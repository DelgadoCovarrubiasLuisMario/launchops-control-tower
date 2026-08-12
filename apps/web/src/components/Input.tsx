type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-[var(--lo-ink)]">
      <span className="lo-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">{label}</span>
      <input
        {...props}
        className={`rounded-none border border-[var(--lo-line)] bg-[var(--lo-panel-2)] px-3 py-2.5 text-[var(--lo-ink)] outline-none transition placeholder:text-[var(--lo-muted)] focus:border-[var(--lo-ink)] ${className}`}
      />
    </label>
  );
}
