import { useEffect, useState, useRef } from 'react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

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
      nextBanner();
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, currentIndex]);

  if (banners.length === 0) return null;

  const nextBanner = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevBanner = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToBanner = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="relative overflow-hidden rounded-lg h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]">
        {/* Sliding container */}
        <div 
          ref={sliderRef}
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full h-full flex-shrink-0">
              {banner.link_url ? (
                <Link to={banner.link_url} className="block w-full h-full">
                  <img
                    src={banner.image_url}
                    alt={banner.alt_text}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={banner.image_url}
                  alt={banner.alt_text}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={prevBanner}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button 
              onClick={nextBanner}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gold w-6' 
                    : 'bg-background/60 hover:bg-background/80 w-2'
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
