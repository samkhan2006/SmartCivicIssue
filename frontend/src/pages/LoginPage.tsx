import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, User, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('citizen@demo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      onLoginSuccess();
    } else {
      setError('Invalid credentials.');
    }
  };

  const handleQuickLogin = (role: 'citizen' | 'admin') => {
    if (role === 'citizen') {
      setEmail('citizen@demo.com');
      setPassword('123456');
      login('citizen@demo.com', '123456');
    } else {
      setEmail('admin@demo.com');
      setPassword('admin123');
      login('admin@demo.com', 'admin123');
    }
    onLoginSuccess();
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-in fade-in duration-300 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25">
          <Landmark className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign in to SmartCivic</h1>
        <p className="text-xs text-slate-500">
          Chhatrapati Sambhajinagar Civic Grievance & GIS Telemetry System
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Quick Demo Access Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen')}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Login as Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">Or enter manually</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div><strong>Demo Citizen:</strong> citizen@demo.com / 123456</div>
          <div><strong>Demo Admin:</strong> admin@demo.com / admin123</div>
        </div>
      </div>
    </div>
  );
};
