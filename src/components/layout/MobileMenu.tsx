'use client';

import React, { useEffect } from 'react';

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
                className={`fixed left-0 top-0 h-full w-80 bg-panel transform transition-transform duration-300 ease-in-out z-50 lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 bg-panel shadow-sm text-primary hover:bg-chip rounded-full transition-colors border border-line"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
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
