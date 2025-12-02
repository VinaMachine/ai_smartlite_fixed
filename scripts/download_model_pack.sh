#!/usr/bin/env bash
set -e
REG_URL=${1:-"https://registry.smartlite.internal"}
AUTH_HEADER=${2:-"X-Registry-Key: $MODEL_REG_KEY"}

RETRY=3
WAIT=3

for i in $(seq 1 $RETRY); do
  echo "Downloading model pack... attempt $i"
  if curl -f -H "$AUTH_HEADER" -o models.tar.gz "$REG_URL/models/$MODEL_PACK_VERSION/models.tar.gz"; then
    echo "Downloaded."
    tar -xzf models.tar.gz -C /models
    exit 0
  else
    echo "Retrying in $WAIT seconds"
    sleep $((WAIT * i))
  fi
done

echo '{"event":"model_download_fail","exit_code":2}'
exit 2
