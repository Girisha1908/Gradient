import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-[#f9f9f9] text-[#2d3435] font-body selection:bg-[#e0e1f1]">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-slate-800">Gradient</Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-sans text-sm font-medium tracking-tight text-slate-900 font-semibold border-b-2 border-slate-800 pb-1" href="#">Features</a>
            <a className="font-sans text-sm font-medium tracking-tight text-slate-500 hover:text-slate-800 transition-colors" href="#">Pricing</a>
            <a className="font-sans text-sm font-medium tracking-tight text-slate-500 hover:text-slate-800 transition-colors" href="#">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="font-sans text-sm font-medium tracking-tight text-slate-700 hover:opacity-80 transition-opacity">Sign In</Link>
            <Link to="/auth" className="bg-[#5b5e6b] text-[#f8f7ff] px-5 py-2 rounded-full font-sans text-sm font-medium tracking-tight hover:opacity-80 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center overflow-hidden pt-[290px]">
        {/* Video Background Layer */}
        <div className="absolute inset-0 z-0">
          <video autoPlay className="w-full h-full object-cover hero-video-container" loop muted playsInline>
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 hero-gradient-overlay"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-[1200px] w-full px-6 flex flex-col items-center gap-[32px] text-center">
          <h1 className="font-headline text-[80px] leading-[1.05] tracking-[-0.03em] text-[#2d3435]">
            Track Work. Not Just Tasks.
          </h1>
          <p className="font-body text-[18px] leading-[1.6] text-[#373a46] opacity-80 max-w-[554px]">
            Assign tasks, track progress, review deliverables, and measure performance, all from a single platform designed for modern teams.
          </p>
          <div className="flex flex-col items-center gap-6 w-full max-w-[480px]">
            <div className="w-full p-1 pl-6 bg-[#fcfcfc] border border-[#adb3b4]/20 rounded-[40px] flex items-center gap-2 input-shadow">
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#2d3435] placeholder:text-[#adb3b4] text-sm"
                placeholder="Enter your work email"
                type="email"
              />
              <Link to="/auth" className="tactile-cta text-[#f8f7ff] px-8 py-3.5 rounded-full text-sm font-semibold tracking-tight transition-transform active:scale-95">
                Create Free Account
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs font-label tracking-widest uppercase text-[#5a6061]/60">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#dde4e5] border border-white flex items-center justify-center overflow-hidden">
                  <img alt="User 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD38yuCziNdyplC1BmfR60rHiKU4TJ71s2X1FKBGp-GCLVdb-aT5153D-L_cWgmQE8Dmmy30q3-bLfSnSFl1M0rHhbm-FnARWqPghrW0n_jLG-HZTbUWMk0MppTNO3VwE3uPO9kXp4Hn51G85BpjF4kcuFUYEKO9RusThFMqN-6vJMPqR_Q9fwLXAhPVV_nLmF330FJjoTBe3-ES3KnoXLsaIS5Oo2-uucXdF6mVGLaylZeBHclXPaSQJ9wejeWDvzAEhJK1WOzN0aa" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#dde4e5] border border-white flex items-center justify-center overflow-hidden">
                  <img alt="User 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkxJ7pS35tywPDGwk8cEoGPdvKgHHlHdGOlpCxI1ko-obOvR1_ItDfJJMAFLWZ0Qi-TTkn_2z-al-9v6bqDwnN1ZnDvTjkVw68S5wgZn9QiX-BrUMC3fZTBmKW6afgNHeNHzZrs4zxhA8Thd3GxoSPnRWWFwdG8XjSuAhqNGgL72waGv2tsQngNKpUo3CDerFx73QdMHSU1buZhJ243XTETUPd5YaI2x-pukm_dqwXQ0xQxCn7RA2wRnW2vLlG2WCh507SZ8JZBzqG" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#dde4e5] border border-white flex items-center justify-center overflow-hidden">
                  <img alt="User 3" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQsX_Ic6BnbwG1SKdaQ9GE9BsBH8NWSf9E71zEIV1Tk13xqgT6EHHAOxrcNS0JQgS2Lt3SBTOxI0v1TMSatuNfedZidOOeE4iBmyhC_GmwtSCxQPLz_5JNZgnrmElndkAz6hY-D6LfyO7AcRLJNo72UK-MS-Xjv_XWbhPyT0_BM-0-g6QMoGNGSOijQSDo2O6HYX1V1_CHLsW70Fe_JMyX4k2b0j_ekcdCzQZNsd4invADqOnMP9NJLNAU2kz_5jNoiTg29x1i-MtE" />
                </div>
              </div>
              <span>1,020+ Reviews</span>
              <span className="flex items-center gap-1 text-[#5b5e6b]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#adb3b4] mb-12 font-semibold">
            Trusted by leading architectural teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 grayscale contrast-125">
            {['LUME', 'ORBIT', 'VERTEX', 'NEXUS', 'PRISM'].map((brand) => (
              <div key={brand} className="text-xl font-bold tracking-tighter">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: 'track_changes', title: 'Precision Tracking', desc: 'Every heartbeat of your project monitored with sub-second accuracy. No more estimation guesswork.' },
            { icon: 'public', title: 'Global Alignment', desc: 'Sync cross-continental teams with intelligent time-zone buffers and cultural-aware scheduling.' },
            { icon: 'auto_awesome', title: 'Intelligent Workflows', desc: "Self-correcting pipelines that learn from your team's velocity to prevent burnout before it starts." }
          ].map((feature, idx) => (
            <div key={idx} className="group p-8 rounded-xl transition-all duration-500 hover:bg-white">
              <div className="w-12 h-12 bg-[#f2f4f4] rounded-lg flex items-center justify-center mb-8 group-hover:bg-[#e0e1f1] transition-colors">
                <span className="material-symbols-outlined text-[#5b5e6b]">{feature.icon}</span>
              </div>
              <h3 className="font-headline text-xl mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-[#5a6061] leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 bg-[#f2f4f4]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <span className="uppercase tracking-widest text-[#5b5e6b]/60 font-semibold text-xs">The Methodology</span>
          <h2 className="font-headline text-4xl mt-4 tracking-tight">
            Seamless progression from <span className="font-serif italic font-normal">idea</span> to impact
          </h2>
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative flex justify-between items-start">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-[1px] bg-[#adb3b4]/30 z-0"></div>
            {/* Steps */}
            {[
              { label: 'Assign', sub: 'Initialization' },
              { label: 'Submit', sub: 'Development' },
              { label: 'Review', sub: 'Quality Assurance' },
              { label: 'Complete', sub: 'Deployment', active: true }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-4 text-center group">
                <div className={`w-12 h-12 rounded-full ${step.active ? 'bg-[#5b5e6b] text-[#f8f7ff] shadow-lg' : 'bg-white border border-[#adb3b4]/20 shadow-sm'} flex items-center justify-center font-serif italic text-lg group-hover:scale-110 transition-transform`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="font-headline text-sm font-bold tracking-tight mb-1">{step.label}</div>
                  <div className="text-[11px] text-[#5a6061] uppercase tracking-widest">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-48 bg-[#f9f9f9]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12">
            <span className="material-symbols-outlined text-[#5b5e6b]/30 text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
          </div>
          <blockquote className="font-serif italic text-4xl md:text-5xl leading-[1.3] text-[#2d3435] mb-12">
            "Gradient has transformed our asynchronous culture from a chaotic mess into a <span className="text-[#4f525f]">perfectly curated</span> symphony of productivity. It is quite literally the only tool we use for management."
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 grayscale">
              <img
                alt="Marcus Chen"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WUT7g_i6Reb4nzK8VPWzjsXzj9-X-PUOkcphTAaQMuZgylbnpWYJQnnzU1VlZaTazIsoWHihMDCJbwULGHPA8Osll1YKSXcAvspbYsetTyKwGCRxS3uLRgsKgH8KJOowZjwSXVyERQkbJ0rOxSZnmbumCxvohLthcDf9exxGGPIUi7fW-8j0uMvzK5SNvwc4YyV1YGmxUQUvZaoIAPn7JrkzDH8KXz1g-dirHxU3_h9gSOYT1zfKcU7-ZMYdCTNj0t3TreXZK3t"
              />
            </div>
            <div className="font-headline text-sm font-bold tracking-tight">Marcus Chen</div>
            <div className="text-[11px] text-[#5a6061] uppercase tracking-widest mt-1">VP of Engineering, Orbit Global</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-6">
          <div className="text-lg font-bold tracking-tighter text-slate-800">Gradient</div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Security', 'Status'].map((link) => (
              <a key={link} className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors" href="#">{link}</a>
            ))}
          </div>
          <div className="font-sans text-xs uppercase tracking-widest text-slate-600">
            © 2024 Gradient. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
