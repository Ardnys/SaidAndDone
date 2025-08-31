import { useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { useJournalStore } from "../../store";
import axios from "axios";
import {
	Stack,
	Title,
	Text,
	Button,
	Group,
	Box,
	Badge,
	Code,
} from "@mantine/core";

// A simple component to display the recording status with a colored badge
function StatusIndicator({ status }: { status: string }) {
	let color = "gray";
	if (status === "recording") color = "red";
	if (status === "stopped") color = "blue";
	return (
		<Badge color={color} size="lg" radius="sm">
			{status}
		</Badge>
	);
}

// This is the new component to display audio track settings

export function RecordingStep() {
	const {
		setAudioBlob: setGlobalAudioBlob,
		setStep,
		setTranscription,
	} = useJournalStore();
	const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);

	// This is important
	const audioConstraints = {
		sampleSize: 16,
		sampleRate: 44100,
		channelCount: 1,
	};

	// WARN: recording breaks when some other audio is playing on the browser
	// And the player is a bit buggy
	const { status, startRecording, stopRecording, mediaBlobUrl } =
		useReactMediaRecorder({
			video: false,
			audio: audioConstraints,
		});

	useEffect(() => {
		if (mediaBlobUrl) {
			fetch(mediaBlobUrl)
				.then((res) => res.blob())
				.then(setLocalAudioBlob);
		}
	}, [mediaBlobUrl]);

	const handleSubmitRecording = async () => {
		if (!localAudioBlob) return;

		setGlobalAudioBlob(localAudioBlob);
		setStep("TRANSCRIBING");

		const formData = new FormData();
		// IMPORTANT: Ensure the filename reflects the actual format.
		// Browsers often record in 'audio/webm' or 'audio/ogg'.
		const fileExtension = localAudioBlob.type.split("/")[1].split(";")[0];
		formData.append("file", localAudioBlob, `recording.${fileExtension}`);

		try {
			const response = await axios.post("/api/transcribe/", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setTranscription(response.data.transcription);
			setStep("EDIT_TRANSCRIPTION");
		} catch (error) {
			console.error("Error transcribing audio:", error);
			setStep("RECORDING");
		}
	};

	return (
		<Stack align="center" mt="xl" gap="lg">
			<Title order={2}>Record Your Journal Entry</Title>
			<Text>Press Start and speak your mind.</Text>

			<Group>
				<StatusIndicator status={status} />
			</Group>

			<Group>
				<Button
					onClick={startRecording}
					disabled={status === "recording"}
					color="green"
				>
					Start Recording
				</Button>
				<Button
					onClick={stopRecording}
					disabled={status !== "recording"}
					color="red"
				>
					Stop Recording
				</Button>
			</Group>

			{mediaBlobUrl && (
				<Box
					mt="md"
					p="md"
					style={{ border: "1px solid #ccc", borderRadius: "4px" }}
				>
					<Stack align="center">
						<Text fw={500}>Recording Preview</Text>
						<audio src={mediaBlobUrl} controls />
						<Text size="xs">
							Blob Type: <Code>{localAudioBlob?.type}</Code>
						</Text>
						<Button
							onClick={handleSubmitRecording}
							mt="sm"
							disabled={!localAudioBlob}
						>
							Use This Recording
						</Button>
					</Stack>
				</Box>
			)}
		</Stack>
	);
}
