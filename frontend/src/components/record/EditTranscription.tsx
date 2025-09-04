import { useState } from "react";
import { useJournalStore } from "../../store";
import axios from "axios";
import { Textarea, Button, Stack, Title, Group } from "@mantine/core";

export function EditTranscriptionStep() {
	const {
		date,
		transcription,
		setMarkdown,
		setTask,
		setStep,
		nextStep,
		prevStep,
	} = useJournalStore();
	const [editedTranscription, setEditedTranscription] = useState(transcription);

	const handleGenerateEntry = async () => {
		setStep("GENERATING_MARKDOWN");
		try {
			const payload = {
				date: date?.split("T")[0], // format as YYYY-MM-DD
				transcription: editedTranscription,
			};
			const response = await axios.post("/api/generate_entry", payload);
			setMarkdown(response.data["generated_content"]); // Assuming the backend returns the markdown string directly
			setTask(response.data["task"]);
			nextStep();
		} catch (error) {
			console.error("Error generating entry:", error);
			prevStep();
		}
	};

	return (
		<Stack>
			<Title order={2}>Correct the Transcription</Title>
			<Textarea
				label="Your transcribed text"
				description="Correct any errors in the transcription below before proceeding."
				value={editedTranscription}
				onChange={(event) => setEditedTranscription(event.currentTarget.value)}
				autosize={true}
			/>
			<Group justify="flex-end">
				<Button onClick={handleGenerateEntry}>Generate Journal Entry</Button>
			</Group>
		</Stack>
	);
}
