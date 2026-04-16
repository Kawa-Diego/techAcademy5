import type { SelectHTMLAttributes } from 'react';

type Option = {
  readonly value: string;
  readonly label: string;
};

type Props = {
  readonly label: string;
  readonly options: readonly Option[];
  readonly error?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = ({
  label,
  options,
  error,
  id,
  className = '',
  ...rest
}: Props): React.ReactElement => {
  const selectId = id ?? rest.name ?? label;
  const errId = `${selectId}-error`;
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} aria-invalid={Boolean(error)} aria-describedby={error ? errId : undefined} {...rest}>
        <option value="">Selecione…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
