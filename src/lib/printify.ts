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

export type PrintifyProductCreatePayload = {
    title: string;
    description: string;
    blueprint_id: number;
    print_provider_id: number;
    variants: Array<{
        id: number;
        price: number; // in cents
        is_enabled: boolean;
    }>;
    print_areas: Array<{
        variant_ids: number[];
        placeholders: Array<{
            position: string;
            images: Array<{
                id: string;
                x: number;
                y: number;
                scale: number;
                angle: number;
            }>;
        }>;
    }>;
    tags?: string[];
    visible?: boolean;
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

// Write API Functions
export async function createProduct(
    payload: PrintifyProductCreatePayload
): Promise<PrintifyProduct> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products.json`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to create product: ${response.status} ${response.statusText} - ${text}`
        );
    }

    return response.json();
}

export async function updateProduct(
    productId: string,
    payload: Partial<PrintifyProductCreatePayload>
): Promise<PrintifyProduct> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}.json`,
        {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to update product: ${response.status} ${response.statusText} - ${text}`
        );
    }

    return response.json();
}

export async function deleteProduct(productId: string): Promise<void> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}.json`,
        {
            method: "DELETE",
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to delete product: ${response.status} ${response.statusText} - ${text}`
        );
    }
}

export async function publishProduct(
    productId: string,
    publishOptions: {
        title?: boolean;
        description?: boolean;
        images?: boolean;
        variants?: boolean;
        tags?: boolean;
    } = {}
): Promise<void> {
    const shopId = getShopId();
    const options = {
        title: publishOptions.title ?? true,
        description: publishOptions.description ?? true,
        images: publishOptions.images ?? true,
        variants: publishOptions.variants ?? true,
        tags: publishOptions.tags ?? true,
    };

    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}/publish.json`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(options),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to publish product: ${response.status} ${response.statusText} - ${text}`
        );
    }
}

// ⭐ KEY FUNCTION: Clear the "Publishing..." state
export async function setPublishSucceeded(
    productId: string,
    externalData: {
        external_id: string; // Your store's product ID
        handle?: string; // URL handle/slug
    }
): Promise<void> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}/publishing_succeeded.json`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                external: externalData,
            }),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to set publish succeeded: ${response.status} ${response.statusText} - ${text}`
        );
    }
}

// Mark publishing as failed (also clears "Publishing..." state)
export async function setPublishFailed(
    productId: string,
    reason: string
): Promise<void> {
    const shopId = getShopId();
    const response = await fetch(
        `${PRINTIFY_API_BASE}/shops/${shopId}/products/${productId}/publishing_failed.json`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ reason }),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to set publish failed: ${response.status} ${response.statusText} - ${text}`
        );
    }
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

// Get only published products for your storefront
export async function getPublishedProducts(): Promise<PrintifyProduct[]> {
    const allProducts = await getAllProducts();
    return allProducts.filter(
        (p) => p.visible && getEnabledVariants(p).length > 0
    );
}

// ⭐ KEY FUNCTION: Sync products stuck in "Publishing..." state
export async function syncPublishedProducts(): Promise<string[]> {
    const allProducts = await getAllProducts();

    // Only sync products that are locked (stuck in "Publishing..." state)
    // These are products where someone clicked "Publish" in Printify UI
    const lockedProducts = allProducts.filter(
        (p) => p.is_locked && p.visible && getEnabledVariants(p).length > 0
    );

    if (lockedProducts.length === 0) {
        console.log("[Printify Sync] No products in 'Publishing...' state to sync");
        return [];
    }

    const syncedIds: string[] = [];

    for (const product of lockedProducts) {
        try {
            await setPublishSucceeded(product.id, {
                external_id: product.id,
                handle: product.title.toLowerCase().replace(/\s+/g, "-"),
            });
            syncedIds.push(product.id);
            console.log(
                `[Printify Sync] Cleared publishing state: ${product.title} (${product.id})`
            );
        } catch (error) {
            console.error(
                `[Printify Sync] Failed to sync ${product.title} (${product.id}):`,
                error
            );
        }
    }

    console.log(
        `[Printify Sync] Synced ${syncedIds.length} of ${lockedProducts.length} locked products`
    );
    return syncedIds;
}

// Check if a product is ready for sale
export function isProductPublished(product: PrintifyProduct): boolean {
    return product.visible && getEnabledVariants(product).length > 0;
}
