"use client";

import { useParams } from "next/navigation";
import { PersonalBrandPage } from "./components/PersonalBrandPage";

export default function PersonalBrandDetailPage() {
    const params = useParams();
    const personalBrandId = params["personal-brand-id"] as string;

    if (!personalBrandId) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-red-600">Personal brand ID is required</p>
                </div>
            </div>
        );
    }

    return <PersonalBrandPage personalBrandId={personalBrandId} />;
}

