import { LucideIcon } from 'lucide-react';
import { NeonCard } from '@/components/ui/neon-card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <NeonCard 
      title={title}
      showExpandButton={false}
      className="min-h-[120px]"
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-6 h-6 text-cyan-400" />
            <span className="text-2xl font-bold text-white">{value}</span>
          </div>
          
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </NeonCard>
  );
}