import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
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
  const { isInWishlist, toggleWishlist } = useWishlist();

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
    toast.success(`${name} added to cart`, {
      icon: <Sparkles className="w-4 h-4 text-gold" />,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  const discount = original_price ? Math.round(((original_price - price) / original_price) * 100) : 0;
  const inWishlist = isInWishlist(id);

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="relative bg-card rounded-xl overflow-hidden border border-gold/10 transition-all duration-500 hover:border-gold/40 hover-lift hover-glow">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-gold to-gold-light text-background text-xs font-bold px-3 py-1.5 rounded-full shadow-gold animate-pulse-gold">
              -{discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            className={`absolute top-4 right-4 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gold/20 ${
              inWishlist 
                ? 'bg-gold text-background' 
                : 'bg-background/90 hover:bg-gold hover:text-background'
            }`}
            onClick={handleWishlistClick}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add Button */}
          <Button
            variant="gold"
            size="sm"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0 shadow-gold-lg"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 relative">
          <p className="text-gold/70 text-xs uppercase tracking-[0.2em] mb-2 font-body">
            {category}
          </p>
          <h3 className="font-display text-lg text-cream mb-3 line-clamp-1 group-hover:text-gold transition-colors duration-300">
            {name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-gold font-sans text-xl font-semibold">
              {formatPrice(price)}
            </span>
            {original_price && (
              <span className="text-muted-foreground line-through text-sm font-sans">
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