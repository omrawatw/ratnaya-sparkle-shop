import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Plus, LogOut, Pencil, Trash2, Eye, Upload, X, Megaphone, Truck, PartyPopper } from 'lucide-react';
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

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
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

interface OfferBanner {
  id: string;
  title: string;
  description: string | null;
  background_color: string;
  text_color: string;
  link_url: string | null;
  link_text: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface DeliverySetting {
  id: string;
  name: string;
  charge: number;
  min_order_amount: number | null;
  is_free: boolean;
  is_active: boolean;
  display_order: number;
  estimated_time: string | null;
}

interface FestivalBanner {
  id: string;
  image_url: string;
  link_url: string | null;
  alt_text: string;
  is_active: boolean;
  display_order: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [festivalBanners, setFestivalBanners] = useState<FestivalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [festivalDialogOpen, setFestivalDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<OfferBanner | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<DeliverySetting | null>(null);
  const [editingFestival, setEditingFestival] = useState<FestivalBanner | null>(null);
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

  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    background_color: '#D4AF37',
    text_color: '#1A1A2E',
    link_url: '',
    link_text: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    charge: '',
    min_order_amount: '',
    is_free: false,
    is_active: true,
    display_order: 0,
    estimated_time: '',
  });

  const [festivalForm, setFestivalForm] = useState({
    image_url: '',
    link_url: '',
    alt_text: 'Festival Banner',
    is_active: true,
    display_order: 0,
  });

  const [festivalImageFile, setFestivalImageFile] = useState<File | null>(null);
  const [festivalImagePreview, setFestivalImagePreview] = useState<string>('');
  const [festivalUploading, setFestivalUploading] = useState(false);
  const festivalFileInputRef = useRef<HTMLInputElement>(null);

  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isNew: boolean; id?: string }[]>([]);
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
    
    const [productsRes, ordersRes, bannersRes, deliveryRes, festivalRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('offer_banners').select('*').order('display_order'),
      supabase.from('delivery_settings').select('*').order('display_order'),
      supabase.from('festival_banners').select('*').order('display_order'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (bannersRes.data) setBanners(bannersRes.data);
    if (deliveryRes.data) setDeliverySettings(deliveryRes.data);
    if (festivalRes.data) setFestivalBanners(festivalRes.data);
    
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
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleEditProduct = async (product: Product) => {
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
    setImageFiles([]);
    
    // Fetch existing images for this product
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');
    
    if (existingImages && existingImages.length > 0) {
      setImagePreviews(existingImages.map(img => ({ 
        url: img.image_url, 
        isNew: false, 
        id: img.id 
      })));
    } else if (product.image_url) {
      // Fallback to main image_url if no gallery images exist
      setImagePreviews([{ url: product.image_url, isNew: false }]);
    } else {
      setImagePreviews([]);
    }
    
    setProductDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, { url: reader.result as string, isNew: true }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = imagePreviews[index];
    
    // If it's an existing image in the database, delete it
    if (!imageToRemove.isNew && imageToRemove.id) {
      await supabase
        .from('product_images')
        .delete()
        .eq('id', imageToRemove.id);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Also remove from imageFiles if it's a new file
    if (imageToRemove.isNew) {
      const newFileIndex = imagePreviews.slice(0, index).filter(p => p.isNew).length;
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
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

    let productId = editingProduct?.id;

    // Upload new images
    const uploadedImageUrls: string[] = [];
    for (const file of imageFiles) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        uploadedImageUrls.push(uploadedUrl);
      } else {
        toast.error('Failed to upload one or more images');
        setUploading(false);
        return;
      }
    }

    // Get main image URL (first image)
    const mainImageUrl = imagePreviews.length > 0 
      ? (imagePreviews[0].isNew ? uploadedImageUrls[0] : imagePreviews[0].url)
      : null;

    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image_url: mainImageUrl,
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
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error || !data) {
        toast.error('Failed to add product');
        setUploading(false);
        return;
      }
      productId = data.id;
    }

    // Save new images to product_images table
    if (uploadedImageUrls.length > 0 && productId) {
      const existingCount = imagePreviews.filter(p => !p.isNew).length;
      const imageRecords = uploadedImageUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: existingCount + index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
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

  // Banner handlers
  const resetBannerForm = () => {
    setBannerForm({
      title: '',
      description: '',
      background_color: '#D4AF37',
      text_color: '#1A1A2E',
      link_url: '',
      link_text: '',
      image_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingBanner(null);
    setBannerImageFile(null);
    setBannerImagePreview('');
  };

  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = '';
    }
  };

  const removeBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview('');
    setBannerForm({ ...bannerForm, image_url: '' });
  };

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

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

  const handleEditBanner = (banner: OfferBanner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      description: banner.description || '',
      background_color: banner.background_color,
      text_color: banner.text_color,
      link_url: banner.link_url || '',
      link_text: banner.link_text || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setBannerImageFile(null);
    setBannerImagePreview(banner.image_url || '');
    setBannerDialogOpen(true);
  };

  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerUploading(true);

    let imageUrl = bannerForm.image_url;

    // Upload new image if selected
    if (bannerImageFile) {
      const uploadedUrl = await uploadBannerImage(bannerImageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error('Failed to upload banner image');
        setBannerUploading(false);
        return;
      }
    }

    const bannerData = {
      title: bannerForm.title,
      description: bannerForm.description || null,
      background_color: bannerForm.background_color,
      text_color: bannerForm.text_color,
      link_url: bannerForm.link_url || null,
      link_text: bannerForm.link_text || null,
      image_url: imageUrl || null,
      is_active: bannerForm.is_active,
      display_order: bannerForm.display_order,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from('offer_banners')
        .update(bannerData)
        .eq('id', editingBanner.id);

      if (error) {
        toast.error('Failed to update banner');
        setBannerUploading(false);
        return;
      }
      toast.success('Banner updated successfully');
    } else {
      const { error } = await supabase
        .from('offer_banners')
        .insert(bannerData);

      if (error) {
        toast.error('Failed to add banner');
        setBannerUploading(false);
        return;
      }
      toast.success('Banner added successfully');
    }

    setBannerUploading(false);
    setBannerDialogOpen(false);
    resetBannerForm();
    fetchData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    const { error } = await supabase.from('offer_banners').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete banner');
      return;
    }

    toast.success('Banner deleted successfully');
    fetchData();
  };

  const toggleBannerActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('offer_banners')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update banner');
      return;
    }
    fetchData();
  };

  // Delivery Settings handlers
  const resetDeliveryForm = () => {
    setDeliveryForm({
      name: '',
      charge: '',
      min_order_amount: '',
      is_free: false,
      is_active: true,
      display_order: 0,
      estimated_time: '',
    });
    setEditingDelivery(null);
  };

  const handleEditDelivery = (delivery: DeliverySetting) => {
    setEditingDelivery(delivery);
    setDeliveryForm({
      name: delivery.name,
      charge: delivery.charge.toString(),
      min_order_amount: delivery.min_order_amount?.toString() || '',
      is_free: delivery.is_free,
      is_active: delivery.is_active,
      display_order: delivery.display_order,
      estimated_time: delivery.estimated_time || '',
    });
    setDeliveryDialogOpen(true);
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    const deliveryData = {
      name: deliveryForm.name,
      charge: deliveryForm.is_free ? 0 : parseFloat(deliveryForm.charge) || 0,
      min_order_amount: deliveryForm.min_order_amount ? parseFloat(deliveryForm.min_order_amount) : null,
      is_free: deliveryForm.is_free,
      is_active: deliveryForm.is_active,
      display_order: deliveryForm.display_order,
      estimated_time: deliveryForm.estimated_time || null,
    };

    if (editingDelivery) {
      const { error } = await supabase
        .from('delivery_settings')
        .update(deliveryData)
        .eq('id', editingDelivery.id);

      if (error) {
        toast.error('Failed to update delivery option');
        return;
      }
      toast.success('Delivery option updated successfully');
    } else {
      const { error } = await supabase
        .from('delivery_settings')
        .insert(deliveryData);

      if (error) {
        toast.error('Failed to add delivery option');
        return;
      }
      toast.success('Delivery option added successfully');
    }

    setDeliveryDialogOpen(false);
    resetDeliveryForm();
    fetchData();
  };

  const handleDeleteDelivery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery option?')) return;

    const { error } = await supabase.from('delivery_settings').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete delivery option');
      return;
    }

    toast.success('Delivery option deleted successfully');
    fetchData();
  };

  const toggleDeliveryActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('delivery_settings')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update delivery option');
      return;
    }
    fetchData();
  };

  // Festival Banner handlers
  const resetFestivalForm = () => {
    setFestivalForm({
      image_url: '',
      link_url: '',
      alt_text: 'Festival Banner',
      is_active: true,
      display_order: 0,
    });
    setEditingFestival(null);
    setFestivalImageFile(null);
    setFestivalImagePreview('');
  };

  const handleFestivalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFestivalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFestivalImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (festivalFileInputRef.current) {
      festivalFileInputRef.current.value = '';
    }
  };

  const removeFestivalImage = () => {
    setFestivalImageFile(null);
    setFestivalImagePreview('');
    setFestivalForm({ ...festivalForm, image_url: '' });
  };

  const uploadFestivalImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `festival-banners/${fileName}`;

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

  const handleEditFestival = (banner: FestivalBanner) => {
    setEditingFestival(banner);
    setFestivalForm({
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      alt_text: banner.alt_text,
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setFestivalImageFile(null);
    setFestivalImagePreview(banner.image_url);
    setFestivalDialogOpen(true);
  };

  const handleSubmitFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    setFestivalUploading(true);

    let imageUrl = festivalForm.image_url;

    // Upload new image if selected
    if (festivalImageFile) {
      const uploadedUrl = await uploadFestivalImage(festivalImageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error('Failed to upload festival banner image');
        setFestivalUploading(false);
        return;
      }
    }

    if (!imageUrl) {
      toast.error('Please upload an image');
      setFestivalUploading(false);
      return;
    }

    const festivalData = {
      image_url: imageUrl,
      link_url: festivalForm.link_url || null,
      alt_text: festivalForm.alt_text,
      is_active: festivalForm.is_active,
      display_order: festivalForm.display_order,
    };

    if (editingFestival) {
      const { error } = await supabase
        .from('festival_banners')
        .update(festivalData)
        .eq('id', editingFestival.id);

      if (error) {
        toast.error('Failed to update festival banner');
        setFestivalUploading(false);
        return;
      }
      toast.success('Festival banner updated successfully');
    } else {
      const { error } = await supabase
        .from('festival_banners')
        .insert(festivalData);

      if (error) {
        toast.error('Failed to add festival banner');
        setFestivalUploading(false);
        return;
      }
      toast.success('Festival banner added successfully');
    }

    setFestivalUploading(false);
    setFestivalDialogOpen(false);
    resetFestivalForm();
    fetchData();
  };

  const handleDeleteFestival = async (id: string) => {
    if (!confirm('Are you sure you want to delete this festival banner?')) return;

    const { error } = await supabase.from('festival_banners').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete festival banner');
      return;
    }

    toast.success('Festival banner deleted successfully');
    fetchData();
  };

  const toggleFestivalActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('festival_banners')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update festival banner');
      return;
    }
    fetchData();
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
            <TabsTrigger value="banners" className="data-[state=active]:bg-gold data-[state=active]:text-background">
              <Megaphone className="w-4 h-4 mr-1" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-gold data-[state=active]:text-background">
              <Truck className="w-4 h-4 mr-1" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="festival" className="data-[state=active]:bg-gold data-[state=active]:text-background">
              <PartyPopper className="w-4 h-4 mr-1" />
              Festival
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
                      <Label className="text-cream">Product Images</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      
                      {/* Image Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gold/20"
                            />
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 text-xs bg-gold text-background px-1 rounded">
                                Main
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Add More Button */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors"
                        >
                          <Upload className="w-6 h-6 text-gold/50 mb-1" />
                          <p className="text-xs text-muted-foreground">Add</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">First image will be the main product image</p>
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

          {/* Banners Tab */}
          <TabsContent value="banners">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-cream">Offer Banners</h2>
              <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
                setBannerDialogOpen(open);
                if (!open) resetBannerForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-gold/20 max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cream font-display">
                      {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitBanner} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cream">Title *</Label>
                      <Input
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        required
                        placeholder="e.g., 🎉 Flash Sale!"
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Description</Label>
                      <Input
                        value={bannerForm.description}
                        onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                        placeholder="e.g., Get 20% off on all necklaces"
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-cream">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={bannerForm.background_color}
                            onChange={(e) => setBannerForm({ ...bannerForm, background_color: e.target.value })}
                            className="w-12 h-10 p-1 bg-muted border-gold/20"
                          />
                          <Input
                            value={bannerForm.background_color}
                            onChange={(e) => setBannerForm({ ...bannerForm, background_color: e.target.value })}
                            className="bg-muted border-gold/20 text-cream flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-cream">Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={bannerForm.text_color}
                            onChange={(e) => setBannerForm({ ...bannerForm, text_color: e.target.value })}
                            className="w-12 h-10 p-1 bg-muted border-gold/20"
                          />
                          <Input
                            value={bannerForm.text_color}
                            onChange={(e) => setBannerForm({ ...bannerForm, text_color: e.target.value })}
                            className="bg-muted border-gold/20 text-cream flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-cream">Link URL</Label>
                        <Input
                          value={bannerForm.link_url}
                          onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                          placeholder="/shop"
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-cream">Link Text</Label>
                        <Input
                          value={bannerForm.link_text}
                          onChange={(e) => setBannerForm({ ...bannerForm, link_text: e.target.value })}
                          placeholder="Shop Now"
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                    </div>
                    {/* Banner Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-cream">Banner Image (Optional)</Label>
                      <input
                        type="file"
                        ref={bannerFileInputRef}
                        onChange={handleBannerImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      {bannerImagePreview ? (
                        <div className="relative">
                          <img
                            src={bannerImagePreview}
                            alt="Banner preview"
                            className="w-full h-32 object-cover rounded-lg border border-gold/20"
                          />
                          <button
                            type="button"
                            onClick={removeBannerImage}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="w-full h-24 border-2 border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gold/50 transition-colors text-muted-foreground"
                        >
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">Click to upload banner image</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-cream">Display Order</Label>
                      <Input
                        type="number"
                        value={bannerForm.display_order}
                        onChange={(e) => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) || 0 })}
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={bannerForm.is_active}
                        onCheckedChange={(checked) => setBannerForm({ ...bannerForm, is_active: checked })}
                      />
                      <Label className="text-cream">Active</Label>
                    </div>
                    
                    {/* Preview */}
                    <div className="space-y-2">
                      <Label className="text-cream">Preview</Label>
                      <div 
                        className="p-3 rounded-lg text-center relative overflow-hidden"
                        style={{ 
                          backgroundColor: bannerForm.background_color,
                          color: bannerForm.text_color 
                        }}
                      >
                        {bannerImagePreview && (
                          <img
                            src={bannerImagePreview}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                        )}
                        <div className="relative z-10">
                          <span className="font-bold mr-2">{bannerForm.title || 'Banner Title'}</span>
                          <span className="text-sm opacity-90">{bannerForm.description}</span>
                          {bannerForm.link_text && (
                            <span className="ml-2 underline text-sm">{bannerForm.link_text}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" variant="gold" className="w-full" disabled={bannerUploading}>
                      {bannerUploading ? 'Uploading...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No banners yet. Create your first offer banner!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div 
                    key={banner.id} 
                    className="bg-card border border-gold/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-16 h-10 rounded flex items-center justify-center text-xs font-bold"
                        style={{ 
                          backgroundColor: banner.background_color,
                          color: banner.text_color 
                        }}
                      >
                        Preview
                      </div>
                      <div className="flex-1">
                        <p className="text-cream font-display">{banner.title}</p>
                        {banner.description && (
                          <p className="text-muted-foreground text-sm">{banner.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={(checked) => toggleBannerActive(banner.id, checked)}
                        />
                        <span className={`text-xs ${banner.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Delivery Settings Tab */}
          <TabsContent value="delivery">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-cream">Delivery Settings</h2>
              <Dialog open={deliveryDialogOpen} onOpenChange={(open) => {
                setDeliveryDialogOpen(open);
                if (!open) resetDeliveryForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Delivery Option
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-gold/20 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-cream font-display">
                      {editingDelivery ? 'Edit Delivery Option' : 'Add Delivery Option'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitDelivery} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cream">Name *</Label>
                      <Input
                        value={deliveryForm.name}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                        required
                        placeholder="e.g., Standard Delivery"
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <Switch
                        checked={deliveryForm.is_free}
                        onCheckedChange={(checked) => setDeliveryForm({ ...deliveryForm, is_free: checked, charge: checked ? '0' : deliveryForm.charge })}
                      />
                      <Label className="text-cream">Free Delivery (based on minimum order)</Label>
                    </div>
                    {!deliveryForm.is_free && (
                      <div className="space-y-2">
                        <Label className="text-cream">Delivery Charge (₹)</Label>
                        <Input
                          type="number"
                          value={deliveryForm.charge}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, charge: e.target.value })}
                          placeholder="99"
                          className="bg-muted border-gold/20 text-cream"
                        />
                      </div>
                    )}
                    {deliveryForm.is_free && (
                      <div className="space-y-2">
                        <Label className="text-cream">Minimum Order Amount (₹) for Free Delivery</Label>
                        <Input
                          type="number"
                          value={deliveryForm.min_order_amount}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, min_order_amount: e.target.value })}
                          placeholder="2000"
                          className="bg-muted border-gold/20 text-cream"
                        />
                        <p className="text-xs text-muted-foreground">
                          Orders above this amount qualify for free delivery
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-cream">Estimated Delivery Time</Label>
                      <Input
                        value={deliveryForm.estimated_time}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, estimated_time: e.target.value })}
                        placeholder="e.g., 3-5 business days"
                        className="bg-muted border-gold/20 text-cream"
                      />
                      <p className="text-xs text-muted-foreground">
                        Time estimate shown to customers
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Display Order</Label>
                      <Input
                        type="number"
                        value={deliveryForm.display_order}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, display_order: parseInt(e.target.value) || 0 })}
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={deliveryForm.is_active}
                        onCheckedChange={(checked) => setDeliveryForm({ ...deliveryForm, is_active: checked })}
                      />
                      <Label className="text-cream">Active</Label>
                    </div>
                    <Button type="submit" variant="gold" className="w-full">
                      {editingDelivery ? 'Update Delivery Option' : 'Add Delivery Option'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : deliverySettings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No delivery options yet. Add your first delivery option!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliverySettings.map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className="bg-card border border-gold/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-10 rounded bg-gold/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-cream font-display">{delivery.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {delivery.is_free 
                            ? `Free on orders above ${formatPrice(delivery.min_order_amount || 0)}` 
                            : formatPrice(delivery.charge)}
                          {delivery.estimated_time && ` • ${delivery.estimated_time}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={delivery.is_active}
                          onCheckedChange={(checked) => toggleDeliveryActive(delivery.id, checked)}
                        />
                        <span className={`text-xs ${delivery.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {delivery.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDelivery(delivery)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDelivery(delivery.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Festival Banners Tab */}
          <TabsContent value="festival">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-cream">Festival Banners</h2>
              <Dialog open={festivalDialogOpen} onOpenChange={(open) => {
                setFestivalDialogOpen(open);
                if (!open) resetFestivalForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Festival Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-gold/20 max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-cream font-display">
                      {editingFestival ? 'Edit Festival Banner' : 'Add Festival Banner'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitFestival} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cream">Banner Image *</Label>
                      <input
                        ref={festivalFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFestivalImageSelect}
                        className="hidden"
                      />
                      
                      {festivalImagePreview ? (
                        <div className="relative">
                          <img
                            src={festivalImagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-gold/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFestivalImage}
                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => festivalFileInputRef.current?.click()}
                          className="h-48 border-2 border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors"
                        >
                          <Upload className="w-10 h-10 text-gold/50 mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Alt Text</Label>
                      <Input
                        value={festivalForm.alt_text}
                        onChange={(e) => setFestivalForm({ ...festivalForm, alt_text: e.target.value })}
                        placeholder="Festival Banner"
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Link URL (optional)</Label>
                      <Input
                        value={festivalForm.link_url}
                        onChange={(e) => setFestivalForm({ ...festivalForm, link_url: e.target.value })}
                        placeholder="/shop"
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream">Display Order</Label>
                      <Input
                        type="number"
                        value={festivalForm.display_order}
                        onChange={(e) => setFestivalForm({ ...festivalForm, display_order: parseInt(e.target.value) || 0 })}
                        className="bg-muted border-gold/20 text-cream"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={festivalForm.is_active}
                        onCheckedChange={(checked) => setFestivalForm({ ...festivalForm, is_active: checked })}
                      />
                      <Label className="text-cream">Active</Label>
                    </div>
                    <Button type="submit" variant="gold" className="w-full" disabled={festivalUploading}>
                      {festivalUploading ? 'Uploading...' : editingFestival ? 'Update Banner' : 'Add Banner'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : festivalBanners.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No festival banners yet. Add your first banner!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {festivalBanners.map((banner) => (
                  <div 
                    key={banner.id} 
                    className="bg-card border border-gold/10 rounded-lg overflow-hidden"
                  >
                    <img
                      src={banner.image_url}
                      alt={banner.alt_text}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-cream font-display text-sm truncate">{banner.alt_text}</p>
                      {banner.link_url && (
                        <p className="text-muted-foreground text-xs truncate">{banner.link_url}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={(checked) => toggleFestivalActive(banner.id, checked)}
                          />
                          <span className={`text-xs ${banner.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFestival(banner)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFestival(banner.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
