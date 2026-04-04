export const ErrorBanner = ({
  message,
}: {
  readonly message: string | null;
}): JSX.Element | null =>
  message === null ? null : (
    <div className="error-banner" role="alert">
      {message}
    </div>
  );
