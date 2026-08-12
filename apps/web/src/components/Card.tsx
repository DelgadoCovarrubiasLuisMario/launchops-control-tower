type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <section className={`lo-panel rounded-none p-4 ${className}`}>{children}</section>;
}
