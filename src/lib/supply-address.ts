import type { PrintifyShippingAddress } from "@/lib/printify";
import {
  formatPhoneNumber,
  getDialCode,
  isSupportedCountryCode,
  normalizeCountryCode,
} from "@/lib/supply-countries";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SupplyAddressFieldErrors = Partial<
  Record<keyof PrintifyShippingAddress, string>
>;

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePhone(phone: string, country: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return "Enter a valid phone number";
  }

  const dialCode = getDialCode(country);
  const dialDigits = dialCode.replace(/\D/g, "");
  if (!dialDigits) {
    return "Select a valid country";
  }

  if (phone.trim().startsWith("+") && !digits.startsWith(dialDigits)) {
    return `Phone number should use ${dialCode}`;
  }

  return null;
}

export function getSupplyAddressFieldErrors(
  address: PrintifyShippingAddress
): SupplyAddressFieldErrors {
  const errors: SupplyAddressFieldErrors = {};

  if (!isNonEmpty(address.first_name)) {
    errors.first_name = "First name is required";
  }

  if (!isNonEmpty(address.last_name)) {
    errors.last_name = "Last name is required";
  }

  if (!isNonEmpty(address.email)) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(address.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!isNonEmpty(address.phone)) {
    errors.phone = "Phone number is required";
  } else if (!isSupportedCountryCode(address.country)) {
    errors.phone = "Select a country before entering your phone number";
  } else {
    const phoneError = validatePhone(address.phone, address.country);
    if (phoneError) errors.phone = phoneError;
  }

  if (!isNonEmpty(address.address1)) {
    errors.address1 = "Street address is required";
  }

  if (!isNonEmpty(address.city)) {
    errors.city = "City is required";
  }

  if (!isNonEmpty(address.zip)) {
    errors.zip = "Postal code is required";
  }

  if (!isNonEmpty(address.country)) {
    errors.country = "Select your country";
  } else if (!isSupportedCountryCode(address.country)) {
    errors.country = "Choose a country from the list";
  }

  return errors;
}

export function getSupplyAddressError(
  address: PrintifyShippingAddress
): string | null {
  const errors = getSupplyAddressFieldErrors(address);
  return Object.values(errors).find(Boolean) ?? null;
}

export function assertSupplyAddress(
  address: PrintifyShippingAddress
): PrintifyShippingAddress {
  const errors = getSupplyAddressFieldErrors(address);
  const firstError = Object.values(errors).find(Boolean);
  if (firstError) {
    throw new Error(firstError);
  }

  const country = normalizeCountryCode(address.country);
  if (!country) {
    throw new Error("Choose a country from the list");
  }

  const phone = address.phone.trim().startsWith("+")
    ? `+${address.phone.replace(/\D/g, "")}`
    : formatPhoneNumber(address.phone, country);

  return {
    first_name: address.first_name.trim(),
    last_name: address.last_name.trim(),
    email: address.email.trim().toLowerCase(),
    phone,
    country,
    region: address.region?.trim() ?? "",
    address1: address.address1.trim(),
    address2: address.address2?.trim() || undefined,
    city: address.city.trim(),
    zip: address.zip.trim().toUpperCase(),
  };
}
