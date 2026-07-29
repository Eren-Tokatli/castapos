export function PlaceholderPage({
  title,
  milestone,
  description,
}: {
  title: string;
  milestone: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-start justify-center gap-2 px-6 py-24">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {milestone}
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}
