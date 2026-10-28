#!/usr/bin/env bash
# Read-only checks for an Ubuntu lab host. Run with sudo. Changes nothing.
set -uo pipefail
pass=0; fail=0; warn=0
ok()   { echo "PASS  $1"; pass=$((pass+1)); }
bad()  { echo "FAIL  $1"; fail=$((fail+1)); }
note() { echo "WARN  $1"; warn=$((warn+1)); }
check() { if eval "$2" >/dev/null 2>&1; then ok "$1"; else bad "$1"; fi; }

echo "== SSH"
check "root login disabled"            "sshd -T | grep -qx 'permitrootlogin no'"
check "password auth disabled"         "sshd -T | grep -qx 'passwordauthentication no'"
check "max auth tries <= 3"            "[ \$(sshd -T | awk '/^maxauthtries/{print \$2}') -le 3 ]"
check "X11 forwarding off"             "sshd -T | grep -qx 'x11forwarding no'"

echo "== Firewall"
check "ufw active"                     "ufw status | grep -q 'Status: active'"
check "default deny incoming"          "ufw status verbose | grep -q 'deny (incoming)'"

echo "== Patching"
check "unattended-upgrades installed"  "dpkg -s unattended-upgrades | grep -q 'Status: install ok installed'"
check "automatic upgrades enabled"     "grep -q 'Unattended-Upgrade \"1\"' /etc/apt/apt.conf.d/20auto-upgrades"
if [ -f /var/run/reboot-required ]; then note "reboot required to finish updates"; else ok "no pending reboot"; fi

echo "== Brute-force protection and auditing"
check "fail2ban running"               "systemctl is-active --quiet fail2ban"
check "fail2ban sshd jail enabled"     "fail2ban-client status sshd"
check "auditd running"                 "systemctl is-active --quiet auditd"

echo "== Accounts and files"
check "only root has UID 0"            "[ \"\$(awk -F: '\$3==0{print \$1}' /etc/passwd)\" = root ]"
check "no empty password hashes"       "[ -z \"\$(awk -F: '(\$2==\"\"){print \$1}' /etc/shadow)\" ]"
check "/etc/shadow not world-readable" "[ \"\$(stat -c %A /etc/shadow | cut -c8)\" = - ]"   # 8th char = 'other' read bit
ww=$(find / -xdev -type f -perm -0002 ! -path '/proc/*' ! -path '/sys/*' 2>/dev/null | head -5 | tr '\n' ' ')
if [ -z "$ww" ]; then ok "no world-writable files on root fs"; else bad "world-writable files found (first 5): $ww"; fi

echo "== Exposure"
if command -v ss >/dev/null; then
  listening=$(ss -tlnH | awk '{print $4}' | grep -vE '^(127\.|\[::1\])' | sort -u | tr '\n' ' ')
  note "listening on non-loopback addresses: ${listening:-none} (each one should be expected)"
else
  note "ss not installed (apt install iproute2); listening-port check skipped"
fi

echo; echo "$pass passed, $fail failed, $warn warnings"; [ "$fail" -eq 0 ]
