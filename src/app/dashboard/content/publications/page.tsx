import { Metadata } from "next";
import { PublicationsContainer } from "./components/PublicationsContainer";

export const metadata: Metadata = {
    title: "Publications | Social Assistant",
    description: "Manage your publications",
};

export default function Page() {
    return <PublicationsContainer />;
}

