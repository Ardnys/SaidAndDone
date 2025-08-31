from typing import Optional

from pydantic import BaseModel, Field


class DailyThings(BaseModel):
    """
    Daily activies of a person.
    """

    wokeUpAt: Optional[str] = Field(
        default=None, description="The time at which person has woken up."
    )
    mood: Optional[str] = Field(
        default=None, description="Mood of the person during the day."
    )
    sports: Optional[str] = Field(
        default=None,
        description="Sports done by the person during the day, such as running, playing volleyball or bodyweight workouts.",
    )
    programming: Optional[str] = Field(
        default=None, description="Programming and coding things done during the day."
    )
    studying: Optional[str] = Field(
        default=None,
        description="What and how long something has been studied, things like learning languages or a concept.",
    )
    goingOut: Optional[str] = Field(
        default=None,
        description="For leisure activities done by the person outside, such as meeting with friends or going to cinema.",
    )
    videoGames: Optional[str] = Field(
        default=None, description="What video game has been played for how long."
    )
    watchingMoviesOrAnime: Optional[str] = Field(
        default=None, description="Watching movies, tv series or anime at home."
    )
    cooking: Optional[str] = Field(default=None, description="Food prepared by person.")
    chores: Optional[str] = Field(default=None, description="Chores done by person.")
