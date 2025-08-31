import datetime
from typing import List, Literal, TypedDict
import uuid
from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import START, StateGraph, END
from langgraph.types import interrupt

from src.backend.journal_llm.schema import DailyThings
from src.backend.storage.common import date_as_header
from .common import vector_store, structured_llm, llm, md_store
from .prompts import (
    extraction_prompt_template,
    markdown_prompt_template,
    today_feedback_prompt_template,
)

headers_to_split_on = [
    ("#", "Header 1"),
]

markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)


def load_markdown_files(files: list):
    docs = []
    for file in files:
        print(f"File: {file}")
        loader = TextLoader(file)
        data = loader.load()

        assert len(data) == 1
        assert isinstance(data[0], Document)

        content = data[0].page_content
        split = split_markdown_files(content)
        docs.extend(split)

        vector_store.add_documents(split)
    return docs


def split_markdown_files(file_content):
    md_header_split = markdown_splitter.split_text(file_content)
    return md_header_split


class State(TypedDict):
    # state
    transcription: str
    date: datetime.date | None
    extracted_information: DailyThings
    content: str
    num_previous_entries: int | None
    past_docs: List[Document]
    answer: str
    # flags for extra control
    entry_point: Literal["full", "generate_only"]


# === nodes ===
def extraction(state: State):
    prompt = extraction_prompt_template.invoke({"text": state["transcription"]})
    daily_things = structured_llm.invoke(prompt)
    print(f"Extracted class: {daily_things}")

    return {"extracted_information": daily_things}


# TODO: if more human interaction is needed
# https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop/#review-and-edit-state
# def extraction_human_review(state: State):
#     result = interrupt({
#         "task": "Please review and edit the extracted information if necessary.",
#         "extraction": state["extracted_information"]
#     })

#     return {
#         "extracted_information": result["edited_extraction"]
#     }


def create_journal_entry(state: State):
    # generate markdown journal entry
    info_json = state["extracted_information"].model_dump_json()
    prompt = markdown_prompt_template.invoke(
        {"json_data": info_json, "transcription": state["transcription"]}
    )
    markdown = llm.invoke(prompt)

    return {"content": markdown.content}


def human_review_journal_entry(state: State):
    result = interrupt(
        {
            "task": "Please review and edit the markdown entry if necessary.",
            "generated_content": state["content"],
        }
    )

    return {"content": result["edited_content"]}


def save_journal_entry(state: State):
    content = state["content"]
    date = state["date"]

    md_store.save(content, date)


def generate_today(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["past_docs"])
    today = date_as_header(datetime.date.today())
    messages = today_feedback_prompt_template.invoke(
        {"context": docs_content, "today": today}
    )
    # TODO: inject day of the week here so this dingus doesn't yell at me on weekends
    response = llm.invoke(messages)
    return {"answer": response.content}


def pull_recent_docs(state: State):
    # pull recent entries
    files = md_store.get_recent_files(state["num_previous_entries"])
    docs = load_markdown_files(files)
    return {"past_docs": docs}


# === conditional edges ===
def select_entry_point(state: State):
    if state["entry_point"] == "generate_only":
        return "pull_recent_docs"
    return "extraction"


graph_builder = StateGraph(State)

graph_builder.add_node(extraction)
graph_builder.add_node(create_journal_entry)
graph_builder.add_node(human_review_journal_entry)
graph_builder.add_node(save_journal_entry)
graph_builder.add_node(pull_recent_docs)
graph_builder.add_node(generate_today)

graph_builder.add_edge("extraction", "create_journal_entry")
graph_builder.add_edge("create_journal_entry", "human_review_journal_entry")
graph_builder.add_edge("human_review_journal_entry", "save_journal_entry")
graph_builder.add_edge("pull_recent_docs", "generate_today")
graph_builder.add_edge("create_journal_entry", END)
graph_builder.add_edge("generate_today", END)

# TODO: tbh generation could be a separate graph. they have nothing in common
graph_builder.add_conditional_edges(
    START,
    select_entry_point,
    {"extraction": "extraction", "pull_recent_docs": "pull_recent_docs"},
)

# in-memory checkpoint for interrupt support
checkpointer = InMemorySaver()

graph = graph_builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": uuid.uuid4()}}
