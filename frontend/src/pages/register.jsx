import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Common
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Patient only
    dob: '',
    gender: '',
    address: '',
    // Doctor only
    specialty: '',
    license_no: '',
  });

  const specialties = [
    'General Practice',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Psychiatry',
    'Oncology',
    'Radiology',
    'Emergency Medicine',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!form.first_name || !form.last_name) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!form.password || form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.phone) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (role === 'patient') {
      if (!form.dob) { toast.error('Please enter your date of birth'); return false; }
      if (!form.gender) { toast.error('Please select your gender'); return false; }
    }
    if (role === 'doctor') {
      if (!form.specialty) { toast.error('Please select your specialty'); return false; }
      if (!form.license_no) { toast.error('Please enter your license number'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created successfully! Welcome to SmartCare.');
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (err) {
      toast.error(err.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden py-10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700/5 to-gray-900/10"></div>
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full border border-teal-500/20"></div>
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full border border-teal-500/20"></div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-[480px] relative z-10 shadow-xl mx-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 9h-4V5a2 2 0 00-4 0v4H7a2 2 0 000 4h4v4a2 2 0 004 0v-4h4a2 2 0 000-4z" />
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold text-gray-900">SmartCare</span>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-400 mb-6">Join SmartCare as a patient or doctor</p>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['patient', 'doctor'].map((r) => (
            <div
              key={r}
              onClick={() => { setRole(r); setStep(1); }}
              className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                role === r ? 'border-gray-900 bg-gray-900' : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                role === r ? 'bg-white/15' : 'bg-gray-100'
              }`}>
                {r === 'patient' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role === r ? 'white' : 'currentColor'} strokeWidth="2">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role === r ? 'white' : 'currentColor'} strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="3" /><path d="M9 7h6M12 4v6M9 15h6" />
                  </svg>
                )}
              </div>
              <p className={`text-xs font-bold capitalize ${role === r ? 'text-white' : 'text-gray-600'}`}>{r}</p>
            </div>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{s}</div>
              <span className={`text-xs font-medium ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
                {s === 1 ? 'Account Info' : role === 'patient' ? 'Patient Details' : 'Doctor Details'}
              </span>
              {s < 2 && <div className={`h-px flex-1 ${step > s ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); } : handleSubmit}>

          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">First Name</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                    placeholder="Sarah" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Last Name</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                    placeholder="Murphy" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                  placeholder="Min. 8 characters" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                  placeholder="Re-enter password" required />
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors mt-2">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Role-specific Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                  placeholder="+353 87 123 4567" required />
              </div>

              {role === 'patient' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Date of Birth</label>
                      <input type="date" name="dob" value={form.dob} onChange={handleChange}
                        className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange}
                        className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm bg-white" required>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Address (Optional)</label>
                    <input name="address" value={form.address} onChange={handleChange}
                      className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                      placeholder="14 Oak Street, Dublin 4" />
                  </div>
                </>
              )}

              {role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Specialty</label>
                    <select name="specialty" value={form.specialty} onChange={handleChange}
                      className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm bg-white" required>
                      <option value="">Select specialty</option>
                      {specialties.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Medical License Number</label>
                    <input name="license_no" value={form.license_no} onChange={handleChange}
                      className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500 outline-none transition-colors text-sm"
                      placeholder="e.g. IMC-12345" required />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    ℹ️ Doctor accounts require admin approval before activation. You will receive an email once verified.
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:border-gray-400 transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;