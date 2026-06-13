import { IconChevronLeft } from "@/lib/symbols-react";
import ProductDetailGallery from "@/components/pages/product-detail-gallery";
import ProductDetailPanel from "@/components/pages/product-detail-panel";
import { SupplyProductHero } from "@/components/supply-product-hero";
import type { SupplyProductPageData } from "@/lib/supply-product-page";

export default function SupplyProductPage(props: SupplyProductPageData) {
  const { product, defaultImage, ...detailProps } = props;

  return (
    <article className="page-panel-vt text-[17px] flex gap-4">
      <a
        href="/supply"
        className="shrink-0 mt-0.5 flex size-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground group"
        aria-label="Back to Supply"
      >
        <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      </a>

      <div className="grid md:grid-cols-2 gap-8 min-w-0 flex-1">
        <div>
          <SupplyProductHero
            productId={product.id}
            productTitle={product.title}
            imageUrl={defaultImage}
          />
          <ProductDetailGallery
            client:load
            product={product}
            defaultImage={defaultImage}
            {...detailProps}
          />
        </div>
        <ProductDetailPanel
          client:load
          product={product}
          defaultImage={defaultImage}
          {...detailProps}
        />
      </div>
    </article>
  );
}
