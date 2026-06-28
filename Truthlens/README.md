# TruthLens — AI-Powered Fake News Detection Platform

> **Detect misinformation in seconds using NLP + Machine Learning**

![TruthLens](https://img.shields.io/badge/TruthLens-v1.0.0-00D4FF?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square)

---

## Features

| Feature | Description |
|---|---|
| **AI Classification** | Logistic Regression trained on TF-IDF features |
| **NLP Pipeline** | Tokenization → Lemmatization → Stopword removal |
| **Confidence Scores** | Fake/real probability with 4-tier verdict system |
| **Signal Analysis** | Sensational language, caps ratio, punctuation detection |
| **TF-IDF Key Terms** | Top weighted keywords extracted per article |
| **Analysis History** | Full history with pagination & detail view |
| **Analytics Dashboard** | Recharts visualizations: pie, bar, line charts |
| **REST API** | Full FastAPI backend with OpenAPI docs |
| **TypeScript Frontend** | React + TypeScript + Tailwind CSS |

---

## Tech Stack

```
Frontend:  React 18 + TypeScript + Tailwind CSS + Recharts + Axios
Backend:   FastAPI + Python 3.10+ + Uvicorn
ML:        Scikit-Learn (TF-IDF + LogisticRegression) + NLTK
Storage:   JSON (production: swap for MongoDB with motor)
```

---

## Project Structure

```
truthlens/
├── backend/
│   ├── main.py                 # FastAPI app + REST endpoints
│   ├── ml_model.py             # NLP pipeline + ML model + training
│   ├── truthlens_model.pkl     # Pre-trained model (auto-generated)
│   └── analysis_history.json   # Persistent analysis store
│
└── frontend/
    ├── src/
    │   ├── App.tsx             # Root component + routing
    │   ├── main.tsx            # React entry point
    │   ├── index.css           # Global styles + animations
    │   ├── components/
    │   │   ├── Navbar.tsx      # Navigation bar
    │   │   └── VerdictCard.tsx # Analysis result card (full + compact)
    │   ├── pages/
    │   │   ├── AnalyzePage.tsx # Article input + analysis
    │   │   ├── HistoryPage.tsx # Analysis history browser
    │   │   └── DashboardPage.tsx # Analytics + charts
    │   ├── utils/
    │   │   ├── api.ts          # Axios API service layer
    │   │   └── helpers.ts      # Verdict config + date utils
    │   └── types/
    │       └── index.ts        # TypeScript interfaces
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn scikit-learn nltk pymongo motor \
            python-multipart pydantic aiohttp numpy pandas

# Download NLTK data
python3 -c "import nltk; nltk.download('stopwords'); nltk.download('wordnet')"

# Train the model + start server
python3 main.py
# → Running at http://localhost:8000
# → API docs at http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
# → Running at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Analyze an article |
| `GET` | `/history` | Get analysis history |
| `GET` | `/history/{id}` | Get specific analysis |
| `GET` | `/stats` | Platform analytics |
| `DELETE` | `/history` | Clear all history |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive API docs |

### POST /analyze — Request Body

```json
{
  "title": "Article headline here",
  "content": "Full article content...",
  "source": "CNN",       // optional
  "url": "https://..."   // optional
}
```

### POST /analyze — Response

```json
{
  "id": "a1b2c3d4",
  "verdict": "FAKE",
  "fake_score": 87.3,
  "real_score": 12.7,
  "confidence": 87.3,
  "features": {
    "word_count": 45,
    "sensational_words": 4,
    "exclamation_marks": 3,
    "caps_ratio": 12.5,
    ...
  },
  "signals": [
    {
      "type": "warning",
      "label": "Sensational Language",
      "description": "Found 4 sensationalist words",
      "severity": "high"
    }
  ],
  "important_words": [
    { "word": "conspiracy", "weight": 0.412 },
    ...
  ],
  "timestamp": "2026-06-25T10:30:00"
}
```

---

## NLP Pipeline

```
Raw Text
   ↓
Lowercase + URL removal + HTML strip
   ↓
Tokenization
   ↓
Stopword removal (NLTK English stopwords)
   ↓
WordNet Lemmatization
   ↓
TF-IDF Vectorization (5,000 features, N-grams 1-3)
   ↓
Logistic Regression (class_weight='balanced')
   ↓
Probability scores → Verdict
```

### Verdict Thresholds

| Verdict | Condition |
|---|---|
| **FAKE** | fake_score ≥ 75% |
| **SUSPICIOUS** | fake_score 45–75% |
| **CREDIBLE** | real_score ≥ 75% |
| **UNCERTAIN** | neither threshold met |

---

## MongoDB Integration (Production)

Replace the JSON file store in `main.py` with:

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.truthlens
collection = db.analyses

# Insert
await collection.insert_one(record)

# Query
cursor = collection.find().sort("timestamp", -1).limit(limit).skip(skip)
items = await cursor.to_list(length=limit)

# Stats aggregation
pipeline = [{"$group": {"_id": "$verdict", "count": {"$sum": 1}}}]
results = await collection.aggregate(pipeline).to_list(length=None)
```

---

## Extending the Model

To retrain with your own dataset:

```python
from ml_model import train_model

# Add samples to FAKE_SAMPLES / REAL_SAMPLES lists in ml_model.py
# Or load from CSV:
import pandas as pd
df = pd.read_csv("your_dataset.csv")  # columns: text, label

# Then call:
train_model()
```

For larger datasets consider: `RandomForestClassifier`, `SGDClassifier`, 
or swap to `transformers` (BERT/DistilBERT) for higher accuracy.

---

## Environment Variables

```env
# backend/.env
MODEL_PATH=./truthlens_model.pkl
HISTORY_FILE=./analysis_history.json
MONGO_URL=mongodb://localhost:27017   # optional, for production
CORS_ORIGINS=http://localhost:5173
```

---

## License

MIT — build freely, attribute kindly.
