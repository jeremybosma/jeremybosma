import React from "react";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/printify";
import { getEnabledVariants } from "@/lib/printify";

export type ProductDetailData = {
  product: PrintifyProduct;
  enabledVariants: PrintifyVariant[];
  colors: Array<{ id: number; title: string; colors: string[] }>;
  sizes: Array<{ id: number; title: string }>;
  defaultImage: string | null;
  lowestPrice: number;
  highestPrice: number;
  cleanDescription: string;
  safetyInformation: string | null;
};

type ProductDetailState = {
  selectedColor: number | null;
  selectedSize: number | null;
  selectedImageIndex: number;
  lightboxOpen: boolean;
  sizeUnit: "cm" | "in";
};

type Store = {
  data: ProductDetailData;
  state: ProductDetailState;
  listeners: Set<() => void>;
  initialVariantId: number | undefined;
};

const stores = new Map<string, Store>();

function createInitialState(data: ProductDetailData): ProductDetailState {
  return {
    selectedColor: data.colors.at(0)?.id ?? null,
    selectedSize: data.sizes.at(0)?.id ?? null,
    selectedImageIndex: 0,
    lightboxOpen: false,
    sizeUnit: "cm",
  };
}

function getStore(productId: string, data?: ProductDetailData): Store {
  const existing = stores.get(productId);
  if (existing) return existing;

  if (!data) {
    throw new Error(`Product detail store missing for ${productId}`);
  }

  const store: Store = {
    data,
    state: createInitialState(data),
    listeners: new Set(),
    initialVariantId: undefined,
  };
  stores.set(productId, store);
  return store;
}

function emit(store: Store) {
  for (const listener of store.listeners) listener();
}

function patchState(store: Store, patch: Partial<ProductDetailState>) {
  store.state = { ...store.state, ...patch };
  emit(store);
}

export function useProductDetailStore(
  data: ProductDetailData,
  options?: { effects?: boolean }
) {
  const store = getStore(data.product.id, data);
  const runEffects = options?.effects ?? false;

  const snapshot = React.useSyncExternalStore(
    (listener) => {
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
    },
    () => store.state,
    () => store.state
  );

  const selectedVariant = React.useMemo(() => {
    const { selectedColor, selectedSize } = snapshot;
    const { enabledVariants } = store.data;

    if (!selectedColor && !selectedSize) return enabledVariants.at(0);

    return enabledVariants.find((v) => {
      const hasColor = selectedColor ? v.options.includes(selectedColor) : true;
      const hasSize = selectedSize ? v.options.includes(selectedSize) : true;
      return hasColor && hasSize;
    });
  }, [snapshot.selectedColor, snapshot.selectedSize, store.data]);

  const variantImages = React.useMemo(() => {
    const { product } = store.data;
    if (!selectedVariant) return product.images;

    const images = product.images.filter((img) =>
      img.variant_ids.includes(selectedVariant.id)
    );

    return images.length > 0 ? images : product.images;
  }, [selectedVariant, store.data]);

  const currentImage =
    variantImages.at(snapshot.selectedImageIndex) ?? variantImages.at(0);

  React.useEffect(() => {
    if (!runEffects) return;

    const variantId = selectedVariant?.id;
    if (store.initialVariantId === undefined) {
      store.initialVariantId = variantId;
      return;
    }
    if (store.initialVariantId === variantId) return;
    store.initialVariantId = variantId;

    const { defaultImage } = store.data;
    if (!defaultImage) {
      patchState(store, { selectedImageIndex: 0 });
      return;
    }
    const idx = variantImages.findIndex((img) => img.src === defaultImage);
    patchState(store, { selectedImageIndex: idx >= 0 ? idx : 0 });
  }, [runEffects, selectedVariant?.id, variantImages, store]);

  React.useEffect(() => {
    if (!runEffects) return;

    const button = document.querySelector(
      `[data-supply-hero-btn="${store.data.product.id}"]`
    );
    if (!(button instanceof HTMLButtonElement)) return;

    const openLightbox = () => patchState(store, { lightboxOpen: true });
    button.addEventListener("click", openLightbox);
    return () => button.removeEventListener("click", openLightbox);
  }, [runEffects, store]);

  React.useEffect(() => {
    if (!runEffects || !currentImage) return;

    for (const img of document.querySelectorAll<HTMLImageElement>(
      `img[data-supply-hero="${store.data.product.id}"]`
    )) {
      if (img.src !== currentImage.src) {
        img.src = currentImage.src;
      }
    }
  }, [runEffects, currentImage?.src, store]);

  const isVariantAvailable = React.useCallback(
    (colorId: number | null, sizeId: number | null) => {
      return store.data.enabledVariants.some((v) => {
        const hasColor = colorId ? v.options.includes(colorId) : true;
        const hasSize = sizeId ? v.options.includes(sizeId) : true;
        return hasColor && hasSize;
      });
    },
    [store]
  );

  return {
    data: store.data,
    ...snapshot,
    selectedVariant,
    variantImages,
    currentImage,
    isVariantAvailable,
    setSelectedColor: (selectedColor: number | null) =>
      patchState(store, { selectedColor }),
    setSelectedSize: (selectedSize: number | null) =>
      patchState(store, { selectedSize }),
    setSelectedImageIndex: (selectedImageIndex: number) =>
      patchState(store, { selectedImageIndex }),
    setLightboxOpen: (lightboxOpen: boolean) =>
      patchState(store, { lightboxOpen }),
    setSizeUnit: (sizeUnit: "cm" | "in") => patchState(store, { sizeUnit }),
  };
}

export function isVariantEnabled(product: PrintifyProduct) {
  return getEnabledVariants(product).length > 0;
}
