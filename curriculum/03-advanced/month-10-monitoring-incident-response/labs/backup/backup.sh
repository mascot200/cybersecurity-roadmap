#!/usr/bin/env bash
# Back up one PostgreSQL database: custom-format dump + SHA-256 checksum + row-count manifest.
# Connection comes from the standard libpq variables (PGHOST, PGPORT, PGUSER, PGPASSWORD or ~/.pgpass).
# Usage: ./backup.sh <database> [backup-dir]
set -euo pipefail
DB="${1:?usage: backup.sh <database> [backup-dir]}"
DIR="${2:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="$DIR/${DB}-${STAMP}"
mkdir -p "$DIR"
umask 077                                            # backups contain all the data: owner-only

pg_dump --format=custom --no-owner --dbname="$DB" --file="$BASE.dump"
sha256sum "$BASE.dump" | awk '{print $1}' > "$BASE.dump.sha256"

# Exact row counts per table, used later to check that a restore is complete.
psql --dbname="$DB" -At -c "
  SELECT format('%I.%I', schemaname, tablename) FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1" |
while read -r table; do
  printf '%s\t%s\n' "$table" "$(psql --dbname="$DB" -At -c "SELECT count(*) FROM $table")"
done > "$BASE.rows.tsv"

echo "backup:   $BASE.dump ($(du -h "$BASE.dump" | cut -f1))"
echo "checksum: $(cat "$BASE.dump.sha256")"
echo "tables:   $(wc -l < "$BASE.rows.tsv")"
