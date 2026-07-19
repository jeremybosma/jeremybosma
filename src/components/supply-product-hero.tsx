import type React from "react";
import { supplyImageVtName } from "@/lib/page-view-transition";

type SupplyProductHeroProps = {
  productId: string;
  productTitle: string;
  imageUrl: string | null;
};

/** Server-rendered hero image. Stays outside client islands so view transitions are not replaced on hydrate. */
export function SupplyProductHero({
  productId,
  productTitle,
  imageUrl,
}: SupplyProductHeroProps) {
  return (
    <button
      type="button"
      data-supply-hero-btn={productId}
      className="supply-product-hero aspect-square relative bg-secondary/30 overflow-hidden w-full cursor-zoom-in"
      aria-label={`View ${productTitle} images in fullscreen`}
    >
      {imageUrl ? (
        <img
          data-supply-hero={productId}
          src={imageUrl}
          alt={`${productTitle} product image`}
          className="page-image-vt absolute inset-0 w-full h-full object-contain"
          style={
            {
              "--page-image-vt": supplyImageVtName(productId),
            } as React.CSSProperties
          }
          fetchPriority="high"
        />
      ) : null}
    </button>
  );
}
