type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <section className={`glass-panel rounded-3xl p-5 ${className}`}>{children}</section>;
}
