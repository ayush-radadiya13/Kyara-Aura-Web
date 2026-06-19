'use client';

import { useState } from 'react';
import { LoadingLabel } from '@/components/ui/loader';
import { submitCustomerReviewApi } from '@/services/customer-reviews';

export default function ProductReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!productId) {
      setError('Unable to submit review for this product.');
      return;
    }

    if (rating < 1) {
      setError('Please select a rating.');
      return;
    }

    const trimmedReview = review.trim();
    if (!trimmedReview) {
      setError('Please write your review.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCustomerReviewApi({
        product_id: productId,
        rating,
        review: trimmedReview,
      });

      setRating(0);
      setHoveredRating(0);
      setReview('');
      setSuccessMessage('Thank you! Your review has been submitted.');
      onSuccess?.();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message
          || submitError?.message
          || 'Unable to submit your review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoveredRating || rating;

  return (
    <form className="space-y-5 bg-[#f8f8f7] p-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-gray-900">
        Leave a Review
      </h2>

      <div className="border-b border-gray-300 py-3">
        <p className="text-sm text-gray-400">Rating</p>
        <div
          className="mt-2 flex items-center gap-1"
          role="radiogroup"
          aria-label="Rating"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= activeRating;

            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={rating === starValue}
                aria-label={`${starValue} star${starValue === 1 ? '' : 's'}`}
                onMouseEnter={() => setHoveredRating(starValue)}
                onClick={() => setRating(starValue)}
                className={`text-2xl leading-none transition ${
                  isActive ? 'text-[#c9a75d]' : 'text-gray-300 hover:text-[#c9a75d]/70'
                }`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        placeholder="Your Review"
        rows={3}
        value={review}
        onChange={(event) => setReview(event.target.value)}
        className="w-full resize-none border-b border-gray-300 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {successMessage && (
        <p className="text-sm text-green-700">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-md font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? (
          <LoadingLabel spinnerClassName="border-white border-t-transparent">
            Submitting...
          </LoadingLabel>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
