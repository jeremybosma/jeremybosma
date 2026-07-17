import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import GalleryPage from "@/components/pages/gallery-page";
import galleryData from "@/lib/gallery-highlights.json";
import type { GalleryHighlightsData } from "@/lib/gallery-highlights";

const data = galleryData as GalleryHighlightsData;

export default function GalleryLayout({ title, description, path }: LayoutProps) {
  return (
    <SitexPageShell title={title} description={description} path={path}>
      <GalleryPage client:load highlights={data.highlights} />
    </SitexPageShell>
  );
}
