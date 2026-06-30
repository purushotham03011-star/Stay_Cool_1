import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Smartphone, 
  User, 
  CheckCircle, 
  Key, 
  ArrowRight,
  Info,
  ChevronLeft,
  Sparkles,
  LockKeyhole
} from 'lucide-react';
import { getLocalStorageData } from '../mockData';


interface AuthWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; phone: string; password?: string }, isRegister?: boolean) => void;
  onAddAuditLog?: (action: string, module: 'Bookings' | 'Tenants') => void;
  initialView?: 'login' | 'register';
  isInline?: boolean;
}

export default function AuthWizard({ isOpen, onClose, onLoginSuccess, onAddAuditLog, initialView = 'login', isInline = false }: AuthWizardProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'otp'>(initialView);
  const [authIntent, setAuthIntent] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isOpen && initialView) {
      setView(initialView);
    }
  }, [isOpen, initialView]);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Error and Notification helpers
  const [errorText, setErrorText] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [generatedOtp, setGeneratedOtp] = useState('1234');

  // Background countdown for OTP demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'otp' && otpTimer > 0 && !successAnimation) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, otpTimer, successAnimation]);

  if (!isOpen && !isInline) return null;

  const resetFormState = () => {
    setErrorText('');
    setSuccessAnimation(false);
  };

  const handleGotoRegister = () => {
    resetFormState();
    setView('register');
  };

  const handleGotoLogin = () => {
    resetFormState();
    setView('login');
  };

  const handleGotoForgot = () => {
    resetFormState();
    setView('forgot');
  };

  const handleTriggerOtp = (targetEmail: string, targetName?: string, actionType?: string) => {
    resetFormState();
    const demoOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(demoOtp);
    setOtpTimer(60);
    setView('otp');
    if (onAddAuditLog) {
      onAddAuditLog(`OTP code ${demoOtp} sent to ${targetEmail} for ${actionType || 'Auth simulation'}`, 'Bookings');
    }
  };

  // Submit methods
  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    
    if (!email || !password) {
      setErrorText('Please enter your email and secure passcode.');
      return;
    }

    if (password.length < 4) {
      setErrorText('Passcode must be at least 4 digits/characters.');
      return;
    }

    const currentTenants = getLocalStorageData<any[]>('tenants', []);
    const matchedTenant = currentTenants.find(t => t.email?.toLowerCase() === email.toLowerCase());

    if (!matchedTenant) {
      setErrorText('Account not found. Please register first.');
      return;
    }

    const expectedPassword = matchedTenant.password || 'customer123';
    if (password !== expectedPassword) {
      setErrorText('Invalid password PIN.');
      return;
    }

    setAuthIntent('login');
    // Auto trigger verification OTP to show off complete Auth cycle
    handleTriggerOtp(email, matchedTenant.name || 'Guest user', 'Signing In');
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!name || !email || !phone || !password) {
      setErrorText('All registration fields are mandatory.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorText('Secure passcodes do not match.');
      return;
    }

    setAuthIntent('register');
    handleTriggerOtp(email, name, 'Registration New Account');
  };

  const submitForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorText('Specify an active registered email.');
      return;
    }
    handleTriggerOtp(email, 'User Recovery', 'Forgot Password Code');
  };

  const submitVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    // Accepting 1234 as universal demo fallback or the random code
    if (otpCode !== generatedOtp && otpCode !== '1234') {
      setErrorText('Incorrect verification code. Hint: Use ' + generatedOtp + ' or demo default 1234.');
      return;
    }

    setSuccessAnimation(true);
    
    // Simulate server response and logging
    setTimeout(() => {
      const finalName = name || 'Aarav Mehta';
      const finalPhone = phone || '+91 95555 12345';
      const finalEmail = email || 'aarav.mehta@example.com';
      
      onLoginSuccess({
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        password: password || 'customer123'
      }, authIntent === 'register');

      if (onAddAuditLog) {
        onAddAuditLog(`Customer ${finalName} successfully validated simulated OTP and signed in`, 'Bookings');
      }

      onClose();
      // Reset views
      setView('login');
      resetFormState();
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
    }, 1500);
  };

  const content = (
    <div id="auth-wizard-sheet" className={`no-uiverse bg-white rounded-2xl w-full max-w-[340px] p-5 space-y-4 text-slate-800 flex flex-col justify-between ${isInline ? 'shadow-lg border border-slate-200/60' : 'animate-scale-up shadow-2xl border border-slate-100'}`}>
      
      {/* Header toolbar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        {view !== 'login' && !successAnimation ? (
          <button 
            type="button"
            onClick={handleGotoLogin}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 text-[10px] font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Login Screen</span>
          </button>
        ) : (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <LockKeyhole className="w-3 h-3 text-indigo-500" /> Secure Member Verification
          </span>
        )}
        
        {!successAnimation && onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

        {/* Dynamic State Layouts */}
        {successAnimation ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-950">Identity Approved!</h4>
              <p className="text-[10px] text-slate-500 mt-1">Bootstrapping local custom secure cookie session state...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* VIEW: LOGIN */}
            {view === 'login' && (
              <form onSubmit={submitLogin} className="space-y-3.5 text-xs">
                <div className="text-center">
                  <h3 className="text-sm font-bold text-slate-950 tracking-tight font-display">Welcome Back to StayHub</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Access stays, complete digital KYC, and scan payments.</p>
                </div>

                {errorText && (
                  <div className="p-2 border border-rose-100 bg-rose-50 rounded-lg text-[9px] font-medium text-rose-700">
                    {errorText}
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password or Secure Pin"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={handleGotoForgot}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot passcode/PIN Pin?
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm active:scale-98"
                  >
                    Request Secure Verification OTP
                  </button>
                  
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">Don't have an active stay? </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        onLoginSuccess({ name: '', email: '', phone: '' }, true);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      Create Profile
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* VIEW: REGISTER */}
            {view === 'register' && (
              <form onSubmit={submitRegister} className="space-y-3.5 text-xs">
                <div className="text-center">
                  <h3 className="text-sm font-bold text-slate-950 tracking-tight font-display">Create Account Profile</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Register to find PGs, hotels, and track invoices</p>
                </div>

                {errorText && (
                  <div className="p-2 border border-rose-100 bg-rose-50 rounded-lg text-[9px] font-medium text-rose-700">
                    {errorText}
                  </div>
                )}

                <div className="space-y-2.5 scroll-y max-h-[180px] pr-1 overflow-y-auto">
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name (E.g. Aarav Mehta)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Smartphone className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Phone (+91 9XXXX XXXXX)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Secure Passcode PIN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Secure Passcode PIN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm active:scale-98"
                  >
                    Send Account Activation OTP
                  </button>
                  
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">Already have password credentials? </span>
                    <button 
                      type="button" 
                      onClick={handleGotoLogin}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      Sign In Now
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* VIEW: FORGOT PASSWORD */}
            {view === 'forgot' && (
              <form onSubmit={submitForgot} className="space-y-4 text-xs">
                <div className="text-center">
                  <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wide">Recover Password / PIN</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Provide stay registered email to get a password reset security token.</p>
                </div>

                {errorText && (
                  <div className="p-2 border border-rose-100 bg-rose-50 rounded-lg text-[9px] font-medium text-rose-700">
                    {errorText}
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Registered email Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition"
                >
                  Send OTP Verification Code
                </button>
              </form>
            )}

            {/* VIEW: OTP VERIFICATION */}
            {view === 'otp' && (
              <form onSubmit={submitVerifyOtp} className="space-y-4 text-xs">
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-extrabold text-slate-950 uppercase">Verify Simulated OTP</h3>
                  <p className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100/50 inline-block font-medium animate-pulse">
                     Simulated SMS/Email code sent: <strong>{generatedOtp}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">Enter code to complete authorization and log in.</p>
                </div>

                {errorText && (
                  <div className="p-2 border border-rose-100 bg-rose-50 rounded-lg text-[9px] font-medium text-rose-700">
                    {errorText}
                  </div>
                )}

                <div className="space-y-1 text-center">
                  <div className="relative w-36 mx-auto">
                    <Key className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))}
                      placeholder="Demo: 1234"
                      className="w-full tracking-[1.2rem] bg-slate-50 font-bold text-center border border-slate-200 rounded-xl py-2 pl-8 pr-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none text-slate-950 font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-center mt-3">
                    <button 
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="text-[9px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 border border-slate-200 px-2 py-1 rounded-md transition font-medium"
                    >
                      Autofill Generated ({generatedOtp})
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 text-center">
                  <span>Didn't receive passcode?</span>
                  {otpTimer > 0 ? (
                    <span className="font-semibold text-slate-600">Resend in {otpTimer}s</span>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
                        setGeneratedOtp(newOtp);
                        setOtpTimer(45);
                      }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Approve Credentials & Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Static secure context note */}
            <div className="flex items-start space-x-1 px-1 text-[8.5px] text-slate-400 leading-normal border-t border-slate-100/60 pt-2 bg-slate-50/20 rounded-md">
              <Info className="w-3 h-3 shrink-0 text-slate-300 mt-0.5" />
              <span>StayHub encrypts all local mock storage variables inside active containers under corporate policy sandboxing.</span>
            </div>

          </div>
        )}

      </div>
    );

    if (isInline) {
      return content;
    }

    return (
      <div id="auth-wizard-backdrop" className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
}
