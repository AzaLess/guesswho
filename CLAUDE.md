# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multilingual party game called "Guess Who" - a fact-guessing game where players submit interesting facts about themselves and try to guess who wrote each fact. The project is a full-stack application with a Django REST API backend and React TypeScript frontend.

## Architecture

### Backend (Django REST API)
- **Framework**: Django 4.2 with Django REST Framework
- **Database**: SQLite (db.sqlite3)
- **Main app**: `game/` - contains all game logic
- **Models**: Game, Player, Fact, GuessEvent, Score (in `game/models.py`)
- **API views**: Complete REST API in `game/views.py` for game management
- **Deployment**: Configured for Heroku with gunicorn

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript and Vite
- **Routing**: React Router DOM
- **Styling**: CSS with custom styles in `styles.css`
- **State management**: React Context for language/translations
- **Build tool**: Vite for development and production builds

## Development Commands

### Backend Development
```bash
# Start Django development server
python manage.py runserver

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on localhost:5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Key Features & Architecture

### Game Flow Architecture
1. **Welcome Page** → Create/Join Game
2. **Waiting Room** → Players join and submit facts
3. **Game Round** → Host presents facts, players guess
4. **Scoreboard** → Shows current scores
5. **End Screen** → Final results with mini-statistics

### Multilingual Support
- Complete i18n implementation in `frontend/src/contexts/LanguageContext.tsx`
- Supports: English (en), Ukrainian (uk), Russian (ru), German (de)
- Translations stored in context, persisted to localStorage

### Scoring System
- Correct guess: +3 points to guesser
- Fact author gets points equal to number of wrong attempts
- Detailed statistics tracking (best detective, hardest fact, etc.)

### Real-time Game State
- Game state managed via REST API polling
- Host controls game flow (start, current fact, scoring)
- Players can be kicked by host
- Sound notifications system with toggle

## Important Files

### Backend Core
- `game/models.py` - Database models for game entities
- `game/views.py` - All API endpoints and game logic
- `game/serializers.py` - DRF serializers
- `guesswho/settings.py` - Django configuration with CORS setup

### Frontend Core
- `frontend/src/App.tsx` - Main routing and app structure
- `frontend/src/contexts/LanguageContext.tsx` - Multilingual support
- `frontend/src/api.ts` - API client functions
- `frontend/src/pages/` - All game screen components

### Configuration
- `requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies
- `Procfile` - Heroku deployment configuration

## Development Notes

- API endpoints are prefixed with `/api/game/`
- Frontend development server proxies API calls to Django backend
- Game tokens are auto-generated friendly codes (e.g., "fox42", "bear17")
- Players get unique emoji assignments automatically
- All game data persists in SQLite database
- Analytics page available at `/secret-analytics` for game statistics

## Testing

Currently no automated tests are implemented. Manual testing should cover:
- Game creation and joining flows
- Fact submission and validation
- Game round management by host
- Scoring calculations
- Multilingual interface functionality