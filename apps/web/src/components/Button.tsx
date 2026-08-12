type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

const variants = {
  primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  ghost: 'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800',
  danger: 'bg-rose-500 text-white hover:bg-rose-400'
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
