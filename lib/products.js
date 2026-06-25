import { PRODUCT_API_ROUTES } from "@/lib/routes";

const DEFAULT_SPECS = [
  { label: 'Brand', value: 'Kayra Aura' },
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

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

function mediaUrlFromItem(item) {
  if (typeof item === 'string') return item;
  return item?.image_url || item?.image_path || item?.video_url || item?.url || '';
}

function isVideoMedia(item) {
  // A file with a video extension is never a valid image, regardless of any
  // (possibly incorrect) media_type/type the backend reports. Check the URL
  // first so a mislabelled `.mp4` can't leak into the image gallery.
  if (VIDEO_EXTENSION_PATTERN.test(mediaUrlFromItem(item))) return true;

  if (item && typeof item === 'object') {
    const type = String(item.media_type ?? item.type ?? '').toLowerCase();
    if (type.includes('video')) return true;
  }

  return false;
}

function productMediaItems(product) {
  const mediaSources = [
    product.images,
    product.image,
    product.product_images,
    product.productImages,
  ];
  const items = mediaSources.find((source) => Array.isArray(source) && source.length)
    ?? (product.image_url || product.image_path ? [product] : []);

  return [...items]
    .sort((first, second) => {
      if (typeof first === 'string' || typeof second === 'string') return 0;
      if (first?.is_primary && !second?.is_primary) return -1;
      if (!first?.is_primary && second?.is_primary) return 1;
      return toNumber(first?.sort_order) - toNumber(second?.sort_order);
    })
    .map((item) => ({ type: isVideoMedia(item) ? 'video' : 'image', src: mediaUrlFromItem(item) }))
    .filter((item) => item.src);
}

function productImages(product) {
  return productMediaItems(product)
    .filter((item) => item.type === 'image')
    .map((item) => item.src);
}

function productVideo(product) {
  return productMediaItems(product).find((item) => item.type === 'video')?.src ?? '';
}

function galleryImages(images) {
  if (!images?.length) return ['/images/product-1.png'];
  if (images.length >= 4) return images.slice(0, 4);
  return Array.from({ length: 4 }, (_, index) => images[index % images.length]);
}

function normalizeSize(size) {
  const sizeText = String(size.size_text ?? size.size ?? size.value ?? '').trim();
  const masterSizeId =
    size.size_id ??
    size.master_size_id ??
    size.sizeId ??
    size.size?.id ??
    size.size?._id ??
    null;
  const price = toNumber(size.price);

  return {
    ...size,
    id: size.id ?? size._id,
    masterSizeId: masterSizeId === null ? null : String(masterSizeId),
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
  const video = productVideo(product);
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
    video,
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

export function getCollectionProducts() {
  return getProductList(PRODUCT_API_ROUTES.COLLECTION);
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
