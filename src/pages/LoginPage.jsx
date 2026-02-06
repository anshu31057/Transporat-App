import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(formData.username, formData.password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <svg
              viewBox="0 0 64 64"
              aria-hidden="true"
              className="h-10 w-10 text-emerald-700"
            >
              <rect x="6" y="22" width="30" height="18" rx="4" fill="currentColor" />
              <rect x="36" y="28" width="18" height="12" rx="3" fill="currentColor" />
              <rect x="42" y="22" width="12" height="8" rx="2" fill="currentColor" />
              <circle cx="18" cy="44" r="5" fill="currentColor" />
              <circle cx="46" cy="44" r="5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Transport Entry System</h1>
          <p className="mt-1 text-base font-semibold text-emerald-700">Secure business access</p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">Username</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={onChange}
              className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base"
              required
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-emerald-700 text-lg font-semibold text-white"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
