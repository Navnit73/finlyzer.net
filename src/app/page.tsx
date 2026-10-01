import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Palette,
  CheckCircle2,
  BarChart3,
  Globe2,
} from "lucide-react";

export default function Home() {
  const themes = [
    "dark",
    "light",
    "emerald",
    "synthwave",
    "cyberpunk",
    "dracula",
    "luxury",
    "night",
    "nord",
    "sunset",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-content/10">
        <div className="navbar max-w-7xl mx-auto px-4 sm:px-8">
          <div className="navbar-start gap-2">
            <div className="dropdown lg:hidden">
              <button tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="Open menu">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#stats">Stats</a>
                </li>
                <li>
                  <a href="#components">Components</a>
                </li>
              </ul>
            </div>
            <a className="btn btn-ghost text-xl font-bold tracking-tight gap-2 flex items-center">
              <span className="p-2 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span>
                Fin<span className="text-primary">lyzer</span>
              </span>
            </a>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 font-medium gap-1">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#stats">Stats</a>
              </li>
              <li>
                <a href="#components">Components</a>
              </li>
            </ul>
          </div>

          <div className="navbar-end gap-3">
            {/* Theme Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2 normal-case"
              >
                <Palette className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Theme</span>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content bg-base-200 rounded-box z-50 w-44 p-2 shadow-2xl border border-base-content/10 max-h-60 overflow-y-auto"
              >
                {themes.map((theme) => (
                  <li key={theme}>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start capitalize font-normal"
                      aria-label={theme}
                      value={theme}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="https://daisyui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm rounded-lg"
            >
              DaisyUI Docs
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="badge badge-outline badge-primary gap-2 py-3 px-4 font-semibold">
              <Sparkles className="w-4 h-4 text-primary" /> Next.js 16 + Tailwind v4 + DaisyUI v5
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Build modern web apps at{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                lightning speed
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-base-content/70 leading-relaxed">
              Your Next.js project is fully equipped with DaisyUI component library, Tailwind CSS v4, App Router, TypeScript, and modern themes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="#components" className="btn btn-primary gap-2 shadow-lg">
                Explore Components <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/saadeghi/daisyui"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-12 bg-base-200/50 border-y border-base-content/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-100 w-full border border-base-content/10">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="stat-title">Component Classes</div>
                <div className="stat-value text-primary">60+</div>
                <div className="stat-desc">DaisyUI UI primitives included</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <Palette className="w-8 h-8" />
                </div>
                <div className="stat-title">Built-in Themes</div>
                <div className="stat-value text-secondary">32+</div>
                <div className="stat-desc">Dark, light, synthwave & more</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-accent">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div className="stat-title">Performance</div>
                <div className="stat-value text-accent">100%</div>
                <div className="stat-desc">Turbopack & Tailwind CSS v4</div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Showcase */}
        <section id="components" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Interactive DaisyUI Components</h2>
            <p className="text-base-content/70">
              Preview built-in buttons, alerts, badges, and card components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Buttons */}
            <div className="card bg-base-200/60 border border-base-content/10 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" /> Buttons & Colors
                </h3>
                <p className="text-sm text-base-content/70">
                  Semantic color system with accessible button variants.
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <button className="btn btn-primary btn-sm">Primary</button>
                  <button className="btn btn-secondary btn-sm">Secondary</button>
                  <button className="btn btn-accent btn-sm">Accent</button>
                  <button className="btn btn-neutral btn-sm">Neutral</button>
                </div>
              </div>
            </div>

            {/* Card 2: Badges & Tags */}
            <div className="card bg-base-200/60 border border-base-content/10 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-secondary" /> Badges & Status
                </h3>
                <p className="text-sm text-base-content/70">
                  Tagging and state indicators out of the box.
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <div className="badge badge-primary">Primary</div>
                  <div className="badge badge-secondary">Secondary</div>
                  <div className="badge badge-success">Success</div>
                  <div className="badge badge-warning">Warning</div>
                  <div className="badge badge-error">Error</div>
                </div>
              </div>
            </div>

            {/* Card 3: Form Controls */}
            <div className="card bg-base-200/60 border border-base-content/10 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" /> Form Inputs
                </h3>
                <p className="text-sm text-base-content/70">
                  Pre-styled inputs, toggles, and ranges.
                </p>
                <div className="flex items-center gap-4 pt-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="toggle toggle-primary"
                    aria-label="Toggle demo"
                  />
                  <input
                    type="checkbox"
                    defaultChecked
                    className="checkbox checkbox-secondary"
                    aria-label="Checkbox demo"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="60"
                    className="range range-xs range-primary flex-1"
                    aria-label="Range demo"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Component Example */}
          <div role="alert" className="alert alert-info shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h3 className="font-bold">DaisyUI is installed and ready to use!</h3>
              <div className="text-xs">
                Edit <code>src/app/page.tsx</code> to customize this page for your application.
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-16 bg-base-200/30 border-t border-base-content/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Why Next.js + DaisyUI?</h2>
              <p className="text-base-content/70">
                The fastest way to design semantic, themeable, high-performance UIs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Pure CSS Component Classes</h3>
                  <p className="text-sm text-base-content/70 mt-1">
                    No extra JavaScript runtime overhead. Clean HTML markup with utility classes like <code>btn</code>, <code>card</code>, and <code>modal</code>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Multi-Theme System</h3>
                  <p className="text-sm text-base-content/70 mt-1">
                    Seamless dark mode and dozens of pre-configured color palettes switchable with simple <code>data-theme</code> attributes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Next.js 16 & Turbopack</h3>
                  <p className="text-sm text-base-content/70 mt-1">
                    App Router, React 19 Server Components, fast Turbopack bundling, and full TypeScript support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-8 bg-base-200 text-base-content border-t border-base-content/10">
        <aside>
          <p className="font-medium">
            Finlyzer &copy; {new Date().getFullYear()} - Powered by Next.js & DaisyUI
          </p>
          <p className="text-xs text-base-content/60">
            Tailwind CSS v4 &bull; DaisyUI v5 &bull; Next.js App Router
          </p>
        </aside>
      </footer>
    </div>
  );
}

