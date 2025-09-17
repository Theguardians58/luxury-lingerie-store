import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProductWithDetails } from '@/lib/types';
import ProductDetailsClient from './ProductDetailsClient'; // We will create this client component below in the same file

// This is a Server Component that fetches data for ONE specific product
async function getProduct(slug: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, alt_text),
      product_variants (id, size, color, stock_quantity)
    `)
    .eq('slug', slug)
    .single(); // .single() gets just one record

  if (error || !data) {
    return null;
  }

  return data as ProductWithDetails;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  // If no product is found for the slug, show a 404 page
  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
    }
