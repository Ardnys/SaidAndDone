from typing import List, Literal, TypedDict
from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langgraph.graph import START, StateGraph, END

from src.journal_llm.schema import DailyThings
from src.storage import MarkdownStorage
from src.storage.common import tomorrow_header_str
from .common import vector_store, stt_model, structured_llm, llm
from .prompts import (
    extraction_prompt_template,
    markdown_prompt_template,
    feedback_generation_prompt_template,
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
    md_store: MarkdownStorage
    audio_file: str
    transcription: str
    extracted_information: DailyThings
    past_docs: List[Document]
    answer: str
    # flags for extra control
    transcribe_only: bool
    entry_point: Literal["full", "generate_only"]


# === nodes ===


def speech_to_text(state: State):
    result = stt_model.transcribe(state["audio_file"])
    print(f"You said: {result["text"]}")
    return {"transcription": result["text"]}


def extraction(state: State):
    prompt = extraction_prompt_template.invoke({"text": state["transcription"]})
    daily_things = structured_llm.invoke(prompt)
    print(f"Extracted class: {daily_things}")

    return {"extracted_information": daily_things}


def save_and_pull_docs(state: State):
    # generate markdown journal entry
    info_json = state["extracted_information"].model_dump_json()
    prompt = markdown_prompt_template.invoke(
        {"json_data": info_json, "transcription": state["transcription"]}
    )
    markdown = llm.invoke(prompt)

    # TODO: I can save one extra read and write here but too complicated rn
    # save to disk
    md_store = state["md_store"]
    md_store.save(markdown.content)

    # pull recent entries
    files = md_store.get_recent_files(5)
    docs = load_markdown_files(files)
    return {"past_docs": docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["past_docs"])
    tomorrow = tomorrow_header_str()
    messages = feedback_generation_prompt_template.invoke(
        {"context": docs_content, "next_day": tomorrow}
    )
    # TODO: inject day of the week here so this dingus doesn't yell at me on weekends
    response = llm.invoke(messages)
    return {"answer": response.content}


def pull_recent_docs(state: State):
    md_store = state["md_store"]

    # pull recent entries
    files = md_store.get_recent_files(5)
    docs = load_markdown_files(files)
    return {"past_docs": docs}


# === conditional edges ===


def should_continue_after_stt(state: State):
    if state["transcribe_only"]:
        return "end"
    else:
        return "continue"


def select_entry_point(state: State):
    if state["entry_point"] == "generate_only":
        return "pull_recent_docs"
    return "speech_to_text"


graph_builder = StateGraph(State)

graph_builder.add_node(speech_to_text)
graph_builder.add_node(extraction)
graph_builder.add_node(save_and_pull_docs)
graph_builder.add_node(pull_recent_docs)
graph_builder.add_node(generate)

graph_builder.add_edge("extraction", "save_and_pull_docs")
graph_builder.add_edge("save_and_pull_docs", "generate")
graph_builder.add_edge("generate", END)

graph_builder.add_conditional_edges(
    "speech_to_text", should_continue_after_stt, {"continue": "extraction", "end": END}
)
graph_builder.add_conditional_edges(
    START,
    select_entry_point,
    {"speech_to_text": "speech_to_text", "pull_recent_docs": "pull_recent_docs"},
)


graph = graph_builder.compile()
