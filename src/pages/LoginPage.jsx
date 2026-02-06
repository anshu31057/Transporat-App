import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      await login(formData.email, formData.password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Transport Entry System</p>
        <h1 className="mt-2 text-pageTitle">Sign in</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              required
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-blue-600 text-lg font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
