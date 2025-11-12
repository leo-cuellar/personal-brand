import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Social Assistant",
    description: "Social Assistant Dashboard",
};

export default function DashboardPage() {
    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to Social Assistant
                </p>
            </div>
        </div>
    );
}

