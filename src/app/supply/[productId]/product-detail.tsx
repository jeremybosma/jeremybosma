"use client";

import Image from "next/image";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PrintifyProduct, PrintifyVariant, PrintifyImage } from "@/lib/printify";
import { formatPrice } from "@/lib/printify";
import { useUserCountry } from "@/lib/use-user-country";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
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

export function ProductDetail({
    product,
    enabledVariants,
    colors,
    sizes,
    defaultImage,
    lowestPrice,
    highestPrice,
    cleanDescription,
    safetyInformation,
}: Props) {
    const [selectedColor, setSelectedColor] = React.useState<number | null>(
        colors.at(0)?.id ?? null
    );
    const [selectedSize, setSelectedSize] = React.useState<number | null>(
        sizes.at(0)?.id ?? null
    );
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [sizeUnit, setSizeUnit] = React.useState<"cm" | "in">("cm");
    const userCountry = useUserCountry();

    // Size chart data (measurements in cm)
    const sizeChart = {
        sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
        measurements: {
            width: [45.72, 50.8, 55.88, 60.96, 66.04, 71.12, 76.2, 81.28],
            length: [71.12, 73.66, 76.2, 78.74, 81.28, 83.82, 86.36, 88.9],
            sleeve: [38.35, 41.91, 45.72, 49.53, 53.34, 56.9, 60.2, 63.5],
            tolerance: [3.81, 3.81, 3.81, 3.81, 3.81, 3.81, 3.81, 3.81],
        },
    };

    const cmToInch = (cm: number) => (cm / 2.54).toFixed(1);
    const formatMeasurement = (cm: number) =>
        sizeUnit === "cm" ? cm.toFixed(1) : cmToInch(cm);

    // Close lightbox on escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setLightboxOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

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
            <div>
                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="aspect-square relative bg-secondary/30 overflow-hidden w-full cursor-zoom-in"
                >
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
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* Thumbnail Gallery */}
                {variantImages.length > 1 && (
                    <div className="flex overflow-x-auto pb-2">
                        {variantImages.map((img, index) => (
                            <button
                                key={img.src}
                                type="button"
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative w-[72px] h-[72px] shrink-0 overflow-hidden border transition-colors ${index === selectedImageIndex
                                    ? "border-border"
                                    : "border-transparent hover:border-muted-foreground/50"
                                    }`}
                            >
                                <Image
                                    src={img.src}
                                    alt={`${product.title} view ${index + 1}`}
                                    fill
                                    sizes="72px"
                                    className="object-contain bg-secondary/30"
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
                            ? formatPrice(selectedVariant.price, userCountry)
                            : lowestPrice === highestPrice
                                ? formatPrice(lowestPrice, userCountry)
                                : `${formatPrice(lowestPrice, userCountry)} - ${formatPrice(highestPrice, userCountry)}`}
                    </p>
                </div>

                {/* Color Selection - only show selector if more than 1 color */}
                {colors.length > 0 && (
                    <div>
                        <p className="text-sm font-medium">
                            Color:{" "}
                            <span className="text-muted-foreground font-normal">
                                {colors.find((c) => c.id === selectedColor)?.title}
                            </span>
                        </p>
                        {colors.filter((color) => isVariantAvailable(color.id, null)).length > 1 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {colors
                                    .filter((color) => isVariantAvailable(color.id, null))
                                    .map((color) => {
                                        const isSelected = selectedColor === color.id;
                                        const displayColor = color.colors.at(0) ?? "#888";

                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setSelectedColor(color.id)}
                                                className={`w-8 h-8 rounded-full border transition-all ${isSelected
                                                    ? "border-foreground scale-110"
                                                    : "border-transparent hover:border-muted-foreground/50"
                                                    }`}
                                                style={{ backgroundColor: displayColor }}
                                                title={color.title}
                                            />
                                        );
                                    })}
                            </div>
                        )}
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

                {/* Description, Sizing & Safety Accordions */}
                {(cleanDescription || sizes.length > 0 || safetyInformation) && (
                    <Accordion type="multiple" className="w-full">
                        {cleanDescription && (
                            <AccordionItem value="description">
                                <AccordionTrigger>Description</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {cleanDescription}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {sizes.length > 0 && (
                            <AccordionItem value="sizing">
                                <AccordionTrigger>Size Guide</AccordionTrigger>
                                <AccordionContent>
                                    {/* Unit Toggle */}
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setSizeUnit("cm")}
                                            className={`px-3 py-1 text-xs rounded-md border transition-all ${sizeUnit === "cm"
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border hover:border-muted-foreground"
                                                }`}
                                        >
                                            CM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSizeUnit("in")}
                                            className={`px-3 py-1 text-xs rounded-md border transition-all ${sizeUnit === "in"
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border hover:border-muted-foreground"
                                                }`}
                                        >
                                            IN
                                        </button>
                                    </div>

                                    {/* Measurements Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-2 pr-4 font-medium sticky left-0 bg-background">
                                                        {sizeUnit === "cm" ? "Measurement (cm)" : "Measurement (in)"}
                                                    </th>
                                                    {sizeChart.sizes.map((size) => (
                                                        <th key={size} className="text-center py-2 px-2 font-medium min-w-[50px]">
                                                            {size}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">Width</td>
                                                    {sizeChart.measurements.width.map((val, i) => (
                                                        <td key={i} className="text-center py-2 px-2">
                                                            {formatMeasurement(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">Length</td>
                                                    {sizeChart.measurements.length.map((val, i) => (
                                                        <td key={i} className="text-center py-2 px-2">
                                                            {formatMeasurement(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">Sleeve length</td>
                                                    {sizeChart.measurements.sleeve.map((val, i) => (
                                                        <td key={i} className="text-center py-2 px-2">
                                                            {formatMeasurement(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">Tolerance ±</td>
                                                    {sizeChart.measurements.tolerance.map((val, i) => (
                                                        <td key={i} className="text-center py-2 px-2 text-muted-foreground">
                                                            {formatMeasurement(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {safetyInformation && (
                            <AccordionItem value="safety">
                                <AccordionTrigger>Safety & Care</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {safetyInformation}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && currentImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
                        onClick={() => setLightboxOpen(false)}
                    >
                        {/* Blurred background */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Image */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative z-10 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={currentImage.src}
                                alt={product.title}
                                width={1200}
                                height={1200}
                                className="max-w-[90vw] max-h-[85dvh] w-auto h-auto object-contain cursor-zoom-out"
                                sizes="90vw"
                                onClick={() => setLightboxOpen(false)}
                                priority
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
