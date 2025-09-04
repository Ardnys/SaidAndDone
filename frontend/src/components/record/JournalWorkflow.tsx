import {
	Button,
	Group,
	Container,
	Grid,
	Card,
	Stack,
	Title,
} from "@mantine/core";
import { useJournalStore } from "../../store";
import { RecordingStep } from "./RecordingStep";
import { EditTranscriptionStep } from "./EditTranscription";
import { EditMarkdownStep } from "./EditMarkdown";
import { LoadingStep } from "./LoadingStep";
import { DoneStep } from "./DoneStep";
import EntryStepper from "./EntryStepper";
import type { Step } from "../../store";
import JournalDatePicker from "./JournalDatePicker";

export function JournalWorkflow() {
	const { step, nextStep, prevStep } = useJournalStore();

	// A function to derive the stepper's active index from the application step
	const stepToActiveIndex = (currentStep: Step): number => {
		switch (currentStep) {
			case "RECORDING":
			case "TRANSCRIBING":
				return 0;
			case "EDIT_TRANSCRIPTION":
			case "GENERATING_MARKDOWN":
				return 1;
			case "EDIT_MARKDOWN":
			case "SAVING":
				return 2;
			case "DONE":
				return 4; // All steps completed
			default:
				return 0;
		}
	};

	const activeIndex = stepToActiveIndex(step);

	const renderStepContent = () => {
		switch (step) {
			case "RECORDING":
				return <RecordingStep />;
			case "TRANSCRIBING":
				return <LoadingStep text="Transcribing your audio..." />;
			case "EDIT_TRANSCRIPTION":
				return <EditTranscriptionStep />;
			case "GENERATING_MARKDOWN":
				return <LoadingStep text="Generating your journal entry..." />;
			case "EDIT_MARKDOWN":
				return <EditMarkdownStep />;
			case "SAVING":
				return <LoadingStep text="Saving your entry..." />;
			case "DONE":
				return <DoneStep />;
			default:
				return <RecordingStep />;
		}
	};

	const showNavButtons = ["EDIT_TRANSCRIPTION", "EDIT_MARKDOWN"].includes(step);

	return (
		<Container size="xl">
			<Grid gutter="xl">
				{/* Main Content Column */}
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Card withBorder radius="md" p="xl">
						<Stack gap="xl">
							<div>
								<Title order={4} mb="xs">
									Journal Entry
								</Title>
								<JournalDatePicker />
							</div>

							{/* Dynamic Step Content */}
							<div>{renderStepContent()}</div>

							{/* Navigation Buttons */}
							{showNavButtons && (
								<Group justify="flex-end" mt="md">
									<Button variant="default" onClick={prevStep}>
										Back
									</Button>
									<Button onClick={nextStep}>
										{step === "EDIT_MARKDOWN" ? "Save & Finish" : "Next Step"}
									</Button>
								</Group>
							)}
						</Stack>
					</Card>
				</Grid.Col>

				{/* Right Sidebar Column */}
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Stack>
						<Title order={4}>Your Progress</Title>
						<EntryStepper active={activeIndex} />
					</Stack>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
