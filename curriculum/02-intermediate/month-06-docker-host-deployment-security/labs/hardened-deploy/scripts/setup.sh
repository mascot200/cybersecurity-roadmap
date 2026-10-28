#!/usr/bin/env bash
# Generates local-only secrets and a self-signed certificate. Nothing here is committed.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p secrets proxy/certs
umask 077
[ -f secrets/db_password.txt ] || openssl rand -base64 32 > secrets/db_password.txt
if [ ! -f proxy/certs/dev.crt ]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 30 \
    -keyout proxy/certs/dev.key -out proxy/certs/dev.crt \
    -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi
# The containers' non-root users must be able to read these mounts.
chmod 644 proxy/certs/dev.crt proxy/certs/dev.key secrets/db_password.txt
echo "secrets and dev certificate ready (local only, git-ignored)"
