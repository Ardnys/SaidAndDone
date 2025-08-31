# Said And Done

A voice-powered AI journaling assistant with a modern web interface. Record your daily activities through voice or text, get them transcribed, and receive AI-powered insights about your routines.

> ⚠️ **Note**: This project is currently under active development. Some features may be incomplete or subject to change.

![Said And Done Logo](images/said_and_done_logo.png)

## Features

- 🎙️ In-browser voice recording
- 🗣️ Automatic speech-to-text transcription using Whisper
- 📝 AI-powered analysis of daily activities
- ✏️ Rich markdown editor for manual entry refinement
- 🤖 Smart suggestions for daily planning based on past entries
- 🌐 Modern React-based web interface
- 🔄 Step-by-step journal entry workflow
- 📊 Entry history and insights viewer

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- PyTorch (see installation notes)
- Google Generative AI API key

## Installation

1. **Clone the repository**

```sh
git clone https://github.com/yourusername/SaidAndDone.git
cd SaidAndDone
```

2. **Backend Setup**
   The pytorch version in the `requirements.txt` matches my GPU and might not match yours.
   This might not work. I'll update it soon I promise.

```sh
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. **Frontend Setup**

```sh
cd frontend
npm install
```

4. **Environment Configuration**
   Set `GOOGLE_API_KEY` environment variable.

Linux:

```sh
export GOOGLE_API_KEY=your_api_key_here
```

Windows CMD:

```cmd
set GOOGLE_API_KEY=your_api_key_here
```

## Development

1. **Start the Backend Server**

```sh
fastapi dev src/backend/api/api.py
```

2. **Start the Frontend Development Server**

```sh
cd frontend
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API Swagger UI: `http://localhost:8000/docs`

## Project Structure

- frontend: React application built with Vite

  - `src/components/`: React components organized by feature
  - `src/router/`: Application routing
  - `src/store.ts`: Global state management

- backend: Python backend services
  - `api/`: FastAPI endpoints and payload definitions
  - `audio/`: Voice recording processing
  - `journal_llm/`: AI integration for text analysis
  - `storage/`: Data persistence layer

## Planned Features

- [ ] Friendlier home screen
- [ ] Journal page
- [ ] Celery for backend
- [ ] Fixing UI layouts lol
- [ ] Adding tiptap editor
- [ ] Checking out whisper's output
- [ ] Better recording & transcription UI
- [ ] Database for journal entries
- [ ] Weekly/monthly activity analytics
- [ ] Stream the generation maybe?
- [ ] Chatbot
- [ ] Generate prompts and extraction schema from configuration.
- [ ] Mobile-responsive design
- [ ] Other LLM stuff as I discover more

## Contributing

This project is in active development. Issues and pull requests are welcome, but please note that the architecture and features are still evolving.

## Troubleshooting

- If you encounter PyTorch-related issues, ensure you've installed the correct version for your system from [pytorch.org](https://pytorch.org)
- For audio recording issues, check your browser's microphone permissions
- Make sure your Google API key has access to the Generative AI services

## License

MIT

---

For the latest updates and documentation, please check back regularly as this project is actively being developed.
