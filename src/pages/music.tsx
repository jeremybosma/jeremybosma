import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import MusicList from "@/components/pages/music-list";
import { musicData } from "@/lib/music-data";
import { fetchMultipleAlbumArtsServer } from "@/lib/music-api.server";

export default async function Page() {
  const music = await fetchMultipleAlbumArtsServer(musicData);

  return (
    <BaseLayout
      title="Music"
      description="Music Jeremy Bosma is listening to."
      pathname="/music"
    >
      <ClientShell client:load pathname="/music">
        <MusicList client:load music={music} />
      </ClientShell>
    </BaseLayout>
  );
}
