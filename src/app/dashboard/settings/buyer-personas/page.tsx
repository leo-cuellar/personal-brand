import { Metadata } from "next";
import { BuyerPersonasPage } from "./components/BuyerPersonasPage";

export const metadata: Metadata = {
    title: "Buyer Personas | Social Assistant",
    description: "Manage buyer personas for content targeting",
};

export default function Page() {
    return <BuyerPersonasPage />;
}

