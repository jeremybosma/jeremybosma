"use client";

import { useState, useEffect } from "react";

// Map common timezone prefixes to country codes
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
    "Europe/Amsterdam": "NL",
    "Europe/Berlin": "DE",
    "Europe/Paris": "FR",
    "Europe/London": "GB",
    "Europe/Dublin": "IE",
    "Europe/Madrid": "ES",
    "Europe/Rome": "IT",
    "Europe/Lisbon": "PT",
    "Europe/Brussels": "BE",
    "Europe/Vienna": "AT",
    "Europe/Athens": "GR",
    "Europe/Helsinki": "FI",
    "Europe/Luxembourg": "LU",
    "Europe/Zurich": "CH",
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Phoenix": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Perth": "AU",
    "Asia/Tokyo": "JP",
};

function getCountryFromTimezone(): string | null {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return TIMEZONE_COUNTRY_MAP[timezone] ?? null;
    } catch {
        return null;
    }
}

function getCountryFromLanguage(): string | null {
    try {
        // navigator.language returns like "en-US", "nl-NL", "de-DE"
        const lang = navigator.language;
        const parts = lang.split("-");
        if (parts.length > 1) {
            return parts.at(-1)?.toUpperCase() ?? null;
        }
        // Fallback mappings for language-only codes
        const langCountryMap: Record<string, string> = {
            en: "US",
            nl: "NL",
            de: "DE",
            fr: "FR",
            es: "ES",
            it: "IT",
            pt: "PT",
            ja: "JP",
        };
        return langCountryMap[parts.at(0) ?? ""] ?? null;
    } catch {
        return null;
    }
}

export function useUserCountry(): string | null {
    const [country, setCountry] = useState<string | null>(null);

    useEffect(() => {
        // Try timezone first (more accurate)
        let detectedCountry = getCountryFromTimezone();

        // Fall back to language
        if (!detectedCountry) {
            detectedCountry = getCountryFromLanguage();
        }

        setCountry(detectedCountry);
    }, []);

    return country;
}
