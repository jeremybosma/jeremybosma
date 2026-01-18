const PRINTIFY_API_BASE = "https://api.printify.com/v1";

function getHeaders() {
    const token = process.env.PRINTIFY_API_TOKEN;
    if (!token) {
        throw new Error("PRINTIFY_API_TOKEN is not set");
    }
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Portfolio-Supply",
    };
}

function getShopId() {
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) {
        throw new Error("PRINTIFY_SHOP_ID is not set");
    }
    return shopId;
}

// Types
export type PrintifyShop = {
    id: number;
    title: string;
    sales_channel: string;
};

export type PrintifyVariant = {
    id: number;
    sku: string;
    cost: number;
    price: number;
    title: string;
    grams: number;
    is_enabled: boolean;
    is_default: boolean;
    is_available: boolean;
    options: number[];
};

export type PrintifyImage = {
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
};

export type PrintifyOption = {
    name: string;
    type: string;
    values: Array<{
        id: number;
        title: string;
        colors?: string[];
    }>;
};

export type PrintifyProduct = {
    id: string;
    title: string;
    description: string;
    safety_information?: string;
    tags: string[];
    options: PrintifyOption[];
    variants: PrintifyVariant[];
    images: PrintifyImage[];
    created_at: string;
    updated_at: string;
    visible: boolean;
    is_locked: boolean;
    blueprint_id: number;
    user_id: number;
    shop_id: number;
    print_provider_id: number;
};

export type PrintifyProductsResponse = {
    current_page: number;
    data: PrintifyProduct[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

// API Functions
export async function getShops(): Promise<PrintifyShop[]> {
    const response = await fetch(`${PRINTIFY_API_BASE}/shops.json`, {
        headers: getHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.statusText}`);
    }

    return response.json();
}

export async function getProducts(
    page = 1,
    limit = 50
): Promise<PrintifyProductsResponse> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products.json?page=${page}&limit=${limit}`,
        {
            headers: getHeaders(),
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
}

export async function getProduct(productId: string): Promise<PrintifyProduct> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}.json`,
        {
            headers: getHeaders(),
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
}

export async function getAllProducts(): Promise<PrintifyProduct[]> {
    const allProducts: PrintifyProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await getProducts(page, 50);
        allProducts.push(...response.data);

        if (response.next_page_url) {
            page++;
        } else {
            hasMore = false;
        }
    }

    return allProducts;
}

// Helper functions
export function getDefaultImage(product: PrintifyProduct): string | null {
    const defaultImage = product.images.find((img) => img.is_default);
    if (defaultImage) return defaultImage.src;
    return product.images.at(0)?.src ?? null;
}

export function getFrontImage(product: PrintifyProduct): string | null {
    const frontImage = product.images.find((img) => img.position === "front");
    if (frontImage) return frontImage.src;
    return getDefaultImage(product);
}

export function getEnabledVariants(product: PrintifyProduct): PrintifyVariant[] {
    return product.variants.filter((v) => v.is_enabled && v.is_available);
}

type CurrencyConfig = {
    locale: string;
    currency: string;
};

const REGION_CURRENCY_MAP: Record<string, CurrencyConfig> = {
    // EU countries
    AT: { locale: "de-AT", currency: "EUR" },
    BE: { locale: "fr-BE", currency: "EUR" },
    DE: { locale: "de-DE", currency: "EUR" },
    ES: { locale: "es-ES", currency: "EUR" },
    FI: { locale: "fi-FI", currency: "EUR" },
    FR: { locale: "fr-FR", currency: "EUR" },
    GR: { locale: "el-GR", currency: "EUR" },
    IE: { locale: "en-IE", currency: "EUR" },
    IT: { locale: "it-IT", currency: "EUR" },
    LU: { locale: "fr-LU", currency: "EUR" },
    NL: { locale: "nl-NL", currency: "EUR" },
    PT: { locale: "pt-PT", currency: "EUR" },
    // UK
    GB: { locale: "en-GB", currency: "GBP" },
    UK: { locale: "en-GB", currency: "GBP" },
    // US
    US: { locale: "en-US", currency: "USD" },
    // Canada
    CA: { locale: "en-CA", currency: "CAD" },
    // Australia
    AU: { locale: "en-AU", currency: "AUD" },
    // Japan
    JP: { locale: "ja-JP", currency: "JPY" },
    // Switzerland
    CH: { locale: "de-CH", currency: "CHF" },
};

// Default to EUR for European focus
const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
    locale: "nl-NL",
    currency: "EUR",
};

export function getCurrencyConfig(countryCode?: string | null): CurrencyConfig {
    if (!countryCode) return DEFAULT_CURRENCY_CONFIG;
    return REGION_CURRENCY_MAP[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY_CONFIG;
}

export function formatPrice(cents: number, countryCode?: string | null): string {
    const config = getCurrencyConfig(countryCode);
    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.currency,
    }).format(cents / 100);
}

export function getVariantImages(
    product: PrintifyProduct,
    variantId: number
): PrintifyImage[] {
    return product.images.filter((img) => img.variant_ids.includes(variantId));
}

export function getUniqueColors(product: PrintifyProduct): Array<{
    id: number;
    title: string;
    colors: string[];
}> {
    const colorOption = product.options.find((opt) => opt.type === "color");
    if (!colorOption) return [];

    return colorOption.values.map((v) => ({
        id: v.id,
        title: v.title,
        colors: v.colors ?? [],
    }));
}

export function getUniqueSizes(product: PrintifyProduct): Array<{
    id: number;
    title: string;
}> {
    const sizeOption = product.options.find((opt) => opt.type === "size");
    if (!sizeOption) return [];

    return sizeOption.values.map((v) => ({
        id: v.id,
        title: v.title,
    }));
}
