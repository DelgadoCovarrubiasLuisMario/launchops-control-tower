type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`lo-mono inline-flex items-center rounded-none border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] ${className}`}>
      {children}
    </span>
  );
}
