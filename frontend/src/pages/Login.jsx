import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const roleHome = {
  patient: '/patient/dashboard',
  doctor:  '/doctor/dashboard',
  admin:   '/admin/dashboard',
};

const RoleIcon = ({ role, active }) => {
  const stroke = active ? 'white' : 'currentColor';
  if (role === 'patient')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    );
  if (role === 'doctor')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <path d="M9 7h6M12 4v6M9 15h6" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
    </svg>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login }  = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('patient');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // const [email, setEmail] = useState('sarah.murphy@gmail.com');
  // const [password, setPassword] = useState('SecurePass123!');
  // const [role, setRole] = useState('patient');
  // const [loading, setLoading] = useState(false);
  // const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password, role);

      // Special admin override (as per requirement)
      if (email === 'admin@smartcare.com' && password === 'admin123') {
        navigate('/admin/dashboard');
      } else {

        // Redirect based on role
        switch (response.user?.role || role) {
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/patient/dashboard');
        }
      }
    //   const dest = roleHome[response.user?.role || role] || '/login';
    //   navigate(dest, { replace: true });
    // } catch (err) {
    //   setError(err.error || 'Login failed. Please check your credentials.');
    // } finally {
    //   setLoading(false);
    // }
      
      setToast({ message: 'Login successful!', type: 'success' });
    } catch (err) {
      setToast({ message: err.error || 'Login failed. Please try again.', type: 'error'});
    } finally {
      setLoading(false);
    }
    };
  };

  // Pre-fill demo credentials (no real auto-login)
  const prefillDemo = (demoRole) => {
    setRole(demoRole);
    const creds = {
      patient: { email: 'sarah.murphy@gmail.com',   password: 'SecurePass123!' },
      doctor:  { email: 'dr.obrien@beaumont.ie',    password: 'DoctorPass123!' },
      admin:   { email: 'admin@smartcare.ie',        password: 'AdminPass123!' },
    };
    setEmail(creds[demoRole].email);
    setPassword(creds[demoRole].password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100
      relative overflow-hidden px-4">
      {/* Decorative circles */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px]
        rounded-full border border-teal-500/20 pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px]
        rounded-full border border-teal-500/20 pointer-events-none" />

      <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-[440px]
        relative z-10 shadow-xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-ink rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 9h-4V5a2 2 0 00-4 0v4H7a2 2 0 000 4h4v4a2 2 0 004 0v-4h4a2 2 0 000-4z" />
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold text-ink">SmartCare</span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-ink mb-1 leading-tight">
          Sign in to<br />your account
        </h1>
        <p className="text-sm text-gray-400 mb-7">Select your role and enter your credentials</p>

        {/* Role picker */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {['patient', 'doctor', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setError(''); }}
              className={`p-3 rounded-xl border-2 text-center transition-all
                ${role === r
                  ? 'border-ink bg-ink'
                  : 'border-gray-200 bg-white hover:border-gray-400'}`}
            >
              <div className={`w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center
                ${role === r ? 'bg-white/15' : 'bg-gray-100'}`}>
                <RoleIcon role={r} active={role === r} />
              </div>
              <p className={`text-xs font-bold capitalize ${role === r ? 'text-white' : 'text-gray-600'}`}>
                {r}
              </p>
            </button>
          ))}
        </div>

        {/* Azure note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5
          text-xs text-blue-700 flex gap-2 items-start mb-6 leading-relaxed">
          <svg width="14" height="14" className="flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0066cc" />
          </svg>
          <span><strong>Azure AD B2C Authentication</strong> — Secure role-based login.
            POST /auth/token · JWT tokens · 30d expiry</span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl
            text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-2.5 border-2 border-gray-200 rounded-lg
                focus:border-teal-500 outline-none transition-colors text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-2.5 border-2 border-gray-200 rounded-lg
                focus:border-teal-500 outline-none transition-colors text-sm"
            />
          </div>

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Sign In →
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-teal-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo prefill buttons */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-400 mb-2">Quick demo logins (pre-fills credentials):</p>
          <div className="flex gap-2">
            {['patient', 'doctor', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => prefillDemo(r)}
                className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-gray-50
                  text-xs font-semibold text-gray-600 hover:border-teal-500
                  hover:text-teal-600 hover:bg-teal-50 transition-all"
              >
                {r === 'patient' ? '👤' : r === 'doctor' ? '🩺' : '🛡'} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );

export default Login;
