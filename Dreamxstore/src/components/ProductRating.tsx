"use client";

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ReviewService } from '../lib/api/services/reviewService';
import { TokenManager } from '../lib/api/tokenManager';

interface RatingProps {
  productId: string;
  currentRating?: number;
  reviewsCount?: number;
  onRatingSubmitted?: (rating: number, newProductRating: number) => void;
  className?: string;
}

const ProductRating: React.FC<RatingProps> = ({
  productId,
  currentRating = 0,
  reviewsCount = 0,
  onRatingSubmitted,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');

  // Check user's existing review on mount
  useEffect(() => {
    checkUserReview();
  }, [productId]);

  const checkUserReview = async () => {
    try {
      if (!TokenManager.getToken()) return;

      const review = await ReviewService.getUserProductReview(productId);
      if (review) {
        setUserRating(review.rating);
      }
    } catch (error) {
      // No review yet, that's fine
      console.log('[ProductRating] No existing review');
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!TokenManager.getToken()) {
      alert('Please login to leave a review');
      return;
    }

    setLoading(true);
    try {
      await ReviewService.createReview({
        productId,
        rating,
        comment: comment.trim()
      });

      setUserRating(rating);
      setComment('');
      setShowForm(false);

      // Refresh to get updated product rating
      onRatingSubmitted?.(rating, currentRating);

      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error('[ProductRating] Error submitting review:', error);
      alert(error?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = async (rating: number) => {
    if (!userRating) {
      // Create new review
      await handleRatingSubmit(rating);
      return;
    }

    // Update existing review
    setLoading(true);
    try {
      // Would need to get reviewId first - for now we'll create a new one
      await ReviewService.createReview({
        productId,
        rating,
        comment
      });

      setUserRating(rating);
      alert('Review updated successfully!');
    } catch (error: any) {
      console.error('[ProductRating] Error updating review:', error);
      if (error?.message?.includes('already reviewed')) {
        alert('You have already reviewed this product. Update coming soon!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Display current product rating */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`transition-colors ${
                star <= currentRating
                  ? 'fill-yellow-400 stroke-yellow-400'
                  : 'fill-gray-200 stroke-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {currentRating.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500">({reviewsCount} reviews)</span>
      </div>

      {/* User rating form */}
      {TokenManager.getToken() && !userRating && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showForm ? 'Cancel' : 'Leave a Review'}
        </button>
      )}

      {userRating && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Your rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={`transition-colors ${
                  star <= userRating
                    ? 'fill-green-500 stroke-green-500'
                    : 'fill-gray-200 stroke-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rating input form */}
      {showForm && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setHoverRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={loading}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={20}
                    className={`transition-colors ${
                      star <= (hoverRating || 0)
                        ? 'fill-yellow-400 stroke-yellow-400'
                        : 'fill-gray-200 stroke-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Share your thoughts about this product..."
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (hoverRating) {
                  handleRatingUpdate(hoverRating);
                } else {
                  alert('Please select a rating');
                }
              }}
              disabled={loading || !hoverRating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold py-2 rounded transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-semibold py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRating;
