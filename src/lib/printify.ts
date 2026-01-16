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

export function formatPrice(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
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
