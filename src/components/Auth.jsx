import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, saveUserRole, saveProfile } = useAuth();
  const [error, setError] = useState('');

  const handleAuth = async (e, isSignUpFlow) => {
    e.preventDefault();
    setError('');
    const form = e.target.closest('form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');

    try {
      let data;
      if (isSignUpFlow) {
        data = await signUpWithEmail(email, password);
      } else {
        data = await signInWithEmail(email, password);
      }

      const user = data?.user;
      if (user) {
        await saveProfile(user.id, user.email);
        await saveUserRole(user.id, user.role);

        if (user.role === 'admin') navigate('/manager');
        else if (user.role === 'employee') navigate('/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-black selection:text-white">
      {/* Background & Video Overlay */}
      <div className="fixed inset-0 -z-20 w-full h-full bg-white">
        <video autoPlay className="w-full h-full object-cover [transform:scaleY(-1)]" loop muted playsInline>
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 26.416%, white 66.943%)' }}></div>
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 h-24">
        <Link to="/" className="text-xl font-bold tracking-[-0.04em]" style={{ fontFamily: "'Geist Sans', sans-serif" }}>Gradient</Link>
        <div className="hidden md:flex gap-10 items-center">
          <a className="geist-medium text-sm text-[#121212] hover:opacity-60 transition-opacity" href="#">Features</a>
          <a className="geist-medium text-sm text-[#121212] hover:opacity-60 transition-opacity" href="#">Solutions</a>
          <a className="geist-medium text-sm text-[#121212] hover:opacity-60 transition-opacity" href="#">Pricing</a>
        </div>
        <div className="flex items-center gap-6">
          <button className="geist-medium text-sm">Sign In</button>
          <Link to="/auth" className="geist-medium text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-colors">Get Started</Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-[480px] w-full animate-stagger">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-medium tracking-[-0.04em] leading-[1.1] mb-6" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
              Simple <span className="font-serif italic font-normal px-1">management</span> for your team
            </h1>
            <p className="text-[18px] opacity-80 text-[#373a46] geist-medium max-w-sm mx-auto">
              Access your dashboard and stay in flow with your team's velocity.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-10 editorial-shadow">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center">{error}</div>
            )}
            <form className="space-y-8">
              <div className="relative group">
                <label className="block geist-medium text-[10px] uppercase tracking-widest text-[#373a46]/60 mb-2">Work Email</label>
                <input name="email" className="w-full bg-transparent border-0 border-b border-black/10 py-3 text-lg focus:ring-0 focus:border-black transition-all placeholder:text-zinc-300" style={{ fontFamily: "'Geist Sans', sans-serif", fontWeight: 500 }} placeholder="name@company.com" type="email" required />
              </div>
              <div className="relative group">
                <label className="block geist-medium text-[10px] uppercase tracking-widest text-[#373a46]/60 mb-2">Security Key</label>
                <input name="password" className="w-full bg-transparent border-0 border-b border-black/10 py-3 text-lg focus:ring-0 focus:border-black transition-all placeholder:text-zinc-300" style={{ fontFamily: "'Geist Sans', sans-serif", fontWeight: 500 }} placeholder="••••••••" type="password" required />
              </div>
              <div className="space-y-4">
                <label className="block geist-medium text-[10px] uppercase tracking-widest text-[#373a46]/60">Access Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Admin', value: 'admin' }, { label: 'Manager', value: 'manager' }, { label: 'Employee', value: 'employee' }].map((role) => (
                    <label key={role.value} className="cursor-pointer">
                      <input className="hidden peer" name="role" type="radio" value={role.value} defaultChecked={role.value === 'admin'} />
                      <div className="text-center py-3 rounded-xl border border-zinc-100 text-[13px] geist-medium text-zinc-500 bg-white/50 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition-all duration-300">{role.label}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <div className="flex gap-4">
                  <button className="w-1/2 bg-gradient-to-br from-zinc-800 to-black text-white font-bold py-5 rounded-2xl btn-editorial-shadow hover:opacity-90 transition-all duration-300 transform active:scale-[0.99] uppercase text-[10px] tracking-widest" onClick={(e) => handleAuth(e, false)}>
                    Log In
                  </button>
                  <button className="w-1/2 bg-white text-zinc-800 border border-zinc-200 shadow-sm font-bold py-5 rounded-2xl hover:bg-zinc-50 transition-all duration-300 transform active:scale-[0.99] uppercase text-[10px] tracking-widest" onClick={(e) => handleAuth(e, true)}>
                    Sign Up
                  </button>
                </div>
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-grow h-px bg-black/5"></div>
                  <span className="text-[10px] geist-medium uppercase tracking-[0.2em] text-[#373a46]/40 whitespace-nowrap">or continue with</span>
                  <div className="flex-grow h-px bg-black/5"></div>
                </div>
                <button onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-3 bg-white/60 backdrop-blur-md border border-white/80 py-4 rounded-2xl hover:bg-white transition-all duration-300 group" type="button">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-[11px] geist-medium uppercase tracking-widest text-[#373a46]">Sign in with Google</span>
                </button>
                <div className="flex justify-center mt-6 text-[11px] geist-medium uppercase tracking-widest">
                  <a className="text-[#373a46]/40 hover:text-black transition-colors" href="#">Forgot Access?</a>
                </div>
              </div>
            </form>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-white/50 border border-white py-4 rounded-2xl hover:bg-white transition-all group">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}>terminal</span>
              <span className="text-[10px] geist-medium uppercase tracking-widest">SSO Gateway</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/50 border border-white py-4 rounded-2xl hover:bg-white transition-all group">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}>passkey</span>
              <span className="text-[10px] geist-medium uppercase tracking-widest">Passkey</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-12 px-8 md:px-16 border-t border-zinc-100 bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="font-bold text-black text-lg tracking-[-0.04em]" style={{ fontFamily: "'Geist Sans', sans-serif" }}>Gradient</span>
            <p className="text-[10px] geist-medium text-zinc-400 mt-1 uppercase tracking-widest">© 2024 Kinetic Systems</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            {['Privacy Policy', 'Terms of Service', 'Security', 'Status'].map((link) => (
              <a key={link} className="geist-medium text-[11px] tracking-widest uppercase text-zinc-400 hover:text-black transition-colors" href="#">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
