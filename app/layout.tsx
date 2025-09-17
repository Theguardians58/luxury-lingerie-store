import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar'; // We will create this next
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Éclat Lingerie',
  description: 'Exquisite lingerie for the modern individual.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-pink-50 text-gray-800`}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          {/* Footer will go here */}
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
  }
