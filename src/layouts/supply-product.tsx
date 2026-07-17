import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import SupplyProductPage from "@/components/pages/supply-product-page";
import { loadSupplyProductPage } from "@/lib/supply-product-page";

type SupplyProductLayoutProps = LayoutProps<{ productId: string }>;

export default async function SupplyProductLayout({
  productId,
  title,
  description,
  path,
}: SupplyProductLayoutProps) {
  const data = await loadSupplyProductPage(productId);

  if (!data) {
    return (
      <SitexPageShell title="Product Not Found" path={path}>
        <section className="text-[17px]">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="text-muted-foreground mt-2">
            <a href="/supply" className="underline">
              Back to Supply
            </a>
          </p>
        </section>
      </SitexPageShell>
    );
  }

  const productIcon = data.product.images[0]?.src ?? data.defaultImage ?? undefined;

  return (
    <SitexPageShell
      title={title}
      description={description}
      path={path}
      icon={productIcon}
    >
      <SupplyProductPage {...data} />
    </SitexPageShell>
  );
}
