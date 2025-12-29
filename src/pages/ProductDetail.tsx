import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  stock: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setProduct(null);
      } else {
        setProduct(data);
        
        // Fetch related products from same category
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        
        setRelatedProducts(related || []);
      }
      
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url || '',
        });
      }
      toast.success(`${product.name} added to cart`);
    }
  };

  const discount = product?.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-16 flex justify-center items-center">
          <div className="text-gold">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-3xl font-display text-cream mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button variant="gold">Back to Shop</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-2 text-gold hover:text-gold-light mb-8 font-body">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Product Image */}
            <div className="relative animate-fade-in">
              <div className="aspect-square overflow-hidden rounded-lg bg-card">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-background text-sm font-bold px-3 py-1 rounded">
                  -{discount}% OFF
                </span>
              )}
              <button className="absolute top-4 right-4 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-all">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Product Info */}
            <div className="animate-slide-up">
              <p className="text-gold font-body tracking-[0.3em] uppercase mb-2">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-6">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-display text-gold font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through font-body">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              <p className="text-cream/70 font-body text-lg leading-relaxed mb-8">
                {product.description || 'Exquisite handcrafted jewelry piece from our exclusive collection. Made with premium materials and exceptional attention to detail.'}
              </p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-400 font-body">✓ In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-destructive font-body">✗ Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-cream font-body">Quantity:</span>
                <div className="flex items-center border border-gold/20 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gold/10 transition-colors text-cream"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-cream font-body">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gold/10 transition-colors text-cream"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mb-12">
                <Button 
                  variant="gold" 
                  size="xl" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="gold-outline" size="xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gold/10">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-cream font-body text-sm">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-cream font-body text-sm">Certified</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-cream font-body text-sm">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-display font-bold text-cream mb-8 text-center gold-underline inline-block w-full">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
