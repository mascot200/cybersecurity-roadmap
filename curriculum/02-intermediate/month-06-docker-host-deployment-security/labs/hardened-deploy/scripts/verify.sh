#!/usr/bin/env bash
# Checks the running stack's hardening. Run after: docker compose up -d --build
set -uo pipefail
cd "$(dirname "$0")/.."
pass=0; fail=0
check() { if eval "$2" >/dev/null 2>&1; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1"; fail=$((fail+1)); fi; }
id_of() { docker compose ps -q "$1"; }
insp() { docker inspect --format "$2" "$(id_of "$1")"; }

for s in proxy api; do
  check "$s: root filesystem read-only"     "[ \"\$(insp $s '{{.HostConfig.ReadonlyRootfs}}')\" = true ]"
  check "$s: all capabilities dropped"       "insp $s '{{.HostConfig.CapDrop}}' | grep -qi all"
  check "$s: no-new-privileges"              "insp $s '{{.HostConfig.SecurityOpt}}' | grep -q no-new-privileges"
  check "$s: not privileged"                 "[ \"\$(insp $s '{{.HostConfig.Privileged}}')\" = false ]"
  check "$s: memory limit set"               "[ \"\$(insp $s '{{.HostConfig.Memory}}')\" != 0 ]"
done
check "api: runs as non-root (uid != 0)"     "[ \"\$(docker compose exec -T api id -u)\" != 0 ]"
check "api: cannot write to its code"        "! docker compose exec -T api sh -c 'echo x >> /app/server.js'"
check "api: no published ports"              "[ -z \"\$(docker compose port api 3000 2>/dev/null)\" ]"
check "db: no published ports"               "[ -z \"\$(docker compose port db 5432 2>/dev/null)\" ]"
check "db: cannot reach the internet"        "! docker compose exec -T db sh -c 'wget -q -T 3 -O /dev/null https://example.com'"
check "proxy: HTTPS responds"                "curl -sk https://127.0.0.1:8443/healthz | grep -q ok"
check "proxy: HSTS header present"           "curl -skI https://127.0.0.1:8443/healthz | grep -qi strict-transport-security"
check "proxy: version not disclosed"         "! curl -skI https://127.0.0.1:8443/healthz | grep -qi 'server: nginx/'"
check "proxy: dotfiles denied"               "[ \"\$(curl -sk -o /dev/null -w '%{http_code}' https://127.0.0.1:8443/.env)\" = 403 ]"
check "secret not in api environment"        "! insp api '{{json .Config.Env}}' | grep -q \"\$(cat secrets/db_password.txt)\""
echo; echo "$pass passed, $fail failed"; [ "$fail" -eq 0 ]
