import React from "react";

interface KeyCapProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  icon?: any;
  label: string;
  wide?: boolean;
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function KeyCap({
  href,
  onClick,
  icon: Icon,
  label,
  wide = false,
  external = false,
  className = "",
  style,
  ...props
}: KeyCapProps) {
  const commonClassName = `key-cap key-cap-hover group flex h-10 items-center justify-center gap-2 transition-all ${
    wide ? "px-4" : "w-10"
  } ${className}`;

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        aria-label={label}
        className={commonClassName}
        style={style}
        {...(props as any)}
      >
        {Icon && (
          <Icon 
            className="h-3.5 w-3.5 transition-transform group-hover:scale-90 shrink-0" 
            strokeWidth={1.5} 
          />
        )}
        {wide && (
          <span className="font-mono text-[12px] uppercase tracking-widest font-semibold italic">
            {label}
          </span>
        )}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={commonClassName}
      style={style}
      {...(props as any)}
    >
      {Icon && (
        <Icon 
          className="h-3.5 w-3.5 transition-transform group-hover:scale-90 shrink-0" 
          strokeWidth={1.5} 
        />
      )}
      {wide && (
        <span className="font-mono text-[12px] uppercase tracking-widest font-semibold italic">
          {label}
        </span>
      )}
    </button>
  );
}
