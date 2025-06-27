import React, { useState } from 'react';
import { ChevronUp, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeonCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  showExpandButton?: boolean;
  footer?: React.ReactNode;
}

export function NeonCard({ 
  title, 
  children, 
  className, 
  defaultExpanded = false,
  showExpandButton = true,
  footer 
}: NeonCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn(
      "relative bg-slate-900/90 rounded-xl transition-all duration-300 group",
      "border-2 border-transparent",
      // Gradiente de borde neón
      "before:absolute before:inset-0 before:rounded-xl before:p-[2px]",
      "before:bg-gradient-to-r before:from-fuchsia-500 before:via-purple-500 before:via-blue-500 before:to-cyan-400",
      "before:content-[''] before:-z-10",
      "after:absolute after:inset-[2px] after:rounded-[10px] after:bg-slate-900/95 after:content-[''] after:-z-10",
      // Efecto hover
      "hover:before:shadow-lg hover:before:shadow-fuchsia-500/25",
      "hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20",
      className
    )}>
      {/* Orbes decorativas cuando está expandida */}
      {isExpanded && (
        <>
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-cyan-400/60 blur-sm animate-pulse" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-fuchsia-500/60 blur-sm animate-pulse" />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
            {title}
          </h3>
        </div>
        
        {showExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-slate-800/50 transition-colors"
          >
            <ChevronUp 
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Body - Animación de despliegue */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4">
          <div className="text-slate-300 text-sm leading-relaxed">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 pb-4">
            <div className="flex justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Botones para el footer
export function NeonButton({ 
  children, 
  variant = 'primary', 
  onClick,
  className 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:scale-105 hover:shadow-lg",
        variant === 'primary' 
          ? "bg-blue-600 text-white hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400" 
          : "bg-slate-700 text-slate-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500",
        className
      )}
    >
      {children}
    </button>
  );
}