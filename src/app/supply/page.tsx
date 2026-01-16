import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getDefaultImage, formatPrice, getEnabledVariants } from "@/lib/printify";
import { IconTshirt } from "symbols-react";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function SupplyPage() {
    let products;
    let error: string | null = null;

    try {
        products = await getAllProducts();
        // Filter to only show visible products with enabled variants
        products = products.filter(
            (p) => p.visible && getEnabledVariants(p).length > 0
        );
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to load products";
    }

    if (error || !products || products.length === 0) {
        return (
            <section className="text-[17px] flex flex-col items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <IconTshirt className="w-24 h-24 text-muted-foreground/40" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">Coming Soon</h1>
                        <p className="text-muted-foreground max-w-sm">
                            Products are on the way. Check back later.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="text-[17px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                    const imageUrl = getDefaultImage(product);
                    const enabledVariants = getEnabledVariants(product);
                    const lowestPrice = Math.min(
                        ...enabledVariants.map((v) => v.price)
                    );

                    return (
                        <Link
                            key={product.id}
                            href={`/supply/${product.id}`}
                            className="group block"
                        >
                            <div className="aspect-square relative bg-secondary/30 rounded-lg overflow-hidden mb-2">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={product.title}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <h2 className="text-sm font-medium truncate group-hover:text-muted-foreground transition-colors">
                                {product.title}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {formatPrice(lowestPrice)}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
