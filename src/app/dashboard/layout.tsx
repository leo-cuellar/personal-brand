"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PersonSelector } from "./components/PersonSelector";

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
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Social Assistant
                            </h1>
                        </Link>
                        <PersonSelector />
                    </div>
                </div>
                <nav className="border-t border-gray-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="flex space-x-1">
                            <Link
                                href="/dashboard"
                                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive("/dashboard")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/dashboard/content/inspirations"
                                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive("/dashboard/content/inspirations")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Inspirations
                            </Link>
                            <Link
                                href="/dashboard/content/ideas"
                                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive("/dashboard/content/ideas")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Ideas
                            </Link>
                            <Link
                                href="/dashboard/content/publications"
                                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive("/dashboard/content/publications")
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                Publications
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className={`px-4 py-3 text-sm font-medium transition-colors ${isActive("/dashboard/settings")
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

