type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

const variants = {
  primary: 'border border-[var(--lo-ink)] bg-[var(--lo-ink)] text-[var(--lo-panel-2)] hover:bg-[#2a3140]',
  ghost: 'border border-[var(--lo-line)] bg-[var(--lo-panel-2)] text-[var(--lo-ink)] hover:border-[var(--lo-ink)]',
  danger: 'border border-[var(--lo-danger)] bg-[var(--lo-danger)] text-white hover:brightness-95'
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`lo-mono inline-flex items-center justify-center gap-2 rounded-none px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
