import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import MusicList from "@/components/pages/music-list";
import { getCachedMusic } from "@/lib/music-covers";

export default function MusicLayout({ title, description, path }: LayoutProps) {
  const music = getCachedMusic();

  return (
    <SitexPageShell title={title} description={description} path={path}>
      <MusicList client:load music={music} />
    </SitexPageShell>
  );
}
