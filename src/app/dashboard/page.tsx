import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Dashboard | Social Assistant",
    description: "Manage your social media content and settings",
};

export default function DashboardPage() {
    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                    Manage your social media content and configurations
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Settings Section */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                        Settings
                    </h2>
                    <p className="mb-4 text-gray-600">
                        Configure your content generation settings. These are more
                        static configurations used for generating ideas and publications.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/settings/topics"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Publication Categories
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage categories for your publications
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/settings/types"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Publication Types
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage types of publications
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/settings/opinions"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Strong Opinions
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage your strong opinions for content generation
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/settings/persons"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Persons
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage persons (personal brands) for content generation
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Content Section */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                        Content
                    </h2>
                    <p className="mb-4 text-gray-600">
                        Manage your dynamic content. These change frequently as you
                        create and modify ideas and publications.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/content/ideas"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Publication Ideas
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage ideas for future publications
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/content/inspirations"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Inspirations
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage inspiration content - from short ideas to full LinkedIn posts
                            </div>
                        </Link>
                        <Link
                            href="/dashboard/content/publications"
                            className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                            <div className="font-medium text-gray-900">
                                Publications
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage your publications (drafts, scheduled, published)
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

