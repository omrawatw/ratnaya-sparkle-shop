import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
      if (user) {
        const userRev = data?.find(r => r.user_id === user.id);
        if (userRev) {
          setUserReview(userRev);
          setRating(userRev.rating);
          setReviewText(userRev.review_text || '');
        }
      }
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from('product_reviews')
        .update({ rating, review_text: reviewText || null })
        .eq('id', userReview.id);

      if (error) {
        console.error('Error updating review:', error);
        toast.error('Failed to update review');
      } else {
        toast.success('Review updated successfully');
        fetchReviews();
      }
    } else {
      // Create new review
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          review_text: reviewText || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else {
          console.error('Error submitting review:', error);
          toast.error('Failed to submit review');
        }
      } else {
        toast.success('Review submitted successfully');
        fetchReviews();
      }
    }

    setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-16 pt-12 border-t border-gold/10">
      <h2 className="text-3xl font-display font-bold text-cream mb-8">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= Math.round(averageRating)
                  ? 'text-gold fill-gold'
                  : 'text-gold/30'
              }`}
            />
          ))}
        </div>
        <span className="text-cream font-body text-lg">
          {averageRating.toFixed(1)} out of 5
        </span>
        <span className="text-muted-foreground font-body">
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* Write Review Form */}
      {user && (
        <div className="bg-card border border-gold/10 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-display text-cream mb-4">
            {userReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          
          <div className="mb-4">
            <p className="text-cream/70 font-body mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-gold fill-gold'
                        : 'text-gold/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              className="bg-muted border-gold/20 text-cream min-h-[100px]"
            />
          </div>

          <Button 
            variant="gold" 
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      )}

      {!user && (
        <div className="bg-card border border-gold/10 rounded-lg p-6 mb-8 text-center">
          <p className="text-cream/70 font-body">
            Please <a href="/auth" className="text-gold hover:underline">sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-cream/70 font-body">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-cream/70 font-body">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card/50 border border-gold/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-gold fill-gold'
                              : 'text-gold/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm font-body">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              {review.review_text && (
                <p className="text-cream/80 font-body">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
