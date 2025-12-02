#!/usr/bin/env python3
import hashlib, json, os, sys

def sha256(path):
    h = hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda: f.read(8192),b''):
            h.update(chunk)
    return h.hexdigest()

lock = json.load(open('config/MODEL_LOCK.json'))

checklist = {
    "asr": "/models/asr/model.bin",
    "llm": "/models/llm/model.bin",
    "tts": "/models/tts/model.bin"
}

for name, path in checklist.items():
    if not os.path.exists(path):
        print(json.dumps({"event":"model_missing","type":name}))
        sys.exit(1)
    digest = sha256(path)
    exp = lock[f"{name}_sha256"]
    if digest != exp:
        print(json.dumps({"event":"model_mismatch","model":name,"expected":exp,"actual":digest}))
        sys.exit(1)

print("OK")
