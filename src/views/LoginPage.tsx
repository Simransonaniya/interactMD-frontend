import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Hospital,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onExploreLibrary?: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onSuccess, 
  onExploreLibrary,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'LEARNER' | 'EDUCATOR' | 'ADMIN'>('LEARNER');
  
  // UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Authentication successful! Loading simulation portal...');
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          setErrorMsg('First and last name are required for clinical credentialing.');
          setIsSubmitting(false);
          return;
        }
        await register(firstName, lastName, email, password);
        setSuccessMsg('Account created successfully! Welcome to InteractMD.');
      }

      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#0B1A1C] text-[#F7F4EE] relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-[#39605B]/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 sm:w-[30rem] h-80 sm:h-[30rem] bg-[#F2D7B8]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Platform Showcase (Hidden on small screens or stacked) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F] border border-[#39605B]/60 text-[#F2D7B8] text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#F2D7B8]" />
            <span>Clinical AI Simulation Suite</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Master clinical reasoning with <span className="text-[#F2D7B8]">AI Patients</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#F7F4EE]/75 leading-relaxed">
            Practice realistic patient histories, order diagnostic investigations, perform physical examinations, and receive instant 5-dimension attending evaluations.
          </p>

          {/* Value Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 text-xs sm:text-sm text-[#F7F4EE]/90">
              <div className="w-6 h-6 rounded-lg bg-[#14302F] border border-[#39605B]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F2D7B8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F2D7B8]" />
              </div>
              <span>Real-time voice & text diagnostic interviews with dynamic vitals.</span>
            </div>

            <div className="flex items-start space-x-3 text-xs sm:text-sm text-[#F7F4EE]/90">
              <div className="w-6 h-6 rounded-lg bg-[#14302F] border border-[#39605B]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F2D7B8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F2D7B8]" />
              </div>
              <span>Automated scoring aligned with USMLE Step 2 CS / OSCE standards.</span>
            </div>

            <div className="flex items-start space-x-3 text-xs sm:text-sm text-[#F7F4EE]/90">
              <div className="w-6 h-6 rounded-lg bg-[#14302F] border border-[#39605B]/60 flex items-center justify-center shrink-0 mt-0.5 text-[#F2D7B8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F2D7B8]" />
              </div>
              <span>Comprehensive library spanning Cardiology, Neurology, Pediatrics & EM.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md bg-[#102528]/90 border border-[#39605B]/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            
            {/* Tab Switcher: Sign In vs Register */}
            <div className="flex p-1 bg-[#14302F] rounded-2xl mb-6 border border-[#39605B]/40">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#F2D7B8] text-[#1A2928] shadow-sm'
                    : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#F2D7B8] text-[#1A2928] shadow-sm'
                    : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* 1-Click Demo Role Logins */}
            {mode === 'login' && (
              <div className="mb-5 p-3 rounded-2xl bg-[#14302F]/60 border border-[#39605B]/40 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2D7B8] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#F2D7B8]" />
                  <span>1-Click Quick Demo Logins:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex.morgan@medschool.edu');
                      setPassword('password123');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#102528] hover:bg-[#1A3F3D] border border-[#39605B]/50 text-[#F7F4EE] text-[10.5px] font-semibold text-left transition-all cursor-pointer truncate"
                  >
                    🩺 Student Alex
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('sarah.chen@medschool.edu');
                      setPassword('password123');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#102528] hover:bg-[#1A3F3D] border border-[#39605B]/50 text-[#F7F4EE] text-[10.5px] font-semibold text-left transition-all cursor-pointer truncate"
                  >
                    👩‍⚕️ Faculty Sarah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@interactmd.com');
                      setPassword('adminpassword123');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#102528] hover:bg-[#1A3F3D] border border-[#39605B]/50 text-[#F7F4EE] text-[10.5px] font-semibold text-left transition-all cursor-pointer truncate"
                  >
                    ⚙️ Admin
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#F7F4EE]/80 mb-1">First Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#F7F4EE]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Alex"
                          className="w-full bg-[#14302F]/80 border border-[#39605B]/50 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F7F4EE]/80 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Morgan"
                        className="w-full bg-[#14302F]/80 border border-[#39605B]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Clinical Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#F7F4EE]/80 mb-1">Clinical Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('LEARNER')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                          role === 'LEARNER'
                            ? 'bg-[#F2D7B8] text-[#1A2928] border-[#F2D7B8] font-bold'
                            : 'bg-[#14302F] text-[#F7F4EE]/70 border-[#39605B]/50 hover:bg-[#1A3F3D]'
                        }`}
                      >
                        Student / Resident
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('EDUCATOR')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                          role === 'EDUCATOR'
                            ? 'bg-[#F2D7B8] text-[#1A2928] border-[#F2D7B8] font-bold'
                            : 'bg-[#14302F] text-[#F7F4EE]/70 border-[#39605B]/50 hover:bg-[#1A3F3D]'
                        }`}
                      >
                        Educator
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('ADMIN')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                          role === 'ADMIN'
                            ? 'bg-[#F2D7B8] text-[#1A2928] border-[#F2D7B8] font-bold'
                            : 'bg-[#14302F] text-[#F7F4EE]/70 border-[#39605B]/50 hover:bg-[#1A3F3D]'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#F7F4EE]/80 mb-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#F7F4EE]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full bg-[#14302F]/80 border border-[#39605B]/50 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#F7F4EE]/80">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setErrorMsg('Please contact your medical institution administrator or residency coordinator to reset your simulation credentials.')}
                      className="text-[11px] text-[#F2D7B8] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#F7F4EE]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#14302F]/80 border border-[#39605B]/50 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F7F4EE] placeholder-[#F7F4EE]/30 focus:outline-none focus:border-[#F2D7B8] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F7F4EE]/40 hover:text-[#F7F4EE] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] text-xs font-extrabold shadow-lg transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-[#1A2928]" />
                    <span>Verifying Clinical Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Access Simulation Portal' : 'Register & Start OSCE Cases'}</span>
                    <ArrowRight className="w-4 h-4 text-[#1A2928]" />
                  </>
                )}
              </button>

            </form>

            {/* Guest / Explore option */}
            {onExploreLibrary && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={onExploreLibrary}
                  className="text-xs text-[#F7F4EE]/60 hover:text-[#F2D7B8] transition-colors cursor-pointer"
                >
                  Continue as Guest Learner &rarr;
                </button>
              </div>
            )}

            {/* Footer Trust Tag */}
            <div className="mt-6 pt-4 border-t border-[#39605B]/30 flex items-center justify-center space-x-2 text-[10px] text-[#F7F4EE]/40">
              <Hospital className="w-3.5 h-3.5 text-[#F2D7B8]" />
              <span>HIPAA Compliant Simulated Educational Environment</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
