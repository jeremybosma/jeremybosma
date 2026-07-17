import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import VideosPageContent from "@/components/pages/videos-page";

export default function VideosLayout({ title, description, path }: LayoutProps) {
  return (
    <SitexPageShell title={title} description={description} path={path}>
      <VideosPageContent client:load />
    </SitexPageShell>
  );
}
