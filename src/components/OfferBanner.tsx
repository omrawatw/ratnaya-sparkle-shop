import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  background_color: string;
  text_color: string;
  link_url: string | null;
  link_text: string | null;
}

const OfferBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('offer_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data && data.length > 0) {
        setBanners(data);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!isVisible || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div 
      className="relative py-3 px-4"
      style={{ 
        backgroundColor: currentBanner.background_color,
        color: currentBanner.text_color 
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-4">
        {banners.length > 1 && (
          <button 
            onClick={prevBanner}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: currentBanner.text_color }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        <div className="text-center flex-1">
          <span className="font-display font-bold mr-2">{currentBanner.title}</span>
          {currentBanner.description && (
            <span className="font-body text-sm opacity-90">{currentBanner.description}</span>
          )}
          {currentBanner.link_url && currentBanner.link_text && (
            <Link 
              to={currentBanner.link_url} 
              className="ml-3 underline font-body text-sm hover:opacity-70 transition-opacity"
            >
              {currentBanner.link_text}
            </Link>
          )}
        </div>

        {banners.length > 1 && (
          <button 
            onClick={nextBanner}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: currentBanner.text_color }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          style={{ color: currentBanner.text_color }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-1.5 h-1.5 rounded-full transition-opacity"
              style={{ 
                backgroundColor: currentBanner.text_color,
                opacity: index === currentIndex ? 1 : 0.4
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferBanner;