"use client";

import { useEffect, useRef, useState } from "react";

// Hiệu ứng click "giọt cà phê loang" (HAP-24 — DESIGN.md mục 9): khi nhấn
// chuột/tap trên storefront, một giọt cà phê loang ra tại đúng điểm nhấn
// kèm vòng gợn mờ rồi fade hết. Chỉ gắn ở layout storefront nên /admin
// không có hiệu ứng này.
//
// Ràng buộc theo issue: overlay thuần thị giác (pointer-events-none),
// chỉ animate transform/opacity, tối đa 5 giọt đồng thời, node tự dọn
// sau animation, tắt hoàn toàn khi prefers-reduced-motion, sự kiện
// pointerdown thống nhất chuột + cảm ứng (không double-fire trên mobile).

const MAX_DROPS = 5;
const DROP_LIFETIME_MS = 750; // khớp --duration-drop 700ms + đệm dọn node

interface Drop {
  id: number;
  x: number;
  y: number;
}

export default function CoffeeDropClickEffect() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // Tôn trọng giảm chuyển động: không sinh giọt nào cả (khác với việc
    // chỉ rút ngắn animation như lớp CSS toàn cục).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      // Chỉ nút chính (chuột trái / chạm / bút nhấn chính).
      if (event.button !== 0 || !event.isPrimary) return;

      const id = ++nextId.current;
      const drop: Drop = { id, x: event.clientX, y: event.clientY };
      setDrops((prev) => [...prev.slice(-(MAX_DROPS - 1)), drop]);

      const timer = window.setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, DROP_LIFETIME_MS);
      timers.current.push(timer);
    };

    window.addEventListener("pointerdown", onPointerDown);
    const timersSnapshot = timers.current;
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      timersSnapshot.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (drops.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="absolute"
          style={{ left: drop.x, top: drop.y }}
        >
          {/* Giọt loang: radial-gradient coffee → caramel, alpha ≤ 0.35
              theo DESIGN.md để không trông như vết lem. h-14 w-14 = 56px
              kích thước tối đa (Duy yêu cầu thu nhỏ từ 96px, HAP-24);
              -left-7/-top-7 để tâm giọt trùng điểm nhấn mà keyframes
              chỉ cần animate scale. */}
          <span
            className="animate-coffee-drop absolute -top-7 -left-7 block h-14 w-14 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(62, 42, 32, 0.35) 0%, rgba(192, 133, 82, 0.28) 45%, rgba(192, 133, 82, 0) 70%)",
            }}
          />
          {/* Vòng gợn mờ lan ra ngoài giọt. */}
          <span className="animate-coffee-ring absolute -top-7 -left-7 block h-14 w-14 rounded-full border-2 border-caramel" />
        </span>
      ))}
    </div>
  );
}
