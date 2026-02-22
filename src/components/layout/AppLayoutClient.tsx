"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ListOrdered, ArrowLeftRight, CircleDollarSign } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileMenu from "@/components/layout/MobileMenu";
import NavLink from "@/components/layout/NavLink";
import LogoMenu from "@/components/layout/LogoMenu";
import GlobalFilters from "@/components/filters/GlobalFilters";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-x-hidden min-h-screen">
                <TopBar onMenuOpen={() => setMobileMenuOpen(true)} />

                <MobileMenu
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                >
                    <div className="flex flex-col gap-3 p-3.5 h-full">
                        <div className="px-2 py-2">
                            <LogoMenu />
                        </div>

                        <nav className="flex flex-col gap-1 mt-4">
                            <NavLink
                                href="/leaderboard"
                                label="Leaderboard"
                                icon={<ListOrdered className="w-5 h-5 text-muted" strokeWidth={1.5} />}
                            />
                            <NavLink
                                href="/compare"
                                label="Compare"
                                icon={<ArrowLeftRight className="w-5 h-5 text-muted" strokeWidth={1.5} />}
                            />
                            <NavLink
                                href="/pricing"
                                label="Pricing"
                                icon={<CircleDollarSign className="w-5 h-5 text-muted" strokeWidth={1.5} />}
                            />
                        </nav>

                        <div className="flex-1 mt-4">
                            <GlobalFilters />
                        </div>
                    </div>
                </MobileMenu>

                <main className="flex-1 p-4 lg:p-6 w-full relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
