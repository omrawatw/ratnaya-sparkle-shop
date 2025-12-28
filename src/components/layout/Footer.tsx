import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-gold/20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-3xl font-display font-bold text-gold mb-4">RATNAYA</h3>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              Exquisite jewelry crafted with passion, designed to celebrate your most precious moments.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold text-cream mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-display font-semibold text-cream mb-4">Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop?category=necklaces" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/shop?category=earrings" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Earrings
                </Link>
              </li>
              <li>
                <Link to="/shop?category=rings" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Rings
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bracelets" className="text-muted-foreground hover:text-gold transition-colors font-body">
                  Bracelets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-display font-semibold text-cream mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground font-body">
                <MapPin className="w-4 h-4 text-gold" />
                123 Jewelry Lane, Mumbai, India
              </li>
              <li className="flex items-center gap-3 text-muted-foreground font-body">
                <Phone className="w-4 h-4 text-gold" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-muted-foreground font-body">
                <Mail className="w-4 h-4 text-gold" />
                hello@ratnaya.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gold/20 pt-8 text-center">
          <p className="text-muted-foreground font-body">
            © 2024 Ratnaya. All rights reserved. Crafted with ♥ in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
