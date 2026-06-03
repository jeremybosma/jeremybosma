import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import SupplyPageContent from "@/components/pages/supply-page";
import { getPublishedProducts } from "@/lib/printify";

export default async function Page() {
  let products = null;
  let error: string | null = null;

  try {
    products = await getPublishedProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <BaseLayout
      title="Supply"
      description="Jeremy's Supply — apparel and goods."
      pathname="/supply"
    >
      <ClientShell client:load pathname="/supply">
        <SupplyPageContent products={products} error={error} />
      </ClientShell>
    </BaseLayout>
  );
}
