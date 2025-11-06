import { Metadata } from "next";
import { StrongOpinionsPage } from "./components/StrongOpinionsPage";

export const metadata: Metadata = {
    title: "Strong Opinions | Social Assistant",
    description: "Manage your strong opinions for content generation",
};

export default function Page() {
    return <StrongOpinionsPage />;
}

