export default function BadgeChip({ name }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-50 px-3 py-1.5 text-xs font-black text-amber-800 shadow-[0_0_22px_rgba(245,158,11,0.22)]">
      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
      {name}
    </span>
  );
}
