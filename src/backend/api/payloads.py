import datetime
from pydantic import BaseModel


class GenerateEntryPayload(BaseModel):
    transcription: str
    date: datetime.date


class EntryPayload(BaseModel):
    contents: str
