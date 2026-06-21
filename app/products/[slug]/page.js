import ProductDetail from './ProductDetail';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import { getProductBySlug } from '@/lib/products';
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from '@/lib/structured-data';
import { jsonLd, metadataForPage } from '@/lib/seo';

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
  const productImage = product.image
    ? [product.image]
    : ['/images/product-placeholder.svg'];

  return metadataForPage({
    title: `${product.name} | Kayra Aura`,
    description,
    path: `/products/${product.slug}`,
    images: productImage,
    type: 'product',
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const productSchema = product ? buildProductSchema(product) : null;
  const breadcrumbSchema = product
    ? buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: product.name, path: `/products/${product.slug}` },
      ])
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
      {product ? <ProductViewTracker product={product} /> : null}
      <ProductDetail product={product} slug={slug} />
    </>
  );
}
