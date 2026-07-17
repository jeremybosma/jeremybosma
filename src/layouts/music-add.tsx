import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import MusicAddPage from "@/components/pages/music-add-page";

export default function MusicAddLayout({ title, description, path }: LayoutProps) {
  if (!import.meta.env.DEV) {
    return (
      <SitexPageShell title="Not Found" path={path} noIndex>
        <section className="text-[17px]">
          <h1 className="text-2xl font-semibold">Not found</h1>
        </section>
      </SitexPageShell>
    );
  }

  return (
    <SitexPageShell title={title} description={description} path={path} noIndex>
      <MusicAddPage client:load />
    </SitexPageShell>
  );
}
