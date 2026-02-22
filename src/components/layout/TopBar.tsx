'use client';

import React from 'react';
import LogoMenu from './LogoMenu';
import { Menu } from 'lucide-react';

export default function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
    return (
        <header className="lg:hidden sticky top-0 z-50 flex flex-row items-center justify-between h-14 px-4 bg-panel/95 backdrop-blur-md border-b border-line">
            <button
                onClick={onMenuOpen}
                className="p-2 -ml-2 text-primary hover:bg-chip rounded-lg transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" strokeWidth={2} />
            </button>

            <div className="flex-1 max-w-[200px] ml-2">
                <LogoMenu />
            </div>

            <div className="w-10" />
        </header>
    );
}
