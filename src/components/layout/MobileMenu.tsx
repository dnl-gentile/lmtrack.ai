'use client';

import React, { useEffect } from 'react';
import { PanelLeftClose } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
    // Prevent body scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Overlay Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-out Panel */}
            <div
                className={`fixed left-0 top-0 h-full w-80 bg-background transform transition-transform duration-300 ease-in-out z-50 lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-chip/60"
                        aria-label="Close menu"
                    >
                        <PanelLeftClose className="h-5 w-5" strokeWidth={1.8} />
                    </button>
                </div>

                {/* Render children (like the Sidebar content structure) inside the mobile panel */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
}
