import Header from '../../components/Header';
import ProductList from '@/components/ProductList';

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;

  return (
    <div>
      <Header />
      
      {/* Page Title and Description Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl text-gray-900 mb-4">
            Our Collection
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Discover our exquisite collection of fine jewellery, where each piece is meticulously crafted with precision and passion. From timeless classics to contemporary designs, find the perfect expression of your unique style.
          </p>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <ProductList categoryId={categoryId} />
      </section>
    </div>
  );
}
