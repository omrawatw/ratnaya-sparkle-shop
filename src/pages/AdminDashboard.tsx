import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Plus, LogOut, Pencil, Trash2, Eye, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdmin } from '@/contexts/AdminContext';
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
  featured: boolean;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    category: 'necklaces',
    stock: '',
    featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setLoading(true);
    
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      category: 'necklaces',
      stock: '',
      featured: false,
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url || '',
      category: product.category,
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setImageFile(null);
    setImagePreview(product.image_url || null);
    setProductDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProductForm({ ...productForm, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = productForm.image_url;

    // Upload new image if selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error('Failed to upload image');
        setUploading(false);
        return;
      }
    }

    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image_url: imageUrl || null,
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      featured: productForm.featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Failed to update product');
        setUploading(false);
        return;
      }
      toast.success('Product updated successfully');
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        toast.error('Failed to add product');
        setUploading(false);
        return;
      }
      toast.success('Product added successfully');
    }

    setUploading(false);
    setProductDialogOpen(false);
    resetProductForm();
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete product');
      return;
    }

    toast.success('Product deleted successfully');
    fetchData();
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    
    setOrderItems(data || []);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
      return;
    }

    toast.success('Order status updated');
    fetchData();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-gold/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-display font-bold text-gold">RATNAYA Admin</h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-gold/10 rounded-lg p-6">
            <Package className="w-8 h-8 text-gold mb-2" />
            <p className="text-3xl font-display text-cream font-bold">{products.length}</p>
            <p className="text-muted-foreground font-body">Products</p>
          </div>
          <div className="bg-card border border-gold/10 rounded-lg p-6">
            <ShoppingCart className="w-8 h-8 text-gold mb-2" />
            <p className="text-3xl font-display text-cream font-bold">{orders.length}</p>
            <p className="text-muted-foreground font-body">Orders</p>
          </div>
          <div className="bg-card border border-gold/10 rounded-lg p-6">
            <p className="text-3xl font-display text-gold font-bold">
              {formatPrice(orders.reduce((sum, o) => sum + Number(o.total_amount), 0))}
            </p>
            <p className="text-muted-foreground font-body">Total Revenue</p>
          </div>
          <div className="bg-card border border-gold/10 rounded-lg p-6">
            <p className="text-3xl font-display text-cream font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-muted-foreground font-body">Pending Orders</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card border border-gold/20">
            <TabsTrigger value="products" className="data-[state=active]:bg-gold data-[state=active]:text-background">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-background">
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-cream">Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={(open) => {
                setProductDialogOpen(open);
                if (!open) resetProductForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-gold/20 max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cream font-display">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cream">Name</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Description</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-cream">Price (₹)</Label>
                        <Input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-cream">Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={productForm.original_price}
                          onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Product Image</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg border border-gold/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-40 border-2 border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-gold/50 mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-cream">Category</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                        >
                          <SelectTrigger className="bg-muted border-gold/20 text-cream">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="necklaces">Necklaces</SelectItem>
                            <SelectItem value="earrings">Earrings</SelectItem>
                            <SelectItem value="rings">Rings</SelectItem>
                            <SelectItem value="bracelets">Bracelets</SelectItem>
                            <SelectItem value="bangles">Bangles</SelectItem>
                            <SelectItem value="pendants">Pendants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-cream">Stock</Label>
                        <Input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={productForm.featured}
                        onCheckedChange={(checked) => setProductForm({ ...productForm, featured: checked })}
                      />
                      <Label className="text-cream">Featured Product</Label>
                    </div>
                    <Button type="submit" variant="gold" className="w-full" disabled={uploading}>
                      {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <div className="bg-card border border-gold/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-cream font-body">Product</th>
                        <th className="text-left p-4 text-cream font-body">Category</th>
                        <th className="text-left p-4 text-cream font-body">Price</th>
                        <th className="text-left p-4 text-cream font-body">Stock</th>
                        <th className="text-left p-4 text-cream font-body">Featured</th>
                        <th className="text-right p-4 text-cream font-body">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t border-gold/10">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <span className="text-cream font-body">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground font-body capitalize">{product.category}</td>
                          <td className="p-4 text-gold font-body">{formatPrice(product.price)}</td>
                          <td className="p-4 text-cream font-body">{product.stock}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${product.featured ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                              {product.featured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-2xl font-display text-cream mb-6">Orders</h2>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No orders yet</div>
            ) : (
              <div className="bg-card border border-gold/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 text-cream font-body">Order ID</th>
                        <th className="text-left p-4 text-cream font-body">Customer</th>
                        <th className="text-left p-4 text-cream font-body">Date</th>
                        <th className="text-left p-4 text-cream font-body">Total</th>
                        <th className="text-left p-4 text-cream font-body">Payment</th>
                        <th className="text-left p-4 text-cream font-body">Status</th>
                        <th className="text-right p-4 text-cream font-body">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-gold/10">
                          <td className="p-4 text-cream font-body font-mono text-sm">
                            {order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-cream font-body">{order.customer_name}</p>
                              <p className="text-muted-foreground text-sm">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground font-body text-sm">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="p-4 text-gold font-body">{formatPrice(order.total_amount)}</td>
                          <td className="p-4 text-cream font-body uppercase text-sm">{order.payment_method}</td>
                          <td className="p-4">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-muted border-gold/20 text-cream text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4 text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-gold/20 max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-cream font-display">
                                    Order Details
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Order ID</p>
                                        <p className="text-cream font-mono">{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="text-gold capitalize">{selectedOrder.status}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Customer</p>
                                        <p className="text-cream">{selectedOrder.customer_name}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="text-cream">{selectedOrder.customer_phone}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="text-cream">{selectedOrder.customer_email}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-muted-foreground">Address</p>
                                        <p className="text-cream">
                                          {selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="border-t border-gold/10 pt-4">
                                      <p className="text-muted-foreground mb-2">Items</p>
                                      <div className="space-y-2">
                                        {orderItems.map((item) => (
                                          <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-cream">{item.product_name} x {item.quantity}</span>
                                            <span className="text-gold">{formatPrice(item.price * item.quantity)}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex justify-between mt-4 pt-4 border-t border-gold/10">
                                        <span className="text-cream font-semibold">Total</span>
                                        <span className="text-gold font-bold">{formatPrice(selectedOrder.total_amount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
