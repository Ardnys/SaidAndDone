# docs for soundfile: https://python-soundfile.readthedocs.io/en/0.13.1/_modules/soundfile.html#
import os
import tempfile
import threading
from typing import Optional
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.text import Text
import sounddevice as sd
import soundfile as sf

import numpy as np

assert np


def get_sound_devices() -> str:
    return repr(sd.query_devices())


def on_key_press(key):
    if key.char == "q":
        print("Stopping recording...")
        return False


class RecordingManager:
    """
    Docstring for RecordingManager

    deals with mic recording, playback, controls and saving
    """

    def __init__(self):
        self.mic_recorder = MicRecorder(samplerate=41800, channels=1)
        self.playback = None
        self.recorded_filename = None

    def stop(self):
        if self.mic_recorder.recording:
            self.mic_recorder.stop_recording()
        elif self.playback.is_playing:
            self.playback.stop()

    def record(self):
        self.recorded_filename = self.mic_recorder.start_recording()

    def cleanup(self):
        self.mic_recorder.cleanup()

    def play(self):
        if not self.recorded_filename:
            print("No recorded file found.")
            return

        if not self.playback:
            self.playback = Playback(self.recorded_filename)

        self.playback.play()
        self.playback = None


class Playback:
    def __init__(self, filename: str):
        self.filename = filename
        self.current_frame = 0
        self.finished_event = threading.Event()
        self.is_playing = False

    def play(self):
        data, fs = sf.read(self.filename, always_2d=True)

        def callback(outdata, frames, time, status):
            if status:
                print(status)
            chunksize = min(len(data) - self.current_frame, frames)

            outdata[:chunksize] = data[
                self.current_frame : self.current_frame + chunksize
            ]
            if chunksize < frames:
                outdata[chunksize:] = 0
                raise sd.CallbackStop()

            self.current_frame += chunksize

        stream = sd.OutputStream(
            samplerate=fs,
            channels=data.shape[1],
            callback=callback,
            finished_callback=self.finished_event.set,
        )
        self.is_playing = True

        with stream:
            self.finished_event.wait()
            self.is_playing = False

    def stop(self):
        if self.is_playing:
            self.finished_event.set()


class MicRecorder:
    def __init__(
        self, samplerate: Optional[int], channels: int, subtype: Optional[str] = None
    ):
        self.__samplerate = samplerate
        self.__channels = channels
        self.__subtype = subtype

        self.frames = []
        self.recording = False

        # temporary file to store the recording
        self.__file = None

        self.__cb = self.__callback_generator()

    def start_recording(self):
        self.cleanup()
        self.__file = tempfile.NamedTemporaryFile(
            prefix="recording_", suffix=".wav", dir="", delete=False
        )

        try:
            self.__recording_loop()
        except Exception as e:
            # TODO: not sure how to exit
            print(f"Exception: {e}")
            return None

        return self.__file.name

    def stop_recording(self):
        self.recording = False

    def cleanup(self):
        self.frames = []
        if self.__file:
            self.__file.close()
            os.remove(self.__file.name)

    def __callback_generator(self):
        def cb(indata, frames, time, status):
            self.frames.extend(indata.copy())

        return cb

    def __recording_loop(self):
        # Create a console object to print rich content
        console = Console()

        # --- Create a more visually appealing instruction panel ---
        info_panel = Panel(
            Text.assemble("Press ", ("q", "bold magenta"), " to stop the recording"),
            title="[bold red]🔴 RECORDING[/bold red]",
            border_style="red",
            subtitle="Waiting for stop command...",
        )

        # --- Use a Live display with a Spinner for the recording loop ---
        with Live(
            info_panel, console=console, screen=True, redirect_stderr=False
        ) as live:
            with sd.InputStream(
                samplerate=self.__samplerate,
                channels=self.__channels,
                callback=self.__cb,
            ):
                self.recording = True
                while self.recording:
                    # The 'Live' context manager handles refreshing the display.
                    # No need to print inside the loop.
                    pass  # Your main thread can wait here

        # --- Save the file after the loop finishes ---
        with sf.SoundFile(
            self.__file,
            mode="x",
            samplerate=self.__samplerate,
            channels=self.__channels,
            subtype=self.__subtype,
        ) as file:
            file.write(np.array(self.frames))

        # --- Print a final, styled confirmation message ---
        console.print(
            f"[bold green]✅ Recording finished! Audio saved to '[cyan]{self.__file.name}[/cyan]'.[/bold green]"
        )
