import { NavLink } from 'react-router-dom';
import { navigationItems } from '../utils/constants';

const getLinkClass = ({ isActive }) =>
  [
    'flex min-h-12 flex-col items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
  ].join(' ');

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-3 sm:static sm:border-t-0 sm:bg-transparent sm:p-0">
      <div className="mx-auto grid max-w-4xl grid-cols-4 gap-2 px-1 sm:mt-6 sm:px-6">
        {navigationItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClass}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
