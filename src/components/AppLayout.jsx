import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';

const AppLayout = () => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-white shadow-sm">
      <Header />
      <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-6">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
