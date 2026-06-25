const DUMMY_REVIEWS = [
  {
    customer_name: 'Priya Patel',
    rating: 5,
    date: '12 Jun 2026',
    review: 'Beautiful product! The quality is excellent and exactly as expected.',
  },
  {
    customer_name: 'Khushi Shah',
    rating: 4,
    date: '10 Jun 2026',
    review: 'Very nice product. Delivery was quick and packaging was secure.',
  },
  {
    customer_name: 'Hetal Joshi',
    rating: 5,
    date: '08 Jun 2026',
    review: 'Amazing craftsmanship. Highly recommended!',
  },
  {
    customer_name: 'Riddhi Mehta',
    rating: 4,
    date: '05 Jun 2026',
    review: 'Good quality and worth the price. Very satisfied.',
  },
  {
    customer_name: 'Nidhi Desai',
    rating: 5,
    date: '02 Jun 2026',
    review: 'Excellent finish and premium look. Loved it!',
  },
  {
    customer_name: 'Pooja Patel',
    rating: 4,
    date: '30 May 2026',
    review: 'Happy with my purchase. The product matches the description.',
  },
  {
    customer_name: 'Mansi Trivedi',
    rating: 5,
    date: '28 May 2026',
    review: 'Superb quality. Will definitely shop again.',
  },
  {
    customer_name: 'Jinal Shah',
    rating: 4,
    date: '25 May 2026',
    review: 'Nice design and fast delivery. Good experience overall.',
  },
  {
    customer_name: 'Krupa Patel',
    rating: 5,
    date: '22 May 2026',
    review: "One of the best purchases I've made. Highly satisfied!",
  },
  {
    customer_name: 'Neha Bhatt',
    rating: 5,
    date: '20 May 2026',
    review: 'Excellent product with premium quality. Highly recommend.',
  },
  {
    customer_name: 'Ayush Patel',
    rating: 5,
    date: '18 May 2026',
    review: 'Outstanding quality. The product exceeded my expectations.',
  },
  {
    customer_name: 'Hardik Patel',
    rating: 4,
    date: '15 May 2026',
    review: 'Very good product. Value for money and delivered on time.',
  },
  {
    customer_name: 'Meet Shah',
    rating: 5,
    date: '12 May 2026',
    review: 'Premium finish and excellent quality. Would buy again.',
  },
  {
    customer_name: 'Dhruv Joshi',
    rating: 4,
    date: '09 May 2026',
    review: 'Good experience overall. Packaging was neat and product is nice.',
  },
  {
    customer_name: 'Krunal Patel',
    rating: 5,
    date: '06 May 2026',
    review: 'Fantastic product! Great quality and fast delivery.',
  },
];

function formatReviewDate(dateValue) {
  if (!dateValue) return '';

  const normalized = String(dateValue).includes('T')
    ? dateValue
    : String(dateValue).replace(' ', 'T');

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StarRating({ rating, max = 5 }) {
  const safeRating = Math.min(Math.max(Math.round(Number(rating) || 0), 0), max);

  return (
    <div
      className="flex items-center gap-0.5 text-base leading-none"
      aria-label={`${safeRating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={index < safeRating ? 'text-[#c9a75d]' : 'text-gray-300'}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="mr-4 flex min-h-[180px] w-[280px] shrink-0 flex-col border border-gray-100 bg-white p-5 sm:w-[320px]">
      <p className="text-sm font-semibold text-gray-950">
        {review.customer_name || 'Anonymous'}
      </p>

      <div className="mt-2">
        <StarRating rating={review.rating} />
      </div>

      {review.review && (
        <p className="mt-3 flex-1 text-sm leading-6 text-gray-500">
          {review.review}
        </p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        {formatReviewDate(review.created_at ?? review.date)}
      </p>
    </article>
  );
}

export default function ProductReviewsSection({ reviews = [], reviewsCount }) {
  const originalReviews = Array.isArray(reviews) ? reviews : [];
  // Original (real) reviews are shown first, followed by the dummy reviews.
  const displayedReviews = [...originalReviews, ...DUMMY_REVIEWS];

  if (!displayedReviews.length) {
    return null;
  }

  const totalReviews = reviewsCount ?? originalReviews.length;
  // Slow the marquee down as the list grows so the speed stays comfortable.
  const marqueeDuration = `${Math.max(displayedReviews.length * 5, 30)}s`;

  return (
    <section className="mt-16 lg:mt-20">
      <h2 className="mb-9 text-center text-2xl font-semibold text-gray-950">
        Reviews 
      </h2>

      <div className="reviews-marquee group -mx-4 overflow-hidden px-4">
        <div
          className="reviews-marquee-track flex w-max"
          style={{ '--reviews-marquee-duration': marqueeDuration }}
        >
          {[...displayedReviews, ...displayedReviews].map((review, index) => (
            <ReviewCard key={`${review.customer_name}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
