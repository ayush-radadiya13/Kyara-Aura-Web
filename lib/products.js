import { PRODUCT_API_ROUTES } from "@/lib/routes";

const DEFAULT_SPECS = [
  { label: 'Brand', value: 'Kyara Aura' },
  { label: 'Base Material', value: 'Brass' },
  { label: 'Plating', value: 'Gold / Silver Plated' },
  { label: 'Gemstone', value: 'American Diamond' },
  { label: 'Care', value: 'Store in a dry pouch' },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://kayraaura.up.railway.app";

function apiUrl(path) {
  return `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function productImages(product) {
  const imageSources = [
    product.images,
    product.image,
    product.product_images,
    product.productImages,
  ];
  const images = imageSources.find((source) => Array.isArray(source) && source.length)
    ?? (product.image_url || product.image_path ? [product] : []);

  return [...images]
    .sort((first, second) => {
      if (typeof first === 'string' || typeof second === 'string') return 0;
      if (first?.is_primary && !second?.is_primary) return -1;
      if (!first?.is_primary && second?.is_primary) return 1;
      return toNumber(first?.sort_order) - toNumber(second?.sort_order);
    })
    .map((image) => {
      if (typeof image === 'string') return image;
      return image?.image_url || image?.image_path || '';
    })
    .filter(Boolean);
}

function galleryImages(images) {
  if (!images?.length) return ['/images/product-1.png'];
  if (images.length >= 4) return images.slice(0, 4);
  return Array.from({ length: 4 }, (_, index) => images[index % images.length]);
}

function normalizeSize(size) {
  const sizeText = String(size.size_text ?? size.size ?? size.value ?? '').trim();
  const price = toNumber(size.price);

  return {
    ...size,
    id: size.id ?? size._id,
    value: sizeText || String(size.id ?? size._id ?? ''),
    label: sizeText,
    price,
    quantity: toNumber(size.quantity),
  };
}

function buildSpecs(product) {
  const specFields = [
    ['Brand', product.brand],
    ['Base Material', product.base_material],
    ['Plating', product.plating],
    ['Gemstone', product.gemstone],
    ['Design', product.design],
    ['Occasion', product.occasion],
    ['Ideal For', product.ideal_for],
    ['Package Contents', product.package_contents],
  ];

  const specs = specFields
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => ({ label, value }));

  return specs.length ? specs : DEFAULT_SPECS;
}

export function normalizeProduct(product) {
  const id = product.id ?? product._id;
  const images = productImages(product);
  const sizes = Array.isArray(product.sizes) ? product.sizes.map(normalizeSize) : [];
  const firstSizePrice = sizes.find((size) => size.price > 0)?.price;
  const price = toNumber(
    product.cover_price ?? product.price ?? product.sale_price ?? firstSizePrice
  );
  const discount = toNumber(product.discount_percentage ?? product.discount);
  const originalPrice =
    toNumber(product.originalPrice ?? product.oldPrice ?? product.original_price) ||
    (discount > 0 && discount < 100
      ? Math.round(price / (1 - discount / 100))
      : price);

  return {
    ...product,
    _id: String(id),
    id,
    slug: product.slug || String(id),
    images,
    image: images[0] ?? product.image_url ?? product.image_path ?? product.image,
    sizes,
    price,
    originalPrice,
    oldPrice: originalPrice,
    discount,
    gallery: galleryImages(images),
    specs: buildSpecs(product),
    description:
      product.description ||
      product.short_description ||
      `Handcrafted ${product.category?.name?.toLowerCase() ?? 'jewellery'} designed for everyday elegance and special occasions.`,
  };
}

export function productsFromPayload(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function fetchProductPayload(path) {
  const response = await fetch(apiUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function getProductList(path) {
  try {
    const payload = await fetchProductPayload(path);
    return productsFromPayload(payload)
      .filter((product) => product?.is_active !== false)
      .map(normalizeProduct);
  } catch {
    return [];
  }
}

export function getAllProducts() {
  return getProductList(PRODUCT_API_ROUTES.LIST);
}

export function getFeaturedProducts() {
  return getProductList(PRODUCT_API_ROUTES.FEATURED);
}

export function getProductsByCategory(categoryId) {
  if (!categoryId) return getAllProducts();
  return getProductList(PRODUCT_API_ROUTES.CATEGORY(encodeURIComponent(categoryId)));
}

export async function getProductBySlug(slug) {
  try {
    if (!slug) return null;

    const payload = await fetchProductPayload(
      PRODUCT_API_ROUTES.DETAIL(encodeURIComponent(slug))
    );

    if (!payload?.data || payload.data.is_active === false) {
      return null;
    }

    return normalizeProduct(payload.data);
  } catch {
    return null;
  }
}
