#!/usr/bin/env bash
# Prove a backup is usable: verify its checksum, restore it into a throwaway database,
# compare row counts with the manifest, and report how long the restore took (your measured RTO).
# Usage: ./verify-restore.sh backups/<db>-<stamp>.dump
set -euo pipefail
DUMP="${1:?usage: verify-restore.sh <file.dump>}"
BASE="${DUMP%.dump}"
SCRATCH="restore_check_$(date +%s)"
cleanup() { dropdb --if-exists "$SCRATCH" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "1. checksum"
expected="$(cat "$DUMP.sha256")"
actual="$(sha256sum "$DUMP" | awk '{print $1}')"
if [ "$expected" != "$actual" ]; then
  echo "   FAIL checksum mismatch: backup is corrupted or was modified"; exit 1
fi
echo "   ok"

echo "2. restore into $SCRATCH"
start=$(date +%s)
createdb "$SCRATCH"
pg_restore --no-owner --exit-on-error --dbname="$SCRATCH" "$DUMP"
elapsed=$(( $(date +%s) - start ))
echo "   ok (${elapsed}s)"

echo "3. row counts vs manifest"
status=0
while IFS=$'\t' read -r table expected_rows; do
  got=$(psql --dbname="$SCRATCH" -At -c "SELECT count(*) FROM $table")
  if [ "$got" = "$expected_rows" ]; then
    echo "   ok   $table $got"
  else
    echo "   FAIL $table expected $expected_rows got $got"; status=1
  fi
done < "$BASE.rows.tsv"

echo
[ $status -eq 0 ] && echo "RESTORE VERIFIED in ${elapsed}s" || echo "RESTORE INCOMPLETE"
exit $status
