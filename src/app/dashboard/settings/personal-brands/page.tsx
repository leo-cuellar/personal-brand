import { Metadata } from "next";
import { PersonalBrandsPage } from "./components/PersonalBrandsPage";

export const metadata: Metadata = {
    title: "Personal Brands | Social Assistant",
    description: "Manage personal brands for content generation",
};

export default function Page() {
    return <PersonalBrandsPage />;
}

