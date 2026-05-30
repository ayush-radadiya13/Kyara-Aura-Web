import Header from '../../components/Header';
import CategoryGrid from '@/components/CategoryGrid';
import ProductList from '@/components/ProductList';

export default function CategoriesPage() {
  return (
    <div>
      <Header />
      
      {/* Page Title and Description Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Explore our curated collections organized by category. From timeless rings to elegant necklaces, each category showcases our commitment to craftsmanship and beauty. Find the perfect piece that speaks to your heart and complements your unique style.
          </p>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <CategoryGrid />
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20 border-t border-gray-200 bg-gray-50/50">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked pieces from our collection that showcase the finest craftsmanship and design
          </p>
        </div>
        <ProductList featured />
      </section>
    </div>
  );
}
