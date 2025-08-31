from datetime import datetime, timedelta, date
from pathlib import Path
from typing import Tuple


def get_storage_paths() -> Tuple[Path, Path]:
    dot = Path(".")
    entries_dir = dot / "entries"
    if not entries_dir.is_dir():
        print("entries dir not found")
        exit(1)

    json_dir = entries_dir / "json"
    markdown_dir = entries_dir / "markdown"

    if not json_dir.is_dir():
        print("json dir not found")

    if not markdown_dir.is_dir():
        print("markdown dir not found")

    return (json_dir, markdown_dir)


def date_as_header(date: date) -> str:
    return date.strftime("%d %B, %A")


def tomorrow_header_str() -> str:
    return (datetime.today() + timedelta(days=1)).strftime("%d %B, %A")
