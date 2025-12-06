"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PersonalBrandSelector } from "./components/PersonalBrandSelector";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname === path || pathname?.startsWith(path + "/");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Social Assistant
                            </h1>
                        </Link>
                        <PersonalBrandSelector />
                    </div>
                </div>
                <nav className="border-t border-gray-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="flex space-x-1 overflow-x-auto -mx-4 px-4 scrollbar-hide">
                            <Link
                                href="/dashboard"
                                className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${isActive("/dashboard")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/dashboard/trend-scanner"
                                className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${isActive("/dashboard/trend-scanner")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Trend Scanner
                            </Link>
                            <Link
                                href="/dashboard/ideas"
                                className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${isActive("/dashboard/ideas")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Ideas
                            </Link>
                            <Link
                                href="/dashboard/publications"
                                className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${isActive("/dashboard/publications")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Publications
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className={`whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${isActive("/dashboard/settings")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Settings
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
            <main>{children}</main>
        </div>
    );
}

