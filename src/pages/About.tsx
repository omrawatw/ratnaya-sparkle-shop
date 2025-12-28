import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Gem, Award, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gold font-body tracking-[0.3em] uppercase mb-4">Our Story</p>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-cream mb-8 gold-underline inline-block">
              About Ratnaya
            </h1>
            <p className="text-xl text-cream/70 font-body leading-relaxed">
              Founded with a passion for exceptional craftsmanship and timeless beauty, 
              Ratnaya has been creating exquisite jewelry that celebrates life's most precious moments.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <img
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600"
                alt="Jewelry craftsmanship"
                className="rounded-lg shadow-elegant"
              />
            </div>
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-cream mb-6">
                A Legacy of <span className="text-gold">Excellence</span>
              </h2>
              <p className="text-cream/70 font-body text-lg mb-6 leading-relaxed">
                Since our inception, Ratnaya has been synonymous with exceptional quality and 
                unparalleled craftsmanship. Our master artisans blend traditional techniques 
                with contemporary designs to create jewelry that transcends generations.
              </p>
              <p className="text-cream/70 font-body text-lg leading-relaxed">
                Every piece in our collection is a testament to our commitment to perfection. 
                From selecting the finest gemstones to the final polish, we ensure that each 
                creation meets the highest standards of quality and beauty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card border-y border-gold/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-cream gold-underline inline-block">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Gem className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Quality</h3>
              <p className="text-muted-foreground font-body">Only the finest materials and gemstones</p>
            </div>
            <div className="text-center p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Craftsmanship</h3>
              <p className="text-muted-foreground font-body">Handcrafted with precision and care</p>
            </div>
            <div className="text-center p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Trust</h3>
              <p className="text-muted-foreground font-body">Certified authentic with full transparency</p>
            </div>
            <div className="text-center p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-display text-cream mb-3">Passion</h3>
              <p className="text-muted-foreground font-body">Creating pieces that tell your story</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
