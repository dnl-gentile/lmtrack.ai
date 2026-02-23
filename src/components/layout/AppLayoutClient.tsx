"use client";

import React, { useState } from "react";
import { ListOrdered, Database, Gauge } from "lucide-react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileMenu from "@/components/layout/MobileMenu";
import NavLink from "@/components/layout/NavLink";
import LogoMenu from "@/components/layout/LogoMenu";
import Footer from "@/components/layout/Footer";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isLeaderboardDomainPage =
        pathname.startsWith("/leaderboard/") && pathname !== "/leaderboard";
    const hideFooter = isLeaderboardDomainPage || pathname === "/speed-test";
    const mainClassName = isLeaderboardDomainPage
        ? "flex min-h-0 flex-1 flex-col overflow-y-auto bg-background lg:overflow-hidden"
        : "flex min-h-0 flex-1 flex-col overflow-y-auto bg-background";
    const contentClassName = isLeaderboardDomainPage
        ? "relative w-full px-4 pt-0 pb-6 lg:h-full lg:min-h-0 lg:px-6 lg:pt-0 lg:pb-0"
        : "relative w-full px-4 pt-0 pb-6 lg:px-6 lg:pt-0 lg:pb-8";

    return (
        <div className="flex h-screen flex-col lg:flex-row">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar
                    isMenuOpen={mobileMenuOpen}
                    onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
                />

                <MobileMenu
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                >
                    <div className="flex h-full flex-col gap-1.5 px-2.5 pb-3.5 pt-4">
                        <div className="px-0.5 py-0.5">
                            <LogoMenu />
                        </div>

                        <nav className="mt-0.5 flex flex-col gap-1 px-0.5">
                            <NavLink
                                href="/speed-test"
                                label="Speed Test"
                                icon={<Gauge className="h-[18px] w-[18px]" strokeWidth={1.6} />}
                            />
                            <NavLink
                                href="/leaderboard"
                                label="Leaderboard"
                                icon={<ListOrdered className="h-[18px] w-[18px]" strokeWidth={1.6} />}
                            />
                            <NavLink
                                href="/records"
                                label="Records"
                                icon={<Database className="h-[18px] w-[18px]" strokeWidth={1.6} />}
                            />
                        </nav>
                    </div>
                </MobileMenu>

                <main className={mainClassName}>
                    <div className={contentClassName}>
                        {children}
                    </div>
                    <div className={hideFooter ? "hidden" : ""}>
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
}
