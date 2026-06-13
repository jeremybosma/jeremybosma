import {
  getEnabledVariants,
  getUniqueColors,
  getUniqueSizes,
  getDefaultImage,
  isProductPublished,
  type PrintifyProduct,
  type PrintifyVariant,
} from "@/lib/printify";
import { getCachedProduct } from "@/lib/supply-products";

export type SupplyProductPageData = {
  product: PrintifyProduct;
  enabledVariants: PrintifyVariant[];
  colors: ReturnType<typeof getUniqueColors>;
  sizes: ReturnType<typeof getUniqueSizes>;
  defaultImage: string | null;
  lowestPrice: number;
  highestPrice: number;
  cleanDescription: string;
  safetyInformation: string | null;
};

export async function loadSupplyProductPage(
  productId: string
): Promise<SupplyProductPageData | null> {
  const product = getCachedProduct(productId);
  if (!product) {
    return null;
  }

  if (!isProductPublished(product)) {
    return null;
  }

  const enabledVariants = getEnabledVariants(product);
  const colors = getUniqueColors(product);
  const sizes = getUniqueSizes(product);
  const defaultImage = getDefaultImage(product);
  const lowestPrice = Math.min(...enabledVariants.map((v) => v.price));
  const highestPrice = Math.max(...enabledVariants.map((v) => v.price));
  const cleanDescription = product.description
    .replace(/<[^>]*>/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const safetyInformation = product.safety_information
    ? product.safety_information
        .replace(/<[^>]*>/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : null;

  return {
    product,
    enabledVariants,
    colors,
    sizes,
    defaultImage,
    lowestPrice,
    highestPrice,
    cleanDescription,
    safetyInformation,
  };
}
