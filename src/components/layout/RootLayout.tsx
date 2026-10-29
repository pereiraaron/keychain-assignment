import { Outlet, ScrollRestoration } from "react-router";

/** Wraps every page. Scrolls to the top on navigation and restores position on back/forward. */
export const RootLayout = () => (
  <>
    <Outlet />
    <ScrollRestoration />
  </>
);
