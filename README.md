# Swiss System Tournament Manager

A comprehensive tournament management system implementing the Swiss System pairing algorithm. This project includes both a Python backend with Jupyter notebook analysis and a modern Vue.js web application frontend.

## Project Structure

- **Python Backend**: Tournament logic, player management, and Swiss pairing algorithms
- **Vue.js Frontend**: Modern web interface for tournament management
- **Jupyter Notebook**: Tournament analysis and testing environment
- **Data**: Tournament and round data storage

## Prerequisites

- **Python**: 3.14 or higher
- **Node.js**: 18 or higher
- **npm**: Latest version

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SwissSystem
```

### 2. Python Environment Setup

Create and activate a virtual environment:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell)
.venv\Scripts\Activate.ps1
# On Windows (Command Prompt)
.venv\Scripts\activate.bat
# On macOS/Linux
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -e .
```

### 3. Frontend Setup

Navigate to the webapp directory and install dependencies:

```bash
cd webapp
npm install
```

## Running the Application

### Python/Jupyter Environment

1. Start Jupyter notebook (with virtual environment activated):
```bash
jupyter notebook
```

2. Open `tournament.ipynb` to run tournament analysis and management

### Vue.js Frontend Development Server

1. Navigate to webapp directory:
```bash
cd webapp
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

To build the frontend for production:

```bash
cd webapp
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Development Workflow

### Backend Development
- Use the Jupyter notebook (`tournament.ipynb`) for interactive development and testing
- Python models and logic are defined using Pydantic for type safety
- Tournament data is stored in JSON format in the `data/` directory

### Frontend Development
- The Vue.js app uses TypeScript for type safety
- Styling is handled with Tailwind CSS
- Swiss System engine is implemented in `webapp/src/engine/swissEngine.ts`
- Tournament types are defined in `webapp/src/types/tournament.ts`

### Project Technologies

**Backend:**
- Python 3.14+
- Pydantic for data validation
- Pandas for data analysis
- Jupyter notebook for interactive development

**Frontend:**
- Vue 3 with Composition API
- TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix Vue for UI components

## Data Structure

Tournament data is stored in the `data/` directory:
- `tournament.json`: Tournament configuration and metadata
- `round_*.json`: Individual round results and pairings
- `teilnehmer.csv`: Participant data

## Contributing

1. Ensure Python virtual environment is activated
2. Install dependencies for both Python and Node.js components
3. Run tests before submitting changes
4. Follow TypeScript and Python type annotations

## License

[Add your license information here]