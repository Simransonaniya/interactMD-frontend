import React, { useState } from 'react';
import { X, Lock, Mail, User, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Please enter both your first and last name');
        }
        await register(firstName, lastName, email, password);
      }
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'An error occurred during authentication');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-[#102528] text-[#F7F4EE] border border-[#39605B]/40 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#39605B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F2D7B8]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#F7F4EE]/60 hover:text-[#F7F4EE] hover:bg-[#14302F] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#14302F] border border-[#39605B]/50 flex items-center justify-center text-[#F2D7B8]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#F7F4EE]">
              {mode === 'login' ? 'Welcome Back' : 'Create Learner Account'}
            </h2>
            <p className="text-xs text-[#F7F4EE]/60">
              {mode === 'login' ? 'Sign in to access your clinical simulation sessions' : 'Join InteractMD to practice patient encounters'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#14302F] p-1 rounded-2xl border border-[#39605B]/40 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[#F2D7B8] text-[#1A2928] shadow-xs' : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[#F2D7B8] text-[#1A2928] shadow-xs' : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#F7F4EE]/80 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F7F4EE]/40" />
                  <input
                    type="text"
                    required
                    placeholder="Simran"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#14302F] border border-[#39605B]/50 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F7F4EE]/80 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Kaur"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#14302F] border border-[#39605B]/50 rounded-2xl px-3.5 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#F7F4EE]/80 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F7F4EE]/40" />
              <input
                type="email"
                required
                placeholder="learner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#14302F] border border-[#39605B]/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F7F4EE]/80 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F7F4EE]/40" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#14302F] border border-[#39605B]/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 px-4 rounded-2xl bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
