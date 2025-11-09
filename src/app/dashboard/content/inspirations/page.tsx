import type { Metadata } from "next";
import { InspirationsPage } from "./components/InspirationsPage";

export const metadata: Metadata = {
    title: "Inspirations | Social Assistant",
    description: "Manage your inspiration content for content generation",
};

export default function Page() {
    return <InspirationsPage />;
}

