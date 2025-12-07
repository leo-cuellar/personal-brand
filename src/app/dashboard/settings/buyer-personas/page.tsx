import { Metadata } from "next";
import { BuyerPersonasPage } from "./components/BuyerPersonasPage";

export const metadata: Metadata = {
    title: "Reader Personas | Social Assistant",
    description: "Manage reader personas for content targeting",
};

export default function Page() {
    return <BuyerPersonasPage />;
}

