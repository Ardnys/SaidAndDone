import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel
from .common import date_as_header


class MarkdownStorage:
    def __init__(self, path: Path):
        # TODO: we'll get em from config
        self.path = path
        self.num_entries = self.get_num_files()

    def save(self, text: str, date: datetime.date) -> Path:
        """
        Docstring for save

        :param text: should be a formatted markdown
        :type text: str
        """
        filename = date.isoformat() + ".md"
        filename = self.path / filename
        file_header = date_as_header(date)
        file_contents = [f"**{file_header}**\n", "\n", f"{text}\n"]
        with open(filename, "a", encoding="utf-8") as f:
            f.writelines(file_contents)

        # not sure about this one
        return filename.name

    def get_recent_files(self, n: int) -> list[Path]:
        files = list(self.path.glob("*.md"))
        files.sort(reverse=True)

        # WARN: n could be larger than number of files which is not alright
        return files[:n]

    def get_files_in_range(self, start: int | None, end: int) -> list[Path]:
        files = list(self.path.glob("*.md"))
        files.sort(reverse=True)

        if start:
            return files[start:end]

        return files[:end]

    def get_num_files(self):
        return sum(1 for _ in self.path.glob(".md"))

    def get_file_content_from_name(self, filename: str) -> dict[str | Any]:
        filename = self.path / filename

        with open(filename, "r", encoding="utf-8") as f:
            contents = f.read()
            name = filename.stem
            return {"date": name, "markdownContent": contents}
