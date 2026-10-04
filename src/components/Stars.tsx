export function Stars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange?: (value: number) => void;
  label: string;
}) {
  return (
    <span className="stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          className={star <= value ? "on" : ""}
          onClick={() => onChange?.(value === star ? 0 : star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export function StarReadout({ value }: { value: number }) {
  if (value <= 0) return <span className="muted">Pas encore</span>;
  return (
    <span className="star-read">
      <b>{value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}</b>
      <span aria-hidden="true">★</span>
    </span>
  );
}
