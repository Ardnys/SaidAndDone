import { createBrowserRouter } from "react-router-dom";
import App from "../App.tsx";
import { JournalWorkflow } from "../components/record/JournalWorkflow.tsx";
import Plan from "../components/plan/Plan.tsx";
import Entries from "../components/journal/Entries.tsx";
import Home from "../components/Home.tsx";
import JournalViewPage from "../components/journal/JournalViewPage.tsx";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/record",
				element: <JournalWorkflow />,
			},
			{
				path: "/plan",
				element: <Plan />,
			},
			{
				path: "/journal",
				element: <Entries />,
			},
			{
				path: "/journal/:id",
				element: <JournalViewPage />,
			},
			// {
			// 	path: "/editor",
			// }
		],
	},
]);
