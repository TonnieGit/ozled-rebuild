import { cx } from "@/lib/format";

export function Section({
  id,
  title,
  eyebrow,
  children,
  className,
  action,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-h`} className={cx("scroll-mt-28", className)} id={id}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-1 text-action">{eyebrow}</p>}
          <h2 id={`${id}-h`} className="display text-d3">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
