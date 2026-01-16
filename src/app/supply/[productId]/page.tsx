import { notFound } from "next/navigation";
import Link from "next/link";
import {
    getProduct,
    getAllProducts,
    getDefaultImage,
    formatPrice,
    getEnabledVariants,
    getUniqueColors,
    getUniqueSizes,
} from "@/lib/printify";
import { IconChevronLeft } from "symbols-react";
import { ProductDetail } from "./product-detail";

type Props = {
    params: Promise<{ productId: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
    try {
        const products = await getAllProducts();
        return products.map((product) => ({
            productId: product.id,
        }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: Props) {
    const { productId } = await params;
    try {
        const product = await getProduct(productId);
        return {
            title: product.title,
            description: product.description.replace(/<[^>]*>/g, "").slice(0, 160),
        };
    } catch {
        return {
            title: "Product Not Found",
        };
    }
}

export default async function ProductPage({ params }: Props) {
    const { productId } = await params;

    let product;
    try {
        product = await getProduct(productId);
    } catch {
        notFound();
    }

    const enabledVariants = getEnabledVariants(product);
    if (enabledVariants.length === 0) {
        notFound();
    }

    const colors = getUniqueColors(product);
    const sizes = getUniqueSizes(product);
    const defaultImage = getDefaultImage(product);
    const lowestPrice = Math.min(...enabledVariants.map((v) => v.price));
    const highestPrice = Math.max(...enabledVariants.map((v) => v.price));

    // Clean description from HTML tags
    const cleanDescription = product.description
        .replace(/<[^>]*>/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return (
        <article className="text-[17px]">
            <Link
                href="/supply"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
                <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Supply
            </Link>

            <ProductDetail
                product={product}
                enabledVariants={enabledVariants}
                colors={colors}
                sizes={sizes}
                defaultImage={defaultImage}
                lowestPrice={lowestPrice}
                highestPrice={highestPrice}
                cleanDescription={cleanDescription}
            />
        </article>
    );
}
