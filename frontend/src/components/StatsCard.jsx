import { QrCode, BarChart3, Link as LinkIcon } from 'lucide-react';

export function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-2 sm:p-3">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
