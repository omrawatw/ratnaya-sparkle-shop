import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OfferBanner from '@/components/OfferBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          payment_method: formData.paymentMethod,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(orderData.id);
      setOrderSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <OfferBanner />
        <Header />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center animate-scale-in">
              <div className="w-24 h-24 mx-auto mb-8 bg-gold/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-gold" />
              </div>
              <h1 className="text-4xl font-display font-bold text-cream mb-4">
                Order Confirmed!
              </h1>
              <p className="text-muted-foreground font-body text-lg mb-4">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
              <p className="text-gold font-body mb-8">
                Order ID: <span className="font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
              <Button variant="gold" size="lg" onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <OfferBanner />
      <Header />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-12 text-center">
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Shipping Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="bg-card border border-gold/10 rounded-lg p-8">
                  <h2 className="text-2xl font-display text-cream mb-6">Contact Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-cream font-body">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-cream font-body">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="text-cream font-body">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card border border-gold/10 rounded-lg p-8">
                  <h2 className="text-2xl font-display text-cream mb-6">Shipping Address</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-cream font-body">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-cream font-body">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-cream font-body">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-cream font-body">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card border border-gold/10 rounded-lg p-8">
                  <h2 className="text-2xl font-display text-cream mb-6">Payment Method</h2>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-4 bg-muted p-4 rounded-lg border border-gold/10 cursor-pointer hover:border-gold/30 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Banknote className="w-6 h-6 text-gold" />
                        <div>
                          <p className="text-cream font-body font-semibold">Cash on Delivery</p>
                          <p className="text-muted-foreground text-sm">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-4 bg-muted p-4 rounded-lg border border-gold/10 cursor-pointer hover:border-gold/30 transition-colors">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Smartphone className="w-6 h-6 text-gold" />
                        <div>
                          <p className="text-cream font-body font-semibold">UPI Payment</p>
                          <p className="text-muted-foreground text-sm">Pay using Google Pay, PhonePe, Paytm</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-4 bg-muted p-4 rounded-lg border border-gold/10 cursor-pointer hover:border-gold/30 transition-colors">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="w-6 h-6 text-gold" />
                        <div>
                          <p className="text-cream font-body font-semibold">Credit/Debit Card</p>
                          <p className="text-muted-foreground text-sm">Secure payment via card</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-gold/20 rounded-lg p-8 sticky top-28">
                  <h2 className="text-2xl font-display text-cream mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-cream font-body text-sm">{item.name}</p>
                          <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gold font-sans">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-6 pt-6 border-t border-gold/10">
                    <div className="flex justify-between font-sans">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-cream">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-gold">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-8 pt-4 border-t border-gold/10">
                    <span className="text-xl font-display text-cream">Total</span>
                    <span className="text-2xl font-sans text-gold font-bold">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    variant="gold" 
                    size="lg" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
