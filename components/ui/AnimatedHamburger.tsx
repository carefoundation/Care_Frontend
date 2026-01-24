'use client';

import { clsx } from 'clsx';

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  variant?: 'light' | 'dark' | 'green';
}

export default function AnimatedHamburger({ 
  isOpen, 
  onClick, 
  className,
  variant = 'light'
}: AnimatedHamburgerProps) {
  const lineColor = variant === 'dark' ? 'bg-white' : variant === 'green' ? 'bg-[#10b981]' : 'bg-gray-700';
  const activeColor = 'bg-[#10b981]';
  
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-10 h-10 flex items-center justify-center focus:outline-none group',
        className
      )}
      aria-label="Toggle menu"
      suppressHydrationWarning
    >
      <div className="relative w-6 h-5">
        {/* Top line */}
        <span
          className={clsx(
            'absolute top-0 left-0 w-full h-0.5 transition-all duration-300 ease-in-out rounded-full',
            isOpen 
              ? `${activeColor} rotate-45 top-2` 
              : `${lineColor} group-hover:bg-[#10b981]`
          )}
        />
        {/* Middle line */}
        <span
          className={clsx(
            'absolute top-2 left-0 w-full h-0.5 transition-all duration-300 ease-in-out rounded-full',
            isOpen 
              ? 'opacity-0 scale-0' 
              : `opacity-100 ${lineColor} group-hover:bg-[#10b981]`
          )}
        />
        {/* Bottom line */}
        <span
          className={clsx(
            'absolute top-4 left-0 w-full h-0.5 transition-all duration-300 ease-in-out rounded-full',
            isOpen 
              ? `${activeColor} -rotate-45 top-2` 
              : `${lineColor} group-hover:bg-[#10b981]`
          )}
        />
      </div>
    </button>
  );
}

