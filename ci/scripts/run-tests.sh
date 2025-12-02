#!/bin/bash
set -e

echo "Running test suite..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to tests directory
cd tests

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}Installing test dependencies...${NC}"
    npm ci
fi

# Run linting
echo "${YELLOW}Running linters...${NC}"
npm run lint --if-present || echo "No lint script found"

# Run integration tests
echo "${YELLOW}Running integration tests...${NC}"
npm run test:integration

# Run contract tests
echo "${YELLOW}Running contract tests...${NC}"
npm run test:contract

# Run E2E tests if environment is set
if [ ! -z "$RUN_E2E" ]; then
    echo "${YELLOW}Running E2E tests...${NC}"
    npm run test:e2e
fi

# Generate coverage report
echo "${YELLOW}Generating coverage report...${NC}"
npm run test:coverage

# Check coverage threshold
COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9.]*,"covered":[0-9.]*,"skipped":[0-9.]*,"pct":[0-9.]*' | grep -o 'pct":[0-9.]*' | cut -d':' -f2)
THRESHOLD=80

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
    echo "${RED}✗ Coverage $COVERAGE% is below threshold $THRESHOLD%${NC}"
    exit 1
else
    echo "${GREEN}✓ Coverage $COVERAGE% meets threshold $THRESHOLD%${NC}"
fi

echo "${GREEN}All tests passed!${NC}"
