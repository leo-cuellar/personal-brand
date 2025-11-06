import { Metadata } from "next";
import { PublicationTopicsPage } from "./components/PublicationTopicsPage";

export const metadata: Metadata = {
    title: "Publication Topics | Social Assistant",
    description: "Manage your publication topics for content generation",
};

export default function Page() {
    return <PublicationTopicsPage />;
}

