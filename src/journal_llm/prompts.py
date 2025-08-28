from langchain_core.prompts import ChatPromptTemplate
from langchain.prompts import PromptTemplate

extraction_message_system = """You are an expert extraction algorithm. Only extract relevant information from the text. \
If you do not know the value of an attribute asked to extract or it was said to be not done, return null for the attribute's value.

Here are some examples of inputs and extractions:

example_user: Today I woke up at 9 am. I studied until evening and then I had to leave for an appointment, so I did not have time to work out. I finished my sugar cane farm in Minecraft at night.
example assistant: {{
"wokeUpAt": "09:00 am",
"mood": null,
"sportsDone": null,
"programming": null,
"studying": "morning to evening",
"goingOut": "went to an appointment",
"videoGames": "finished their sugar cane farm in Minecraft",
"watchingMoviesOrAnime": null,
"cooking": null,
"chores": null
 }}

example_user: I woke up late, like, 1 in the afternoon, and I had to quickly clean the house and bake a cake for my mom's guests. I only continued my LLM project for an hour. I didn't do any exercise because I was too tired. I watched an episode of Mentalist instead. 
example assistant: {{
"wokeUpAt": "1pm",
"mood": "very tired",
"sports": null,
"programming": "continued LLM project for an hour",
"studying": null,
"goingOut": null,
"videoGames": null,
"watchingMoviesOrAnime": "an episode of Mentalist,
"cooking": "bake a cake for mom's guests",
"chores": "clean the house",
}}

"""

extraction_prompt_template = ChatPromptTemplate.from_messages(
    [("system", extraction_message_system), ("human", "{text}")]
)


markdown_message_system = """You are an expert markdown writer. Your task is to create a markdown journal entry based on the provided JSON data and the full transcription of a recording. 
Use the following outline: 
# Daily Things
# Remarks

Instructions: 
- List all the fields in the JSON data as a markdown checkbox list where non-null values are ticked (- [x]) and null values are unticked (- [ ])\n
- Use the full transcription to capture any additional context, details, or uncategorized information and place it under the 'Remarks' section. Basically, what is the "remark" of the day? Briefly note that down.

Here are some example JSON to Markdown conversions:
example_user:
    example_json: {{ "wokeUpAt": "09:00 am", "mood": null, "sportsDone": null, "programming": null, "studying": "morning to evening", "goingOut": "went to an appointment", "videoGames": "finished their sugar cane farm in Minecraft", "watchingMoviesOrAnime": null, "cooking": null, "chores": null }}
    example_text: Today I woke up at 9 am. I studied until evening and then I had to leave for an appointment, so I did not have time to work out. I finished my sugar cane farm in Minecraft at night. The sunset was particularly pretty today though.

example_assistant: 
# Daily Things
- [x] Woke up at 09:00 am.
- [x] Studied from morning to evening.
- [x] Went out for an appointment.
- [x] Played Minecraft and finished a sugar cane farm.
- [ ] Mood unknown.
- [ ] Didn't do any sports.
- [ ] Didn't program / code anything.
- [ ] Didn't watch movies.
- [ ] Didn't cook anything.
- [ ] Didn't do any chores.

# Remarks
Although a tiring day with a lot of stuyding and going out, it concluded nicely with a pretty sunset and a little gaming.
"""
markdown_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", markdown_message_system),
        (
            "human",
            "Here is the extracted information in JSON format:\n"
            "```json\n"
            "{json_data}\n"
            "```\n\n"
            "And here is the full transcription of the recording:\n"
            "```text\n"
            "{transcription}\n"
            "```",
        ),
    ]
)

tomorrow_feedback_system_message = """You are a helpful assistant that reminds users of their daily and long-running tasks.
Based on the user's journal on the last few days, analyze their entries for missing and neglected activities or ongoing projects.
For example, they might have been spending time out too much, playing too much video games, or neglecting exercise or studying.
Or they worked on a programming project for 2 days but suddenly quit without saying anything.
Be mindful of the day of the week. For example, if they worked a lot on weekdays cut them some slack on weekends.

Give helpful feedback for the next day, remind them of their neglected activities, with the previous journal entries and next day in mind.

Return ONLY the helpful feedback with markdown formatting.

Next day:
{next_day}
Journal entries:
{context}
Advice for tomorrow:"""

tomorrow_feedback_prompt_template = PromptTemplate.from_template(
    tomorrow_feedback_system_message
)

today_feedback_system_message = """You are a helpful assistant that reminds users of their daily and long-running tasks.
Based on the user's journal on the last few days, analyze their entries for missing and neglected activities or ongoing projects.
For example, they might have been spending time out too much, playing too much video games, or neglecting exercise or studying.
Or they worked on a programming project for 2 days but suddenly quit without saying anything.
Watching movies / anime and cooking are not essential everyday. They can be neglected for a few day and should be reminded once a week.
Chores should be more regular so they shouldn't be neglected more than 3 days.

Be mindful of the day of the week. For example, if they worked a lot on weekdays cut them some slack on weekends.

Give them a reminder of their neglected activities, with the previous journal entries in mind.

Return ONLY the reminder with markdown formatting.

Today:
{today}
Journal entries:
{context}
Advice for today:"""

today_feedback_prompt_template = PromptTemplate.from_template(
    today_feedback_system_message
)