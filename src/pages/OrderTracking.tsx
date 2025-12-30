import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface StatusHistory {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError('');

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (orderError || !orderData) {
      setError('Order not found. Please check your order ID.');
      setOrder(null);
      setLoading(false);
      return;
    }

    setOrder(orderData);

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    setOrderItems(items || []);

    // Fetch status history
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    setStatusHistory(history || []);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchOrder(searchId.trim());
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-gold-light mb-8 font-body">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-8 text-center">
            Track Your Order
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
            <div className="flex gap-4">
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter your Order ID"
                className="bg-card border-gold/20 text-cream"
              />
              <Button type="submit" variant="gold" disabled={loading}>
                {loading ? 'Searching...' : 'Track'}
              </Button>
            </div>
          </form>

          {error && (
            <div className="max-w-2xl mx-auto text-center mb-8">
              <p className="text-destructive font-body">{error}</p>
            </div>
          )}

          {order && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Order Status Timeline */}
              <div className="bg-card border border-gold/10 rounded-lg p-8">
                <h2 className="text-2xl font-display text-cream mb-8">Order Status</h2>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-8 left-0 right-0 h-1 bg-gold/20 rounded">
                    <div 
                      className="h-full bg-gold rounded transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex() / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= getCurrentStepIndex();
                      const isCurrent = index === getCurrentStepIndex();
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div 
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-gold text-background' 
                                : 'bg-card border-2 border-gold/20 text-gold/50'
                            } ${isCurrent ? 'ring-4 ring-gold/30 scale-110' : ''}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className={`mt-3 font-body text-sm text-center ${
                            isCompleted ? 'text-gold' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="bg-card border border-gold/10 rounded-lg p-6">
                  <h3 className="text-xl font-display text-cream mb-4">Order Information</h3>
                  <div className="space-y-3 font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="text-cream">{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date</span>
                      <span className="text-cream">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-gold font-semibold">{formatPrice(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-gold capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card border border-gold/10 rounded-lg p-6">
                  <h3 className="text-xl font-display text-cream mb-4">Shipping Address</h3>
                  <div className="font-body text-cream/80 space-y-1">
                    <p className="font-semibold text-cream">{order.customer_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>{order.city}, {order.state} - {order.pincode}</p>
                    <p className="text-muted-foreground mt-2">{order.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card border border-gold/10 rounded-lg p-6">
                <h3 className="text-xl font-display text-cream mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gold/10 last:border-0">
                      <div>
                        <p className="text-cream font-body">{item.product_name}</p>
                        <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-gold font-body">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {statusHistory.length > 0 && (
                <div className="bg-card border border-gold/10 rounded-lg p-6">
                  <h3 className="text-xl font-display text-cream mb-4">Status History</h3>
                  <div className="space-y-4">
                    {statusHistory.map((history) => (
                      <div key={history.id} className="flex gap-4 items-start">
                        <div className="w-3 h-3 bg-gold rounded-full mt-1.5" />
                        <div>
                          <p className="text-cream font-body capitalize">{history.status}</p>
                          {history.notes && (
                            <p className="text-muted-foreground text-sm">{history.notes}</p>
                          )}
                          <p className="text-gold/60 text-xs mt-1">{formatDate(history.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderTracking;
