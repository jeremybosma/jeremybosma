export const FAVORITE_SONGS_PLAYLIST = {
  id: "pl.u-25UGMBgVBg",
  country: "nl",
  url: "https://music.apple.com/nl/playlist/favorite-songs/pl.u-25UGMBgVBg",
} as const;

export type AppleMusicPlaylistTrack = {
  title: string;
  author: string;
  album?: string;
};
