#!/usr/bin/env python3
"""
Save an Instaloader session by importing Instagram cookies from your browser.

Instagram often rejects username/password login in Instaloader
("Unexpected null login result") even when the password works in the app.
Use this instead.

Recommended (Helium): log into instagram.com in Helium, then:
  bun run instagram:login

Other browsers: INSTAGRAM_COOKIE_BROWSER=firefox|chrome bun run instagram:login
"""

from __future__ import annotations

import argparse
import os
import sys
from glob import glob
from os.path import expanduser
from pathlib import Path
from platform import system
from sqlite3 import OperationalError, connect

ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"
USERNAME_DEFAULT = "jeremybosma_"
HELIUM_DATA_DIR = expanduser("~/Library/Application Support/net.imput.helium")


def load_dotenv() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def session_path(username: str) -> Path:
    config = Path(os.environ.get("XDG_CONFIG_HOME", expanduser("~/.config"))) / "instaloader"
    config.mkdir(parents=True, exist_ok=True)
    return config / f"session-{username}"


def firefox_cookiefile() -> str:
    pattern = {
        "Windows": "~/AppData/Roaming/Mozilla/Firefox/Profiles/*/cookies.sqlite",
        "Darwin": "~/Library/Application Support/Firefox/Profiles/*/cookies.sqlite",
    }.get(system(), "~/.mozilla/firefox/*/cookies.sqlite")
    files = sorted(glob(expanduser(pattern)), key=os.path.getmtime, reverse=True)
    if not files:
        raise SystemExit(
            "No Firefox profile found.\n"
            "1. Install Firefox\n"
            "2. Open https://www.instagram.com and log in\n"
            "3. Run this script again"
        )
    return files[0]


def import_from_firefox_sqlite(cookiefile: str) -> tuple[str, object]:
    from instaloader import Instaloader

    print(f"Reading cookies from Firefox ({cookiefile})…")
    conn = connect(f"file:{cookiefile}?immutable=1", uri=True)
    try:
        rows = conn.execute(
            "SELECT name, value FROM moz_cookies WHERE baseDomain='instagram.com'"
        )
    except OperationalError:
        rows = conn.execute(
            "SELECT name, value FROM moz_cookies WHERE host LIKE '%instagram.com'"
        )

    loader = Instaloader(max_connection_attempts=3)
    loader.context._session.cookies.update(rows)
    username = loader.test_login()
    if not username:
        raise SystemExit(
            "Not logged in to Instagram in Firefox.\n"
            "Open instagram.com in Firefox, complete any security checks, then retry."
        )
    loader.context.username = username
    return username, loader


def helium_cookiefile(explicit: str | None = None) -> str:
    if explicit:
        return explicit
    patterns = [
        f"{HELIUM_DATA_DIR}/Default/Cookies",
        f"{HELIUM_DATA_DIR}/Profile */Cookies",
    ]
    files: list[str] = []
    for pattern in patterns:
        files.extend(glob(pattern))
    files = sorted(files, key=os.path.getmtime, reverse=True)
    if not files:
        raise SystemExit(
            "Helium profile not found.\n"
            "1. Open Helium → https://www.instagram.com → log in\n"
            "2. Quit Helium (so the cookie DB is not locked)\n"
            "3. Run: bun run instagram:login"
        )
    return files[0]


def import_from_helium(cookiefile: str | None) -> tuple[str, object]:
    from browser_cookie3 import ChromiumBased
    from instaloader import Instaloader, LoginException

    path = helium_cookiefile(cookiefile)
    print(f"Reading cookies from Helium ({path})…")

    store = ChromiumBased(
        browser="Helium",
        cookie_file=path,
        domain_name="instagram.com",
        osx_cookies=[path],
        os_crypt_name="chrome",
        osx_key_service="Helium Storage Key",
        osx_key_user="Helium",
    )
    cookies: dict[str, str] = {c.name: c.value for c in store.load()}

    if not cookies.get("sessionid"):
        raise SystemExit(
            "No Instagram session in Helium.\n"
            "Log into instagram.com in Helium, then quit Helium and retry."
        )

    loader = Instaloader(max_connection_attempts=3)
    loader.context.update_cookies(cookies)
    username = loader.test_login()
    if not username:
        raise LoginException("Helium cookies found but Instagram login test failed.")
    loader.context.username = username
    return username, loader


def import_from_browser(browser: str, cookiefile: str | None) -> tuple[str, object]:
    try:
        import browser_cookie3
    except ImportError:
        raise SystemExit("pip3 install browser-cookie3") from None

    from instaloader import Instaloader, LoginException

    supported = {
        "brave": browser_cookie3.brave,
        "chrome": browser_cookie3.chrome,
        "chromium": browser_cookie3.chromium,
        "edge": browser_cookie3.edge,
        "firefox": browser_cookie3.firefox,
        "librewolf": browser_cookie3.librewolf,
        "opera": browser_cookie3.opera,
        "opera_gx": browser_cookie3.opera_gx,
        "safari": browser_cookie3.safari,
        "vivaldi": browser_cookie3.vivaldi,
        "arc": browser_cookie3.chrome,
    }
    key = browser.lower()
    if key == "helium":
        return import_from_helium(cookiefile)
    if key not in supported:
        raise SystemExit(f"Unsupported browser: {browser}. Try helium or firefox.")

    print(f"Reading cookies from {browser}…")
    cookies: dict[str, str] = {}
    for cookie in supported[key](cookie_file=cookiefile):
        if "instagram.com" in cookie.domain:
            cookies[cookie.name] = cookie.value

    if not cookies.get("sessionid"):
        raise SystemExit(
            f"No Instagram session in {browser}.\n"
            "Log into instagram.com in that browser first, or use Helium."
        )

    loader = Instaloader(max_connection_attempts=3)
    loader.context.update_cookies(cookies)
    username = loader.test_login()
    if not username:
        raise LoginException(
            f"Cookies found but login test failed for {browser}. Try Helium instead."
        )
    loader.context.username = username
    return username, loader


def main() -> None:
    load_dotenv()
    parser = argparse.ArgumentParser(description="Import Instagram session from browser cookies")
    parser.add_argument(
        "-b",
        "--browser",
        default=os.environ.get("INSTAGRAM_COOKIE_BROWSER", "helium"),
        help="Browser with an active Instagram login (default: helium)",
    )
    parser.add_argument(
        "-c",
        "--cookiefile",
        help="Optional path to cookies DB (Firefox cookies.sqlite)",
    )
    parser.add_argument(
        "-u",
        "--username",
        default=os.environ.get("INSTAGRAM_USERNAME", USERNAME_DEFAULT),
        help="Expected Instagram username (validates import)",
    )
    args = parser.parse_args()

    browser = args.browser.lower()
    expected = args.username.lower().lstrip("@")

    if browser == "firefox" and not args.cookiefile:
        cookiefile = firefox_cookiefile()
        username, loader = import_from_firefox_sqlite(cookiefile)
    else:
        username, loader = import_from_browser(browser, args.cookiefile)

    if username.lower() != expected:
        print(
            f"Warning: logged in as @{username}, expected @{expected}.",
            file=sys.stderr,
        )

    dest = session_path(username)
    loader.save_session_to_file(str(dest))
    print(f"Saved session for @{username} → {dest}")
    print("Run: bun run sync:instagram")


if __name__ == "__main__":
    main()
