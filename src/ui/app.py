import questionary

from rich.console import Console

from src.audio.recorder import RecordingManager
from src.events.handler import KeyboardListener
from src.events.types import KeyboardEvent
from src.journal_llm.rag import graph, stt_model
from src.storage import get_storage_paths
from src.storage.markdown_storage import MarkdownStorage

app_name = """
  O  o-O-o         o                       o 
 / \\   |           |                       | 
o---o  |           | o-o o  o o-o o-o   oo | 
|   |  |       \\   o | | |  | |   |  | | | | 
o   oo-O-o      o-o  o-o o--o o   o  o o-o-o 
"""


class App:
    def __init__(self):
        self.listener = KeyboardListener()
        self.rm = RecordingManager()
        self.console = Console()

        (_, self.markdown_dir) = get_storage_paths()
        self.md_store = MarkdownStorage(self.markdown_dir)

        self.listener.start_listener_thread()

        self.console.print(app_name, style="blue")

        @self.listener.kb_event
        def on_kb_event(event: KeyboardEvent):
            try:
                if event.key.char == "q":
                    self.rm.stop()
                elif event.key.char == "p":
                    pass
                    # as in 'pause/unpause' for both recording and playback
                    # RecordingManager.pause()

            except AttributeError:
                pass

    def app_loop(self):
        while True:
            choice = questionary.select(
                "What do you want to do?",
                choices=[
                    "Record",
                    "Play recording",
                    "Create journal entry",
                    "What should I do today",
                    "Exit",
                ],
            ).ask()

            if choice == "Create journal entry":
                response = graph.invoke(
                    {
                        "entry_point": "full",
                        "audio_file": self.rm.recorded_filename,
                        "md_store": self.md_store,
                        "transcribe_only": False,
                    }
                )

                self.console.print(response["answer"], style="yellow")
                self.console.print("Press Esc to exit.", style="bold red")
                break
            elif choice == "Play recording":
                self.console.print("Playing.", style="bold red")
                self.rm.play()
            elif choice == "Record":
                self.console.print("Recording.", style="bold red")
                self.rm.record()

                response = graph.invoke(
                    {
                        "audio_file": self.rm.recorded_filename,
                        "md_store": self.md_store,
                        "entry_point": "full",
                        "transcribe_only": True,
                    }
                )
                transcription = response["transcription"]

                self.console.print("Transcription: ", style="bold red")
                self.console.print(transcription, style="yellow")
            elif choice == "What should I do today":
                response = graph.invoke(
                    {"entry_point": "generate_only", "md_store": self.md_store}
                )
                self.console.print(response["answer"], style="yellow")
            elif choice == "Exit":
                self.console.print("Press Esc to exit.", style="bold red")
                return

    # TODO: dummy function but eh
    def stt(self):
        audio_file = self.rm.recorded_filename
        result = stt_model.transcribe(audio_file)
        return result["text"]

    def cleanup(self):
        self.listener.stop_listener_thread()
        self.rm.cleanup()
