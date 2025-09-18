'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Use the new client creator
import { Session } from '@supabase/supabase-js';
import { Database } from '@/lib/types';

type Category = Database['public']['Tables']['categories']['Row'];
interface CategoryNode extends Category {
  children: CategoryNode[];
}

export default function Navbar() {
  const { cart } = useCart();
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const supabase = createClient(); // Create the client-side instance

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categories } = await supabase.from('categories').select('*');
      if (categories) {
        const categoryMap: { [id: number]: CategoryNode } = {};
        const roots: CategoryNode[] = [];
        categories.forEach(cat => { categoryMap[cat.id] = { ...cat, children: [] }; });
        categories.forEach(cat => {
          if (cat.parent_id && categoryMap[cat.parent_id]) {
            categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
          } else {
            roots.push(categoryMap[cat.id]);
          }
        });
        setCategoryTree(roots);
      }
    };
    fetchCategories();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }}) => {
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src="/eclat-logo-final.png" alt="Éclat Lingerie Logo" width={120} height={35} priority />
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {categoryTree.map((category) => (
              <div key={category.id} className="relative group">
                <Link href={`/products?category=${category.name.toLowerCase()}`} className="text-gray-600 hover:text-gray-900 transition py-4">
                  {category.name}
                </Link>
                {category.children.length > 0 && (
                  <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible">
                    <div className="py-2">
                      {category.children.map((sub) => (
                        <Link key={sub.id} href={`/products?category=${sub.name.toLowerCase().replace(/ /g, '-')}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link href={session ? '/account' : '/login'} className="text-gray-600 hover:text-gray-900">
              <User size={20} />
            </Link>
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4">
            {categoryTree.map(category => (
                <div key={category.id}>
                    <Link href={`/products?category=${category.name.toLowerCase()}`} className="block py-2 font-semibold text-gray-800" onClick={() => setIsOpen(false)}>{category.name}</Link>
                    {category.children.map(sub => (
                        <Link key={sub.id} href={`/products?category=${sub.name.toLowerCase().replace(/ /g, '-')}`} className="block py-2 pl-4 text-gray-600" onClick={() => setIsOpen(false)}>{sub.name}</Link>
                    ))}
                </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
      }
