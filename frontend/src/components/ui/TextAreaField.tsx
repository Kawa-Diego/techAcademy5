import type { TextareaHTMLAttributes } from 'react';

type Props = {
  readonly label: string;
  readonly error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = ({
  label,
  error,
  id,
  className = '',
  ...rest
}: Props): React.ReactElement => {
  const tid = id ?? rest.name ?? label;
  const errId = `${tid}-error`;
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={tid}>{label}</label>
      <textarea id={tid} aria-invalid={Boolean(error)} aria-describedby={error ? errId : undefined} {...rest} />
      {error ? (
        <p id={errId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
