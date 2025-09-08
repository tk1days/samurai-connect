// src/components/StarRating.tsx
type Props = {
  value: number;   // 星の平均値（例: 4.3）
  reviews?: number; // レビュー件数
};

export default function StarRating({ value, reviews }: Props) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  const Star = ({ fill }: { fill: "full" | "half" | "empty" }) => (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      className="inline-block text-yellow-500"
      fill={fill === "full" ? "currentColor" : "none"}
      stroke="currentColor"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      {fill === "half" && (
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="currentColor"
          clipPath="inset(0 50% 0 0)"
        />
      )}
    </svg>
  );

  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} fill="full" />)}
      {half && <Star fill="half" />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} fill="empty" />)}
      {typeof reviews === "number" && (
        <span className="text-xs text-gray-500">({reviews})</span>
      )}
    </span>
  );
}