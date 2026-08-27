import { Spinner } from '@/components/Spinner';
import './LoadingScreen.scss';

export const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <Spinner />
      <p>Loading...</p>
    </div>
  );
};
