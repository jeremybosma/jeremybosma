import { Polar, ServerProduction, ServerSandbox } from "@polar-sh/sdk";
import { SITE_URL } from "@/lib/site";

let polarClient: Polar | null = null;

export function getPolar(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }

  if (!polarClient) {
    polarClient = new Polar({
      accessToken,
      server:
        process.env.POLAR_SERVER === "sandbox"
          ? ServerSandbox
          : ServerProduction,
    });
  }

  return polarClient;
}

import { isPolarProductCatalogConfigured } from "@/lib/polar-product-ids";

export function isPolarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN && isPolarProductCatalogConfigured()
  );
}

export function getSiteBaseUrl(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return SITE_URL;
}
