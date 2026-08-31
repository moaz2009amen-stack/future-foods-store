"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function CloudinaryUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("الصور المسموحة بس: JPG, PNG, WEBP");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`حجم الصورة أكبر من ${MAX_SIZE_MB} ميجا`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // بناخد توقيع آمن من السيرفر بدل ما نستخدم Upload Preset مكشوف
      // لأي حد على الإنترنت — التوقيع ده محدود بالوقت ومربوط بمجلد
      // ثابت محدد من السيرفر نفسه
      const signRes = await fetch("/api/cloudinary-sign");
      const signData = await signRes.json();
      if (!signRes.ok) {
        setError(signData.error || "تعذر تجهيز الرفع");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError("فشل رفع الصورة");
      }
    } catch {
      setError("فشل رفع الصورة");
    }
    setLoading(false);
  }

  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="w-20 h-20 rounded-lg bg-surface2 border border-border overflow-hidden flex items-center justify-center shrink-0">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="صورة" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-5 h-5 text-muted" />
          )}
        </div>
        <span className="text-sm text-muted">اضغط لرفع صورة (JPG, PNG, WEBP)</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </label>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}