import './Spinner.scss';

interface SpinnerProps {
  /** Light track for placement on a dark surface (e.g. the print overlay scrim). */
  onDark?: boolean;
}

export const Spinner = ({ onDark }: SpinnerProps) => (
  <div className={onDark ? 'spinner spinner--on-dark' : 'spinner'} />
);
