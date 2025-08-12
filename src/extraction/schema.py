from typing import Optional

from pydantic import BaseModel, Field

class DailyThings(BaseModel):
    """
    Daily activies of a person.
    """
    wokeUpAt: Optional[str] = Field(default=None, description="The time at which person has woken up")
    mood: Optional[str] = Field(default=None, description="Mood of the person during the day")
    sportsDone: Optional[str] = Field(default=None, description="Sports done by the person during the day")
    programming: Optional[str] = Field(default=None, description="Programming things done during the day")
    hoursStudied: Optional[str] = Field(default=None, description="Number of hours studied during the day")

