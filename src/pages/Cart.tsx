import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OfferBanner from '@/components/OfferBanner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalAmount } = useCart();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <OfferBanner />
      <Header />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-12 text-center gold-underline inline-block w-full">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-20 h-20 text-gold/30 mx-auto mb-6" />
              <h2 className="text-2xl font-display text-cream mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground font-body mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/shop">
                <Button variant="gold" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-gold/10 rounded-lg p-6 flex gap-6 animate-fade-in"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-cream mb-2">{item.name}</h3>
                      <p className="text-gold font-display text-lg mb-4">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gold/20 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gold/10 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-cream" />
                          </button>
                          <span className="px-4 font-body text-cream">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gold/10 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-cream" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-display text-xl font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-gold/20 rounded-lg p-8 sticky top-28">
                  <h2 className="text-2xl font-display text-cream mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6 pb-6 border-b border-gold/10">
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-cream">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-gold">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-8">
                    <span className="text-xl font-display text-cream">Total</span>
                    <span className="text-2xl font-display text-gold font-bold">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  <Link to="/checkout">
                    <Button variant="gold" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link to="/shop" className="block text-center mt-4">
                    <Button variant="link" className="text-cream">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
