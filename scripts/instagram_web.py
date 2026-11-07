"""Instagram's current web queries for highlight exports (read-only)."""
from __future__ import annotations

import json
from curl_cffi import requests
from instagram_auth import _BootstrapParser

# Document IDs from Instagram's web client. Keep these together when queries change.
TRAY_QUERY = ('PolarisProfileStoryHighlightsTrayContentQuery', '26970053832668570')
ITEMS_QUERY = ('PolarisStoriesV3ReelPageStandaloneQuery', '29341065465524437')


def _modules(value):
    if isinstance(value, list):
        if len(value) >= 3 and isinstance(value[0], str):
            yield value[0], value[2]
        for child in value:
            yield from _modules(child)
    elif isinstance(value, dict):
        for child in value.values():
            yield from _modules(child)


class InstagramWebClient:
    def __init__(self, loader):
        # curl's browser transport is required by the current web API; ordinary
        # requests can read HTML but its GraphQL calls are rejected/redirected.
        self.session = requests.Session(impersonate='chrome')
        self.session.cookies.update(loader.context._session.cookies.get_dict())
        response = self.session.get('https://www.instagram.com/', timeout=30)
        response.raise_for_status()
        parser = _BootstrapParser()
        parser.feed(response.text)
        modules = dict(module for payload in parser.payloads for module in _modules(payload))
        try:
            self.tokens = {
                'fb_dtsg': modules['DTSGInitialData']['token'],
                'lsd': modules['LSD']['token'],
            }
        except KeyError:
            raise RuntimeError('Instagram did not return authenticated web request tokens.') from None
        self.session.headers.update({
            'X-CSRFToken': self.session.cookies.get('csrftoken', ''),
            'X-FB-LSD': self.tokens['lsd'],
            'X-IG-App-ID': '936619743392459',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://www.instagram.com',
            'Referer': 'https://www.instagram.com/',
        })

    def query(self, operation, variables):
        name, document_id = operation
        response = self.session.post('https://www.instagram.com/api/graphql', data={
            **self.tokens, '__d': 'www', '__a': '1', '__user': '0', '__comet_req': '7',
            'fb_api_caller_class': 'RelayModern', 'fb_api_req_friendly_name': name,
            'doc_id': document_id, 'variables': json.dumps(variables),
        }, timeout=60)
        response.raise_for_status()
        text = response.text.removeprefix('for (;;);')
        try:
            payload = json.loads(text)
        except ValueError:
            raise RuntimeError(f'Instagram returned an unexpected response for {name}.') from None
        if payload.get('errors') or payload.get('error') or not isinstance(payload.get('data'), dict):
            raise RuntimeError(f'Instagram rejected {name}; export stopped without replacing the gallery manifest.')
        return payload['data']

    def highlights(self, user_id):
        tray = []
        cursor = None
        while True:
            connection = self.query(TRAY_QUERY, {
                'user_id': str(user_id), 'first': 50, 'after': cursor,
                'last': None, 'before': None, 'max_highlights_to_fetch_on_pagination': 50,
            })['highlights']
            tray.extend(edge['node'] for edge in connection['edges'])
            page = connection['page_info']
            if not page['has_next_page']:
                return tray
            next_cursor = page['end_cursor']
            if not next_cursor or next_cursor == cursor:
                raise RuntimeError('Instagram returned an invalid highlights pagination cursor.')
            cursor = next_cursor

    def items(self, highlight_id):
        media = self.query(ITEMS_QUERY, {
            'reel_ids_arr': [f'highlight:{highlight_id}'], 'media_id': None,
            'is_highlight': True,
            '__relay_internal__pv__PolarisCommunityNoteStoriesLabelEnabledrelayprovider': False,
        })['xdt_api__v1__feed__reels_media']['reels_media']
        if len(media) != 1 or str(media[0]['id']).removeprefix('highlight:') != str(highlight_id):
            raise RuntimeError('Instagram returned an unexpected highlight; export stopped.')
        return [{**item, 'instagramId': str(item['pk'])} for item in media[0]['items']]
