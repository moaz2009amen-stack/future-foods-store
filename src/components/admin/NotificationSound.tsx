"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const REPEAT_MS = 4000;

export default function NotificationSound() {
  const [pendingCount, setPendingCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // تشغيل نغمة تنبيه باستخدام Web Audio API (بدون الحاجة لملف صوت خارجي)
  function beep() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.9, now + i * 0.22 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.25);
    });
  }

  function enableSound() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    audioCtxRef.current.resume();
    setUnlocked(true);
    beep();
  }

  useEffect(() => {
    const supabase = createClient();

    async function loadPending() {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("acknowledged", false)
        .neq("status", "cancelled")
        .neq("status", "delivered");
      setPendingCount(count ?? 0);
    }
    loadPending();

    const channel = supabase
      .channel("orders-sound")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadPending();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (pendingCount > 0 && unlocked) {
      beep();
      intervalRef.current = setInterval(beep, REPEAT_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCount, unlocked]);

  if (!unlocked) {
    return (
      <button
        onClick={enableSound}
        className="fixed bottom-4 left-4 z-50 btn-accent rounded-full px-4 py-3 text-sm font-bold flex items-center gap-2 shadow-lg"
      >
        <Volume2 className="w-4 h-4" />
        فعّل صوت تنبيهات الطلبات
      </button>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-danger text-white rounded-full px-4 py-3 text-sm font-bold flex items-center gap-2 shadow-lg new-order-pulse">
        <Volume2 className="w-4 h-4" />
        {pendingCount} طلب بانتظار التأكيد
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 text-muted text-xs flex items-center gap-1 opacity-60">
      <VolumeX className="w-3 h-3" /> لا توجد تنبيهات
    </div>
  );
}
