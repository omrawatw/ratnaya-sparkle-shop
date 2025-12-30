import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import NotificationBell from '@/components/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-display font-bold text-gold tracking-wider">
              RATNAYA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-cream/80 hover:text-gold transition-colors font-body text-lg tracking-wide"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="text-cream/80 hover:text-gold transition-colors font-body text-lg tracking-wide"
            >
              Shop
            </Link>
            <Link 
              to="/track-order" 
              className="text-cream/80 hover:text-gold transition-colors font-body text-lg tracking-wide"
            >
              My Orders
            </Link>
            <Link 
              to="/about" 
              className="text-cream/80 hover:text-gold transition-colors font-body text-lg tracking-wide"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-cream/80 hover:text-gold transition-colors font-body text-lg tracking-wide"
            >
              Contact
            </Link>
          </nav>

          {/* Cart, Wishlist, Notifications, User & Mobile Menu */}
          <div className="flex items-center gap-4">
            {user && <NotificationBell />}
            
            <Link to="/wishlist" className="relative">
              <Heart className="w-6 h-6 text-cream hover:text-gold transition-colors" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-background text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 text-cream hover:text-gold transition-colors">
                <User className="w-6 h-6" />
                <span className="hidden md:inline font-body text-sm">Profile</span>
              </Link>
            ) : (
              <Link to="/auth" className="text-cream hover:text-gold transition-colors font-body text-sm">
                <span className="hidden md:inline">Sign In</span>
                <User className="w-6 h-6 md:hidden" />
              </Link>
            )}
            
            <Link to="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-cream hover:text-gold transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-background text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button 
              className="md:hidden text-cream"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gold/20 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/track-order" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link 
                to="/wishlist" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link 
                to="/about" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-cream/80 hover:text-gold transition-colors font-body text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {user ? (
                <Link 
                  to="/profile" 
                  className="text-gold hover:text-gold-light transition-colors font-body text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
              ) : (
                <Link 
                  to="/auth" 
                  className="text-gold hover:text-gold-light transition-colors font-body text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
