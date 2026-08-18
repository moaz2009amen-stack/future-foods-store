import { Truck, PartyPopper } from "lucide-react";

export default function FreeShippingBar({
  current,
  threshold,
}: {
  current: number;
  threshold: number;
}) {
  if (current >= threshold) {
    return (
      <div className="card p-3 bg-success/10 border-success/30 flex items-center gap-2 text-sm font-bold text-success">
        <PartyPopper className="w-5 h-5 shrink-0" />
        مبروك! وصلت لحد التوصيل المجاني 🎉
      </div>
    );
  }

  const remaining = threshold - current;
  const progress = Math.min(100, (current / threshold) * 100);

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 text-sm font-bold mb-2">
        <Truck className="w-4 h-4 text-accent shrink-0" />
        أضف {remaining.toFixed(0)} ج.م وتاخد توصيل مجاني 🚚
      </div>
      <div className="h-2 rounded-full bg-surface2 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
