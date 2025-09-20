import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	Container,
	Title,
	Text,
	Paper,
	Skeleton,
	Alert,
	Group,
	Button,
	Divider,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";

import classes from "./JournalViewPage.module.css";

type EntryContents = {
	date: string;
	journal_filename: string;
	journal_contents: string;
};

function JournalViewPage() {
	const { id } = useParams<{ id: string }>();
	const [entry, setEntry] = useState<EntryContents | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchEntry = async () => {
			if (!id) return;
			setLoading(true);
			setError(null);
			try {
				const response = await axios.get<EntryContents>(
					`/api/get_entry?id=${id}`
				);
				setEntry(response.data);
			} catch (err) {
				setError(
					"Failed to fetch the journal entry. It may have been deleted."
				);
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchEntry();
	}, [id]);

	// Loading State
	if (loading) {
		return (
			<Container size="sm" mt="xl">
				<Skeleton height={40} width="60%" mb="xl" />
				<Skeleton height={12} width="40%" mb="md" />
				<Skeleton height={200} />
			</Container>
		);
	}

	// Error State
	if (error) {
		return (
			<Container size="sm" mt="xl">
				<Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
					{error}
				</Alert>
				<Button
					component={Link}
					to="/journal"
					leftSection={<IconArrowLeft size={14} />}
					mt="md"
				>
					Back to Journal List
				</Button>
			</Container>
		);
	}

	// Success State
	return (
		<Container size="sm" mt="xl" pb="xl">
			<Group justify="space-between" mb="md">
				<Title order={2}>Journal Entry</Title>
				<Button
					component={Link}
					to="/journal"
					variant="light"
					leftSection={<IconArrowLeft size={14} />}
				>
					Back to List
				</Button>
			</Group>

			{entry && (
				<Paper withBorder radius="md" p="xl">
					<Text c="dimmed" size="sm" mb="md">
						{new Date(entry.date).toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</Text>
					<Divider my="md" />
					<div className={classes.prose}>
						<Markdown remarkPlugins={[remarkGfm]}>
							{entry.journal_contents}
						</Markdown>
					</div>
				</Paper>
			)}
		</Container>
	);
}

export default JournalViewPage;
