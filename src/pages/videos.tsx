import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import VideosPageContent from "@/components/pages/videos-page";

export default function Page() {
  return (
    <BaseLayout
      title="Videos"
      description="Videos by Jeremy Bosma."
      pathname="/videos"
    >
      <ClientShell client:load pathname="/videos">
        <VideosPageContent />
      </ClientShell>
    </BaseLayout>
  );
}
