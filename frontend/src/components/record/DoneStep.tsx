import { Button, Stack, Text, Title } from "@mantine/core";
import { useJournalStore } from "../../store";

export function DoneStep() {
	const reset = useJournalStore((state) => state.reset);
	return (
		<Stack align="center" mt="xl">
			<Title order={2}>All Done!</Title>
			<Text>Your journal entry has been saved successfully.</Text>
			<Button onClick={reset}>Create Another Entry</Button>
		</Stack>
	);
}
