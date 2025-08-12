from whisper import load_model

class Transcriber:
    def __init__(self, model: str = "base.en"):
        print(f"Loading {model}...")
        self.model = load_model(model)
        print("Model loaded.")

    def transcribe(self, filename: str) -> str:
        result = self.model.transcribe(filename)

        return result["text"]