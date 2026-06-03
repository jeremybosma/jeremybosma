import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import MusicAddPage from "@/components/pages/music-add-page";

export default function Page() {
  if (!import.meta.env.DEV) {
    return (
      <BaseLayout title="Not Found" pathname="/music/add" noIndex>
        <ClientShell client:load pathname="/music/add">
          <section className="text-[17px]">
            <h1 className="text-2xl font-semibold">Not found</h1>
          </section>
        </ClientShell>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Add Music" pathname="/music/add" noIndex>
      <ClientShell client:load pathname="/music/add">
        <MusicAddPage client:load />
      </ClientShell>
    </BaseLayout>
  );
}
