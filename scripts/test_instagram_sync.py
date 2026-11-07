"""Offline regression checks for Instagram session and web-query handling."""
import json
import unittest
from types import SimpleNamespace
from unittest.mock import Mock
from instagram_auth import validate_session
from instagram_web import InstagramWebClient


def loader_with_viewer(viewer, module='PolarisViewer', cookie_id='123'):
    payload = {'require': [[module, [], {'data': viewer}]]}
    response = Mock(text='<script type="application/json">' + json.dumps(payload) + '</script>')
    session = SimpleNamespace(cookies={'sessionid': 'private', 'ds_user_id': cookie_id},
                              headers={}, get=Mock(return_value=response))
    return SimpleNamespace(context=SimpleNamespace(_session=session))


class AuthenticationTests(unittest.TestCase):
    def test_validates_authenticated_viewer(self):
        loader = loader_with_viewer({'id': '123', 'username': 'example'})
        self.assertEqual(validate_session(loader), 'example')
        self.assertEqual(loader.context.username, 'example')

    def test_rejects_other_account_and_embedded_profile(self):
        for loader in [loader_with_viewer({'id': '456', 'username': 'other'}),
                       loader_with_viewer({'id': '123', 'username': 'example'}, 'Profile')]:
            self.assertIsNone(validate_session(loader))

    def test_missing_session_does_not_send_request(self):
        loader = loader_with_viewer({'id': '123', 'username': 'example'})
        del loader.context._session.cookies['sessionid']
        self.assertIsNone(validate_session(loader))
        loader.context._session.get.assert_not_called()


class HighlightTests(unittest.TestCase):
    def client(self):
        return InstagramWebClient.__new__(InstagramWebClient)

    def test_paginates_highlights(self):
        client = self.client()
        client.query = Mock(side_effect=[
            {'highlights': {'edges': [{'node': {'id': 'a'}}],
                            'page_info': {'has_next_page': True, 'end_cursor': 'next'}}},
            {'highlights': {'edges': [{'node': {'id': 'b'}}],
                            'page_info': {'has_next_page': False}}},
        ])
        self.assertEqual(client.highlights('123'), [{'id': 'a'}, {'id': 'b'}])
        self.assertEqual(client.query.call_args.args[1]['after'], 'next')

    def test_refuses_repeated_cursor(self):
        client = self.client()
        client.query = Mock(return_value={'highlights': {
            'edges': [], 'page_info': {'has_next_page': True, 'end_cursor': 'same'}}})
        with self.assertRaisesRegex(RuntimeError, 'pagination cursor'):
            client.highlights('123')

    def test_preserves_media_ids_for_reorder_detection(self):
        client = self.client()
        client.query = Mock(return_value={'xdt_api__v1__feed__reels_media': {
            'reels_media': [{'id': 'highlight:123', 'items': [{'pk': '456', 'media_type': 2}]}]}})
        self.assertEqual(client.items('123')[0]['instagramId'], '456')
        with self.assertRaisesRegex(RuntimeError, 'unexpected highlight'):
            client.items('789')

    def test_rejects_errors_and_html_without_exposing_response(self):
        client = self.client()
        client.tokens = {}
        client.session = Mock()
        for text in ['<html>login</html>', '{"errors":[{"message":"private"}]}']:
            client.session.post.return_value = Mock(text=text)
            with self.assertRaises(RuntimeError) as error:
                client.query(('test', '1'), {})
            self.assertNotIn('private', str(error.exception))


if __name__ == '__main__':
    unittest.main()
