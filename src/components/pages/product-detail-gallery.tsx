import type { ProductDetailData } from "@/lib/use-product-detail";
import { useProductDetailStore } from "@/lib/use-product-detail";

export default function ProductDetailGallery(props: ProductDetailData) {
  const { data, variantImages, selectedImageIndex, setSelectedImageIndex } =
    useProductDetailStore(props);

  if (variantImages.length <= 1) {
    return null;
  }

  return (
    <div className="flex overflow-x-auto pb-2">
      {variantImages.map((img, index) => (
        <button
          key={img.src}
          type="button"
          onClick={() => setSelectedImageIndex(index)}
          className={`relative w-[72px] h-[72px] shrink-0 overflow-hidden border transition-colors ${
            index === selectedImageIndex
              ? "border-border"
              : "border-transparent hover:border-muted-foreground/50"
          }`}
        >
          <img
            src={img.src}
            alt={`${data.product.title} thumbnail view ${index + 1}`}
            className="absolute inset-0 w-full h-full object-contain bg-secondary/30"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}
