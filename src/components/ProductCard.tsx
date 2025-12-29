import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  category: string;
}

const ProductCard = ({ id, name, price, original_price, image_url, category }: ProductCardProps) => {
  const { addToCart } = useCart();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, price, image_url });
    toast.success(`${name} added to cart`);
  };

  const discount = original_price ? Math.round(((original_price - price) / original_price) * 100) : 0;

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="group relative bg-card rounded-lg overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 animate-fade-in cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gold text-background text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Quick Add Button */}
          <Button
            variant="gold"
            size="sm"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gold/60 text-xs uppercase tracking-widest mb-1 font-body">
            {category}
          </p>
          <h3 className="font-display text-lg text-cream mb-2 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-gold font-display text-xl font-semibold">
              {formatPrice(price)}
            </span>
            {original_price && (
              <span className="text-muted-foreground line-through text-sm font-body">
                {formatPrice(original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
