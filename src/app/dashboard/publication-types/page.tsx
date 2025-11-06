import { Metadata } from "next";
import { PublicationTypesPage } from "./components/PublicationTypesPage";

export const metadata: Metadata = {
    title: "Publication Types | Social Assistant",
    description: "Manage your publication types for content generation",
};

export default function Page() {
    return <PublicationTypesPage />;
}
