import { Button, Group, Container, Grid } from "@mantine/core";
import { useJournalStore } from "../../store";
import { RecordingStep } from "./RecordingStep";
import { EditTranscriptionStep } from "./EditTranscription";
import { EditMarkdownStep } from "./EditMarkdown";
import { LoadingStep } from "./LoadingStep";
import { DoneStep } from "./DoneStep";
import EntryStepper from "./EntryStepper";
import type { Step } from "../../store"; // Import the Step type

export function JournalWorkflow() {
	// Get state and actions from the store
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

	// Determine when to show the navigation buttons
	const showNavButtons = ["EDIT_TRANSCRIPTION", "EDIT_MARKDOWN"].includes(step);

	return (
		<Container size="xl" style={{ position: "relative", height: "100%" }}>
			<Grid>
				<Grid.Col span={9}>
					{renderStepContent()}
					{showNavButtons && (
						<Group justify="left" mt="xl">
							<Button variant="default" onClick={prevStep}>
								Back
							</Button>
							<Button onClick={nextStep}>
								{step === "EDIT_MARKDOWN" ? "Save & Finish" : "Next step"}
							</Button>
						</Group>
					)}
				</Grid.Col>
				<Grid.Col span={3}>
					<EntryStepper active={activeIndex} />
				</Grid.Col>
			</Grid>
		</Container>
	);
}
