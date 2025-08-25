# Said And Done

A voice-controlled AI journaling assistant that helps you maintain a daily journal and provides personalized insights.

## Features

- 🎙️ Voice recording and playback
- 🗣️ Automatic speech-to-text transcription using Whisper
- 📝 Smart extraction of daily activities into structured data
- 📊 Markdown and JSON storage formats
- 🤖 AI-powered feedback and suggestions based on recent entries
- 🎮 Interactive CLI interface with rich text formatting

## Requirements

- Python 3.12+
- SoundDevice for audio recording
- Whisper for speech recognition
- LangChain with Google Generative AI for LLM features
- Rich for terminal UI
- Questionary for interactive prompts

## Installation

1. Clone the repository
2. Create a virtual environment:

```sh
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate  # Windows
```

3. Install dependencies:

```sh
pip install -r requirements.txt
```

## Usage

Run the main application:

```sh
python main.py
```

The CLI interface provides the following options:

- **Record**: Start a voice recording for your journal entry
- **Play recording**: Play back your last recording
- **Create journal entry**: Generate a formatted journal entry from your recording
- **What should I do today**: Get AI-powered suggestions based on recent entries
- **Exit**: Close the application

## Project Structure

- `src/audio/`: Audio recording and playback functionality
- `src/events/`: Keyboard event handling
- `src/journal_llm/`: LLM integration for text processing and suggestions
- `src/storage/`: Journal entry storage in Markdown and JSON formats
- `src/ui/`: CLI interface and app controllers
- `entries/`: Storage location for journal entries
  - `markdown/`: Human-readable formatted entries
  - `json/`: Structured data storage

## Features in Detail

### Journal Entries

Each journal entry captures:

- Wake up time
- Mood
- Physical activities
- Programming work
- Studies
- Social activities
- Entertainment (gaming, movies, etc.)
- Household activities (cooking, chores)

### AI Analysis

The system analyzes your recent entries to:

- Track activity patterns
- Identify neglected areas
- Provide personalized suggestions
- Consider weekday vs weekend patterns

## Roadmap

This project is in a nice place now. I'll update it as I use it and maybe tackle the features with time or as I need them.

- [x] MVP
- [ ] Configuration
- [ ] SQLite database (or something else) for structured storage
- [ ] Fancy audio controls and visuals
- [ ] More AI customization, like which activities should be prioritized etc.
- [ ] Weekly / monthly reports
- [ ] An actual chatbot or something more interactive

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
