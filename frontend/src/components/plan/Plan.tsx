import { useState } from "react";
import {
	Title,
	Text,
	Container,
	Grid,
	Card,
	Slider,
	Button,
	Loader,
	Alert,
	Timeline,
	ThemeIcon,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconBook,
	IconToolsKitchen2,
	IconMovie,
	IconSun,
	IconHome,
	IconCheck,
	IconCode,
} from "@tabler/icons-react";

// 1. Define a type for the new plan item structure
type PlanItem = {
	title: string;
	reminder: string;
};

// Helper function to select a relevant icon based on the title
const getIconForTitle = (title: string) => {
	const lowerCaseTitle = title.toLowerCase();
	if (lowerCaseTitle.includes("study")) return <IconBook size="1rem" />;
	if (lowerCaseTitle.includes("cook")) return <IconToolsKitchen2 size="1rem" />;
	if (
		lowerCaseTitle.includes("entertainment") ||
		lowerCaseTitle.includes("movie")
	)
		return <IconMovie size="1rem" />;
	if (lowerCaseTitle.includes("out")) return <IconSun size="1rem" />;
	if (lowerCaseTitle.includes("chores")) return <IconHome size="1rem" />;
	if (
		lowerCaseTitle.includes("program") ||
		lowerCaseTitle.includes("code") ||
		lowerCaseTitle.includes("project")
	)
		return <IconCode size="1rem" />;
	return <IconCheck size="1rem" />;
};

function Plan() {
	// 2. Update the state to hold an array of PlanItem objects
	const [plan, setPlan] = useState<PlanItem[]>([]);
	const [numEntries, setNumEntries] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// This function seems to remove a "json\n```" wrapper from the backend response
	const parseData = (data: string): PlanItem[] => {
		const jsonString = data.substring(7, data.length - 3).trim();
		return JSON.parse(jsonString);
	};

	const handleGeneratePlan = async () => {
		setLoading(true);
		setError(null);
		setPlan([]);

		try {
			// Note: Sending n as a query parameter in a POST request is unusual,
			// but this matches your provided code.
			const response = await fetch(`/api/plan/?n=${numEntries}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch the plan from the server.");
			}

			const data = await response.json();

			// 3. Parse the raw string and set the state with the resulting array of objects
			const parsedPlan = parseData(data.plan);
			setPlan(parsedPlan);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size="md">
			<Grid gutter="xl">
				{/* Left Column: Controls (No changes needed here) */}
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Card shadow="sm" padding="lg" radius="md" withBorder>
						<Title order={2} ta="center" mb="lg">
							Plan Your Day
						</Title>
						<Text size="sm" c="dimmed" mb="xl">
							Get a personalized plan based on your recent journal entries.
						</Text>

						<Text fw={500}>How many past entries to consider?</Text>
						<Slider
							value={numEntries}
							onChange={setNumEntries}
							min={0}
							max={10}
							label={(value) => `${value} entries`}
							marks={[
								{ value: 0, label: "0" },
								{ value: 5, label: "5" },
								{ value: 10, label: "10" },
							]}
							mb="xl"
						/>

						<Button
							fullWidth
							onClick={handleGeneratePlan}
							loading={loading}
							size="md"
							variant="gradient"
							gradient={{ from: "blue", to: "cyan" }}
						>
							Generate Plan
						</Button>
					</Card>
				</Grid.Col>

				{/* Right Column: Display Plan */}
				<Grid.Col span={{ base: 12, md: 8 }}>
					{loading && (
						<Card
							withBorder
							radius="md"
							p="xl"
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								minHeight: "200px",
							}}
						>
							<Loader />
						</Card>
					)}

					{error && (
						<Alert
							icon={<IconAlertCircle size="1rem" />}
							title="Error!"
							color="red"
							radius="md"
						>
							{error}
						</Alert>
					)}

					{plan.length > 0 && (
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} mb="lg">
								Your Recommended Plan for Today
							</Title>
							{/* 4. Update the Timeline to render the new data structure */}
							<Timeline active={-1} bulletSize={32} lineWidth={2}>
								{plan.map((item, index) => (
									<Timeline.Item
										key={index}
										bullet={
											<ThemeIcon size={32} radius="xl" variant="filled">
												{getIconForTitle(item.title)}
											</ThemeIcon>
										}
										// Use the title from the data
										title={item.title}
									>
										{/* Use the reminder from the data for the description */}
										<Text c="dimmed" size="sm">
											{item.reminder}
										</Text>
									</Timeline.Item>
								))}
							</Timeline>
						</Card>
					)}
				</Grid.Col>
			</Grid>
		</Container>
	);
}

export default Plan;
