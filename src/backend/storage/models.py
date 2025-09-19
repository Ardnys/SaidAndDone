from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Relationship
import datetime

sqlite_filename = "database.db"
sqlite_url  = f"sqlite:///{sqlite_filename}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# ==== Tables ====

class Entry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: datetime.date # TODO: MUST BE UNIQUE
    transcription: str
    journal_filename: str

    task: Optional["Task"] = Relationship(back_populates="entry", sa_relationship_kwargs={"uselist": False})


# A copy of DailyThings from llm schema. IDK how to do this without copying, but ideally I will generate these from configuration or at installation.
class Task(SQLModel, table=True):
    """
    Daily activies of a person but it's for database
    """
    id: int | None = Field(default=None, primary_key=True)

    wokeUpAt: str | None = Field(
        default=None, description="The time at which person has woken up."
    )
    mood: str | None = Field(
        default=None, description="Mood of the person during the day."
    )
    sports: str | None = Field(
        default=None,
        description="Sports done by the person during the day, such as running, playing volleyball or bodyweight workouts.",
    )
    programming: str | None = Field(
        default=None, description="Programming and coding things done during the day."
    )
    studying: str | None = Field(
        default=None,
        description="What and how long something has been studied, things like learning languages or a concept.",
    )
    goingOut: str | None = Field(
        default=None,
        description="For leisure activities done by the person outside, such as meeting with friends or going to cinema.",
    )
    videoGames: str | None = Field(
        default=None, description="What video game has been played for how long."
    )
    watchingMoviesOrAnime: str | None = Field(
        default=None, description="Watching movies, tv series or anime at home."
    )
    cooking: str | None = Field(default=None, description="Food prepared by person.")
    chores: str | None = Field(default=None, description="Chores done by person.")

    entry_id: int | None = Field(default=None, foreign_key="entry.id", unique=True)
    entry: Entry | None = Relationship(back_populates="task")


class Plan(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    prompt: str
    content: str
    response: str
