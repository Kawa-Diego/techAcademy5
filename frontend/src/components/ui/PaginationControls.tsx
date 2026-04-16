import { Button } from './Button';

type Props = {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (next: number) => void;
};

export const PaginationControls = ({
  page,
  totalPages,
  onPageChange,
}: Props): JSX.Element => (
    <div className="pagination">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="pagination-meta">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
