import Link from 'next/link';
import Image from 'next/image';
import { ProductWithDetails } from '@/lib/types';

interface ProductCardProps {
  product: ProductWithDetails;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Use the first image of the product, or a placeholder if there are no images.
  const primaryImage = product.product_images?.[0]?.image_url || 'https://placehold.co/600x800/f7fafc/e2e8f0?text=Image';

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={primaryImage}
          alt={product.product_images?.[0]?.alt_text || product.name}
          width={600}
          height={800}
          className="object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {product.categories?.name || 'Lingerie'}
          </p>
        </div>
        <p className="text-sm font-medium text-gray-900">
          ${product.price}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
