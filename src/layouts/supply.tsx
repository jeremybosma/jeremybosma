import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import SupplyPageContent from "@/components/pages/supply-page";
import { toSupplyListItems } from "@/lib/printify";
import { getCachedPublishedProducts } from "@/lib/supply-products";

export default function SupplyLayout({ title, description, path }: LayoutProps) {
  const published = getCachedPublishedProducts();
  const products = published.length > 0 ? toSupplyListItems(published) : null;

  return (
    <SitexPageShell title={title} description={description} path={path}>
      <SupplyPageContent client:load products={products} error={null} />
    </SitexPageShell>
  );
}
