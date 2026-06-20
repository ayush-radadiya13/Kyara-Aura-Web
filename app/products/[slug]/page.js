import ProductDetail from './ProductDetail';
import { getProductBySlug } from '@/lib/products';
import { absoluteUrl, jsonLd, metadataForPage } from '@/lib/seo';

function productDescription(product) {
  return String(product?.description ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return metadataForPage({
      title: 'Product Not Found | Kayra Aura',
      description: 'The requested Kayra Aura product could not be found.',
      path: `/products/${slug}`,
    });
  }

  const description = productDescription(product);

  return metadataForPage({
    title: `${product.name} | Kayra Aura`,
    description,
    path: `/products/${product.slug}`,
    images: product.image ? [product.image] : ['/images/product-placeholder.svg'],
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: productDescription(product),
        image: product.images?.length
          ? product.images.map((image) => absoluteUrl(image))
          : [absoluteUrl(product.image || '/images/product-placeholder.svg')],
        sku: String(product._id ?? product.id ?? product.slug),
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Kayra Aura',
        },
        category: product.category?.name || 'Fashion Jewellery',
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(`/products/${product.slug}`),
          priceCurrency: 'INR',
          price: product.price,
          availability: product.sizes?.some((size) => Number(size.quantity) > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      }
    : null;
  const breadcrumbSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: absoluteUrl('/products'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: absoluteUrl(`/products/${product.slug}`),
          },
        ],
      }
    : null;

  return (
    <>
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(productSchema)}
        />
      ) : null}
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(breadcrumbSchema)}
        />
      ) : null}
      <ProductDetail product={product} slug={slug} />
    </>
  );
}
