import {
	Title,
	Text,
	Container,
	Button,
	SimpleGrid,
	ThemeIcon,
	Stack,
	Box,
} from "@mantine/core";
import {
	IconMicrophone,
	IconTransform,
	IconChecklist,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./Home.module.css"; // We'll create this CSS module for the gradient text

// Define a type for feature props for easier mapping
type FeatureProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

// TODO: too much marketing for a local app. Change later
const features: FeatureProps[] = [
	{
		icon: <IconMicrophone />,
		title: "Speak, Don't Type",
		description:
			"Simply record your thoughts and daily activities. Our advanced transcription handles the rest, turning your voice into text effortlessly.",
	},
	{
		icon: <IconTransform />,
		title: "AI-Powered Journaling",
		description:
			"From your transcribed words, we generate a beautifully structured journal entry in Markdown, summarizing your day's highlights.",
	},
	{
		icon: <IconChecklist />,
		title: "Intelligent Day Planning",
		description:
			"Get smart, personalized suggestions for your day. Our AI analyzes your past entries to help you decide what to focus on next.",
	},
];

function Home() {
	return (
		<Container size="lg" py="xl">
			<Stack align="center" gap="md" mt="xl" mb={80}>
				<Title order={1} ta="center" className={classes.title}>
					Turn Your Words into{" "}
					<Text
						component="span"
						variant="gradient"
						gradient={{ from: "blue", to: "cyan" }}
						inherit
					>
						Action
					</Text>
				</Title>

				<Text c="dimmed" ta="center" size="lg" maw={600}>
					Effortlessly capture your thoughts, reflect on your progress, and plan
					your day with Said & Done—your personal AI-powered journal.
				</Text>

				<Button
					component={Link}
					to="/record"
					size="lg"
					variant="gradient"
					gradient={{ from: "blue", to: "cyan" }}
					mt="md"
				>
					Start a New Entry
				</Button>
			</Stack>

			<SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
				{features.map((feature) => (
					<Box key={feature.title}>
						<ThemeIcon
							size={44}
							radius="lg"
							variant="gradient"
							gradient={{ from: "blue", to: "cyan" }}
						>
							{feature.icon}
						</ThemeIcon>
						<Text fz="lg" mt="sm" fw={500}>
							{feature.title}
						</Text>
						<Text c="dimmed" fz="sm">
							{feature.description}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</Container>
	);
}

export default Home;
