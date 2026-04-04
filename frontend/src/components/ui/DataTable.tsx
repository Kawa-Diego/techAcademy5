import type { ReactNode } from 'react';

export type TableColumn<Row> = {
  readonly header: string;
  readonly render: (row: Row) => ReactNode;
};

type Props<Row> = {
  readonly columns: readonly TableColumn<Row>[];
  readonly rows: readonly Row[];
  readonly emptyText?: string;
};

export const DataTable = <Row,>({
  columns,
  rows,
  emptyText = 'Nenhum registro',
}: Props<Row>): JSX.Element => {
  if (rows.length === 0) {
    return (
      <div className="table-wrap">
        <p className="muted py-10 text-center">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c.header}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
