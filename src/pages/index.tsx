import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import HomePage from "@/components/pages/home-page";

export default function Page() {
  return (
    <BaseLayout pathname="/">
      <ClientShell client:load pathname="/">
        <HomePage client:load />
      </ClientShell>
    </BaseLayout>
  );
}
