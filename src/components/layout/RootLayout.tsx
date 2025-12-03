import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../ScrollToTop";
import { usePageTitle } from "@/hooks/use-page-title";

export function RootLayout() {
    usePageTitle();
    return (
        <>
            <ScrollToTop />
            <Outlet />
        </>
    );
}
