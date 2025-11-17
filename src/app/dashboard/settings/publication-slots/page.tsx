import { Metadata } from "next";
import { PublicationSlotsPage } from "./components/PublicationSlotsPage";

export const metadata: Metadata = {
    title: "Publication Slots | Social Assistant",
    description: "Configure publication queue slots",
};

export default function Page() {
    return <PublicationSlotsPage />;
}

