'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PanelLeftOpen, PanelLeftClose, ListOrdered, ArrowLeftRight, CircleDollarSign, FileText } from 'lucide-react';
import NavLink from './NavLink';
import GlobalFilters from '@/components/filters/GlobalFilters';
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
      <aside className="hidden lg:flex flex-col items-center w-[52px] h-screen bg-panel border-r border-line py-4 gap-1">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-muted hover:text-primary hover:bg-chip rounded-lg transition-colors mb-4"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-[18px] h-[18px]" />
        </button>
        <NavLink href="/leaderboard" label="" icon={<ListOrdered className="w-[18px] h-[18px]" strokeWidth={1.5} />} collapsed />
        <NavLink href="/compare" label="" icon={<ArrowLeftRight className="w-[18px] h-[18px]" strokeWidth={1.5} />} collapsed />
        <NavLink href="/pricing" label="" icon={<CircleDollarSign className="w-[18px] h-[18px]" strokeWidth={1.5} />} collapsed />
        <div className="mt-auto w-full border-t border-line/80 pt-3 pb-2">
          <Link
            href="/terms-of-use"
            title="Legal"
            className="flex items-center justify-center p-2 text-muted hover:text-primary hover:bg-chip rounded-lg transition-colors"
          >
            <FileText className="w-[18px] h-[18px]" strokeWidth={1.7} />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col gap-3 w-[240px] h-screen overflow-y-auto bg-panel border-r border-line px-2.5 pt-2 pb-1">
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex-1 mr-2">
          <LogoMenu />
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 text-muted hover:text-primary hover:bg-chip rounded-lg transition-colors shrink-0"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 mt-3">
        <NavLink
          href="/leaderboard"
          label="Leaderboard"
          icon={<ListOrdered className="w-[18px] h-[18px] text-muted" strokeWidth={1.5} />}
        />
        <NavLink
          href="/compare"
          label="Compare"
          icon={<ArrowLeftRight className="w-[18px] h-[18px] text-muted" strokeWidth={1.5} />}
        />
        <NavLink
          href="/pricing"
          label="Pricing"
          icon={<CircleDollarSign className="w-[18px] h-[18px] text-muted" strokeWidth={1.5} />}
        />
      </nav>

      <div className="flex-1 mt-4">
        <GlobalFilters />
      </div>

      <div className="mt-auto pt-2 pb-0.5">
        {footerLinks}
      </div>
    </aside>
  );
}
