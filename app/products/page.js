import ProductCard from '../../components/ProductCard';
import Header from '../../components/Header';
import { getAllProducts } from '@/lib/products';

const mockProducts = getAllProducts();

export default function ProductsPage() {
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
        {mockProducts.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 py-12 text-center">
            No products available at the moment.
          </p>
        )}
      </section>
    </div>
  );
}
