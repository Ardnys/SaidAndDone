import datetime
from pydantic import BaseModel

from src.backend.storage.models import Entry


class GenerateEntryPayload(BaseModel):
    transcription: str
    date: datetime.date


class EntryPayload(BaseModel):
    contents: str


class PaginatedEntriesResponse(BaseModel):
    count: int
    entries: list[Entry]
