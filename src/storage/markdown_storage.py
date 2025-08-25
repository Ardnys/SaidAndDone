from pathlib import Path
from .common import today_file_str, today_header_str


class MarkdownStorage:
    def __init__(self, path: Path):
        # TODO: we'll get em from config
        self.path = path

    def save(self, text: str) -> Path:
        """
        Docstring for save

        :param text: should be a formatted markdown
        :type text: str
        """
        today_file = today_file_str() + ".md"
        today_path = self.path / today_file
        today_header = today_header_str()
        file_contents = [f"**{today_header}**\n", "\n", f"{text}\n"]
        with open(today_path, "a", encoding="utf-8") as f:
            f.writelines(file_contents)

        return today_path

    def get_recent_files(self, n: int):
        files = list(self.path.glob("*.md"))
        files.sort(reverse=True)

        # WARN: n could be larger than number of files which is not alright

        return files[:n]
