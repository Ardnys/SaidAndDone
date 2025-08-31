import { Stepper } from "@mantine/core";
import {
	IconMicrophoneFilled,
	IconChecklist,
	IconCheckupList,
	IconDeviceFloppy, // Changed for clarity
} from "@tabler/icons-react";

type EntryStepperProps = {
	active: number;
};

function EntryStepper({ active }: EntryStepperProps) {
	return (
		<Stepper size="sm" active={active} orientation="vertical">
			<Stepper.Step
				label="Record"
				description="Talk about what you did during the day"
				icon={<IconMicrophoneFilled />}
			/>
			<Stepper.Step
				label="Check Transcription"
				description="Check the transcription and edit"
				icon={<IconChecklist />}
			/>
			<Stepper.Step
				label="Check Journal Entry"
				description="Check journal entry and edit"
				icon={<IconCheckupList />}
			/>
			<Stepper.Step
				label="Save"
				description="Save the journal entry"
				icon={<IconDeviceFloppy />}
			/>
		</Stepper>
	);
}

export default EntryStepper;
