import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OfferBanner from '@/components/OfferBanner';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
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

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
        
        // Fetch product images
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', data.id)
          .order('display_order');
        
        if (images && images.length > 0) {
          setProductImages(images);
        } else if (data.image_url) {
          // Fallback to main image if no gallery images
          setProductImages([{ id: 'main', image_url: data.image_url, display_order: 0 }]);
        }
        
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
      setSelectedImageIndex(0);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const currentImage = productImages[selectedImageIndex]?.image_url || product?.image_url || '/placeholder.svg';

  const nextImage = () => {
    if (productImages.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

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

  const handleWishlistClick = () => {
    if (product) {
      toggleWishlist(product.id);
    }
  };

  const discount = product?.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const inWishlist = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <OfferBanner />
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
        <OfferBanner />
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
      <OfferBanner />
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-2 text-gold hover:text-gold-light mb-8 font-body">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Product Images Gallery */}
            <div className="relative animate-fade-in">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-card relative">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-cream" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-cream" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {productImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-gold' 
                          : 'border-transparent hover:border-gold/50'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-background text-sm font-bold px-3 py-1 rounded">
                  -{discount}% OFF
                </span>
              )}
              <button 
                onClick={handleWishlistClick}
                className={`absolute top-4 right-4 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
                  inWishlist 
                    ? 'bg-gold text-background' 
                    : 'bg-background/80 hover:bg-gold hover:text-background'
                }`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Product Info */}
            <div className="animate-slide-up">
              <p className="text-gold font-body tracking-[0.3em] uppercase mb-2">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-6">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-sans text-gold font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through font-sans">
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
                <Button 
                  variant={inWishlist ? "gold" : "gold-outline"} 
                  size="xl"
                  onClick={handleWishlistClick}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
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

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-display font-bold text-cream mb-8 text-center gold-underline inline-block w-full">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} image_url={product.image_url || ''} />
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
