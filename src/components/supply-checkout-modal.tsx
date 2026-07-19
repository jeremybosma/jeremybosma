import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  formatPrice,
  type PrintifyShippingAddress,
  type PrintifyShippingCosts,
  type PrintifyVariant,
} from "@/lib/printify";
import {
  getSupplyAddressFieldErrors,
  getSupplyAddressError,
} from "@/lib/supply-address";
import {
  formatPhoneNumber,
  getDialCode,
  isSupportedCountryCode,
  splitPhoneLocalNumber,
  SUPPLY_SHIPPING_COUNTRIES,
} from "@/lib/supply-countries";
import { getShippingCostForMethod } from "@/lib/supply-shipping";
import {
  loadStoredSupplyCheckout,
  saveStoredSupplyCheckout,
} from "@/lib/supply-checkout-storage";

type SupplyCheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  variant: PrintifyVariant;
  countryCode?: string | null;
};

const EMPTY_ADDRESS: PrintifyShippingAddress = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "",
  region: "",
  address1: "",
  address2: "",
  city: "",
  zip: "",
};

const SHIPPING_OPTIONS = [
  { id: 1, key: "standard" as const, label: "Standard" },
  { id: 4, key: "economy" as const, label: "Economy" },
  { id: 2, key: "priority" as const, label: "Priority" },
];

const REGION_REQUIRED_COUNTRIES = new Set(["US", "CA", "AU"]);

async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      response.ok
        ? "Checkout returned an unexpected response"
        : "Checkout is unavailable right now"
    );
  }

  return response.json() as Promise<T>;
}

function getDefaultCountry(countryCode?: string | null): string {
  if (countryCode && isSupportedCountryCode(countryCode)) {
    return countryCode.toUpperCase();
  }
  return "NL";
}

function getRegionLabel(country: string): string {
  return REGION_REQUIRED_COUNTRIES.has(country)
    ? "State / province"
    : "Region (optional)";
}

export default function SupplyCheckoutModal({
  open,
  onClose,
  productId,
  productTitle,
  variant,
  countryCode,
}: SupplyCheckoutModalProps) {
  const [address, setAddress] = React.useState(EMPTY_ADDRESS);
  const [phoneLocal, setPhoneLocal] = React.useState("");
  const [shippingMethod, setShippingMethod] = React.useState(1);
  const [shippingCosts, setShippingCosts] =
    React.useState<PrintifyShippingCosts | null>(null);
  const [loadingShipping, setLoadingShipping] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showFieldErrors, setShowFieldErrors] = React.useState(false);

  const fieldErrors = React.useMemo(
    () => getSupplyAddressFieldErrors(address),
    [address]
  );

  const dialCode = getDialCode(address.country);

  const persistCheckout = React.useCallback(
    (nextAddress: PrintifyShippingAddress, method = shippingMethod) => {
      saveStoredSupplyCheckout({
        address: nextAddress,
        shippingMethod: method,
      });
    },
    [shippingMethod]
  );

  const syncPhone = React.useCallback(
    (nextAddress: PrintifyShippingAddress, localPhone: string) => {
      if (!nextAddress.country) {
        return { ...nextAddress, phone: localPhone };
      }

      return {
        ...nextAddress,
        phone: formatPhoneNumber(localPhone, nextAddress.country),
      };
    },
    []
  );

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) {
      setShippingCosts(null);
      setLoadingShipping(false);
      setSubmitting(false);
      setError(null);
      setShowFieldErrors(false);
      return;
    }

    const stored = loadStoredSupplyCheckout();
    if (stored?.address.country) {
      setAddress(stored.address);
      setPhoneLocal(
        splitPhoneLocalNumber(stored.address.phone, stored.address.country)
      );
      setShippingMethod(stored.shippingMethod);
      return;
    }

    const defaultCountry = getDefaultCountry(countryCode);
    setAddress({ ...EMPTY_ADDRESS, country: defaultCountry });
    setPhoneLocal("");
    setShippingMethod(1);
  }, [open, countryCode]);

  const subtotal = variant.price;
  const shippingCost =
    shippingCosts != null
      ? getShippingCostForMethod(shippingCosts, shippingMethod)
      : null;
  const total =
    shippingCost != null ? subtotal + shippingCost : null;

  const updateAddress = (field: keyof PrintifyShippingAddress, value: string) => {
    setAddress((current) => {
      const next = syncPhone({ ...current, [field]: value }, phoneLocal);
      persistCheckout(next);
      return next;
    });
    setShippingCosts(null);
    setError(null);
  };

  const updateCountry = (value: string) => {
    setAddress((current) => {
      const next = syncPhone({ ...current, country: value }, phoneLocal);
      persistCheckout(next);
      return next;
    });
    setShippingCosts(null);
    setError(null);
  };

  const updatePhoneLocal = (value: string) => {
    const sanitized = value.replace(/[^\d\s-]/g, "");
    setPhoneLocal(sanitized);
    setAddress((current) => {
      const next = syncPhone(current, sanitized);
      persistCheckout(next);
      return next;
    });
    setShippingCosts(null);
    setError(null);
  };

  const validateBeforeSubmit = () => {
    setShowFieldErrors(true);
    return getSupplyAddressError(address);
  };

  const fetchShipping = async () => {
    const addressError = validateBeforeSubmit();
    if (addressError) {
      setError(addressError);
      return;
    }

    setLoadingShipping(true);
    setError(null);

    try {
      const response = await fetch("/api/supply/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "shipping",
          productId,
          variantId: variant.id,
          quantity: 1,
          address,
        }),
      });

      const data = await readApiJson<{
        error?: string;
        shipping?: PrintifyShippingCosts;
      }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to calculate shipping");
      }

      setShippingCosts(data.shipping ?? null);
      persistCheckout(address, shippingMethod);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to calculate shipping"
      );
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCheckout = async () => {
    const addressError = validateBeforeSubmit();
    if (addressError) {
      setError(addressError);
      return;
    }

    if (!shippingCosts) {
      setError("Calculate shipping before continuing to payment");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/supply/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          productId,
          variantId: variant.id,
          quantity: 1,
          shippingMethod,
          address,
        }),
      });

      const data = await readApiJson<{
        error?: string;
        checkoutUrl?: string;
      }>(response);

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Failed to start checkout");
      }

      persistCheckout(address, shippingMethod);
      window.location.assign(data.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Failed to start checkout"
      );
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Checkout</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {productTitle}
                  {" · "}
                  {variant.title}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 max-h-[70dvh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  value={address.first_name}
                  autoComplete="given-name"
                  error={showFieldErrors ? fieldErrors.first_name : undefined}
                  onChange={(value) => updateAddress("first_name", value)}
                />
                <Field
                  label="Last name"
                  value={address.last_name}
                  autoComplete="family-name"
                  error={showFieldErrors ? fieldErrors.last_name : undefined}
                  onChange={(value) => updateAddress("last_name", value)}
                />
              </div>

              <Field
                label="Email"
                type="email"
                value={address.email}
                autoComplete="email"
                inputMode="email"
                error={showFieldErrors ? fieldErrors.email : undefined}
                onChange={(value) => updateAddress("email", value)}
              />

              <CountrySelect
                value={address.country}
                error={showFieldErrors ? fieldErrors.country : undefined}
                onChange={updateCountry}
              />

              <PhoneField
                dialCode={dialCode}
                value={phoneLocal}
                countrySelected={Boolean(address.country)}
                error={showFieldErrors ? fieldErrors.phone : undefined}
                onChange={updatePhoneLocal}
              />

              <Field
                label="Street address"
                value={address.address1}
                autoComplete="address-line1"
                error={showFieldErrors ? fieldErrors.address1 : undefined}
                onChange={(value) => updateAddress("address1", value)}
              />

              <Field
                label="Apartment, suite, etc. (optional)"
                value={address.address2 ?? ""}
                autoComplete="address-line2"
                onChange={(value) => updateAddress("address2", value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  value={address.city}
                  autoComplete="address-level2"
                  error={showFieldErrors ? fieldErrors.city : undefined}
                  onChange={(value) => updateAddress("city", value)}
                />
                <Field
                  label="Postal code"
                  value={address.zip}
                  autoComplete="postal-code"
                  error={showFieldErrors ? fieldErrors.zip : undefined}
                  onChange={(value) => updateAddress("zip", value)}
                />
              </div>

              <Field
                label={getRegionLabel(address.country)}
                value={address.region}
                autoComplete="address-level1"
                onChange={(value) => updateAddress("region", value)}
              />

              <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, countryCode)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shippingCost != null
                      ? formatPrice(shippingCost, countryCode)
                      : "Calculate below"}
                  </span>
                </div>
                {total != null ? (
                  <div className="flex justify-between font-medium pt-1 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(total, countryCode)}</span>
                  </div>
                ) : null}
              </div>

              {shippingCosts ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shipping method</p>
                  <div className="flex flex-wrap gap-2">
                    {SHIPPING_OPTIONS.map((option) => {
                      const cost = getShippingCostForMethod(
                        shippingCosts,
                        option.id
                      );
                      if (cost == null) return null;
                      const selected = shippingMethod === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setShippingMethod(option.id);
                            persistCheckout(address, option.id);
                          }}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          {option.label}
                          {" · "}
                          {formatPrice(cost, countryCode)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 pt-1">
                {!shippingCosts ? (
                  <button
                    type="button"
                    disabled={loadingShipping}
                    onClick={() => void fetchShipping()}
                    className="w-full px-4 py-3 text-sm font-medium rounded-md border border-border hover:bg-secondary transition-colors disabled:opacity-60"
                  >
                    {loadingShipping
                      ? "Calculating shipping..."
                      : "Calculate shipping"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleCheckout()}
                    className="w-full px-4 py-3 text-sm font-medium rounded-md border border-foreground bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {submitting
                      ? "Redirecting to payment..."
                      : `Continue to payment${
                          total != null
                            ? ` · ${formatPrice(total, countryCode)}`
                            : ""
                        }`}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-border focus:border-muted-foreground"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}

function CountrySelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">Country</span>
      <select
        value={value}
        aria-invalid={error ? true : undefined}
        autoComplete="country"
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-border focus:border-muted-foreground"
        }`}
      >
        <option value="" disabled>
          Select country
        </option>
        {SUPPLY_SHIPPING_COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}

function PhoneField({
  dialCode,
  value,
  countrySelected,
  onChange,
  error,
}: {
  dialCode: string;
  value: string;
  countrySelected: boolean;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">Phone</span>
      <div className="mt-1 flex gap-2">
        <div
          className={`shrink-0 px-3 py-2 border rounded-md text-sm tabular-nums ${
            countrySelected
              ? "border-border text-foreground"
              : "border-border text-muted-foreground"
          }`}
          aria-hidden="true"
        >
          {dialCode || "-"}
        </div>
        <input
          type="tel"
          value={value}
          disabled={!countrySelected}
          autoComplete="tel-national"
          inputMode="tel"
          placeholder={countrySelected ? "6 12345678" : "Select country first"}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`min-w-0 flex-1 px-3 py-2 border rounded-md bg-transparent focus:outline-none transition-colors disabled:opacity-60 ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-border focus:border-muted-foreground"
          }`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {countrySelected
          ? "Enter your local number without the country code."
          : "Choose your country so we can format your phone number correctly."}
      </p>
      {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}
