from fastapi import FastAPI, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.deps import SessionDep
from src.backend.api.payloads import EntryPayload, GenerateEntryPayload
from src.backend.journal_llm.rag import graph, config, md_store
from src.backend.journal_llm.common import stt_model
from langgraph.types import Command
from pydub import AudioSegment
from sqlmodel import select

import tempfile
import datetime

from src.backend.storage.models import Entry, Task, create_db_and_tables

app = FastAPI()
origins = [
    "http://localhost:5173", # Your React app's origin
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

create_db_and_tables()


@app.get("/")
async def root():
    return "Hello world"


@app.post("/api/transcribe/")
async def transcribe(file: UploadFile):
    contents = await file.read()
    
    # Use a temporary file to handle the uploaded data
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio_file:
        temp_audio_file.write(contents)
        temp_audio_path = temp_audio_file.name

    try:
        # Pydub uses ffmpeg to automatically detect the format and decode it
        audio_segment = AudioSegment.from_file(temp_audio_path)

        audio_segment = audio_segment.set_frame_rate(16000)
        audio_segment = audio_segment.set_sample_width(2) # 2 bytes = 16 bits
        audio_segment = audio_segment.set_channels(1)
        
        wav_output_path = temp_audio_path + ".wav"
        audio_segment.export(wav_output_path, format="wav")

        result = stt_model.transcribe(wav_output_path) # fp16 doesn't work on CPU. set this to true in GPU
        transcription = result["text"]

    finally:
        # Clean up the temporary files
        import os
        os.remove(temp_audio_path)
        if 'wav_output_path' in locals() and os.path.exists(wav_output_path):
            os.remove(wav_output_path)

    return {"transcription": transcription}


@app.post("/api/generate_entry")
async def generate_entry(payload: GenerateEntryPayload):
    response = graph.invoke(
        {
            "date": payload.date,
            "entry_point": "full",
            "transcription": payload.transcription,
        },
        config=config,
    )
    # TODO: maybe check if there's any
    interrupt = response["__interrupt__"][0]
    return interrupt.value


@app.post("/api/save_entry", status_code=status.HTTP_201_CREATED)
async def save_entry(session: SessionDep, payload: EntryPayload):
    # returns the whole state basically
    response = graph.invoke(Command(resume={"edited_content": payload.contents}), config=config)
    data_dict = response["extracted_information"].model_dump()

    # create entry
    journal_entry = Entry(transcription=response["transcription"], date=response["date"], journal_filename=response["filename"])

    # create Task from DailyThings 
    task = Task.model_validate(data_dict)

    # connect it to entry (i think it should be other way around...?)
    task.entry = journal_entry

    session.add(task)
    session.commit()

    session.refresh(task)
    print("Created task: ", task)



@app.post("/api/plan")
async def plan(n: int = 0):
    response = graph.invoke(
        {"entry_point": "generate_only", "num_previous_entries": n}, config=config
    )
    return {"plan": response["answer"]}

@app.get("/api/entries_range")
async def get_entries(session: SessionDep, limit: int = 0 , offset: int = 0):
    file_contents = []

    statement = select(Entry).order_by(Entry.date.desc()).limit(limit).offset(offset)
    results = session.exec(statement)
    entries = results.all()

    for entry in entries:
        content = md_store.get_file_content_from_name(entry.journal_filename)
        file_contents.append(content)

    return file_contents

@app.get("/api/entries_by_date_range")
async def get_entries_by_date_range(session: SessionDep, start: datetime.date, end: datetime.date) -> list[datetime.date]:
    statement = select(Entry).filter(Entry.date.between(start, end))
    results = session.exec(statement)
    entries = results.all()
    return [ e.date for e in entries ]

# needs a date here
@app.get("/api/get_entry")
async def get_entry():
    pass


@app.post("/api/update_entry")
async def update_entry(updated: str):
    pass


# also date
@app.post("/api/delete_entry")
async def delete_entry():
    pass
