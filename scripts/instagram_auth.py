"""Validate browser sessions without Instaloader's retired login GraphQL query."""
from __future__ import annotations

import json
from html.parser import HTMLParser


class _BootstrapParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.payloads = []
        self._parts = None

    def handle_starttag(self, tag, attrs):
        if tag == 'script' and dict(attrs).get('type') == 'application/json':
            self._parts = []

    def handle_data(self, data):
        if self._parts is not None:
            self._parts.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self._parts is not None:
            try:
                self.payloads.append(json.loads(''.join(self._parts)))
            except ValueError:
                pass
            self._parts = None


def _viewer(value):
    if isinstance(value, list):
        if len(value) >= 3 and value[0] == 'PolarisViewer':
            return value[2].get('data') if isinstance(value[2], dict) else None
        for child in value:
            result = _viewer(child)
            if result:
                return result
    elif isinstance(value, dict):
        for child in value.values():
            result = _viewer(child)
            if result:
                return result
    return None


def validate_session(loader):
    """Return the server-verified username, checking it against the session ID."""
    session = loader.context._session
    if not session.cookies.get('sessionid') or not session.cookies.get('ds_user_id'):
        return None
    session.headers['X-CSRFToken'] = session.cookies.get('csrftoken', '')
    response = session.get('https://www.instagram.com/', timeout=30)
    response.raise_for_status()
    parser = _BootstrapParser()
    parser.feed(response.text)
    for payload in parser.payloads:
        viewer = _viewer(payload)
        if (viewer and viewer.get('username') and
                str(viewer.get('id')) == session.cookies.get('ds_user_id')):
            loader.context.username = viewer['username']
            return viewer['username']
    return None
