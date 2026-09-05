const fs = require('fs');

const content = fs.readFileSync('src/components/pages.tsx', 'utf8');

const newRegisterPage = export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    return name.length > 2 && /^\\d{10}$/.test(phone) && password.length >= 6;
  }, [name, phone, password]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const session = {
        id: "u-registered-" + Date.now(),
        name: name,
        email: phone + "@purefarm.test",
        role: "farmer" as const,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("purefarm_session", JSON.stringify(session));
      }

      void navigate({ to: "/" });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center overflow-hidden font-sans">
      {/* 1. FULL-SCREEN AGRICULTURE BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920)' }}
      >
        {/* 2. PROPER DARK OVERLAY */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 35, 25, 0.38)' }} />
      </div>

      {/* 8. LEFT SIDE DESIGN - PUREFARM BRANDING (Top Left) */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-10 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
          <Leaf className="h-6 w-6" />
        </span>
        <div>
          <span className="block text-2xl font-black tracking-wide leading-none text-white drop-shadow-md">PureFarm</span>
          <span className="block text-[10px] font-bold text-white uppercase tracking-widest leading-none mt-1.5 drop-shadow-md">
            Connect • Grow • Prosper
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 mt-20 lg:mt-0">
        
        {/* 8. LEFT-SIDE CONTENT */}
        <div className="w-full lg:w-1/2 text-white mb-10 lg:mb-0 lg:pr-12 hidden md:block">
          <h2 className="text-4xl lg:text-6xl font-bold leading-tight drop-shadow-lg mb-6 text-white">
            Join the Digital<br />Agri Revolution
          </h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-md mb-10 drop-shadow-md" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Register your farmer profile today to unlock crop guidance, Mandi price trackers, government scheme applications, and premium seed/fertiliser listings.
          </p>
          
          <div className="space-y-4">
            {/* 9. FEATURE CARDS */}
            <div 
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div className="p-2"><Leaf className="h-6 w-6 text-white" /></div>
              <div>
                <h4 className="font-bold text-white text-sm">Smart Farming</h4>
                <p className="text-white/80 text-xs">Smarter decisions</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div className="p-2"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
              <div>
                <h4 className="font-bold text-white text-sm">Water Efficient</h4>
                <p className="text-white/80 text-xs">Every drop counts</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div className="p-2"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <div>
                <h4 className="font-bold text-white text-sm">Healthy Crop</h4>
                <p className="text-white/80 text-xs">Better yield</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 & 4. TRUE GLASSMORPHISM CREATE ACCOUNT PANEL */}
        <div className="w-full lg:w-[500px] max-w-[90vw] lg:ml-auto">
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(25px) saturate(140%)',
              WebkitBackdropFilter: 'blur(25px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
              borderRadius: '28px'
            }}
            className="py-[38px] px-6 sm:px-[42px]"
          >
            
            {/* 5. MAKE THE CARD CONTENT HIGH CONTRAST */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/30 backdrop-blur-md border border-white/50 text-[#073B2A] shadow-sm">
                  <Leaf className="h-7 w-7" />
                </span>
              </div>
              <h3 
                className="text-[28px] text-center leading-tight" 
                style={{ color: '#073B2A', fontWeight: 800 }}
              >
                Create Account 🌱
              </h3>
              <p 
                className="text-center text-sm mt-2"
                style={{ color: '#164F3C' }}
              >
                Register your farmer profile to get started
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* 6. INPUTS MUST ALSO LOOK LIKE GLASS */}
              <div className="space-y-1.5">
                <label className="text-[13px] block" style={{ color: '#073B2A', fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    background: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '14px',
                    height: '52px',
                    color: '#082F25'
                  }}
                  className="w-full px-4 text-[15px] outline-none focus:border-[#087F5B] focus:shadow-[0_0_10px_rgba(8,127,91,0.2)] transition-all placeholder:text-[#082F25]/65"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] block" style={{ color: '#073B2A', fontWeight: 700 }}>Mobile Number</label>
                <input
                  type="tel"
                  required
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  style={{
                    background: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '14px',
                    height: '52px',
                    color: '#082F25'
                  }}
                  className="w-full px-4 text-[15px] outline-none focus:border-[#087F5B] focus:shadow-[0_0_10px_rgba(8,127,91,0.2)] transition-all placeholder:text-[#082F25]/65"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] block" style={{ color: '#073B2A', fontWeight: 700 }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 chars)"
                    style={{
                      background: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(255,255,255,0.65)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      height: '52px',
                      color: '#082F25'
                    }}
                    className="w-full pl-4 pr-14 text-[15px] outline-none focus:border-[#087F5B] focus:shadow-[0_0_10px_rgba(8,127,91,0.2)] transition-all placeholder:text-[#082F25]/65"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-xs font-bold text-[#087F5B] hover:text-[#073B2A] transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {!isValid && (name.length > 0 || phone.length > 0 || password.length > 0) && (
                <p className="text-[11px] font-semibold leading-relaxed text-[#087F5B] bg-white/30 backdrop-blur-sm p-3 rounded-xl border border-white/40">
                  • Name should be at least 3 characters.<br />
                  • Mobile number must be exactly 10 digits.<br />
                  • Password must be at least 6 characters.
                </p>
              )}

              {/* 7. CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="group relative w-full mt-4 flex items-center justify-center gap-2 overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[2px] hover:shadow-[0_12px_25px_rgba(0,90,65,0.35)]"
                style={{
                  background: 'linear-gradient(135deg, #087F5B, #0B6B4F)',
                  color: 'white',
                  fontWeight: 700,
                  height: '52px',
                  borderRadius: '14px',
                  boxShadow: '0 8px 20px rgba(0, 90, 65, 0.25)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-sm font-semibold mt-6">
              <span style={{ color: '#082F25' }}>Already have an account? </span>
              <Link
                to="/login"
                className="hover:underline transition-colors"
                style={{ color: '#087F5B', fontWeight: 700 }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const startIdx = content.indexOf('export function RegisterPage() {');
const endIdx = content.indexOf('export function SellerPage() {');

if (startIdx !== -1 && endIdx !== -1) {
    const finalContent = content.substring(0, startIdx) + newRegisterPage + '\n\n' + content.substring(endIdx);
    fs.writeFileSync('src/components/pages.tsx', finalContent);
    console.log('Successfully replaced RegisterPage!');
} else {
    console.log('Could not find boundaries.', startIdx, endIdx);
}
