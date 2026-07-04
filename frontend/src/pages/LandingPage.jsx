import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBuilding,
  FaUsers,
  FaMoneyBill,
  FaHospitalUser,
  FaTools,
  FaCheckCircle,
  FaArrowRight,
  FaSun,
  FaMoon,
  FaEnvelope,
  FaLock,
  FaChartPie,
  FaShieldAlt,
  FaPaperPlane,
  FaUser,
  FaSearch,
  FaCalendarAlt,
  FaArrowUp
} from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      if (user.role === 'superadmin') {
        navigate('/superadmin-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
  }, [user, navigate]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' | 'employee'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Landing Page Pricing Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const MONTHLY_PRICE = 999;
  const ANNUAL_MONTHLY_PRICE = Math.round(MONTHLY_PRICE * 0.8); // 799
  const ANNUAL_TOTAL = ANNUAL_MONTHLY_PRICE * 12; // 9588
  const proMonthlyDisplay = billingCycle === 'annual' ? ANNUAL_MONTHLY_PRICE : MONTHLY_PRICE;
  const [paymentAmount, setPaymentAmount] = useState(String(MONTHLY_PRICE));
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  // Lock body scroll when payment modal is open
  useEffect(() => {
    if (showPaymentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPaymentModal]);


  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setCardExpiry(val);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setUpgrading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowPaymentModal(false);
      alert(`Payment of ₹${paymentAmount} processed successfully! Redirecting you to register your Pro Company Account.`);
      navigate('/register-company?plan=pro');
    } catch (error) {
      alert("Failed to process payment.");
    } finally {
      setUpgrading(false);
    }
  };

  // Input ref for header auto-focus trigger
  const emailInputRef = useRef(null);

  // Contact form state
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Preloader state
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [fadePreloader, setFadePreloader] = useState(false);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Mouse movement tracking for parallax and interactive cursor states
  const [mousePosition, setMousePosition] = useState({ x: -200, y: -200 });
  const [cursorHover, setCursorHover] = useState('none'); // 'none' | 'zoom' | 'pointer'

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target;
      if (!target) return;

      // Classify target under cursor
      const zoomTarget = target.closest('.cursor-zoom-in');
      const isInteractive = target.closest('a, button, input, select, textarea, [onClick], .cursor-pointer');

      if (zoomTarget) {
        setCursorHover('zoom');
      } else if (isInteractive) {
        setCursorHover('pointer');
      } else {
        setCursorHover('none');
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute parallax offset values for ambient lights
  const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.025;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.025;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 2; // Increments by random steps
      if (current >= 100) {
        current = 100;
        setPreloadProgress(100);
        clearInterval(interval);
        setFadePreloader(true);
        setTimeout(() => {
          setPreloaderActive(false);
        }, 500); // Wait for transition animation to end
      } else {
        setPreloadProgress(current);
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const response = await axios.post('/api/landing/contact', {
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      if (response.data.success) {
        setContactSuccess(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        // Hide success message after 5 seconds
        setTimeout(() => setContactSuccess(false), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const focusLoginInput = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 72; // sticky header height
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const explorePortal = (role) => {
    setLoginRole(role);
    setEmail('');
    setPassword('');
    focusLoginInput();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password, role: loginRole });

      if (response.data.success) {
        // Authenticate context
        login(response.data.user);

        // Save session credentials
        localStorage.setItem('token', response.data.token);

        // Redirect based on server role permissions
        if (response.data.user.role === 'superadmin') {
          navigate('/superadmin-dashboard');
        } else if (response.data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Connection failed. Please check backend server status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Employee Management',
      description: 'Add, view, edit, or securely delete employees along with all of their related historical data in one click.',
      icon: <FaUsers className="text-xl text-[#6C63FF]" />,
    },
    {
      title: 'Department Administration',
      description: 'Organize company structure by establishing sub-groups, tracking departments, and aligning staff.',
      icon: <FaBuilding className="text-xl text-[#22D3EE]" />,
    },
    {
      title: 'Leave Review System',
      description: 'Submit leave applications, track statuses, and approve or reject employee leave requests instantly.',
      icon: <FaCheckCircle className="text-xl text-[#6C63FF]" />,
    },
    {
      title: 'Payroll & Salary Management',
      description: 'Add salary records, auto-prefill base wages, track monthly payouts, and view interactive salary charts.',
      icon: <FaMoneyBill className="text-xl text-[#22D3EE]" />,
    },
    {
      title: 'Attendance Analytics',
      description: 'Track daily attendance statuses (Present, Absent, Sick, Leave) and view real-time monthly trends.',
      icon: <FaCalendarAlt className="text-xl text-[#6C63FF]" />,
    },
    {
      title: 'Flexible Subscriptions',
      description: 'Lift employee caps by upgrading from the Basic plan to Pro using our integrated mock checkout gateway.',
      icon: <FaShieldAlt className="text-xl text-[#4F46E5]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-[#6C63FF]/30 relative clip-overflow-x font-sans flex flex-col dotted-grid">
      {/* Cyber Preloader Overlay */}
      {preloaderActive && (
        <div className={`fixed inset-0 bg-[#040408] z-[9999] flex flex-col items-center justify-center transition-all duration-500 ease-out select-none ${fadePreloader ? 'opacity-0 -translate-y-full' : 'opacity-100'
          }`}>
          <div className="space-y-8 flex flex-col items-center">
            {/* Spinning Neon Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#141b2d] border-t-[#6C63FF] border-r-[#22D3EE] animate-spin" />
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img src="/logo3.png" alt="StaffMatrix Logo" className="w-full h-full object-contain drop-shadow-md" />
              </div>
            </div>

            {/* Metrics progress percentage */}
            <div className="text-center space-y-3">
              <div className="font-heading text-2xl font-bold tracking-widest text-[#22D3EE] font-mono">
                {preloadProgress}%
              </div>

              {/* Horizontal fill bar */}
              <div className="w-48 h-1 bg-[#141b2d] border border-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] rounded-full transition-all duration-100"
                  style={{ width: `${preloadProgress}%` }}
                />
              </div>

              <div className="text-[9px] tracking-[0.25em] text-[#6C63FF] font-bold uppercase animate-pulse">
                Initializing StaffMatrix System...
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Decorative Ambient Background Lights (Parallax Shifted) */}
      <div
        className="absolute top-[15%] left-[5%] w-96 h-96 rounded-full bg-[#6C63FF]/8 blur-[130px] animate-pulse-glow pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: 'translate(var(--parallax-x,0px), var(--parallax-y,0px))' }}
      />
      <div
        className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-[#22D3EE]/6 blur-[150px] animate-pulse-glow pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: 'translate(calc(-1 * var(--parallax-x,0px)), calc(-1 * var(--parallax-y,0px)))' }}
      />
      <div className="bg-particles" />

      {/* Trailing Cursor Glowing Light / Interactive Badge */}
      {/* Ambient glow orb that follows mouse when not hovering zoomable */}
      {cursorHover !== 'zoom' && (
        <div
          className={`fixed pointer-events-none z-[9998] rounded-full transition-all duration-300 ease-out hidden md:block -translate-x-1/2 -translate-y-1/2 ${cursorHover === 'pointer'
            ? 'w-5 h-5 bg-transparent border border-[#6C63FF]/70'
            : 'w-72 h-72 bg-gradient-to-r from-[#6C63FF]/5 to-[#22D3EE]/5 blur-[90px]'
            }`}
          style={{ left: 'var(--mouse-x,-200px)', top: 'var(--mouse-y,-200px)' }}
        />
      )}

      {/* Magnifying glass ring — transparent so text shows through */}
      {cursorHover === 'zoom' && (
        <div
          className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
          style={{ left: 'var(--mouse-x,-200px)', top: 'var(--mouse-y,-200px)' }}
        >
          {/* Outer neon ring */}
          <div className="w-10 h-10 rounded-full relative flex items-center justify-center"
            style={{
              border: '2px solid rgba(34,211,238,0.7)',
              boxShadow: '0 0 12px 2px rgba(34,211,238,0.25), inset 0 0 8px rgba(34,211,238,0.05)',
              background: 'transparent',
            }}
          >
            {/* Magnifier handle */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              width: '10px',
              height: '2px',
              background: 'rgba(34,211,238,0.8)',
              borderRadius: '2px',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 4px rgba(34,211,238,0.6)',
            }} />
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-center animate-fade-in">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={theme === 'dark' ? '/logo1.png' : '/logo2.png'} alt="StaffMatrix Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Staff<span className="text-[#6C63FF] font-extrabold">Matrix</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">Features</button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">Solutions</button>
            <button onClick={() => scrollToSection('security')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">Security</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">Pricing</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">About</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#6C63FF] transition-colors cursor-pointer bg-transparent border-none">Contact</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun className="text-sm text-[#22D3EE]" /> : <FaMoon className="text-sm text-[#6C63FF]" />}
            </button>
            <button
              onClick={focusLoginInput}
              className="px-5 py-2 rounded-xl text-sm font-semibold border border-slate-800 hover:border-[#6C63FF]/30 hover:bg-slate-900/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container (Hero Fold Only) */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-14 gap-12 lg:gap-16 justify-between items-center">

        {/* LEFT SIDE (Headline / Copy) */}
        <section className="w-full lg:w-[54%] flex flex-col justify-center space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs font-semibold text-[#22D3EE] w-fit">
              <span className="flex h-2 w-2 rounded-full bg-[#22D3EE] animate-ping" />
              <span>v2.0 Enterprise Release</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Workforce Management <br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#22D3EE] bg-clip-text text-transparent">
                Made Intelligent
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Manage employees, attendance summaries, leaves, payroll allocations, departments, and workforce insights from one secure, premium platform. Built for modern fast-growing enterprises.
            </p>
          </div>

          {/* Quick Metrics Grid inside Hero for visual balance */}
          <div className="grid grid-cols-2 gap-4 max-w-md pt-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
              <div className="text-2xl font-extrabold text-white">1,200+</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employees Managed</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
              <div className="text-2xl font-extrabold text-[#22D3EE]">98%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attendance Accuracy</div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE (Login Form Card) */}
        <section className="w-full lg:w-[40%] flex flex-col justify-center items-center">

          {/* Glassmorphism Login Card */}
          <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl border border-white/5 bg-slate-900/40 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#22D3EE]" />

            <div className="text-center mb-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-slate-400">Sign in to continue to StaffMatrix</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 mb-6 relative z-10">
              <button
                type="button"
                onClick={() => setLoginRole('admin')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${loginRole === 'admin'
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white shadow-md shadow-[#6C63FF]/15'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Admin / HR
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('employee')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${loginRole === 'employee'
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white shadow-md shadow-[#6C63FF]/15'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Employee
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaEnvelope className="text-xs" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    ref={emailInputRef}
                    placeholder=""
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 text-sm transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaLock className="text-xs" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder=""
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 text-sm transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white hover:shadow-lg hover:shadow-[#6C63FF]/20 active:scale-[0.98] hover:scale-[1.01] transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                {!loading && <FaArrowRight className="text-xs" />}
              </button>

              <div className="text-center pt-4 border-t border-slate-800/50 mt-4">
                <p className="text-xs text-slate-400">
                  New to StaffMatrix?{' '}
                  <Link to="/register-company" className="text-[#6C63FF] hover:text-[#4F46E5] font-bold hover:underline transition-all">
                    Register your company
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ====================================================== */}
      {/* SECONDARY MARKETING SECTIONS (FULL-WIDTH & CENTERED) */}
      {/* ====================================================== */}

      {/* 1. FEATURES SECTION */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#6C63FF] border border-[#6C63FF]/30 uppercase tracking-widest shadow-glow">System Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Fully Featured HR Operations</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">StaffMatrix consolidates complex organizational tools into a single, high-contrast control center.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="future-card p-6 flex space-x-4"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center flex-shrink-0 border border-slate-800">
                {feature.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-200">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-normal">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LIVE PREVIEW SHOWCASE */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-4">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#22D3EE] border border-[#22D3EE]/30 uppercase tracking-widest shadow-glow">
            LIVE ANALYTICS PREVIEW
          </span>
        </div>

        {/* Interactive HR Dashboard Mockup */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/20 shadow-2xl relative">
          <div className="space-y-6">
            {/* Header block inside mockup */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[9px] font-bold text-[#6C63FF]">A</span>
                <span className="text-xs font-bold text-slate-300">Admin Dashboard Summary</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* KPI metrics grid inside mockup */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col justify-between hover:border-[#22D3EE]/30 hover:bg-slate-900/60 transition-all duration-300 relative z-10 cursor-zoom-in group">
                <span className="text-[10px] text-slate-500 font-bold uppercase transition-transform duration-200 origin-left inline-block group-hover:scale-[1.15] group-hover:text-[#22D3EE]">Total Employees</span>
                <span className="text-lg font-extrabold text-white mt-1 transition-transform duration-200 origin-left inline-block group-hover:scale-[1.18] group-hover:text-white">15 Active</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col justify-between hover:border-[#22D3EE]/30 hover:bg-slate-900/60 transition-all duration-300 relative z-10 cursor-zoom-in group">
                <span className="text-[10px] text-slate-500 font-bold uppercase transition-transform duration-200 origin-left inline-block group-hover:scale-[1.15] group-hover:text-[#22D3EE]">Total Departments</span>
                <span className="text-lg font-extrabold text-amber-400 mt-1 transition-transform duration-200 origin-left inline-block group-hover:scale-[1.18] group-hover:text-amber-400">5 Active</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col justify-between hover:border-[#22D3EE]/30 hover:bg-slate-900/60 transition-all duration-300 relative z-10 cursor-zoom-in group">
                <span className="text-[10px] text-slate-500 font-bold uppercase transition-transform duration-200 origin-left inline-block group-hover:scale-[1.15] group-hover:text-[#22D3EE]">Monthly Payroll</span>
                <span className="text-lg font-extrabold text-[#22D3EE] mt-1 transition-transform duration-200 origin-left inline-block group-hover:scale-[1.18] group-hover:text-[#22D3EE]">₹2.85M</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col justify-between hover:border-[#22D3EE]/30 hover:bg-slate-900/60 transition-all duration-300 relative z-10 cursor-zoom-in group">
                <span className="text-[10px] text-slate-500 font-bold uppercase transition-transform duration-200 origin-left inline-block group-hover:scale-[1.15] group-hover:text-[#22D3EE]">Total Leaves</span>
                <span className="text-lg font-extrabold text-white mt-1 transition-transform duration-200 origin-left inline-block group-hover:scale-[1.18] group-hover:text-white">12 Applied</span>
              </div>
            </div>

            {/* Lower split mockup info */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 overflow-hidden">
              {/* Leave Analytics */}
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-950/45 border border-slate-800/50 space-y-3 hover:border-[#6C63FF]/30 hover:bg-slate-900/40 transition-all duration-300 relative z-10 cursor-zoom-in overflow-hidden">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Analytics</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1 group cursor-zoom-in">
                      <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.18] group-hover:text-white">Approved Leaves</span>
                      <span className="inline-block transition-transform duration-200 origin-right group-hover:scale-[1.18] group-hover:text-[#22D3EE] font-bold">8 (67%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1 group cursor-zoom-in">
                      <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.18] group-hover:text-white">Pending Review</span>
                      <span className="inline-block transition-transform duration-200 origin-right group-hover:scale-[1.18] group-hover:text-[#22D3EE] font-bold">3 (25%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 mb-1 group cursor-zoom-in">
                      <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.18] group-hover:text-white">Rejected Leaves</span>
                      <span className="inline-block transition-transform duration-200 origin-right group-hover:scale-[1.18] group-hover:text-[#22D3EE] font-bold">1 (8%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Action Items / Activities */}
              <div className="md:col-span-3 p-4 rounded-xl bg-slate-950/45 border border-slate-800/50 space-y-3 flex flex-col justify-between hover:border-[#6C63FF]/30 hover:bg-slate-900/40 transition-all duration-300 relative z-10 cursor-zoom-in overflow-hidden">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Items & Activity</h4>
                <div className="space-y-2 text-[10px] leading-relaxed text-slate-400">
                  <div className="flex items-center space-x-2 border-b border-slate-900 pb-1.5 cursor-zoom-in group">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.15] group-hover:text-white">
                      <strong>John Doe</strong> applied for <strong>Sick Leave</strong> (Pending Review)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 border-b border-slate-900 pb-1.5 cursor-zoom-in group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" />
                    <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.15] group-hover:text-white">
                      Upcoming Birthday: <strong>Alice Johnson</strong> (July 15)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-zoom-in group">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="inline-block transition-transform duration-200 origin-left group-hover:scale-[1.15] group-hover:text-white">
                      Recent Hire: <strong>Bob Smith</strong> joined IT Department
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTIONS SECTION */}
      <section id="solutions" className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#6C63FF] border border-[#6C63FF]/30 uppercase tracking-widest shadow-glow">Solutions & Roles</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Designed for the Whole Organization</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">Explore features custom-tailored for your administrators and staff members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="future-card p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center border border-[#6C63FF]/25">
                <FaUsers className="text-lg" />
              </div>
              <h4 className="font-bold text-white text-base">Administrative Portal</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Establish operational departments, manage active employee profiles, configure monthly salary payouts, review leave requests, track upcoming birthdays, and audit real-time organization metrics.
              </p>
            </div>
            <div
              onClick={() => explorePortal('admin')}
              className="flex items-center text-xs text-[#6C63FF] font-semibold space-x-1 hover:underline cursor-pointer pt-2"
            >
              <span>Explore Admin Controls</span>
              <FaArrowRight className="text-[10px]" />
            </div>
          </div>

          <div className="future-card p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center border border-[#22D3EE]/25">
                <FaUser className="text-lg" />
              </div>
              <h4 className="font-bold text-white text-base">Employee Workspace</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Log daily attendance check-ins, view salary slips and payment history, apply for leaves, track leave approval statuses, and update personal account credentials.
              </p>
            </div>
            <div
              onClick={() => explorePortal('employee')}
              className="flex items-center text-xs text-[#22D3EE] font-semibold space-x-1 hover:underline cursor-pointer pt-2"
            >
              <span>Explore Employee Portal</span>
              <FaArrowRight className="text-[10px]" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY SECTION */}
      <section id="security" className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#22D3EE] border border-[#22D3EE]/30 uppercase tracking-widest shadow-glow">Enterprise Security</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Confidential Guardrails & Verification</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">Engineered with high security criteria to safeguard sensitive workforce information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="future-card p-6 space-y-4 flex flex-col items-center text-center hover:border-[#22D3EE]/30 transition-all duration-300 relative group cursor-zoom-in">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-[#22D3EE] border border-slate-800 group-hover:scale-110 transition-transform">
              <FaLock className="text-lg" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Secure Password Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Encrypts all user passwords securely before storing them in our protected database.</p>
            </div>
          </div>

          <div className="future-card p-6 space-y-4 flex flex-col items-center text-center hover:border-[#6C63FF]/30 transition-all duration-300 relative group cursor-zoom-in">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-[#6C63FF] border border-slate-800 group-hover:scale-110 transition-transform">
              <FaShieldAlt className="text-lg" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Protected User Sessions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Secures all connection endpoints to keep your active session private and safe from intrusion.</p>
            </div>
          </div>

          <div className="future-card p-6 space-y-4 flex flex-col items-center text-center hover:border-[#4F46E5]/30 transition-all duration-300 relative group cursor-zoom-in">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-[#4F46E5] border border-slate-800 group-hover:scale-110 transition-transform">
              <FaTools className="text-lg" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Strict Role Authorization</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Enforces strict rules to prevent employees from accessing sensitive admin configurations or salary sheets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 space-y-16">
        <div className="text-center space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#6C63FF] border border-[#6C63FF]/30 uppercase tracking-widest shadow-glow">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Powerful Tools, One Simple Price.<br />Manage your workforce without the hassle.
          </h2>
          <div className="text-sm text-slate-400 max-w-2xl mx-auto space-y-1">
            <p>Transparent pricing tailored for growing teams.</p>
            <p>Streamline attendance, payroll, and employee management all in one place.</p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8 pt-4">
            <div className="flex bg-slate-900/50 p-1.5 rounded-full border border-slate-800 backdrop-blur-sm relative">
              <button
                onClick={() => { setBillingCycle('monthly'); setPaymentAmount(String(MONTHLY_PRICE)); }}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${billingCycle === 'monthly'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => { setBillingCycle('annual'); setPaymentAmount(String(ANNUAL_TOTAL)); }}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 ${billingCycle === 'annual'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>Annual Billing</span>
                <span className="bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Tier 1: Basic */}
          <div className="relative rounded-3xl bg-slate-950 p-[2px] shadow-xl h-full hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl opacity-100" />

            <div className="relative h-full p-8 rounded-[23px] bg-slate-950 flex flex-col">
              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Everything you need to get your team organized and running.
                  </p>
                </div>
                <div className="flex items-end space-x-1">
                  <span className="text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-sm text-slate-500 mb-1">/ forever</span>
                </div>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Manage up to 10 employees</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Employee profiles & role management</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Attendance & leave tracking</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Basic department structuring</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-slate-600 mt-0.5 flex-shrink-0" />
                    <span>Admin & employee login portals</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Link to="/register-company?plan=basic" className="w-full py-3.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all text-sm block text-center">
                  Start for Free
                </Link>
              </div>
            </div>
          </div>

          {/* Tier 2: Pro (Highlighted) */}
          <div className="relative rounded-3xl bg-slate-950 p-[2px] shadow-2xl shadow-[#6C63FF]/20 z-10 scale-105">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6C63FF] to-[#22D3EE] rounded-3xl opacity-100" />

            {/* Best Deal Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-[#6C63FF] to-[#b346e5] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-20">
              <FaArrowRight className="text-[10px] transform rotate-90" />
              <span>Most Popular</span>
            </div>

            <div className="relative h-full p-8 rounded-[23px] bg-slate-950 flex flex-col">
              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Full-power HR management with payroll, analytics & smart reporting.
                  </p>
                </div>
                <div className="flex items-end space-x-1">
                  <span className="text-4xl font-extrabold text-white">₹{proMonthlyDisplay}</span>
                  <span className="text-sm text-slate-500 mb-1">/ month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs text-emerald-400 font-semibold -mt-3">
                    Billed annually as ₹{ANNUAL_TOTAL.toLocaleString('en-IN')} · Save ₹{(MONTHLY_PRICE * 12 - ANNUAL_TOTAL).toLocaleString('en-IN')}/yr
                  </p>
                )}
                <ul className="space-y-4 pt-4">
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>Unlimited employees & departments</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>Full salary & payroll processing</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>PDF salary slip generation</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>Visual dashboard analytics & reports</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>Advanced leave & attendance controls</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-[#a855f7] mt-0.5 flex-shrink-0" />
                    <span>Company settings & branding controls</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8 space-y-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#b346e5] text-white shadow-lg hover:shadow-[#6C63FF]/30 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Upgrade to Pro</span>
                  <FaArrowRight className="text-xs transform -rotate-45" />
                </button>
                <p className="text-center text-[10px] text-slate-500">14-day free trial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fake Payment Gateway Modal */}
        {showPaymentModal && createPortal(
          <div className="relative z-[9999]">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-[#040408] transition-opacity" aria-hidden="true" onClick={() => setShowPaymentModal(false)}></div>

            <div className="fixed inset-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                {/* Modal Panel */}
                <div className="relative w-full max-w-md transform rounded-2xl border border-slate-800 shadow-2xl shadow-black p-5 text-left align-middle transition-all space-y-4" style={{ background: '#040408' }}>
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

                  {/* Title */}
                  <div className="text-center space-y-1.5">
                    <h3 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
                      <FaLock className="text-indigo-400 text-sm animate-pulse" /> Secure Payment Gateway
                    </h3>
                    <p className="text-xs text-slate-400">Complete your transaction to register Pro Plan</p>
                  </div>

                  {/* Credit Card Graphic */}
                  <div className="relative h-36 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 p-4 text-white flex flex-col justify-between shadow-lg overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">Pro Subscription</p>
                        <p className="text-lg font-bold">StaffMatrix</p>
                      </div>
                      <div className="text-right font-mono font-bold text-sm tracking-wide">
                        ₹ {paymentAmount || '0'}
                      </div>
                    </div>
                    <div className="font-mono text-base tracking-wide my-2 text-center text-indigo-100">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="min-w-0">
                        <p className="text-[8px] text-indigo-300 uppercase tracking-wider">Card Holder</p>
                        <p className="text-xs font-bold uppercase truncate max-w-[150px]">{cardName || 'Your Name'}</p>
                      </div>
                      <div className="flex gap-4 text-right shrink-0">
                        <div>
                          <p className="text-[8px] text-indigo-300 uppercase tracking-wider">Expires</p>
                          <p className="text-xs font-bold font-mono">{cardExpiry || 'MM/YY'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-indigo-300 uppercase tracking-wider">CVV</p>
                          <p className="text-xs font-bold font-mono">{cardCvv ? '•••' : 'CVV'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-3">
                    {/* Price Display — non-editable */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Price</span>
                      <span className="text-sm font-extrabold text-white font-mono">₹{paymentAmount}</span>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength="19"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength="5"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={upgrading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {upgrading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Pay ₹${paymentAmount || '0'}`
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          , document.body)}
      </section>

      {/* 5. ABOUT SECTION */}
      <section id="about" className="relative z-10 w-[80%] max-w-[1600px] mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#6C63FF] border border-[#6C63FF]/30 uppercase tracking-widest shadow-glow">About Our System</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Streamlined Employee Management</h2>
        </div>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-4xl mx-auto">
          Our Employee Management System, StaffMatrix, is designed to simplify human resources for growing organizations. By replacing disorganized spreadsheets with a single, integrated portal, we empower your HR teams to manage departments, log employee salaries, and process leaves securely and transparently. We believe in maximum efficiency and robust data integrity.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-900/60 w-[80%] mx-auto">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-white">Full</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Employee Control</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#22D3EE]">Smart</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Leave Tracking</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-white">Easy</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Payroll System</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#6C63FF]">Secure</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Role Access</div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="relative z-10 w-full max-w-3xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-900/60 scroll-mt-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold text-[#22D3EE] border border-[#22D3EE]/30 uppercase tracking-widest shadow-glow">Contact Admin</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Get in Touch with Support</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">Have a system question or need onboarding credentials? Send a message directly to HR administrators.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl bg-slate-900/20 border border-white/5 backdrop-blur-lg">
          {contactSuccess ? (
            <div className="p-6 text-center space-y-3 animate-fade-in-up">
              <FaCheckCircle className="text-3xl text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Message Sent Successfully</h4>
              <p className="text-xs sm:text-sm text-slate-400">Our HR administration team will reach out to you shortly.</p>
              <button
                onClick={() => setContactSuccess(false)}
                className="mt-4 px-5 py-2 bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white rounded-xl font-bold cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    placeholder=""
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 text-sm animate-fade-in"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Email</label>
                  <input
                    type="email"
                    placeholder=""
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 text-sm animate-fade-in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Details</label>
                <textarea
                  placeholder="Enter details of your system issue or question..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40 text-sm resize-none animate-fade-in"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={contactLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {contactLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-[10px]" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-slate-500 text-xs mt-12 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">StaffMatrix</span>
            <span className="text-slate-600">|</span>
            <span>© {new Date().getFullYear()} StaffMatrix. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-slate-400">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer">Support Channels</a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white shadow-xl shadow-[#6C63FF]/30 hover:scale-110 active:scale-95 transition-all duration-300 z-[99] ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default LandingPage;
