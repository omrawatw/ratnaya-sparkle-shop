import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
    }
    setLoadingData(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', user!.email)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      })
      .eq('user_id', user!.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-12 text-center gold-underline inline-block w-full">
            My Profile
          </h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-gold/10 rounded-lg p-8 mb-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display text-cream">{profile.full_name || 'User'}</h2>
                    <p className="text-muted-foreground font-body">{user?.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-cream font-body">Full Name</Label>
                    <Input
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cream font-body">Phone</Label>
                    <Input
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-cream font-body">Address</Label>
                    <Input
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cream font-body">City</Label>
                    <Input
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cream font-body">State</Label>
                    <Input
                      value={profile.state || ''}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cream font-body">Pincode</Label>
                    <Input
                      value={profile.pincode || ''}
                      onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                      className="bg-muted border-gold/20 text-cream"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="gold" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-gold/20 rounded-lg p-6 sticky top-28">
                <h3 className="text-xl font-display text-cream mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  Order History
                </h3>

                {orders.length === 0 ? (
                  <p className="text-muted-foreground font-body text-center py-8">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-gold font-mono text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-gold/20 text-gold'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-cream font-body">{formatPrice(order.total_amount)}</p>
                        <p className="text-muted-foreground text-sm">{formatDate(order.created_at)}</p>
                        <p className="text-muted-foreground text-xs uppercase mt-1">{order.payment_method}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;
