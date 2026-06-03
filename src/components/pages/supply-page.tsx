import { getPublishedProducts, getDefaultImage } from "@/lib/printify";
import { IconTshirt } from "@/lib/symbols-react";

type SupplyPageContentProps = {
  products: Awaited<ReturnType<typeof getPublishedProducts>> | null;
  error: string | null;
};

export default function SupplyPageContent({
  products,
  error,
}: SupplyPageContentProps) {
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => {
                    const imageUrl = getDefaultImage(product);

                    return (
                        <a
                            key={product.id}
                            href={`/supply/${product.id}`}
                            className="group block"
                            aria-label={`View ${product.title} product details`}
                        >
                            <div className="aspect-square relative bg-secondary/20 overflow-hidden mb-2">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={`${product.title} product image`}
                                        className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                                {product.title}
                            </p>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
