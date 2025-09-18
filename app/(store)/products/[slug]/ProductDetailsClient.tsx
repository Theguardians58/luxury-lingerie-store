'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ProductWithDetails } from '@/lib/types';
import toast from 'react-hot-toast';

interface ProductDetailsClientProps {
  product: ProductWithDetails;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.product_images?.[0]?.image_url || 'https://placehold.co/600x800');

  const variants = product.product_variants || [];
  const allSizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean);
  const allColors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean);

  const [selectedSize, setSelectedSize] = useState<string | null>(allSizes[0] || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [availableColorsForSize, setAvailableColorsForSize] = useState<string[]>(allColors);
  const [quantity, setQuantity] = useState(1);

  // This is the "brain" of the feature.
  // It runs every time the user picks a new size.
  useEffect(() => {
    if (selectedSize) {
      const colorsForSelectedSize = variants
        .filter(variant => variant.size === selectedSize)
        .map(variant => variant.color);

      const uniqueColorsForSize = Array.from(new Set(colorsForSelectedSize)).filter(Boolean);
      setAvailableColorsForSize(uniqueColorsForSize);

      // --- THIS IS THE NEW LOGIC ---
      // If there is only one color available for the selected size,
      // automatically select it for the user.
      if (uniqueColorsForSize.length === 1) {
        setSelectedColor(uniqueColorsForSize[0]);
      } 
      // --- END OF NEW LOGIC ---
      else if (selectedColor && !uniqueColorsForSize.includes(selectedColor)) {
        setSelectedColor(null); // Reset color if it's no longer valid
      }
    }
  }, [selectedSize, variants, selectedColor]);


  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select a size and color.');
      return;
    }

    const selectedVariant = variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );

    if (!selectedVariant) {
      toast.error('This combination is not available.');
      return;
    }

    if (selectedVariant.stock_quantity < quantity) {
      toast.error('Not enough stock available.');
      return;
    }

    addToCart(product, selectedVariant, quantity);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
           {/* Thumbnails */}
          <div className="flex md:flex-col gap-2">
            {product.product_images.map((image, index) => (
              <button key={index} onClick={() => setSelectedImage(image.image_url)} className={`w-16 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === image.image_url ? 'border-rose-500' : 'border-transparent'}`}>
                <Image src={image.image_url} alt={image.alt_text || `Thumbnail ${index + 1}`} width={64} height={80} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-1 aspect-w-3 aspect-h-4 rounded-lg overflow-hidden bg-gray-100">
             <Image src={selectedImage} alt={product.name} width={600} height={800} className="object-cover w-full h-full" />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-gray-900 mb-4">${product.price}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Size Selector */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {allSizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-md text-sm transition-colors ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="mb-6">
             <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
             <div className="flex flex-wrap gap-2">
               {availableColorsForSize.map(color => (
                 <button 
                   key={color} 
                   onClick={() => setSelectedColor(color)} 
                   className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${selectedColor === color ? 'border-rose-500 scale-110' : 'border-gray-300'}`} 
                   style={{ backgroundColor: color.toLowerCase() }} 
                   aria-label={`Select color ${color}`}
                 />
               ))}
             </div>
          </div>

          {/* Add to Cart Button */}
          <button onClick={handleAddToCart} className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition disabled:bg-gray-400" disabled={!selectedSize || !selectedColor}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
    }
