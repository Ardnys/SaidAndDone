from langchain_core.prompts import ChatPromptTemplate
from .schema import DailyThings
from langchain.chat_models import init_chat_model

def get_structured_llm():
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return llm.with_structured_output(schema=DailyThings)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
        "system",
        "You are an expert extraction algorithm. "
        "Only extract relevant information from the text. "
        "If you do not know the value of an attribute asked to extract, "
        "return null for the attribute's value. ",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}")
    ]
)

class Extractor:
    def __init__(self):
        # TODO: it's too late of an hour to make this nice
        self.llm = get_structured_llm()

    def __call__(self, text: str):
        prompt = prompt_template.invoke({"text": text})
        daily_things = self.llm.invoke(prompt)

        return repr(daily_things)
