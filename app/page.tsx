import ProductCard from '@/components/products/ProductCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ProductWithDetails } from '@/lib/types';

// This function runs on the server to get data from our database.
async function getFeaturedProducts() {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, alt_text)
    `)
    .limit(4); // We'll just get 4 products for the homepage.

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return data as ProductWithDetails[];
}

export default async function HomePage() {
  // We call the function to get the data.
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] bg-cover bg-center text-white flex items-center justify-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585254210019-45995511b225?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Embrace Your Elegance</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">Discover our new collection, crafted with passion and precision.</p>
          <Link href="/products" className="bg-white text-black font-semibold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="new-arrivals" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
          {/* If there are no products, show a message. Otherwise, show the products. */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Our new arrivals will be here soon. Stay tuned!</p>
          )}
        </div>
      </section>
    </div>
  );
}
