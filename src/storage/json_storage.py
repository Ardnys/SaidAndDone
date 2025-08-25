from pathlib import Path
from .common import today_header_str


class JsonStorage:
    def __init__(self, path: Path):
        # TODO: we'll get em from config
        self.path = path

    def save(self, text: str) -> Path:
        """
        Docstring for save

        :param text: should be a JSON string
        :type text: str
        """
        today_file = today_header_str() + ".json"
        today_path = self.path / today_file
        with open(today_path, "a", encoding="utf-8") as f:
            f.write(text)

        return today_path
