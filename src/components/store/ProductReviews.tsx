import RatingStars from "./RatingStars";
import type { Review } from "@/types";

export default function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-bold mb-3">التقييمات</h2>
        <p className="text-muted text-sm">لسه مفيش تقييمات على المنتج ده — كن أول من يقيّمه بعد استلام طلبك.</p>
      </div>
    );
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold">التقييمات</h2>
        <div className="flex items-center gap-1.5">
          <RatingStars value={Math.round(avg)} size="w-4 h-4" />
          <span className="text-sm text-muted">{avg.toFixed(1)} من {reviews.length} تقييم</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="card p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">{r.customer_name}</span>
              <RatingStars value={r.rating} size="w-3.5 h-3.5" />
            </div>
            {r.comment && <p className="text-sm text-muted">{r.comment}</p>}
            <span className="text-xs text-muted mt-1 block">
              {new Date(r.created_at).toLocaleDateString("ar-EG")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
