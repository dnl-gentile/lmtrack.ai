import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how market.ai combines quality scores and pricing data to compute model value.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)]">
      {/* Top Header with Logo to return home */}
      <header className="flex items-center justify-between pb-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/market-ai-logo.png"
            alt="market.ai logo"
            width={32}
            height={32}
            className="rounded-md shadow-sm border border-line"
          />
          <span className="text-xl font-bold tracking-tight text-primary mt-0.5">Market</span>
        </Link>
        <div className="flex items-center gap-4 text-muted">
          <button title="Theme toggle (coming soon)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl w-full flex-grow space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-serif text-primary tracking-tight">About Us</h1>
          <p className="text-muted leading-relaxed text-[17px]">
            Created to help developers and businesses navigate the complex landscape of AI models, market.ai is an independent platform for understanding AI performance and cost in the real world. Thousands of builders use market.ai to find the best value frontier models, combining quality benchmarks with API pricing so teams can choose models based on both performance and cost-efficiency.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-line rounded-lg hover:bg-chip transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              View Blog
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-line rounded-lg hover:bg-chip transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              How it works
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-line rounded-lg hover:bg-chip transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              FAQ
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-6 p-6 rounded-2xl bg-[#fafafa] dark:bg-panel border border-transparent dark:border-line items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-chip rounded-full flex items-center justify-center shadow-sm border border-line/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary">Our Mission</h3>
              <p className="text-muted mt-1 leading-relaxed text-[15px]">To measure and surface the true value of AI models for real-world use cases.</p>
            </div>
          </div>

          <div className="flex gap-6 p-6 rounded-2xl bg-[#fafafa] dark:bg-panel border border-transparent dark:border-line items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-chip rounded-full flex items-center justify-center shadow-sm border border-line/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary">Our Vision</h3>
              <p className="text-muted mt-1 leading-relaxed text-[15px]">To build the foundation for everyone to understand, compare, and benefit from the economics of AI.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-primary">Join the Team</h3>
            <p className="text-muted text-[15px]">Check out open roles on our job board.</p>
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium text-[15px] inline-flex items-center gap-1">Open Roles <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg></a>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-primary">Join The Community</h3>
            <p className="text-muted text-[15px]">Jump in to connect, discuss, and shape transparent AI evaluations together</p>
            <div className="flex items-center gap-4 pt-1">
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium text-[15px] inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 4.6l-2-1c-1.3-.6-2.7-.8-4.1-.8h-2.3c-1.4 0-2.8.3-4.1.8l-2 1c-1.6.8-2.6 2.4-2.8 4.2L2 11.2c-.3 2.9.8 5.7 2.8 7.8 1.4 1.5 3.3 2.5 5.3 2.8l1.3.2h1.2l1.3-.2c2.1-.3 3.9-1.3 5.3-2.8 2-2 3.1-4.9 2.8-7.8l-.1-2.4c-.2-1.8-1.2-3.4-2.8-4.2zM8.5 13.9c-.8 0-1.5-.7-1.5-1.5 0-.8.7-1.5 1.5-1.5.8 0 1.5.7 1.5 1.5 0 .8-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5 0-.8.7-1.5 1.5-1.5.8 0 1.5.7 1.5 1.5 0 .8-.7 1.5-1.5 1.5z" /></svg>
                Discord
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium text-[15px] inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                X/Twitter
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium text-[15px] inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Sitemap */}
      <footer className="mt-20 pt-16 border-t border-line/60 pb-8 text-[13px] text-muted-foreground w-full">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="space-y-4">
            <h4 className="font-semibold text-muted uppercase tracking-wider text-[11px]">Use Cases</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-primary transition-colors">Chat with AI</Link>
              <Link href="#" className="hover:text-primary transition-colors">Build Apps & Websites</Link>
              <Link href="#" className="hover:text-primary transition-colors">Write & Edit Text</Link>
              <Link href="#" className="hover:text-primary transition-colors">Search the Web</Link>
              <Link href="#" className="hover:text-primary transition-colors">Generate Images</Link>
              <Link href="#" className="hover:text-primary transition-colors">Generate Videos</Link>
              <Link href="#" className="hover:text-primary transition-colors">Choose any model</Link>
              <Link href="/compare" className="hover:text-primary transition-colors">Compare Models Side by Side</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-muted uppercase tracking-wider text-[11px]">Leaderboard Rankings</h4>
            <div className="flex flex-col gap-3">
              <Link href="/leaderboard" className="hover:text-primary transition-colors">Overall</Link>
              <Link href="/leaderboard/overall" className="hover:text-primary transition-colors">Text</Link>
              <Link href="/leaderboard/coding" className="hover:text-primary transition-colors">Code</Link>
              <Link href="#" className="hover:text-primary transition-colors">Text to Image</Link>
              <Link href="#" className="hover:text-primary transition-colors">Image Edit</Link>
              <Link href="#" className="hover:text-primary transition-colors">Text to Video</Link>
              <Link href="#" className="hover:text-primary transition-colors">Image to Video</Link>
              <Link href="#" className="hover:text-primary transition-colors">Vision</Link>
              <Link href="#" className="hover:text-primary transition-colors">Search</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-muted uppercase tracking-wider text-[11px]">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/about#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="/jobs" className="hover:text-primary transition-colors">Careers</Link>
              <Link href="#" className="hover:text-primary transition-colors">Changelog</Link>
              <Link href="/help" className="hover:text-primary transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-muted uppercase tracking-wider text-[11px]">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-muted uppercase tracking-wider text-[11px]">Follow</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-primary transition-colors">X</Link>
              <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-primary transition-colors">YouTube</Link>
              <Link href="#" className="hover:text-primary transition-colors">Discord</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-line/60">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/market-ai-logo.png"
              alt="market.ai logo"
              width={24}
              height={24}
              className="rounded-md shadow-[0_0_1px_rgba(0,0,0,0.5)] border border-line"
            />
            <span className="text-lg font-bold tracking-tight text-primary mt-0.5">market</span>
          </Link>
          <span className="mt-4 md:mt-0">© market.ai 2026</span>
        </div>
      </footer>
    </div>
  );
}
