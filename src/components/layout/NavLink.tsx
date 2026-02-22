'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, icon, label, collapsed }: { href: string; icon: React.ReactNode; label: string; collapsed?: boolean }) {
    const pathname = usePathname();
    const isActive = pathname?.startsWith(href);

    if (collapsed) {
        return (
            <Link
                href={href}
                title={label}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${isActive
                    ? 'bg-chip-active-bg text-primary'
                    : 'text-muted hover:bg-chip hover:text-primary'
                    }`}
            >
                {icon}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isActive
                ? 'bg-chip-active-bg border border-chip-active-border text-primary font-medium'
                : 'text-muted hover:bg-chip border border-transparent'
                }`}
        >
            <span className="flex-shrink-0">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
