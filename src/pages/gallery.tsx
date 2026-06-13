import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import GalleryPage from "@/components/pages/gallery-page";
import galleryData from "@/lib/gallery-highlights.json";
import type { GalleryHighlightsData } from "@/lib/gallery-highlights";

const data = galleryData as GalleryHighlightsData;

export default function Page() {
  return (
    <BaseLayout
      title="Gallery"
      description="Photos from Jeremy Bosma — travel, work, and everyday life."
      pathname="/gallery"
    >
      <ClientShell client:load pathname="/gallery">
        <GalleryPage client:load highlights={data.highlights} />
      </ClientShell>
    </BaseLayout>
  );
}
