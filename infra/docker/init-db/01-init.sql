-- Initialize database schema
CREATE DATABASE IF NOT EXISTS ai_smartlite;
USE ai_smartlite;

-- Grant permissions
GRANT ALL PRIVILEGES ON ai_smartlite.* TO 'aiuser'@'%';
FLUSH PRIVILEGES;
