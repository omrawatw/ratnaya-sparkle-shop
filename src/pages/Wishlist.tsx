import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
}

const Wishlist = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (wishlistItems.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlistItems]);

  const fetchProducts = async () => {
    setLoading(true);
    const productIds = wishlistItems.map(item => item.product_id);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
    });
    toast.success(`${product.name} added to cart`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Heart className="w-16 h-16 text-gold/50 mx-auto mb-6" />
            <h1 className="text-3xl font-display text-cream mb-4">Sign in to view your wishlist</h1>
            <p className="text-muted-foreground font-body mb-8">
              Create an account to save your favorite items
            </p>
            <Link to="/auth">
              <Button variant="gold" size="lg">Sign In</Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gold hover:text-gold-light mb-8 font-body">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-12 text-center">
            My Wishlist
          </h1>

          {loading ? (
            <div className="text-center text-cream">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gold/50 mx-auto mb-6" />
              <h2 className="text-2xl font-display text-cream mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground font-body mb-8">
                Start adding items you love!
              </p>
              <Link to="/shop">
                <Button variant="gold" size="lg">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = product.original_price 
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
                  : 0;

                return (
                  <div key={product.id} className="bg-card border border-gold/10 rounded-lg overflow-hidden group">
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-square">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-gold text-background text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <p className="text-gold/70 text-xs uppercase tracking-wider mb-1">{product.category}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-display text-cream mb-2 hover:text-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gold font-display text-lg">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-muted-foreground line-through text-sm">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="gold" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="gold-outline" 
                          size="sm"
                          onClick={() => removeFromWishlist(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wishlist;
