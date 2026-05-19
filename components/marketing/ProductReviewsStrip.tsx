import { fetchApprovedReviews } from "@/lib/public-reviews";
import Link from "next/link";

function stars(rating: number) {
  const n = Math.min(5, Math.max(1, Math.round(rating)));
  return "★★★★★".slice(0, n);
}

export async function ProductReviewsStrip() {
  const { reviews, summary } = await fetchApprovedReviews(6);

  if (reviews.length === 0) {
    return null;
  }

  const score = summary.overall_rating ?? 5;
  const count = summary.total_reviews;

  return (
    <section className="section section--reviews product-reviews-strip" aria-labelledby="product-reviews-title">
      <div className="container">
        <h2 className="section__title center" id="product-reviews-title">
          What customers are saying
        </h2>
        <p className="section__lead center">
          {count > 0 ?
            <>
              <span className="review-overall__score">{score.toFixed(1)}</span>{" "}
              <span aria-hidden="true">{stars(score)}</span>
              <span className="sr-only">Rated {score.toFixed(1)} out of 5</span>
              {" · "}
              {count === 1 ? "1 review" : `${count} reviews`}
            </>
          : "Real feedback from the Prime Rise community."}
        </p>

        <div className="reviews-carousel product-reviews-strip__carousel">
          <div className="reviews-track-wrap" tabIndex={0} aria-label="Scroll through customer reviews">
            <div className="reviews-grid" role="list">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className={`review-card${review.source === "google" ? " review-card--google" : ""}`}
                  role="listitem"
                >
                  {review.source === "google" && <p className="review-card__source">Google Review</p>}
                  <p className="review-card__rating" aria-label={`Rated ${review.rating} out of 5`}>
                    {stars(review.rating)}
                  </p>
                  <p className="review-card__quote">&ldquo;{review.review}&rdquo;</p>
                  <p className="review-card__name">— {review.name}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="reviews-scroll-hint" aria-hidden="true">
            Swipe to read more reviews
          </p>
        </div>

        <p className="center mt-6">
          <Link href="/#reviews" className="btn btn--mkt">
            Leave a review
          </Link>
        </p>
      </div>
    </section>
  );
}
