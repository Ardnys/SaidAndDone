import { create } from "zustand";

// Define the states for each step of the workflow
export type Step =
	| "RECORDING"
	| "TRANSCRIBING"
	| "EDIT_TRANSCRIPTION"
	| "GENERATING_MARKDOWN"
	| "EDIT_MARKDOWN"
	| "SAVING"
	| "DONE";

// Define the shape of our state
interface JournalState {
	step: Step;
	audioBlob: Blob | null;
	transcription: string;
	markdown: string;
	task: string;
	date: string | null;
	setDate: (date: string | null) => void;
	setStep: (step: Step) => void;
	setAudioBlob: (blob: Blob) => void;
	setTranscription: (transcription: string) => void;
	setMarkdown: (markdown: string) => void;
	setTask: (task: string) => void;
	reset: () => void;
	// Add workflow actions
	nextStep: () => void;
	prevStep: () => void;
}

// Create the store
export const useJournalStore = create<JournalState>((set, get) => ({
	step: "RECORDING",
	audioBlob: null,
	transcription: "",
	markdown: "",
	task: "",
	date: new Date().toISOString(),
	setDate: (date) => set({ date }),
	setTask: (task) => set({ task }),
	setStep: (step) => set({ step }),
	setAudioBlob: (blob) => set({ audioBlob: blob }),
	setTranscription: (transcription) => set({ transcription }),
	setMarkdown: (markdown) => set({ markdown }),
	reset: () =>
		set({
			step: "RECORDING",
			audioBlob: null,
			transcription: "",
			markdown: "",
		}),

	// Centralized workflow logic
	nextStep: () => {
		const { step, transcription, markdown } = get();
		switch (step) {
			// A user is done editing the transcription
			case "EDIT_TRANSCRIPTION":
				// CHECK: Only proceed if transcription is not empty
				if (transcription.trim()) {
					set({ step: "GENERATING_MARKDOWN" });
				}
				break;
			case "GENERATING_MARKDOWN":
				set({ step: "EDIT_MARKDOWN" });
				break;
			// A user is done editing the markdown
			case "EDIT_MARKDOWN":
				// CHECK: Only proceed if markdown is not empty
				if (markdown.trim()) {
					set({ step: "SAVING" });
				}
				break;
			case "SAVING":
				set({ step: "DONE" });
				break;
			default:
				break;
		}
	},

	prevStep: () => {
		const { step } = get();
		switch (step) {
			case "EDIT_TRANSCRIPTION":
				// Allow going back to re-record
				set({ step: "RECORDING", audioBlob: null, transcription: "" });
				break;
			case "EDIT_MARKDOWN":
				set({ step: "EDIT_TRANSCRIPTION" });
				break;
			default:
				break;
		}
	},
}));
