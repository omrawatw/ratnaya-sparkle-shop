import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import OfferBanner from '@/components/OfferBanner';
import FestivalBanner from '@/components/FestivalBanner';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setFeaturedProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <OfferBanner />
      <Header />
      
      {/* Festival Banner */}
      <div className="pt-20">
        <FestivalBanner />
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gold font-body text-xl tracking-[0.3em] uppercase mb-6 animate-fade-in">
              Luxury Jewelry Collection
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-cream mb-8 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Timeless <span className="text-gold">Elegance</span>
              <br />Crafted for You
            </h1>
            <p className="text-xl md:text-2xl text-cream/70 font-body mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover exquisite handcrafted jewelry that celebrates your unique beauty. Each piece tells a story of passion, artistry, and enduring elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Explore Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="gold-outline" size="xl">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-gold rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card border-y border-gold/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Gem className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Premium Quality</h3>
              <p className="text-muted-foreground font-body">Handcrafted with the finest materials and exceptional attention to detail</p>
            </div>
            <div className="text-center p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Certified Authentic</h3>
              <p className="text-muted-foreground font-body">Every piece comes with a certificate of authenticity and purity</p>
            </div>
            <div className="text-center p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Free Shipping</h3>
              <p className="text-muted-foreground font-body">Complimentary insured delivery on all orders above ₹10,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold font-body tracking-[0.3em] uppercase mb-4">Curated Selection</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-cream gold-underline inline-block">
              Featured Collection
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button variant="gold-outline" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-cream mb-6">
              Experience the <span className="text-gold">Ratnaya</span> Difference
            </h2>
            <p className="text-xl text-cream/70 font-body mb-10">
              Join thousands of satisfied customers who have made Ratnaya their trusted jewelry destination.
            </p>
            <Link to="/shop">
              <Button variant="hero" size="xl">
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
