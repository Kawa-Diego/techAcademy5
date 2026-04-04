import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'danger';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass = (variant: Props['variant']): string => {
  if (variant === 'secondary') return 'btn btn-secondary';
  if (variant === 'danger') return 'btn btn-danger';
  return 'btn btn-primary';
};

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: Props): JSX.Element => {
  const cls = `${variantClass(variant)} ${className}`.trim();
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
};
