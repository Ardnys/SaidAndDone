from queue import Empty, Queue
import threading
from types import FunctionType
from pynput import keyboard
from pynput.keyboard import Key

from src.events.types import KeyboardEvent, ShutdownEvent


class KeyboardListener:
    def __init__(self):
        self.event_queue = Queue()
        self.keyboard_event_handler = None
        self.queue_thread = None
        self.listener_thread = None
        self.active = True

    def start_listener_thread(self):
        self.listener_thread = threading.Thread(target=self._set_keyboard_listener)
        self.listener_thread.start()

        self.queue_thread = threading.Thread(target=self.queue_loop)
        self.queue_thread.start()

    def queue_loop(self):
        while self.active:
            try:
                event = self.event_queue.get(timeout=0.5)
                self.on_kb_event(event)
            except Empty:
                continue

    def stop_listener_thread(self):
        # not sure but eh
        self.active = False
        if self.queue_thread is not None:
            self.queue_thread.join()

        if self.listener_thread is not None:
            self.listener_thread.join()

    def _set_keyboard_listener(self):
        def on_press(key):
            self.event_queue.put(KeyboardEvent(key=key))

            if key == Key.esc:
                return False

        with keyboard.Listener(on_press=on_press) as listener:
            # perhaps ..?
            # self.event_queue.put(ShutdownEvent())
            listener.join()

    def on_kb_event(self, event: KeyboardEvent):
        self.keyboard_event_handler(event)

    def kb_event(self, handler: FunctionType) -> FunctionType:
        if handler.__name__ == "on_kb_event":
            self.keyboard_event_handler = handler
        return handler
