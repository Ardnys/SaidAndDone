import { Loader, Stack, Text } from "@mantine/core";

interface LoadingStepProps {
	text: string;
}

export function LoadingStep({ text }: LoadingStepProps) {
	return (
		<Stack align="center" mt="xl">
			<Loader />
			<Text>{text}</Text>
		</Stack>
	);
}
