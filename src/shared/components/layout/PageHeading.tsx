import { ReactNode } from "react";

export interface PageHeadingProps {
  title: ReactNode;
  subtitle: ReactNode;
  titleAside?: ReactNode;
}

export const PageHeading = ({ title, subtitle, titleAside }: PageHeadingProps) => (
  <div className="min-w-0">
    <div className="flex items-center gap-2 min-w-0">
      <h1 className="min-w-0 truncate text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900 leading-tight">{title}</h1>
      {titleAside}
    </div>
    <div className="mt-0.5 min-w-0 truncate text-xs sm:text-sm text-slate-500">{subtitle}</div>
  </div>
);
