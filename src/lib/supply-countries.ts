export type SupplyCountry = {
  code: string;
  name: string;
  dialCode: string;
};

const DIAL_CODES: Record<string, string> = {
  AD: "+376",
  AE: "+971",
  AT: "+43",
  AU: "+61",
  BE: "+32",
  BG: "+359",
  CA: "+1",
  CH: "+41",
  CY: "+357",
  CZ: "+420",
  DE: "+49",
  DK: "+45",
  EE: "+372",
  ES: "+34",
  FI: "+358",
  FR: "+33",
  GB: "+44",
  GR: "+30",
  HR: "+385",
  HU: "+36",
  IE: "+353",
  IS: "+354",
  IT: "+39",
  JP: "+81",
  LI: "+423",
  LT: "+370",
  LU: "+352",
  LV: "+371",
  MC: "+377",
  MT: "+356",
  MX: "+52",
  NL: "+31",
  NO: "+47",
  NZ: "+64",
  PL: "+48",
  PT: "+351",
  RO: "+40",
  SE: "+46",
  SG: "+65",
  SI: "+386",
  SK: "+421",
  US: "+1",
};

const COUNTRY_CODES = Object.keys(DIAL_CODES).sort();

const displayNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const SUPPLY_SHIPPING_COUNTRIES: SupplyCountry[] = COUNTRY_CODES.map(
  (code) => ({
    code,
    name: displayNames?.of(code) ?? code,
    dialCode: DIAL_CODES[code] ?? "",
  })
).sort((left, right) => left.name.localeCompare(right.name));

const COUNTRY_CODE_SET = new Set(COUNTRY_CODES);

const COUNTRY_ALIASES: Record<string, string> = {
  UK: "GB",
};

export function normalizeCountryCode(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;

  const code = COUNTRY_ALIASES[trimmed] ?? trimmed;
  return COUNTRY_CODE_SET.has(code) ? code : null;
}

export function isSupportedCountryCode(value: string): boolean {
  return normalizeCountryCode(value) != null;
}

export function getDialCode(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return "";
  return DIAL_CODES[normalized] ?? "";
}

export function getCountryName(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return countryCode;
  return (
    SUPPLY_SHIPPING_COUNTRIES.find((country) => country.code === normalized)
      ?.name ?? normalized
  );
}

export function formatPhoneNumber(
  localDigits: string,
  countryCode: string
): string {
  const dialCode = getDialCode(countryCode);
  if (!dialCode) return localDigits.trim();

  const dialDigits = dialCode.replace(/\D/g, "");
  let local = localDigits.replace(/\D/g, "");
  if (local.startsWith("0")) {
    local = local.slice(1);
  }
  if (local.startsWith(dialDigits)) {
    local = local.slice(dialDigits.length);
  }

  return local ? `${dialCode}${local}` : "";
}

export function splitPhoneLocalNumber(
  phone: string,
  countryCode: string
): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  const dialDigits = getDialCode(countryCode).replace(/\D/g, "");
  if (dialDigits && digits.startsWith(dialDigits)) {
    return digits.slice(dialDigits.length);
  }

  if (phone.trim().startsWith("+") && dialDigits) {
    return digits.slice(dialDigits.length);
  }

  return digits;
}
