type Props = {
  rating: 1 | 2 | 3 | 4 | 5;
  className?: string;
};

export default function StarBar({ rating, className = "" }: Props) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return (
    <span
      className={`font-mono text-accent ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      <span aria-hidden="true">{filled}{empty}</span>
    </span>
  );
}
