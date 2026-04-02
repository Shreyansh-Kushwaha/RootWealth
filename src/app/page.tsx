import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Calculator, 
  Eye, 
  Accessibility 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-blue-200 overflow-hidden">
      
      {/* --- COMBINED BACKGROUND ELEMENTS --- */}
      
      {/* 1. Subtle Graph Paper Grid (from Option 1) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* 2. Central Top Glow (from Option 1) */}
      <div className="absolute top-0 z-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="h-[400px] w-[800px] -translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]"></div>
      </div>

      {/* 3. Floating Gradient Blobs (from Option 2) */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none z-0"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none z-0"></div>
      
      {/* ------------------------------------ */}


      {/* Main Content Wrapper - Everything sits above the background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <header className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              FundTracker
            </span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="container mx-auto px-6 pt-20 pb-20 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              100% Privacy-First for Indian Investors
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight text-balance mb-6">
              Master your mutual funds with <span className="text-blue-600">surgical precision.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              Track your portfolio, analyze fund overlap, and harvest taxes efficiently. Built with precise business-day NAV calculations and a zero-compromise approach to your data.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Tracking Now
              </Link>
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-white transition-all shadow-sm"
              >
                View Live Demo
              </Link>
            </div>
          </section>

          {/* Features Grid Section */}
          <section className="bg-white/60 backdrop-blur-md py-24 border-y border-slate-200/60">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                  Everything you need to grow your wealth
                </h2>
                <p className="text-slate-600 max-w-xl mx-auto">
                  Advanced analytics simplified into a high-contrast, easy-to-use dashboard.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Exact SIP Simulation</h3>
                  <p className="text-slate-600 leading-relaxed">
                    We handle the complex math. Fetch historical NAV data directly from mfapi.in with precise business-day unit accumulation.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Tax Harvesting (FIFO)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Maximize your returns by identifying exact LTCG and STCG exposure using standard First-In-First-Out methodology.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Overlap Detection</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Stop buying the same stocks twice. Compare mocked holdings between multiple mutual funds to find true portfolio diversification.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced XIRR Analytics</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Go beyond simple absolute returns. Calculate your true annualized return rate (XIRR) across all your scattered investments.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Your Data, Your Control</h3>
                  <p className="text-slate-600 leading-relaxed">
                    A strict privacy-first architecture. We do not ask for your broker passwords or read your emails. You maintain full control.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-6 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <Accessibility className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">High-Contrast UI</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Finance is for everyone. Designed specifically with older investors in mind, featuring readable typography and clear layouts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6 text-balance">
              Ready to take control of your investments?
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Join other Indian investors making smarter data-driven decisions today.
            </p>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl"
            >
              Create Your Free Account
            </Link>
          </section>
        </main>

        {/* Simple Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm py-8 mt-auto">
          <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} FundTracker. Built for Indian Investors.</p>
            <p className="mt-2">Not a SEBI registered advisor. For educational purposes only.</p>
          </div>
        </footer>
        
      </div>
    </div>
  );
}