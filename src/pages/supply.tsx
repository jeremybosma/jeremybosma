import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import SupplyPageContent from "@/components/pages/supply-page";
import { toSupplyListItems } from "@/lib/printify";
import { getCachedPublishedProducts } from "@/lib/supply-products";

export default function Page() {
  const published = getCachedPublishedProducts();
  const products = published.length > 0 ? toSupplyListItems(published) : null;

  return (
    <BaseLayout
      title="Supply"
      description="Jeremy's Supply — apparel and goods."
      pathname="/supply"
    >
      <ClientShell client:load pathname="/supply">
        <SupplyPageContent client:load products={products} error={null} />
      </ClientShell>
    </BaseLayout>
  );
}
