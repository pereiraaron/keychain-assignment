import { createBrowserRouter, useParams } from "react-router";
import { RouterProvider } from "react-router/dom";
import { NotFound } from "@components/layout/NotFound";
import { RootLayout } from "@components/layout/RootLayout";
import { BuilderPage } from "@pages/BuilderPage";
import { FillPage } from "@pages/FillPage";
import { ResponsesPage } from "@pages/ResponsesPage";
import { TemplatesPage } from "@pages/TemplatesPage";

import type { ComponentType } from "react";

/** Passes the `:templateId` param to a page, keyed so a different template starts fresh. */
const TemplateRoute = ({ page: Page }: { page: ComponentType<{ templateId: string }> }) => {
  const { templateId = "" } = useParams();
  return <Page key={templateId} templateId={templateId} />;
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <TemplatesPage /> },
      { path: "/templates/:templateId", element: <TemplateRoute page={BuilderPage} /> },
      { path: "/templates/:templateId/fill", element: <TemplateRoute page={FillPage} /> },
      { path: "/templates/:templateId/responses", element: <TemplateRoute page={ResponsesPage} /> },
      { path: "*", element: <NotFound message="There's nothing at this address." /> },
    ],
  },
]);

export const App = () => <RouterProvider router={router} />;
