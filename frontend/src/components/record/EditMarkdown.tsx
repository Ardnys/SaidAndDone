import { useState } from "react";
import { useJournalStore } from "../../store";
import axios from "axios";
import { Textarea, Button, Stack, Title, Group, Text } from "@mantine/core";

export function EditMarkdownStep() {
	const { markdown, task, setStep, nextStep, prevStep } = useJournalStore();
	const [editedMarkdown, setEditedMarkdown] = useState(markdown);

	const handleSaveEntry = async () => {
		setStep("SAVING");
		try {
			const payload = {
				contents: editedMarkdown,
			};
			await axios.post("/api/save_entry", payload);
			nextStep();
		} catch (error) {
			console.error("Error saving entry:", error);
			prevStep();
		}
	};

	return (
		<Stack>
			<Title order={2}>Review Your Journal Entry</Title>
			<Text>{task}</Text>
			<Textarea
				label="Your generated journal entry"
				description="Make any final adjustments to the markdown content."
				value={editedMarkdown}
				onChange={(event) => setEditedMarkdown(event.currentTarget.value)}
				autosize={true}
			/>
			<Group justify="flex-end">
				<Button onClick={handleSaveEntry}>Save Entry</Button>
			</Group>
		</Stack>
	);
}
