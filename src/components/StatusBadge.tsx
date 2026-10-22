import React from 'react';
import { humanizeStatus } from '../utils/formatters';

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const normalized = status ? status.toUpperCase() : '';
  const readableText = humanizeStatus(status);

  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyles = 'bg-slate-400';

  if (normalized === 'IN_TRANSIT_TO') {
    badgeStyles = 'bg-blue-50 text-[#1E6BD6] border-blue-200';
    dotStyles = 'bg-[#1E6BD6]';
  } else if (normalized === 'STOPPED_AT') {
    badgeStyles = 'bg-emerald-50 text-[#16A34A] border-emerald-200';
    dotStyles = 'bg-[#16A34A]';
  } else if (normalized === 'INCOMING_AT') {
    badgeStyles = 'bg-amber-50 text-[#B45309] border-amber-200';
    dotStyles = 'bg-[#F5B400]';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors whitespace-nowrap shrink-0 ${sizeClasses} ${badgeStyles} ${className}`}
      title={`Status Armada: ${readableText}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles} ${
          normalized === 'IN_TRANSIT_TO' ? 'motion-safe:animate-pulse' : ''
        }`}
        aria-hidden="true"
      />
      <span>{readableText}</span>
    </span>
  );
};
