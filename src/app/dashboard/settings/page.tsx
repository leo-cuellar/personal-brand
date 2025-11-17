import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Settings | Social Assistant",
    description: "Configure your content generation settings",
};

export default function SettingsPage() {
    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">
                    Configure your content generation settings. These are more
                    static configurations used for generating ideas and publications.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href="/dashboard/settings/categories"
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
                    href="/dashboard/settings/structures"
                    className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="font-medium text-gray-900">
                        Publication Structures
                    </div>
                    <div className="text-sm text-gray-500">
                        Define flexible publication structures with dynamic fields
                    </div>
                </Link>
                <Link
                    href="/dashboard/settings/personal-brands"
                    className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="font-medium text-gray-900">
                        Personal Brands
                    </div>
                    <div className="text-sm text-gray-500">
                        Manage personal brands for content generation
                    </div>
                </Link>
                <Link
                    href="/dashboard/settings/buyer-personas"
                    className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="font-medium text-gray-900">
                        Buyer Personas
                    </div>
                    <div className="text-sm text-gray-500">
                        Manage buyer personas for content targeting
                    </div>
                </Link>
                <Link
                    href="/dashboard/settings/publication-slots"
                    className="block rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="font-medium text-gray-900">
                        Publication Slots
                    </div>
                    <div className="text-sm text-gray-500">
                        Configure queue schedule for automatic publication
                    </div>
                </Link>
            </div>
        </div>
    );
}

