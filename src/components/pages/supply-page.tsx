import type React from "react";
import { HoverSlideItem, HoverSlideList } from "@/components/hover-slide-list";
import { useInstallHoverSlideLists } from "@/lib/hover-slide-list-dom";
import type { SupplyListItem } from "@/lib/printify";
import { supplyImageVtName, supplyTitleVtName } from "@/lib/page-view-transition";
import { IconTshirt } from "@/lib/symbols-react";

type SupplyPageContentProps = {
  products: SupplyListItem[] | null;
  error: string | null;
};

const SHOW_SUPPLY_COMING_SOON = false;

export default function SupplyPageContent({
  products,
  error,
}: SupplyPageContentProps) {
    useInstallHoverSlideLists();

    if (error || !products || products.length === 0) {
        if (SHOW_SUPPLY_COMING_SOON) {
            return (
                <section className="page-panel-vt text-[17px] flex flex-col items-center justify-center min-h-[60vh]">
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

        return <section className="page-panel-vt text-[17px]" />;
    }

    return (
        <section className="page-panel-vt text-[17px]">
            <HoverSlideList className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                    <HoverSlideItem
                        key={product.id}
                        href={`/supply/${product.id}`}
                        className="group block rounded-lg p-3"
                        aria-label={`View ${product.title} product details`}
                    >
                        <div className="aspect-square relative bg-secondary/20 overflow-hidden mb-2 rounded-md">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={`${product.title} product image`}
                                    className="page-image-vt absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    style={
                                        {
                                            "--page-image-vt": supplyImageVtName(product.id),
                                        } as React.CSSProperties
                                    }
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <p
                            className="page-title-vt hover-slide-title hover-slide-muted text-xs text-center text-muted-foreground"
                            style={
                                {
                                    "--page-title-vt": supplyTitleVtName(product.id),
                                } as React.CSSProperties
                            }
                        >
                            {product.title}
                        </p>
                    </HoverSlideItem>
                ))}
            </HoverSlideList>
        </section>
    );
}
