import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme.ts";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mdxeditor/editor/style.css";
import { router } from "./router/router.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<MantineProvider theme={theme}>
			<RouterProvider router={router} />
		</MantineProvider>
	</StrictMode>
);
