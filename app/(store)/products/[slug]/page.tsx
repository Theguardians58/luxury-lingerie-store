import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProductWithDetails, Database } from '@/lib/types';
import ProductDetailsClient from './ProductDetailsClient';

// This is the Server Component part of the page
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Fetch a single product that matches the slug from the URL
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, alt_text),
      product_variants (id, size, color, stock_quantity)
    `)
    .eq('slug', params.slug)
    .single(); // .single() ensures we get one product or an error

  if (error || !product) {
    // If no product is found, show the 404 Not Found page
    notFound();
  }

  // Pass the fetched product data to the Client Component for interaction
  return <ProductDetailsClient product={product as ProductWithDetails} />;
}
