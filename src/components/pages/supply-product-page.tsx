import { IconChevronLeft } from "@/lib/symbols-react";
import { ProductDetail } from "@/components/pages/product-detail";
import type { SupplyProductPageData } from "@/lib/supply-product-page";

export default function SupplyProductPage(props: SupplyProductPageData) {
  const { product, ...detailProps } = props;

  return (
    <article className="text-[17px]">
      <a
        href="/supply"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Supply
      </a>

      <ProductDetail product={product} {...detailProps} />
    </article>
  );
}
