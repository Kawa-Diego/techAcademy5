import type { InputHTMLAttributes } from 'react';

type Props = {
  readonly label: string;
  readonly error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({
  label,
  error,
  id,
  className = '',
  ...rest
}: Props): JSX.Element => {
  const inputId = id ?? rest.name ?? label;
  const errId = `${inputId}-error`;
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? errId : undefined} {...rest} />
      {error ? (
        <p id={errId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
