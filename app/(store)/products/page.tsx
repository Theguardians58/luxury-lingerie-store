import ProductCard from '@/components/products/ProductCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ProductWithDetails, Database } from '@/lib/types';

type Category = Database['public']['Tables']['categories']['Row'];
interface CategoryNode extends Category {
  children: CategoryNode[];
}

async function getProductsAndCategories() {
  const supabase = createServerComponentClient({ cookies });

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from('products').select(`*, categories (name), product_images (image_url, alt_text)`),
    supabase.from('categories').select('*')
  ]);

  if (productsError) console.error('Error fetching products:', productsError);
  if (categoriesError) console.error('Error fetching categories:', categoriesError);

  const categoryMap: { [id: number]: CategoryNode } = {};
  const categoryTree: CategoryNode[] = [];
  if (categories) {
      categories.forEach(category => {
        categoryMap[category.id] = { ...category, children: [] };
      });
      categories.forEach(category => {
        if (category.parent_id && categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(categoryMap[category.id]);
        } else {
          categoryTree.push(categoryMap[category.id]);
        }
      });
  }

  return { products: (products as ProductWithDetails[]) || [], categoryTree };
}

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  let { products, categoryTree } = await getProductsAndCategories();

  const selectedCategory = searchParams.category;
  let pageTitle = "All Collections";

  if (selectedCategory && products.length > 0) {
    const categoryNameToFilter = selectedCategory.replace(/-/g, ' ');
    pageTitle = categoryNameToFilter.charAt(0).toUpperCase() + categoryNameToFilter.slice(1);

    products = products.filter(p => 
        p.categories?.name.toLowerCase() === categoryNameToFilter
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <nav className="space-y-4">
            {categoryTree.map(category => (
              <div key={category.id}>
                <Link 
                  href={`/products?category=${category.name.toLowerCase()}`} 
                  className="font-semibold text-gray-800 hover:text-rose-500"
                >
                  {category.name}
                </Link>
                {category.children.length > 0 && (
                  <ul className="pl-4 mt-2 space-y-2 border-l border-gray-200">
                    {category.children.map(subCategory => (
                      <li key={subCategory.id}>
                        <Link 
                          href={`/products?category=${subCategory.name.toLowerCase().replace(/ /g, '-')}`} 
                          className="text-gray-600 hover:text-rose-500"
                        >
                          {subCategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 col-span-full">No products found in this collection.</p>
          )}
        </main>
      </div>
    </div>
  );
        }
