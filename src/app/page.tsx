import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Search,
  FileSpreadsheet,
  Cpu,
  PieChart,
  Sparkles,
  Check,
  Star,
  Layers,
  Activity,
  Sliders,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      {/* 1. Thin Promotional Announcement Bar */}
      <div className="bg-[var(--color-ink)] text-white text-xs sm:text-sm py-2.5 px-4">
        <div className="site-container flex items-center justify-between">
          <div className="flex-1 text-center font-medium flex items-center justify-center gap-2">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] text-[11px] font-bold uppercase tracking-wider">
              NEW
            </span>
            <span>
              Finlyzer AI 2.0 is live: Instant 10-K deep dives &amp; multi-scenario DCF models.
            </span>
            <a
              href="#demo"
              className="underline hover:text-[var(--color-brand)] transition-colors ml-1 hidden sm:inline"
            >
              Try the interactive model &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* 2. Header and Navigation (Section 5) */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="site-container h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              <span className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-sm">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span>
                Fin<span className="text-[var(--color-ink)]">lyzer</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 text-[16px] font-medium text-[#292929]">
              <div className="dropdown dropdown-hover">
                <button
                  tabIndex={0}
                  className="flex items-center gap-1 hover:text-[var(--color-ink)] transition-colors py-2 cursor-pointer"
                >
                  Valuation Tools <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-50 menu p-2 shadow-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-64 text-sm"
                >
                  <li>
                    <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                      Automated DCF Builder
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                      Comparable Company Analysis
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                      WACC &amp; Cost of Capital Calc
                    </a>
                  </li>
                  <li>
                    <a href="#hub" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                      LBO &amp; M&amp;A Scenarios
                    </a>
                  </li>
                </ul>
              </div>

              <a href="#features" className="hover:text-[var(--color-ink)] transition-colors py-2">
                Financial Hub
              </a>
              <a href="#features" className="hover:text-[var(--color-ink)] transition-colors py-2">
                SEC 10-K Copilot
              </a>
              <a href="#hub" className="hover:text-[var(--color-ink)] transition-colors py-2">
                Enterprise
              </a>
              <a href="#hub" className="hover:text-[var(--color-ink)] transition-colors py-2">
                Pricing
              </a>
            </nav>
          </div>

          {/* Account Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="#login"
              className="text-[16px] font-medium text-[var(--color-ink)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Login
            </a>
            <a
              href="#signup"
              className="btn-brand-dark"
            >
              Sign Up Free
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 3. Breadcrumbs (Section 6) */}
        <div className="site-container pt-6 pb-2">
          <nav className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <a href="#hub" className="hover:text-[var(--color-ink)] transition-colors">
              Financial Tool Hub
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-ink)] font-medium">DCF &amp; Valuation Suite</span>
          </nav>
        </div>

        {/* 4. Hero Section (Section 7A: Tool Landing Hero) */}
        <section className="site-container py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column (52%) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Trust Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ink)] text-white text-xs font-bold ring-2 ring-white">
                    JP
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ink-soft)] text-white text-xs font-bold ring-2 ring-white">
                    MS
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] text-xs font-bold ring-2 ring-white">
                    GS
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--media-violet)] text-white text-xs font-bold ring-2 ring-white">
                    BK
                  </span>
                </div>
                <p className="text-[15px] text-[var(--color-text-secondary)] font-normal">
                  Trusted by <span className="font-semibold text-[var(--color-ink)]">50,000+</span> analysts, CFOs &amp; equity funds
                </p>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-[var(--color-ink)] tracking-tight leading-[1.04] max-w-[580px]">
                Analyze company financials &amp; valuations in{" "}
                <span className="underline decoration-[var(--color-brand)] decoration-4 underline-offset-4">
                  seconds
                </span>
                .
              </h1>

              {/* Description */}
              <p className="text-[18px] text-[var(--color-text-secondary)] leading-relaxed max-w-[560px]">
                Build automated Discounted Cash Flow models, audit 10-K SEC filings with AI, and benchmark valuation multiples across 40,000+ global equities. No broken spreadsheets required.
              </p>

              {/* CTA Group */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <a
                    href="#demo"
                    className="btn-brand-primary"
                  >
                    Start Free Valuation <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="#features"
                    className="btn-brand-secondary"
                  >
                    Explore Models
                  </a>
                </div>
                <p className="text-[14px] text-[var(--color-text-muted)]">
                  No credit card required &bull; 5 free full valuation reports included
                </p>
              </div>
            </div>

            {/* Right Column (48%): Product Preview */}
            <div className="lg:col-span-6" id="demo">
              <div className="relative rounded-[20px] bg-[var(--color-ink)] p-5 sm:p-6 text-white shadow-2xl border border-white/10 overflow-hidden">
                {/* Header Bar of the Tool UI */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold text-xs tracking-wider">
                      NVDA &bull; NASDAQ
                    </span>
                    <span className="text-sm font-semibold text-white">NVIDIA Corp Valuation Model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)] animate-pulse"></span>
                    <span className="text-xs text-[var(--color-text-muted)]">Live SEC Data</span>
                  </div>
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                  <div className="bg-[var(--color-ink-soft)] p-3.5 rounded-xl border border-white/5">
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Intrinsic Value (DCF)</p>
                    <p className="text-xl font-bold text-[var(--color-brand)] mt-1">$148.50</p>
                    <span className="text-[11px] text-[var(--color-brand)] font-medium">+18.4% upside</span>
                  </div>
                  <div className="bg-[var(--color-ink-soft)] p-3.5 rounded-xl border border-white/5">
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Implied EV/EBITDA</p>
                    <p className="text-xl font-bold text-white mt-1">28.4x</p>
                    <span className="text-[11px] text-[var(--color-text-muted)]">Peer Avg: 32.1x</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-[var(--color-ink-soft)] p-3.5 rounded-xl border border-white/5">
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">WACC Baseline</p>
                    <p className="text-xl font-bold text-[var(--media-blue)] mt-1">9.2%</p>
                    <span className="text-[11px] text-[var(--media-blue)]">Cost of Equity: 10.4%</span>
                  </div>
                </div>

                {/* Simulated Financial Model Sliders */}
                <div className="bg-[#242424] p-4 rounded-xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3.5 h-3.5 text-[var(--color-brand)]" /> 5-Year Revenue CAGR Assumption
                    </span>
                    <span className="font-bold text-[var(--color-brand)]">34.0%</span>
                  </div>
                  <div className="w-full bg-[var(--color-ink-soft)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--color-brand)] h-full w-[68%] rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
                      <Activity className="w-3.5 h-3.5 text-[var(--media-blue)]" /> Terminal FCF Margin
                    </span>
                    <span className="font-bold text-[var(--media-blue)]">48.5%</span>
                  </div>
                  <div className="w-full bg-[var(--color-ink-soft)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--media-blue)] h-full w-[75%] rounded-full"></div>
                  </div>
                </div>

                {/* AI Statement Summary Snippet */}
                <div className="mt-4 p-3.5 bg-[var(--color-ink-soft)]/90 rounded-xl border border-[var(--color-brand)]/20 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[var(--color-brand)] shrink-0 mt-0.5" />
                  <p className="text-xs text-white/90 leading-relaxed">
                    <strong className="text-[var(--color-brand)]">AI Analyst Audit:</strong> Data Center gross margins expanded +310bps QoQ. Free cash flow conversion at 54% of revenue supports the $148 intrinsic valuation thesis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Logo / Trust Strip (Section 10) */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-10">
          <div className="site-container">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Review Score Panel */}
              <div className="flex items-center gap-4 shrink-0 pr-8 lg:border-r border-[var(--color-border)]">
                <div className="flex gap-1 text-[var(--color-ink)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-ink)] text-[var(--color-ink)]" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-ink)]">4.9 / 5.0 Rating</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Across G2 &bull; Trustpilot &bull; Capterra</p>
                </div>
              </div>

              {/* Monochrome Financial Partner Integrations */}
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-8 sm:gap-12 opacity-70 grayscale">
                <span className="font-bold tracking-widest text-sm text-[var(--color-ink)]">SEC EDGAR</span>
                <span className="font-bold tracking-wider text-sm text-[var(--color-ink)]">BLOOMBERG API</span>
                <span className="font-bold tracking-wider text-sm text-[var(--color-ink)]">NASDAQ DATA LINK</span>
                <span className="font-bold tracking-wider text-sm text-[var(--color-ink)]">REFINITIV</span>
                <span className="font-bold tracking-wider text-sm text-[var(--color-ink)]">S&amp;P GLOBAL</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Text-led Intro Panel (Section 7B) */}
        <section className="site-container py-16 md:py-24">
          <div className="intro-panel">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight">
                  The modern standard for institutional-grade financial analysis.
                </h2>
              </div>
              <div className="lg:col-span-6 space-y-4">
                <p className="text-[17px] text-[var(--color-text-secondary)] leading-relaxed">
                  Traditional equity research is slowed down by error-prone spreadsheets, manual 10-K parsing, and disconnected tools. Finlyzer unifies automated DCF valuation models, real-time SEC data feeds, and AI-powered audit copilots into one high-salience platform.
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <Check className="w-4 h-4 text-[var(--color-brand)] stroke-[3]" /> 40,000+ Equities
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <Check className="w-4 h-4 text-[var(--color-brand)] stroke-[3]" /> 100% Audited Formulas
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <Check className="w-4 h-4 text-[var(--color-brand)] stroke-[3]" /> Instant Export to Excel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Feature Detail Split Sections (Section 7C - Alternating Layout) */}
        <section id="features" className="site-container py-8 space-y-24 md:space-y-32">
          {/* Split 1: Automated DCF (Visual Left, Copy Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-[18px] bg-[var(--color-surface-subtle)] p-6 sm:p-8 border border-[var(--color-border)] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <span className="font-bold text-[var(--color-ink)] text-sm">Discounted Cash Flow Model (5-Year Unlevered)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] font-semibold">
                    Dynamic Link
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-2 px-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Free Cash Flow to Firm (FY26E)</span>
                    <span className="font-bold text-[var(--color-ink)]">$38.4B</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Discount Factor (PV @ 8.8%)</span>
                    <span className="font-bold text-[var(--color-ink)]">0.841</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Cumulative PV of FCF</span>
                    <span className="font-bold text-[var(--color-ink)]">$164.8B</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-[var(--color-ink)] text-white rounded-lg">
                    <span className="text-[var(--color-text-muted)]">Estimated Equity Value / Share</span>
                    <span className="font-bold text-[var(--color-brand)]">$184.20</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="feature-badge">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-on-brand)]" /> Automated DCF &amp; Valuation
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight">
                Institutional DCF models generated in one click.
              </h3>
              <p className="text-[17px] text-[var(--color-text-secondary)] leading-relaxed">
                Connect directly to SEC filings to build dynamic, audited Discounted Cash Flow models. Adjust WACC, perpetual growth rates, and EBITDA margins on the fly with live sensitivity matrices.
              </p>
              <div className="pt-2">
                <a href="#demo" className="text-[16px] font-semibold text-[var(--color-ink)] underline decoration-[var(--color-ink)] underline-offset-4 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1.5">
                  See how automated sensitivity tables work <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Split 2: AI Statement Audit (Copy Left, Visual Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="feature-badge">
                <Cpu className="w-3.5 h-3.5 text-[var(--color-on-brand)]" /> AI 10-K &amp; Filing Copilot
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight">
                Interrogate annual reports with specialized financial AI.
              </h3>
              <p className="text-[17px] text-[var(--color-text-secondary)] leading-relaxed">
                Ask targeted questions about off-balance sheet liabilities, revenue recognition policies, or executive compensation changes. Finlyzer citations link straight to specific paragraphs in the source 10-K and 10-Q documents.
              </p>
              <div className="pt-2">
                <a href="#demo" className="text-[16px] font-semibold text-[var(--color-ink)] underline decoration-[var(--color-ink)] underline-offset-4 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1.5">
                  Explore AI SEC filing queries <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-[18px] bg-[var(--color-ink)] p-6 sm:p-8 text-white border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] pb-3 border-b border-white/10">
                  <Search className="w-4 h-4 text-[var(--color-brand)]" /> Query: &quot;Identify key margin risks cited in Item 1A&quot;
                </div>
                <div className="bg-[var(--color-ink-soft)] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]"></span>
                    <span className="text-xs font-bold text-white">Item 1A Risk Factor Extraction</span>
                  </div>
                  <p className="text-xs text-[#E5E5E5] leading-relaxed">
                    &quot;Raw material wafer procurement cost escalated 8.2% YoY. Supply concentration in Foundry partners represents primary operational margin bottleneck.&quot;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                    <span>Source: Form 10-K, Page 42, Paragraph 3</span>
                    <span className="text-[var(--color-brand)] font-semibold cursor-pointer hover:underline">
                      View Raw Citation &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Split 3: Comparable Multiples (Visual Left, Copy Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-[18px] bg-[var(--color-surface-subtle)] p-6 sm:p-8 border border-[var(--color-border)] space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <span className="font-bold text-[var(--color-ink)] text-sm">Enterprise Multiples Peer Matrix</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">Updated 15 mins ago</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-4 font-semibold text-[var(--color-text-secondary)] px-3 py-1">
                    <span>Ticker</span>
                    <span>EV/EBITDA</span>
                    <span>P/E (NTM)</span>
                    <span>FCF Yield</span>
                  </div>
                  <div className="grid grid-cols-4 items-center bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] font-medium">
                    <span className="font-bold text-[var(--color-ink)]">NVDA</span>
                    <span>28.4x</span>
                    <span>31.2x</span>
                    <span className="text-[var(--color-ink)] font-semibold">3.8%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] font-medium">
                    <span className="font-bold text-[var(--color-ink)]">AMD</span>
                    <span>24.1x</span>
                    <span>27.8x</span>
                    <span className="text-[var(--color-ink)] font-semibold">2.9%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center bg-[var(--color-brand-soft)] p-3 rounded-lg border border-[var(--color-brand)]/30 font-medium">
                    <span className="font-bold text-[var(--color-on-brand)]">Peer Median</span>
                    <span className="font-bold text-[var(--color-on-brand)]">26.2x</span>
                    <span className="font-bold text-[var(--color-on-brand)]">29.5x</span>
                    <span className="font-bold text-[var(--color-on-brand)]">3.3%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <div className="feature-badge">
                <PieChart className="w-3.5 h-3.5 text-[var(--color-on-brand)]" /> Multi-Asset Comps
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight">
                Instant peer group multiples and market benchmarking.
              </h3>
              <p className="text-[17px] text-[var(--color-text-secondary)] leading-relaxed">
                Compare EV/Sales, EV/EBITDA, and Price-to-Earnings ratios against custom industry peer groups. Standardized GAAP-to-Non-GAAP reconciliation ensures accurate apples-to-apples evaluation.
              </p>
              <div className="pt-2">
                <a href="#demo" className="text-[16px] font-semibold text-[var(--color-ink)] underline decoration-[var(--color-ink)] underline-offset-4 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1.5">
                  Explore peer benchmarking templates <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Dark Editorial Card Section (Section 10B: "More from Finlyzer Hub") */}
        <section id="hub" className="dark-editorial-section py-20 md:py-28 mt-20">
          <div className="site-container space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
                FINANCIAL TOOLS HUB
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                More tools to power your investment workflow.
              </h2>
              <p className="text-[17px] text-[var(--color-text-muted)]">
                Explore specialized analytical suites built for private equity, investment banking, and retail research.
              </p>
            </div>

            {/* 3-Column Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="dark-editorial-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="h-44 rounded-xl bg-[#242424] p-4 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--media-blue)]/20 text-[var(--media-blue)]">
                        PORTFOLIO RISK
                      </span>
                      <BarChart3 className="w-4 h-4 text-[var(--media-blue)]" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-[var(--color-text-muted)]">Monte Carlo 10,000 Iterations</p>
                      <p className="text-xl font-bold text-white">95% VaR: -6.4%</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Monte Carlo Risk Engine</h3>
                  <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed">
                    Simulate extreme macro stress tests, tail-risk probabilities, and sector correlation shifts across your active holdings.
                  </p>
                </div>
                <a
                  href="#demo"
                  className="btn-brand-primary w-full text-center"
                >
                  Launch Simulator
                </a>
              </div>

              {/* Card 2 */}
              <div className="dark-editorial-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="h-44 rounded-xl bg-[#242424] p-4 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--media-violet)]/20 text-[var(--media-violet)]">
                        M&amp;A / LBO
                      </span>
                      <Layers className="w-4 h-4 text-[var(--media-violet)]" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-[var(--color-text-muted)]">Target IRR @ 4.5x Leverage</p>
                      <p className="text-xl font-bold text-white">22.8% Returns</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">LBO &amp; M&amp;A Scenario Suite</h3>
                  <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed">
                    Model debt tranches, interest coverage covenants, debt paydown schedules, and exit multiples with institutional precision.
                  </p>
                </div>
                <a
                  href="#demo"
                  className="btn-brand-primary w-full text-center"
                >
                  Build LBO Model
                </a>
              </div>

              {/* Card 3 */}
              <div className="dark-editorial-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="h-44 rounded-xl bg-[#242424] p-4 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--media-pink)]/20 text-[var(--media-pink)]">
                        DIVIDEND &amp; YIELD
                      </span>
                      <TrendingUp className="w-4 h-4 text-[var(--media-pink)]" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-[var(--color-text-muted)]">Payout Ratio Sustainability</p>
                      <p className="text-xl font-bold text-white">100% Safe Rating</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Dividend Cash Flow Predictor</h3>
                  <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed">
                    Forecast future dividend payouts, free cash flow coverage safety scores, and reinvestment compounding trajectories.
                  </p>
                </div>
                <a
                  href="#demo"
                  className="btn-brand-primary w-full text-center"
                >
                  Analyze Yields
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Final High-Contrast CTA Section */}
        <section className="site-container py-20 md:py-28 text-center space-y-8">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-ink)] tracking-tight leading-tight">
              Ready to elevate your financial analysis?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Join thousands of analysts, investors, and CFOs building valuation models in minutes with Finlyzer.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#demo"
                className="btn-brand-primary"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#demo"
                className="btn-brand-secondary"
              >
                Schedule Enterprise Demo
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Clean Institutional Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-14">
        <div className="site-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[var(--color-border)]">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-ink)]">
                <span className="w-7 h-7 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)]">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                </span>
                <span>Finlyzer</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
                Next-generation financial tool hub for automated DCF modeling, AI SEC filing investigation, and equity research.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-[var(--color-ink)]">Valuation Tools</h4>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><a href="#features" className="hover:text-[var(--color-ink)] transition-colors">DCF Valuation</a></li>
                <li><a href="#features" className="hover:text-[var(--color-ink)] transition-colors">Comps Analysis</a></li>
                <li><a href="#features" className="hover:text-[var(--color-ink)] transition-colors">WACC Calculator</a></li>
                <li><a href="#hub" className="hover:text-[var(--color-ink)] transition-colors">LBO Model</a></li>
              </ul>
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-[var(--color-ink)]">Financial Hub</h4>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><a href="#features" className="hover:text-[var(--color-ink)] transition-colors">SEC 10-K Copilot</a></li>
                <li><a href="#hub" className="hover:text-[#171717] transition-colors">Monte Carlo Risk</a></li>
                <li><a href="#hub" className="hover:text-[#171717] transition-colors">Dividend Forecast</a></li>
                <li><a href="#demo" className="hover:text-[#171717] transition-colors">Excel Add-in</a></li>
              </ul>
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-[var(--color-ink)]">Company</h4>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Security &amp; SOC2</a></li>
                <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[var(--color-ink)] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
            <p>&copy; {new Date().getFullYear()} Finlyzer Inc. All rights reserved.</p>
            <p>Financial data provided for research &amp; analytical modeling purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
