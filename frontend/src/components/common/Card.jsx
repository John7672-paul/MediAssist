import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle ${
        hoverEffect ? 'hover:shadow-card hover:border-slate-300 transition-all duration-200' : ''
      } ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-slate-100 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs sm:text-sm text-slate-500 mt-1 ${className}`}>
    {children}
  </p>
);
