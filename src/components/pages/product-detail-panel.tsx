import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { supplyTitleVtName } from "@/lib/page-view-transition";
import { formatPrice } from "@/lib/printify";
import { useUserCountry } from "@/lib/use-user-country";
import type { ProductDetailData } from "@/lib/use-product-detail";
import { useProductDetailStore } from "@/lib/use-product-detail";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetailPanel(props: ProductDetailData) {
  const userCountry = useUserCountry();
  const {
    data,
    selectedColor,
    selectedSize,
    selectedVariant,
    currentImage,
    lightboxOpen,
    sizeUnit,
    isVariantAvailable,
    setSelectedColor,
    setSelectedSize,
    setLightboxOpen,
    setSizeUnit,
  } = useProductDetailStore(props, { effects: true });

  const {
    product,
    lowestPrice,
    highestPrice,
    cleanDescription,
    safetyInformation,
    colors,
    sizes,
  } = data;

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLightboxOpen]);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1
            className="page-title-vt text-2xl font-semibold mb-2"
            style={
              {
                "--page-title-vt": supplyTitleVtName(product.id),
              } as React.CSSProperties
            }
          >
            {product.title}
          </h1>
          <p className="text-xl">
            {selectedVariant
              ? formatPrice(selectedVariant.price, userCountry)
              : lowestPrice === highestPrice
                ? formatPrice(lowestPrice, userCountry)
                : `${formatPrice(lowestPrice, userCountry)} - ${formatPrice(highestPrice, userCountry)}`}
          </p>
        </div>

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
                        className={`w-8 h-8 rounded-full border transition-all ${
                          isSelected
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
                    className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                      isSelected
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
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setSizeUnit("cm")}
                      className={`px-3 py-1 text-xs rounded-md border transition-all ${
                        sizeUnit === "cm"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeUnit("in")}
                      className={`px-3 py-1 text-xs rounded-md border transition-all ${
                        sizeUnit === "in"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      IN
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 font-medium sticky left-0 bg-background">
                            {sizeUnit === "cm" ? "Measurement (cm)" : "Measurement (in)"}
                          </th>
                          {sizeChart.sizes.map((size) => (
                            <th
                              key={size}
                              className="text-center py-2 px-2 font-medium min-w-[50px]"
                            >
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">
                            Width
                          </td>
                          {sizeChart.measurements.width.map((val, i) => (
                            <td key={i} className="text-center py-2 px-2">
                              {formatMeasurement(val)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">
                            Length
                          </td>
                          {sizeChart.measurements.length.map((val, i) => (
                            <td key={i} className="text-center py-2 px-2">
                              {formatMeasurement(val)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">
                            Sleeve length
                          </td>
                          {sizeChart.measurements.sleeve.map((val, i) => (
                            <td key={i} className="text-center py-2 px-2">
                              {formatMeasurement(val)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-muted-foreground sticky left-0 bg-background">
                            Tolerance ±
                          </td>
                          {sizeChart.measurements.tolerance.map((val, i) => (
                            <td
                              key={i}
                              className="text-center py-2 px-2 text-muted-foreground"
                            >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.src}
                alt={`${product.title} fullscreen view`}
                className="max-w-[90vw] max-h-[85dvh] w-auto h-auto object-contain cursor-zoom-out"
                onClick={() => setLightboxOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
