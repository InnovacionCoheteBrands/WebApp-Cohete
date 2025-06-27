
import React, { useState } from 'react';
import { ChevronUp, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomCardProps {
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onToggle?: (expanded: boolean) => void;
}

export function CustomCard({
  title = "CUSTOM CARD",
  children,
  footer,
  defaultExpanded = false,
  className,
  icon,
  onToggle
}: CustomCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden transition-all duration-500 group",
      "bg-slate-900/95 backdrop-blur-sm",
      // Neon glow border effect
      "before:absolute before:inset-0 before:rounded-xl before:p-[2px]",
      "before:bg-gradient-to-r before:from-fuchsia-500 before:via-purple-500 before:via-blue-500 before:to-cyan-400",
      "before:opacity-60 before:blur-sm before:transition-all before:duration-300",
      "hover:before:opacity-100 hover:before:blur-md hover:before:scale-105",
      "after:absolute after:inset-[2px] after:rounded-[10px] after:bg-slate-900/95",
      className
    )}>
      {/* Decorative orbs when expanded */}
      {isExpanded && (
        <>
          {/* Cyan orb - top left */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-cyan-400/30 rounded-full blur-lg animate-pulse z-10" />
          <div className="absolute top-6 left-6 w-4 h-4 bg-cyan-400/50 rounded-full blur-md z-10" />
          
          {/* Magenta orb - bottom right */}
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-fuchsia-500/30 rounded-full blur-lg animate-pulse z-10" />
          <div className="absolute bottom-6 right-6 w-4 h-4 bg-fuchsia-500/50 rounded-full blur-md z-10" />
        </>
      )}

      {/* Card content */}
      <div className="relative z-20">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors duration-200"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3">
            {icon || <Grid3X3 className="w-5 h-5 text-cyan-400" />}
            <h3 className="text-white font-semibold tracking-wide">{title}</h3>
          </div>
          <ChevronUp 
            className={cn(
              "w-5 h-5 text-gray-400 transition-all duration-300",
              "hover:text-cyan-400",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </div>

        {/* Body - with smooth animation */}
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          {children && (
            <div className="px-4 pb-4">
              <div className="text-gray-300 leading-relaxed">
                {children}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="px-4 pb-4 flex justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default footer buttons component
export function CustomCardFooter() {
  return (
    <>
      <button className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
        "bg-gray-700 text-gray-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400",
        "hover:text-white hover:shadow-lg hover:shadow-fuchsia-500/25"
      )}>
        Cancel
      </button>
      <button className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
        "bg-blue-600 text-white hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400",
        "hover:shadow-lg hover:shadow-cyan-400/25"
      )}>
        OK
      </button>
    </>
  );
}
