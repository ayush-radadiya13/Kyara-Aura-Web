const PRODUCTS = [
  {
    _id: '1',
    name: 'Plain Silver Bangles For Women (2 Bangles)',
    slug: 'plain-silver-bangles-women',
    price: 599,
    originalPrice: 1899,
    oldPrice: 1899,
    discount: 68,
    category: { name: 'Bangles' },
    images: [
      '/images/product-1.png',
      '/images/product-2.png',
      '/images/product-3.png',
      '/images/product-1.png',
    ],
    specs: [
      { label: 'Brand', value: 'Velisse Jewells' },
      { label: 'Base Material', value: 'Brass' },
      { label: 'Plating', value: 'Silver Plated' },
      { label: 'Gemstone', value: 'American Diamond' },
      { label: 'Package Contents', value: '2 Bangles' },
    ],
    description:
      'Elegant silver-plated bangles crafted for everyday wear. Lightweight, skin-friendly finish with a polished shine that pairs well with ethnic and casual outfits.',
  },
  {
    _id: '2',
    name: 'Celestial Diamond Ring',
    slug: 'celestial-diamond-ring',
    price: 1240,
    category: { name: 'Rings' },
    images: ['/images/product-1.png'],
  },
  {
    _id: '3',
    name: 'Rose Gold Halo Set',
    slug: 'rose-gold-halo-set',
    price: 980,
    category: { name: 'Sets' },
    images: ['/images/product-2.png'],
  },
  {
    _id: '4',
    name: 'Pearl Grace Pendant',
    slug: 'pearl-grace-pendant',
    price: 760,
    category: { name: 'Pendants' },
    images: ['/images/product-3.png'],
  },
  {
    _id: '5',
    name: 'Midnight Diamond Earrings',
    slug: 'midnight-diamond-earrings',
    price: 1450,
    category: { name: 'Earrings' },
    images: ['/images/product-4.png'],
  },
  {
    _id: '6',
    name: 'Eternal Love Bracelet',
    slug: 'eternal-love-bracelet',
    price: 890,
    category: { name: 'Bracelets' },
    images: ['/images/product-5.png'],
  },
  {
    _id: '7',
    name: 'Royal Sapphire Ring',
    slug: 'royal-sapphire-ring',
    price: 2100,
    category: { name: 'Rings' },
    images: ['/images/product-6.png'],
  },
  {
    _id: '8',
    name: 'Vintage Crystal Necklace',
    slug: 'vintage-crystal-necklace',
    price: 1350,
    category: { name: 'Necklaces' },
    images: ['/images/product-7.png'],
  },
  {
    _id: '9',
    name: 'Diamond Stud Earrings',
    slug: 'diamond-stud-earrings',
    price: 680,
    category: { name: 'Earrings' },
    images: ['/images/product-8.png'],
  },
];

const DEFAULT_SPECS = [
  { label: 'Brand', value: 'Kyara Aura' },
  { label: 'Base Material', value: 'Brass' },
  { label: 'Plating', value: 'Gold / Silver Plated' },
  { label: 'Gemstone', value: 'American Diamond' },
  { label: 'Care', value: 'Store in a dry pouch' },
];

function galleryImages(images) {
  if (!images?.length) return ['/images/product-1.png'];
  if (images.length >= 4) return images.slice(0, 4);
  return Array.from({ length: 4 }, (_, index) => images[index % images.length]);
}

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductBySlug(slug) {
  const product = PRODUCTS.find((item) => item.slug === slug);
  if (!product) return null;

  const originalPrice = product.originalPrice ?? product.oldPrice ?? Math.round(product.price * 2.5);

  return {
    ...product,
    originalPrice,
    discount:
      product.discount ??
      Math.max(0, Math.round(((originalPrice - product.price) / originalPrice) * 100)),
    gallery: galleryImages(product.images),
    specs: product.specs ?? DEFAULT_SPECS,
    description:
      product.description ??
      `Handcrafted ${product.category?.name?.toLowerCase() ?? 'jewellery'} designed for everyday elegance and special occasions.`,
  };
}
