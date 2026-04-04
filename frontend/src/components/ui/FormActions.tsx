import type { ReactNode } from 'react';

export const FormActions = ({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element => <div className="form-actions">{children}</div>;
