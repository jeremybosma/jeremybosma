#!/usr/bin/env python3
"""
Download Instagram story highlights into public/gallery/highlights and refresh
src/lib/gallery-highlights.json for the portfolio gallery page.

Uses Instagram's mobile API (i.instagram.com). The Instaloader CLI --highlights
path relies on deprecated GraphQL query hashes and returns 400 "invalid request".

Auth:
  1. Session: ~/.config/instaloader/session-<username>  (bun run instagram:login)
  2. Or refresh from browser: INSTAGRAM_COOKIE_BROWSER=helium in .env

Usage:
  bun run instagram:login
  bun run sync:instagram
  python3 scripts/sync-instagram-highlights.py --posters-only
  python3 scripts/sync-instagram-highlights.py --force   # re-download everything

Posters:
  Video items get a companion 001-poster.jpg (first frame) via ffmpeg for
  gallery view transitions. Install ffmpeg for poster generation:
  brew install ffmpeg
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "gallery" / "highlights"
MANIFEST_PATH = ROOT / "src" / "lib" / "gallery-highlights.json"
ENV_PATH = ROOT / ".env"
USERNAME_DEFAULT = "jeremybosma_"


def load_dotenv() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def slugify(name: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", name.lower().strip())
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug or "highlight"


def refresh_session_from_browser(username: str, browser: str) -> None:
    script = ROOT / "scripts" / "import-instagram-session.py"
    print(f"Refreshing session from {browser} cookies…")
    result = subprocess.run(
        [sys.executable, str(script), "--browser", browser, "--username", username],
        cwd=str(ROOT),
    )
    if result.returncode != 0:
        sys.exit(result.returncode)


def load_instaloader(username: str):
    try:
        from instaloader import Instaloader, Profile
    except ImportError:
        print("pip3 install instaloader browser-cookie3", file=sys.stderr)
        sys.exit(1)

    session_file = Path.home() / ".config" / "instaloader" / f"session-{username}"
    browser = os.environ.get("INSTAGRAM_COOKIE_BROWSER", "").strip().lower()

    if not session_file.exists():
        if browser:
            refresh_session_from_browser(username, browser)
        else:
            print(
                "No Instagram session. Run: bun run instagram:login",
                file=sys.stderr,
            )
            sys.exit(1)

    loader = Instaloader(quiet=True)
    loader.load_session_from_file(username)
    if not loader.test_login():
        if browser:
            refresh_session_from_browser(username, browser)
            loader.load_session_from_file(username)
        if not loader.test_login():
            print(
                "Session invalid. Quit Helium, log into instagram.com, then:\n"
                "  bun run instagram:login",
                file=sys.stderr,
            )
            sys.exit(1)

    profile = Profile.from_username(loader.context, username)
    return loader, profile


def fetch_highlights_tray(context, user_id: str) -> list[dict[str, Any]]:
    data = context.get_iphone_json(
        path=f"api/v1/highlights/{user_id}/highlights_tray/",
        params={},
    )
    tray = data.get("tray", [])
    if not tray:
        raise SystemExit("No highlights found on this profile.")
    return tray


def fetch_highlight_items(context, highlight_id: str) -> list[dict[str, Any]]:
    reel_id = highlight_id.replace("highlight:", "")
    data = context.get_iphone_json(
        path=f"api/v1/feed/reels_media/?reel_ids=highlight:{reel_id}",
        params={},
    )
    reel_key = f"highlight:{reel_id}"
    return data.get("reels", {}).get(reel_key, {}).get("items", [])


def media_url(item: dict[str, Any]) -> tuple[str, str]:
    """Return (url, type) for image or video story item."""
    if item.get("media_type") == 2 and item.get("video_versions"):
        videos = sorted(
            item["video_versions"],
            key=lambda v: v.get("width", 0) * v.get("height", 0),
            reverse=True,
        )
        return videos[0]["url"], "video"
    candidates = item.get("image_versions2", {}).get("candidates", [])
    if candidates:
        best = max(
            candidates,
            key=lambda c: c.get("width", 0) * c.get("height", 0),
        )
        return best["url"], "image"
    raise ValueError("No media URL in story item")


def cover_url(tray_item: dict[str, Any]) -> str:
    return (
        tray_item.get("cover_media", {})
        .get("cropped_image_version", {})
        .get("url", "")
    )


def download_media(context, url: str, dest: Path, *, force: bool = False) -> bool:
    """Download CDN media. Returns True if file was downloaded, False if skipped."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not force and dest.is_file() and dest.stat().st_size > 0:
        return False
    context.get_and_write_raw(url, str(dest))
    return True


def load_existing_manifest() -> dict[str, Any] | None:
    if not MANIFEST_PATH.is_file():
        return None
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def resolve_slug(tray_item: dict[str, Any], existing: dict[str, Any] | None) -> str:
    highlight_id = str(tray_item["id"]).replace("highlight:", "")
    title = tray_item.get("title") or "Highlight"
    unique = f"highlight-{highlight_id}"

    if existing:
        for highlight in existing.get("highlights", []):
            if highlight.get("instagramId") == highlight_id:
                return highlight["id"]

    # Per-highlight folder wins over emoji titles that slugify to "highlight"
    if (OUT_DIR / unique).is_dir():
        return unique

    if existing:
        for highlight in existing.get("highlights", []):
            if highlight.get("title") == title:
                slug = highlight["id"]
                if (OUT_DIR / slug).is_dir():
                    return slug

    base_slug = slugify(title)
    if base_slug != "highlight" and not (OUT_DIR / base_slug).is_dir():
        return base_slug

    if base_slug == "highlight" and not (OUT_DIR / "highlight").is_dir():
        return "highlight"

    return unique


def public_path_exists(src: str) -> bool:
    path = ROOT / "public" / src.lstrip("/")
    return path.is_file() and path.stat().st_size > 0


def highlight_files_complete(highlight: dict[str, Any]) -> bool:
    images = highlight.get("images", [])
    if not images:
        return False
    for entry in images:
        if not public_path_exists(entry.get("src", "")):
            return False
        if entry.get("type") == "video" and entry.get("poster"):
            if not public_path_exists(entry["poster"]):
                return False
    cover = highlight.get("cover", "")
    if cover.endswith("_cover.jpg") and not public_path_exists(cover):
        return False
    return True


_FFMPEG_AVAILABLE: bool | None = None


def ffmpeg_available() -> bool:
    global _FFMPEG_AVAILABLE
    if _FFMPEG_AVAILABLE is None:
        _FFMPEG_AVAILABLE = (
            subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                check=False,
            ).returncode
            == 0
        )
        if not _FFMPEG_AVAILABLE:
            print(
                "ffmpeg not found — video posters skipped (install ffmpeg for lightbox animations)",
                file=sys.stderr,
            )
    return _FFMPEG_AVAILABLE


def poster_path_for_video(video_path: Path) -> Path:
    return video_path.with_name(f"{video_path.stem}-poster.jpg")


def extract_video_poster(video_path: Path) -> Path | None:
    """Extract first frame as JPG for view-transition morphs."""
    if not ffmpeg_available():
        return None

    poster_path = poster_path_for_video(video_path)
    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-ss",
            "0",
            "-i",
            str(video_path),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(poster_path),
        ],
        capture_output=True,
        check=False,
    )
    if result.returncode != 0 or not poster_path.is_file():
        print(f"    poster failed for {video_path.name}", file=sys.stderr)
        return None
    return poster_path


def extension_for_url(url: str, media_type: str) -> str:
    path = urlparse(url).path.lower()
    if ".mp4" in path or media_type == "video":
        return ".mp4"
    if ".webp" in path:
        return ".webp"
    if ".png" in path:
        return ".png"
    return ".jpg"


def sync_highlights(loader, profile, *, force: bool = False) -> list[dict]:
    context = loader.context
    user_id = str(profile.userid)

    print(f"Fetching highlights for @{profile.username}…")
    tray = fetch_highlights_tray(context, user_id)

    if force and OUT_DIR.exists():
        import shutil

        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    existing_manifest = None if force else load_existing_manifest()
    existing_by_instagram_id = {
        h["instagramId"]: h
        for h in (existing_manifest or {}).get("highlights", [])
        if h.get("instagramId")
    }
    existing_by_title = {
        h["title"]: h for h in (existing_manifest or {}).get("highlights", [])
    }

    manifest_highlights: list[dict] = []

    for tray_item in tray:
        raw_id = str(tray_item["id"])
        highlight_id = raw_id.replace("highlight:", "")
        title = tray_item.get("title") or "Highlight"
        slug = resolve_slug(tray_item, existing_manifest)
        dest_dir = OUT_DIR / slug
        dest_dir.mkdir(parents=True, exist_ok=True)

        existing_entry = existing_by_instagram_id.get(
            highlight_id
        ) or existing_by_title.get(title)
        tray_count = tray_item.get("media_count")
        if (
            not force
            and existing_entry
            and existing_entry.get("id") == slug
            and highlight_files_complete(existing_entry)
            and tray_count is not None
            and tray_count == len(existing_entry.get("images", []))
        ):
            print(f"  {title}… (unchanged, {tray_count} item(s))", flush=True)
            manifest_highlights.append(existing_entry)
            continue

        print(f"  {title}…", flush=True)
        items = fetch_highlight_items(context, highlight_id)
        images: list[dict[str, str]] = []
        downloaded = 0
        skipped = 0

        for index, item in enumerate(items, start=1):
            try:
                url, media_type = media_url(item)
            except ValueError:
                continue
            ext = extension_for_url(url, media_type)
            out_name = f"{index:03d}{ext}"
            dest = dest_dir / out_name
            try:
                if download_media(context, url, dest, force=force):
                    downloaded += 1
                    time.sleep(0.3)
                else:
                    skipped += 1
            except Exception as err:
                print(f"    skip item {index}: {err}", file=sys.stderr)
                continue
            entry: dict[str, str] = {
                "src": f"/gallery/highlights/{slug}/{out_name}",
                "alt": title,
                "type": "video" if media_type == "video" else "image",
            }
            if media_type == "video":
                poster_path = poster_path_for_video(dest)
                if poster_path.is_file() and poster_path.stat().st_size > 0:
                    entry["poster"] = f"/gallery/highlights/{slug}/{poster_path.name}"
                else:
                    poster = extract_video_poster(dest)
                    if poster:
                        entry["poster"] = f"/gallery/highlights/{slug}/{poster.name}"
            images.append(entry)

        if not images:
            if dest_dir.exists() and not any(dest_dir.iterdir()):
                dest_dir.rmdir()
            continue

        cover_src = images[0]["src"]
        if existing_entry and highlight_files_complete(existing_entry):
            cover_src = existing_entry.get("cover", cover_src)
        cover_from_tray = cover_url(tray_item)
        cover_path = dest_dir / "_cover.jpg"
        if cover_from_tray and not (cover_path.is_file() and cover_path.stat().st_size > 0):
            try:
                if download_media(context, cover_from_tray, cover_path, force=force):
                    time.sleep(0.3)
                cover_src = f"/gallery/highlights/{slug}/_cover.jpg"
            except Exception:
                pass
        elif cover_path.is_file():
            cover_src = f"/gallery/highlights/{slug}/_cover.jpg"

        manifest_highlights.append(
            {
                "id": slug,
                "instagramId": highlight_id,
                "title": title,
                "cover": cover_src,
                "images": images,
            }
        )
        if skipped and not downloaded:
            print(f"    {len(images)} item(s) (all cached)")
        elif skipped:
            print(f"    {len(images)} item(s) ({downloaded} new, {skipped} cached)")
        else:
            print(f"    {len(images)} item(s)")

    return manifest_highlights


def backfill_posters_from_manifest() -> int:
    """Generate missing video posters and update gallery-highlights.json in place."""
    if not MANIFEST_PATH.is_file():
        print(f"Manifest not found: {MANIFEST_PATH}", file=sys.stderr)
        sys.exit(1)

    payload = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    highlights: list[dict] = payload.get("highlights", [])
    updated = 0

    for highlight in highlights:
        for entry in highlight.get("images", []):
            if entry.get("type") != "video":
                continue
            src = entry.get("src", "")
            if not src.endswith(".mp4"):
                continue
            video_path = ROOT / "public" / src.lstrip("/")
            if not video_path.is_file():
                print(f"  skip missing {video_path.relative_to(ROOT)}", file=sys.stderr)
                continue
            poster = extract_video_poster(video_path)
            if not poster:
                continue
            poster_src = f"/gallery/highlights/{video_path.parent.name}/{poster.name}"
            if entry.get("poster") != poster_src:
                entry["poster"] = poster_src
                updated += 1

    payload["syncedAt"] = __import__("datetime").datetime.now(
        __import__("datetime").timezone.utc
    ).isoformat()
    MANIFEST_PATH.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return updated


def write_manifest(highlights: list[dict], username: str) -> None:
    payload = {
        "username": username,
        "syncedAt": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
        "highlights": highlights,
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    if "--posters-only" in sys.argv:
        count = backfill_posters_from_manifest()
        print(f"Updated {count} poster field(s) in {MANIFEST_PATH.relative_to(ROOT)}")
        return

    load_dotenv()
    username = os.environ.get("INSTAGRAM_USERNAME", USERNAME_DEFAULT).lstrip("@")

    loader, profile = load_instaloader(username)
    loader.save_session_to_file()

    force = "--force" in sys.argv
    if force:
        print("Force mode: re-downloading all media")
    highlights = sync_highlights(loader, profile, force=force)

    if not highlights:
        print("No highlights downloaded.", file=sys.stderr)
        sys.exit(1)

    write_manifest(highlights, username)
    print(f"Wrote {len(highlights)} highlight(s) to {OUT_DIR.relative_to(ROOT)}")
    print(f"Manifest: {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
