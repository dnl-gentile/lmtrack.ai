'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PanelLeftOpen, PanelLeftClose, ListOrdered, Database, Gauge, FileText } from 'lucide-react';
import NavLink from './NavLink';
import LogoMenu from './LogoMenu';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const footerLinks = (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-[11px] text-muted">
      <Link href="/terms-of-use" className="whitespace-nowrap transition-colors hover:text-primary">Terms of Use</Link>
      <Link href="/privacy-policy" className="whitespace-nowrap transition-colors hover:text-primary">Privacy Policy</Link>
      <Link href="/cookies" className="whitespace-nowrap transition-colors hover:text-primary">Cookies</Link>
    </div>
  );

  if (isCollapsed) {
    return (
      <aside className="sticky top-0 hidden h-screen w-[52px] flex-col items-center gap-1 border-r border-line bg-background pt-4 lg:flex">
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-4 rounded-md p-1.5 text-muted transition-colors hover:bg-chip hover:text-primary"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" strokeWidth={1.6} />
        </button>
        <NavLink href="/records" label="Records" icon={<Database className="h-[18px] w-[18px]" strokeWidth={1.6} />} collapsed />
        <NavLink href="/leaderboard" label="Leaderboard" icon={<ListOrdered className="h-[18px] w-[18px]" strokeWidth={1.6} />} collapsed />
        <NavLink href="/speed-test" label="Speed Test" icon={<Gauge className="h-[18px] w-[18px]" strokeWidth={1.6} />} collapsed />
        <div className="mt-auto w-full border-t border-line/50 py-2">
          <Link
            href="/terms-of-use"
            title="Legal"
            className="flex items-center justify-center rounded-md p-1.5 text-muted transition-colors hover:bg-chip hover:text-primary"
          >
            <FileText className="h-5 w-5" strokeWidth={1.6} />
          </Link>
        </div>
      </aside>
    );
  }

  return (
      <aside className="sticky top-0 hidden h-screen w-[240px] flex-col border-r border-line bg-background lg:flex">
      {/* Fixed header */}
      <div className="flex items-center justify-between px-2 pb-1 pt-1.5">
        <div className="flex-1">
          <LogoMenu />
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-chip hover:text-primary"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="mt-2.5 flex-1 overflow-y-auto px-1 scrollbar-hide">
        <nav className="flex flex-col gap-1">
          <NavLink
            href="/records"
            label="Records"
            icon={<Database className="h-[18px] w-[18px]" strokeWidth={1.6} />}
          />
          <NavLink
            href="/leaderboard"
            label="Leaderboard"
            icon={<ListOrdered className="h-[18px] w-[18px]" strokeWidth={1.6} />}
          />
          <NavLink
            href="/speed-test"
            label="Speed Test"
            icon={<Gauge className="h-[18px] w-[18px]" strokeWidth={1.6} />}
          />
        </nav>
      </div>

      {/* Fixed footer */}
      <div className="border-t border-line/50 px-2 py-2">
        {footerLinks}
      </div>
    </aside>
  );
}
