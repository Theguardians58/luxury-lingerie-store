'use client';

import Image from 'next/image'; 
import Link from 'next/link';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const Navbar = () => {
  const { cart } = useCart();
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
          
<Link href="/" className="flex items-center">
  <Image
    src="/logo.png" // <-- CHANGE THIS if your logo has a different name
    alt="Éclat Lingerie Logo"
    width={160}
    height={50}
    priority
  />
</Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
             <Link href="/products" className="text-gray-600 hover:text-gray-900 transition">Collections</Link>
             <Link href="/#new-arrivals" className="text-gray-600 hover:text-gray-900 transition">New Arrivals</Link>
             <Link href="/#about" className="text-gray-600 hover:text-gray-900 transition">About</Link>
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
        {/* Mobile Menu */}
        {isOpen && (
           <div className="md:hidden py-4">
              <Link href="/products" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>Collections</Link>
              <Link href="/#new-arrivals" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>New Arrivals</Link>
              <Link href="/#about" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>About</Link>
           </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
