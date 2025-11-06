import { Metadata } from "next";
import { PublicationsPage } from "./components/PublicationsPage";

export const metadata: Metadata = {
    title: "Publications | Social Assistant",
    description: "Manage your publications",
};

export default function Page() {
    return <PublicationsPage />;
}

