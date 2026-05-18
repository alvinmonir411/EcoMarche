import Link from "next/link";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
      <p className="mt-2 text-stone-600">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
