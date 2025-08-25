from langchain.chat_models import init_chat_model
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from whisper import load_model

from src.journal_llm.schema import DailyThings


llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
structured_llm = llm.with_structured_output(schema=DailyThings)
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
vector_store = InMemoryVectorStore(embeddings)
stt_model = load_model("base.en")
