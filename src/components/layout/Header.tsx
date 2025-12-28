import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

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

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
