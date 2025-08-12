
# docs for soundfile: https://python-soundfile.readthedocs.io/en/0.13.1/_modules/soundfile.html#
import queue
import tempfile
import sys
from typing import Optional, Union
import sounddevice as sd
import soundfile as sf

import numpy
assert numpy

def get_sound_devices() -> str:
    return repr(sd.query_devices())

class MicRecorder:
    def __init__(self, device: Union[int, str], samplerate: Optional[int], channels: int, subtype: Optional[str] = None):
        self.__device = device

        self.__samplerate = samplerate if samplerate is not None else int(sd.query_devices(device, 'input')['default_samplerate'])
        self.__channels = channels
        self.__subtype = subtype

        # queue for audio blocks
        self.__sink = queue.Queue()

        # TODO: maybe an option to keep the recording ?
        # temporary file to store the recording
        self.__file = tempfile.NamedTemporaryFile(prefix='recording_', suffix='.wav', dir='', delete=False)

        self.__cb = self.__callback_generator()

    def record_mic(self):
        try:
            self.__recording_loop()
        except KeyboardInterrupt:
            return self.__file
        except Exception as e:
            # TODO: not sure how to exit
            print(f"Exception: {e}")
            exit(1)

    def __callback_generator(self):
        def cb(indata, frames, time, status):
            self.__sink.put(indata.copy())
        return cb


    def __recording_loop(self):
        with sf.SoundFile(self.__file, mode='x', samplerate=self.__samplerate,
                           channels=self.__channels, subtype=self.__subtype) as file:
            with sd.InputStream(device=self.__device, samplerate=self.__samplerate, channels=self.__channels, callback=self.__cb):
                print("=" * 80)
                print("Recording...")
                print("Press CTRL+C to stop the recording")
                print("=" * 80)
                while True:
                    file.write(self.__sink.get())

    
