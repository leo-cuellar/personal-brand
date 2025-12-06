import { Metadata } from "next";
import { TrendScannerSettingsPage } from "./components/TrendScannerSettingsPage";

export const metadata: Metadata = {
    title: "Trend Scanner Settings | Social Assistant",
    description: "Manage trend scanner settings for content discovery",
};

export default function Page() {
    return <TrendScannerSettingsPage />;
}
