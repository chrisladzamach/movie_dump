interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function RatingInput({ label, value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
              value >= n && n > 0
                ? 'bg-primary text-black'
                : value === 0 && n === 0
                  ? 'bg-primary/20 text-primary border border-primary'
                  : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
