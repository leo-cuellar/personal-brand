import { Metadata } from "next";
import { PublicationIdeasPage } from "./components/PublicationIdeasPage";

export const metadata: Metadata = {
    title: "Publication Ideas | Social Assistant",
    description: "Manage your publication ideas",
};

export default function Page() {
    return <PublicationIdeasPage />;
}

