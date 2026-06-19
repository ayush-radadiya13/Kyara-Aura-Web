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

export default function ProductReviewsSection({ reviews = [], reviewsCount }) {
  const totalReviews = reviewsCount ?? reviews.length;

  if (!reviews.length) {
    return null;
  }

  return (
    <section className="mt-16 lg:mt-20">
      <h2 className="mb-9 text-center text-2xl font-semibold text-gray-950">
        Reviews
        {totalReviews > 0 ? ` (${totalReviews})` : ''}
      </h2>

      <div
        className="-mx-4 snap-x snap-mandatory overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-lenis-prevent-horizontal
      >
        <div className="grid min-w-full auto-cols-[calc((100%-2rem)/3)] grid-flow-col gap-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex min-h-[180px] snap-start flex-col border border-gray-100 bg-white p-5"
            >
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
                {formatReviewDate(review.created_at)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
