"use client";

import { useParams } from "next/navigation";
import { PersonalBrandPage } from "./components/PersonalBrandPage";

export default function PersonalBrandDetailPage() {
    const params = useParams();
    const username = params["username"] as string;

    if (!username) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-red-600">Username is required</p>
                </div>
            </div>
        );
    }

    // Decode username in case it was URL encoded
    const decodedUsername = decodeURIComponent(username);

    return <PersonalBrandPage username={decodedUsername} />;
}

