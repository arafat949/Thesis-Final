function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function CardBrand({ label, className }: { label: string; className: string }) {
  return (
    <div
      class={classNames(
        'flex h-5 w-8 items-center justify-center rounded text-[8px] font-bold italic text-white',
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function CardBrandStrip() {
  return (
    <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1">
      <CardBrand label="VISA" className="bg-[#1A1F71]" />
      <CardBrand label="MC" className="bg-[#EB001B]" />
      <CardBrand label="AMEX" className="bg-[#006FCF]" />
    </div>
  );
}
