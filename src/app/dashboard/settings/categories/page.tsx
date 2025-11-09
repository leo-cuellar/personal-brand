import { Metadata } from "next";
import { PublicationCategoriesPage } from "./components/PublicationCategoriesPage";

export const metadata: Metadata = {
    title: "Publication Categories | Social Assistant",
    description: "Manage your publication categories for content generation",
};

export default function Page() {
    return <PublicationCategoriesPage />;
}

