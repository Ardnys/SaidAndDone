from dataclasses import dataclass
from pynput.keyboard import Key


@dataclass
class Event:
    """Base class for events"""

    pass


@dataclass
class KeyboardEvent(Event):
    """An event representing key press"""

    key: Key


@dataclass
class ShutdownEvent(Event):
    """A special event signaling shutdown"""

    pass
