import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <p className="text-gold font-body tracking-[0.3em] uppercase mb-4">Get in Touch</p>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-cream gold-underline inline-block">
              Contact Us
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-card border border-gold/10 rounded-lg p-8 animate-fade-in">
              <h2 className="text-2xl font-display text-cream mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-cream font-body">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-muted border-gold/20 text-cream"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cream font-body">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-muted border-gold/20 text-cream"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-cream font-body">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-muted border-gold/20 text-cream"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-cream font-body">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-muted border-gold/20 text-cream resize-none"
                  />
                </div>
                <Button type="submit" variant="gold" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-2xl font-display text-cream mb-6">Contact Information</h2>
                <p className="text-cream/70 font-body text-lg leading-relaxed">
                  Have a question about our jewelry or need assistance with an order? 
                  We're here to help you find the perfect piece.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-card border border-gold/10 rounded-lg">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-cream font-display text-lg mb-1">Visit Our Store</h3>
                    <p className="text-muted-foreground font-body">
                      123 Jewelry Lane, Bandra West<br />Mumbai, Maharashtra 400050
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-gold/10 rounded-lg">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-cream font-display text-lg mb-1">Call Us</h3>
                    <p className="text-muted-foreground font-body">
                      +91 98765 43210<br />+91 22 2634 5678
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-gold/10 rounded-lg">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-cream font-display text-lg mb-1">Email Us</h3>
                    <p className="text-muted-foreground font-body">
                      hello@ratnaya.com<br />support@ratnaya.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-card border border-gold/10 rounded-lg">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-cream font-display text-lg mb-1">Store Hours</h3>
                    <p className="text-muted-foreground font-body">
                      Mon - Sat: 10:00 AM - 8:00 PM<br />Sunday: 11:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
