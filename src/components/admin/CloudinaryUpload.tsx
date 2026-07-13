"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      setError("لم يتم إعداد Cloudinary — راجع متغيرات البيئة");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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
        <span className="text-sm text-muted">اضغط لرفع صورة</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
