import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FestivalBannerData {
  id: string;
  image_url: string;
  link_url: string | null;
  alt_text: string;
}

const FestivalBanner = () => {
  const [banners, setBanners] = useState<FestivalBannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('festival_banners')
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

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const bannerContent = (
    <img
      src={currentBanner.image_url}
      alt={currentBanner.alt_text}
      className="w-full h-auto object-cover rounded-lg"
    />
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-lg">
        {currentBanner.link_url ? (
          <Link to={currentBanner.link_url} className="block">
            {bannerContent}
          </Link>
        ) : (
          bannerContent
        )}

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prevBanner(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextBanner(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-gold w-6' 
                    : 'bg-background/60 hover:bg-background/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalBanner;
