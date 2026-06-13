import React from "react";
import { motion, AnimatePresence } from "motion/react";
import SupplyCheckoutModal from "@/components/supply-checkout-modal";
import { supplyTitleVtName } from "@/lib/page-view-transition";
import { formatPrice } from "@/lib/printify";
import { useUserCountry } from "@/lib/use-user-country";
import type { ProductDetailData } from "@/lib/use-product-detail";
import { useProductDetailStore } from "@/lib/use-product-detail";
export default function ProductDetailPanel(props: ProductDetailData) {
  const userCountry = useUserCountry();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [checkoutNotice, setCheckoutNotice] = React.useState<{
    type: "success" | "error" | "cancelled";
    message: string;
  } | null>(null);
  const {
    data,
    selectedColor,
    selectedSize,
    selectedVariant,
    currentImage,
    lightboxOpen,
    isVariantAvailable,
    setSelectedColor,
    setSelectedSize,
    setLightboxOpen,
  } = useProductDetailStore(props, { effects: true });

  const { product, colors, sizes, paymentsConfigured } = data;

  const canPurchase =
    paymentsConfigured &&
    selectedVariant != null &&
    isVariantAvailable(selectedColor, selectedSize);

  const purchasePrice = selectedVariant
    ? formatPrice(selectedVariant.price, userCountry)
    : null;

  const handlePurchase = () => {
    if (!selectedVariant || !canPurchase) return;
    setCheckoutOpen(true);
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const checkoutId =
      params.get("checkout_id") ?? params.get("session_id");

    if (!checkout) return;

    if (checkout === "cancelled") {
      setCheckoutNotice({
        type: "cancelled",
        message: "Payment was cancelled. You can try again when ready.",
      });
      params.delete("checkout");
      params.delete("checkout_id");
      params.delete("session_id");
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${
        nextSearch ? `?${nextSearch}` : ""
      }`;
      window.history.replaceState({}, "", nextUrl);
      return;
    }

    if (checkout !== "success" || !checkoutId) return;

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          `/api/supply/checkout-complete?checkout_id=${encodeURIComponent(checkoutId)}`
        );
        const data = (await response.json()) as {
          error?: string;
          orderId?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to confirm payment");
        }

        if (cancelled) return;

        setCheckoutNotice({
          type: "success",
          message: data.orderId
            ? `Payment received. Your order is being prepared (Printify #${data.orderId}).`
            : "Payment received. Your order is being prepared.",
        });
      } catch (error) {
        if (cancelled) return;
        setCheckoutNotice({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Payment succeeded but order confirmation failed",
        });
      } finally {
        params.delete("checkout");
        params.delete("session_id");
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${
          nextSearch ? `?${nextSearch}` : ""
        }`;
        window.history.replaceState({}, "", nextUrl);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        </div>

        {colors.length > 0 && (
          <div>
            <p className="text-sm font-medium">
              {"Color: "}
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
              {"Size: "}
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

        {checkoutNotice ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              checkoutNotice.type === "success"
                ? "border-green-600/30 bg-green-600/10 text-green-800 dark:text-green-300"
                : checkoutNotice.type === "cancelled"
                  ? "border-border bg-secondary/40 text-muted-foreground"
                  : "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-300"
            }`}
          >
            {checkoutNotice.message}
          </div>
        ) : null}

        <button
          type="button"
          disabled={!canPurchase}
          onClick={handlePurchase}
          className={`w-full px-4 py-3 text-sm font-medium rounded-md border transition-all ${
            canPurchase
              ? "border-foreground bg-foreground text-background hover:opacity-90"
              : "border-border bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
          }`}
        >
          {canPurchase && purchasePrice
            ? `Purchase for ${purchasePrice}`
            : "Out of Stock"}
        </button>
      </div>

      {selectedVariant ? (
        <SupplyCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          productId={product.id}
          productTitle={product.title}
          variant={selectedVariant}
          countryCode={userCountry}
        />
      ) : null}

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
