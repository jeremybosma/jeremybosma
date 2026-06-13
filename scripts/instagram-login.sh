#!/usr/bin/env bash
# Import Instagram session from browser cookies (password login is unreliable).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
USERNAME="${INSTAGRAM_USERNAME:-jeremybosma_}"
BROWSER="${INSTAGRAM_COOKIE_BROWSER:-helium}"

cd "$ROOT"

echo "Instagram password login via Instaloader often fails with"
echo '  "Unexpected null login result" — that is normal.'
echo ""
echo "Import session from your browser instead:"
echo ""
if [[ "${BROWSER}" == "helium" ]]; then
  echo "  1. Open Helium → https://www.instagram.com → log in as @${USERNAME}"
  echo "  2. Quit Helium completely (Cmd+Q) so cookies can be read"
elif [[ "${BROWSER}" == "firefox" ]]; then
  echo "  1. Open Firefox → https://www.instagram.com → log in as @${USERNAME}"
else
  echo "  1. Open ${BROWSER} → https://www.instagram.com → log in as @${USERNAME}"
fi
echo "  3. Complete any security / 2FA prompts in the browser"
echo ""
read -r -p "Press Enter when done… " _

pip3 install -q -r "$ROOT/scripts/requirements-instagram.txt" 2>/dev/null || true
python3 "$ROOT/scripts/import-instagram-session.py" --browser "${BROWSER}" --username "${USERNAME}"
