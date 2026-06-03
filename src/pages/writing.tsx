import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import WritingPageContent from "@/components/pages/writing-page";

export default function Page() {
  return (
    <BaseLayout
      title="Writing"
      description="Essays and notes by Jeremy Bosma."
      pathname="/writing"
    >
      <ClientShell client:load pathname="/writing">
        <WritingPageContent />
      </ClientShell>
    </BaseLayout>
  );
}
