import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DangNhap() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(t('invalid_login'));
      setLoading(false);
    } else {
      navigate('/ban-do-tong-quan');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Left side - Cover Image */}
      <div className="hidden md:flex md:w-1/2 relative bg-gray-900 overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Smart Biosecurity Farm" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {t('login_title')}<br/><span className="text-blue-400">{t('login_subtitle')}</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-md">
            {t('login_tagline')}
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 relative dark:text-gray-100">
        <div className="max-w-md w-full">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please enter your credentials to access the system.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                required
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded" />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 font-medium">{t('remember_me')}</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md disabled:opacity-50 mt-4"
            >
              {loading ? t('logging_in') : t('login_btn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
