import { useState, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
	Title,
	Text,
	Container,
	Card,
	SimpleGrid,
	TextInput,
	Select,
	Group,
	Badge,
	Button,
	Skeleton,
	Center,
	Stack,
} from "@mantine/core";
import { IconSearch, IconNotesOff } from "@tabler/icons-react";
import axios from "axios";

type ApiEntry = {
	date: string;
	markdownContent: string;
};

type JournalEntry = {
	date: Date;
	markdownContent: string;
};

// A helper function to create a clean text snippet from Markdown
const createSnippet = (markdown: string, length = 150) => {
	const text = markdown
		//eslint-disable-next-line
		.replace(/(\#{1,6}\s)|(\*)|(\- \[.\])/g, "") // Remove headers, asterisks, and checklist syntax
		.replace(/\s+/g, " ") // Collapse multiple whitespace
		.trim();

	if (text.length <= length) return text;
	return `${text.substring(0, text.lastIndexOf(" ", length))}...`;
};

function Entries() {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

	const fetchJournalEntries = async () => {
		try {
			// TODO: make this with pagination
			const url = `/api/entries_range?start=0&end=10`;

			const response = await axios.get<ApiEntry[]>(url);

			const convertedEntries: JournalEntry[] = response.data.map((item) => {
				return {
					date: new Date(item.date),
					markdownContent: item.markdownContent,
				};
			});

			setEntries(convertedEntries);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error("Axios error fetching journal entries:", error.message);
			} else {
				console.error("An unexpected error occurred:", error);
			}
		}
	};

	useEffect(() => {
		fetchJournalEntries();
		setLoading(false);
	}, []);

	// Memoize the filtering and sorting logic for performance
	const processedEntries = useMemo(() => {
		return entries
			.filter((entry) =>
				entry.markdownContent.toLowerCase().includes(searchTerm.toLowerCase())
			)
			.sort((a, b) => {
				if (sortBy === "newest") {
					return b.date.getTime() - a.date.getTime();
				}
				return a.date.getTime() - b.date.getTime();
			});
	}, [entries, searchTerm, sortBy]);

	return (
		<Container size="lg">
			{/* Page Header and Controls */}
			<Group justify="space-between" mb="xl">
				<Title order={1}>My Journal</Title>
				<Group>
					<TextInput
						placeholder="Search entries..."
						leftSection={<IconSearch size={14} />}
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.currentTarget.value)}
					/>
					<Select
						value={sortBy}
						onChange={(value) => setSortBy(value as "newest" | "oldest")}
						data={[
							{ label: "Newest First", value: "newest" },
							{ label: "Oldest First", value: "oldest" },
						]}
						allowDeselect={false}
					/>
				</Group>
			</Group>

			{/* Loading State */}
			{loading && (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{Array(3)
						.fill(0)
						.map((_, index) => (
							<Card key={index} withBorder radius="md">
								<Skeleton height={20} width="40%" mb="md" />
								<Skeleton height={12} width="80%" mb="sm" />
								<Skeleton height={12} width="70%" mb="sm" />
								<Skeleton height={12} width="75%" mb="lg" />
								<Skeleton height={36} width="120px" />
							</Card>
						))}
				</SimpleGrid>
			)}

			{/* Empty State */}
			{!loading && processedEntries.length === 0 && (
				<Card withBorder radius="md" p="xl" mt="xl">
					<Center>
						<Stack align="center">
							<IconNotesOff size={48} color="gray" />
							<Title order={3}>No Entries Found</Title>
							<Text c="dimmed">
								It looks like there are no entries that match your search.
							</Text>
						</Stack>
					</Center>
				</Card>
			)}

			{/* Display Entries */}
			{!loading && processedEntries.length > 0 && (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{processedEntries.map((entry) => (
						<Card
							// TODO: get the proper ID when i have a db
							key={uuidv4()}
							shadow="sm"
							padding="lg"
							radius="md"
							withBorder
						>
							<Group justify="space-between" mb="xs">
								<Badge variant="light">
									{entry.date.toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</Badge>
							</Group>

							<Text
								size="sm"
								c="dimmed"
								lineClamp={4}
								style={{ minHeight: "80px" }}
							>
								{createSnippet(entry.markdownContent)}
							</Text>

							<Button
								variant="light"
								color="blue"
								fullWidth
								mt="md"
								radius="md"
							>
								Read More
							</Button>
						</Card>
					))}
				</SimpleGrid>
			)}
		</Container>
	);
}

export default Entries;
