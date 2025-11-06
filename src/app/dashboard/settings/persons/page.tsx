import { Metadata } from "next";
import { PersonsPage } from "./components/PersonsPage";

export const metadata: Metadata = {
    title: "Persons | Social Assistant",
    description: "Manage persons (personal brands) for content generation",
};

export default function Page() {
    return <PersonsPage />;
}

