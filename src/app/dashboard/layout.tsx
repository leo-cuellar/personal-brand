"use client";

import { PersonSelector } from "./components/PersonSelector";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Social Assistant
                            </h1>
                        </div>
                        <PersonSelector />
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}

