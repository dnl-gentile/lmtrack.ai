'use client';

import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface TopBarProps {
    isMenuOpen: boolean;
    onMenuToggle: () => void;
}

export default function TopBar({ isMenuOpen, onMenuToggle }: TopBarProps) {
    return (
        <header className="sticky top-0 z-50 grid h-14 grid-cols-[40px_1fr_40px] items-center border-b border-line bg-background/95 px-2 backdrop-blur-md lg:hidden">
            <button
                onClick={onMenuToggle}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-chip"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
                {isMenuOpen ? (
                    <PanelLeftClose className="h-5 w-5" strokeWidth={1.8} />
                ) : (
                    <PanelLeftOpen className="h-5 w-5" strokeWidth={1.8} />
                )}
            </button>

            <div aria-hidden="true" />

            <div className="h-9 w-9" aria-hidden="true" />
        </header>
    );
}
