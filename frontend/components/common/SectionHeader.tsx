type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold text-stone-950 md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
