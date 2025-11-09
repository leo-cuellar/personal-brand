import { Metadata } from "next";
import { PublicationTopicsPage } from "./components/PublicationTopicsPage";

export const metadata: Metadata = {
    title: "Publication Categories | Social Assistant",
    description: "Manage your publication topics for content generation",
};

export default function Page() {
    return <PublicationTopicsPage />;
}

