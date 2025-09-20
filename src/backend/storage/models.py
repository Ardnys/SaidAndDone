from typing import Optional
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Relationship
import datetime

from src.backend.journal_llm.schema import DailyThingsBase

sqlite_filename = "database.db"
sqlite_url = f"sqlite:///{sqlite_filename}"

engine = create_engine(sqlite_url, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# ==== Tables ====
class EntryBase(BaseModel):
    date: datetime.date  # TODO: MUST BE UNIQUE
    journal_filename: str


class Entry(SQLModel, EntryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    transcription: str

    task: Optional["Task"] = Relationship(
        back_populates="entry", sa_relationship_kwargs={"uselist": False}
    )


class EntryContents(EntryBase):
    journal_contents: str


# A copy of DailyThings from llm schema. IDK how to do this without copying, but ideally I will generate these from configuration or at installation.
class Task(SQLModel, DailyThingsBase, table=True):
    """
    Daily activies of a person but it's for database
    """

    id: int | None = Field(default=None, primary_key=True)
    entry_id: int | None = Field(default=None, foreign_key="entry.id", unique=True)
    entry: Entry | None = Relationship(back_populates="task")


class Plan(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    prompt: str
    content: str
    response: str
