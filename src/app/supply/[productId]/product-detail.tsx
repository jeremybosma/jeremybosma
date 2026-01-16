"use client";

import Image from "next/image";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PrintifyProduct, PrintifyVariant, PrintifyImage } from "@/lib/printify";
import { formatPrice } from "@/lib/printify";

type Props = {
    product: PrintifyProduct;
    enabledVariants: PrintifyVariant[];
    colors: Array<{ id: number; title: string; colors: string[] }>;
    sizes: Array<{ id: number; title: string }>;
    defaultImage: string | null;
    lowestPrice: number;
    highestPrice: number;
    cleanDescription: string;
};

export function ProductDetail({
    product,
    enabledVariants,
    colors,
    sizes,
    defaultImage,
    lowestPrice,
    highestPrice,
    cleanDescription,
}: Props) {
    const [selectedColor, setSelectedColor] = React.useState<number | null>(
        colors.at(0)?.id ?? null
    );
    const [selectedSize, setSelectedSize] = React.useState<number | null>(
        sizes.at(0)?.id ?? null
    );
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

    // Find the selected variant
    const selectedVariant = React.useMemo(() => {
        if (!selectedColor && !selectedSize) return enabledVariants.at(0);

        return enabledVariants.find((v) => {
            const hasColor = selectedColor ? v.options.includes(selectedColor) : true;
            const hasSize = selectedSize ? v.options.includes(selectedSize) : true;
            return hasColor && hasSize;
        });
    }, [selectedColor, selectedSize, enabledVariants]);

    // Get images for the selected variant
    const variantImages = React.useMemo(() => {
        if (!selectedVariant) return product.images;

        const images = product.images.filter((img) =>
            img.variant_ids.includes(selectedVariant.id)
        );

        return images.length > 0 ? images : product.images;
    }, [selectedVariant, product.images]);

    // Reset image index when variant changes
    React.useEffect(() => {
        setSelectedImageIndex(0);
    }, [selectedVariant?.id]);

    const currentImage = variantImages.at(selectedImageIndex) ?? variantImages.at(0);

    // Check if a variant combination is available
    const isVariantAvailable = (colorId: number | null, sizeId: number | null) => {
        return enabledVariants.some((v) => {
            const hasColor = colorId ? v.options.includes(colorId) : true;
            const hasSize = sizeId ? v.options.includes(sizeId) : true;
            return hasColor && hasSize;
        });
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square relative bg-secondary/30 rounded-lg overflow-hidden">
                    <AnimatePresence mode="wait">
                        {currentImage && (
                            <motion.div
                                key={currentImage.src}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                <Image
                                    src={currentImage.src}
                                    alt={product.title}
                                    fill
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                    className="object-contain p-4"
                                    priority
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Thumbnail Gallery */}
                {variantImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {variantImages.map((img, index) => (
                            <button
                                key={img.src}
                                type="button"
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${index === selectedImageIndex
                                    ? "border-foreground"
                                    : "border-transparent hover:border-muted-foreground/50"
                                    }`}
                            >
                                <Image
                                    src={img.src}
                                    alt={`${product.title} view ${index + 1}`}
                                    fill
                                    sizes="64px"
                                    className="object-contain bg-secondary/30 p-1"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>
                    <p className="text-xl">
                        {selectedVariant
                            ? formatPrice(selectedVariant.price)
                            : lowestPrice === highestPrice
                                ? formatPrice(lowestPrice)
                                : `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`}
                    </p>
                </div>

                {/* Color Selection */}
                {colors.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">
                            Color:{" "}
                            <span className="text-muted-foreground font-normal">
                                {colors.find((c) => c.id === selectedColor)?.title}
                            </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => {
                                const available = isVariantAvailable(color.id, selectedSize);
                                const isSelected = selectedColor === color.id;
                                const displayColor = color.colors.at(0) ?? "#888";

                                return (
                                    <button
                                        key={color.id}
                                        type="button"
                                        disabled={!available}
                                        onClick={() => setSelectedColor(color.id)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected
                                            ? "border-foreground scale-110"
                                            : "border-transparent hover:border-muted-foreground/50"
                                            } ${!available ? "opacity-30 cursor-not-allowed" : ""}`}
                                        style={{ backgroundColor: displayColor }}
                                        title={color.title}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Size Selection */}
                {sizes.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">
                            Size:{" "}
                            <span className="text-muted-foreground font-normal">
                                {sizes.find((s) => s.id === selectedSize)?.title}
                            </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => {
                                const available = isVariantAvailable(selectedColor, size.id);
                                const isSelected = selectedSize === size.id;

                                return (
                                    <button
                                        key={size.id}
                                        type="button"
                                        disabled={!available}
                                        onClick={() => setSelectedSize(size.id)}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-all ${isSelected
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border hover:border-muted-foreground"
                                            } ${!available ? "opacity-30 cursor-not-allowed" : ""}`}
                                    >
                                        {size.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* SKU */}
                {selectedVariant && (
                    <p className="text-xs text-muted-foreground">
                        SKU: {selectedVariant.sku}
                    </p>
                )}

                {/* Description */}
                {cleanDescription && (
                    <div className="pt-4 border-t border-border">
                        <h2 className="text-sm font-medium mb-2">Description</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {cleanDescription}
                        </p>
                    </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                    <div className="pt-4 border-t border-border">
                        <h2 className="text-sm font-medium mb-2">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
