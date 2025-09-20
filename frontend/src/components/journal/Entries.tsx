import { useState, useEffect, useCallback } from "react";
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
	Pagination,
} from "@mantine/core";
import { IconSearch, IconNotesOff } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import axios from "axios";
import { Link } from "react-router-dom";

export type ApiEntry = {
	id: string; // Add ID for a stable key
	date: string;
	transcription: string;
};

export type JournalEntry = {
	id: string;
	date: Date;
	markdownContent: string;
};

// A helper function to create a clean text snippet from Markdown
const createSnippet = (markdown: string, length = 150) => {
	const text = markdown
		//eslint-disable-next-line
		.replace(/(\#{1,6}\s)|(\*)|(\- \[.\])/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (text.length <= length) return text;
	return `${text.substring(0, text.lastIndexOf(" ", length))}...`;
};

const ITEMS_PER_PAGE = 9; // A good number for a 3-column grid

function Entries() {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [loading, setLoading] = useState(true);

	// State for server-side controls
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
	const [debouncedSearch] = useDebouncedValue(searchTerm, 500); // Debounce search input

	// State for pagination
	const [activePage, setActivePage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	// Centralized data fetching function
	const fetchJournalEntries = useCallback(async () => {
		setLoading(true);
		try {
			const offset = (activePage - 1) * ITEMS_PER_PAGE;

			const url = `/api/pagination`;
			const params = {
				limit: ITEMS_PER_PAGE,
				offset: offset,
				search: debouncedSearch,
				sort: sortBy,
			};

			const response = await axios.get<{
				entries: ApiEntry[];
				count: number;
			}>(url, { params });

			const { entries: apiEntries, count: totalCount } = response.data;

			const convertedEntries: JournalEntry[] = apiEntries.map((item) => ({
				id: item.id,
				date: new Date(item.date),
				markdownContent: item.transcription,
			}));

			setEntries(convertedEntries);
			setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
		} catch (error) {
			console.error("Error fetching journal entries:", error);
			// Optionally set an error state here
		} finally {
			setLoading(false);
		}
	}, [activePage, debouncedSearch, sortBy]);

	// This useEffect is now the main driver for data fetching
	useEffect(() => {
		fetchJournalEntries();
	}, [fetchJournalEntries]); // It re-runs whenever the memoized fetch function changes

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
						onChange={(event) => {
							setSearchTerm(event.currentTarget.value);
							setActivePage(1); // Reset to first page on search
						}}
					/>
					<Select
						value={sortBy}
						onChange={(value) => {
							setSortBy(value as "newest" | "oldest");
							setActivePage(1); // Reset to first page on sort change
						}}
						data={[
							{ label: "Newest First", value: "newest" },
							{ label: "Oldest First", value: "oldest" },
						]}
						allowDeselect={false}
					/>
				</Group>
			</Group>

			{/* Loading State Skeleton */}
			{loading && (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{Array(ITEMS_PER_PAGE)
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
			{!loading && entries.length === 0 && (
				<Card withBorder radius="md" p="xl" mt="xl">
					<Center>
						<Stack align="center">
							<IconNotesOff size={48} color="gray" />
							<Title order={3}>No Entries Found</Title>
							<Text c="dimmed">
								Your journal is empty or no entries match your search.
							</Text>
						</Stack>
					</Center>
				</Card>
			)}

			{/* Display Entries */}
			{!loading && entries.length > 0 && (
				<>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
						{entries.map((entry) => (
							<Card
								key={entry.id}
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
									component={Link}
									to={`${entry.id}`}
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

					{/* Pagination Component */}
					{totalPages > 1 && (
						<Group justify="center" mt="xl">
							<Pagination
								total={totalPages}
								value={activePage}
								onChange={setActivePage}
							/>
						</Group>
					)}
				</>
			)}
		</Container>
	);
}

export default Entries;
