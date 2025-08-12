import os
from src.audio import MicRecorder, get_sound_devices
from src.extraction import Extractor
from src.stt import Transcriber

def main():
    print(get_sound_devices())
    device = int(input("Enter a device ID: "))
    recorder = MicRecorder(device=device, samplerate=41800, channels=1)
    recorded_file = recorder.record_mic()
    print(f"Recording finished: {recorded_file.name}")

    t = Transcriber()
    transcription = t.transcribe(recorded_file.name)
    print(f"You said: {transcription}")

    extractor = Extractor()
    obj = extractor(transcription)
    print(f"Extracted obj: {obj}")

    # TODO: Find a solution for this though. this is not nice. gimme my move semantics pls
    recorded_file.close()
    os.remove(recorded_file.name)

if __name__ == "__main__":
    main()
