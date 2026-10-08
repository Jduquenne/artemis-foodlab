import { ReactNode } from "react";

export interface DataListProps {
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

export const DataList = ({ isEmpty, emptyMessage, children }: DataListProps) =>
  isEmpty ? (
    <div className="flex-1 flex items-center justify-center p-6">
      <p className="text-sm text-slate-400">{emptyMessage}</p>
    </div>
  ) : (
    <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">{children}</div>
  );
