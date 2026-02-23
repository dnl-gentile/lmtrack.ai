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
                className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${isActive
                    ? 'bg-chip text-primary'
                    : 'text-primary hover:bg-chip'
                    }`}
            >
                {icon}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`flex w-full items-center gap-3 rounded-[8px] pl-2 pr-3 py-1.5 text-[14px] leading-[1.25] transition-colors ${isActive
                ? 'bg-chip text-primary'
                : 'text-primary hover:bg-chip'
                }`}
        >
            <span className="flex-shrink-0 text-current">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
