import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import MusicList from "@/components/pages/music-list";
import { getCachedMusic } from "@/lib/music-covers";

export default function Page() {
  const music = getCachedMusic();

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
