import { Metadata } from "next";
import { PublicationStructuresPage } from "./components/PublicationStructuresPage";

export const metadata: Metadata = {
    title: "Publication Structures | Social Assistant",
    description: "Manage publication structures",
};

export default function StructuresPage() {
    return <PublicationStructuresPage />;
}

