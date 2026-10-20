import Link from "next/link";
import { Icon } from "@/components/icon";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="line-clamp-1 text-fg">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="hover:text-fg hover:underline">
                    {c.name}
                  </Link>
                  <Icon name="chevronRight" size={14} className="text-fg-subtle" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
