"""
TruthLens API - FastAPI Backend
Fake News Detection REST API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import json
from pathlib import Path

from ml_model import analyze_article

app = FastAPI(
    title="TruthLens API",
    description="AI-powered Fake News Detection Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-Memory Storage (MongoDB replacement for demo) ─────────────────────────

HISTORY_FILE = Path(__file__).parent / "analysis_history.json"

def load_history():
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

# ─── Models ───────────────────────────────────────────────────────────────────

class ArticleRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    content: str = Field(..., min_length=20, max_length=50000)
    source: Optional[str] = Field(None, max_length=200)
    url: Optional[str] = Field(None, max_length=500)

class AnalysisResult(BaseModel):
    id: str
    title: str
    source: Optional[str]
    verdict: str
    fake_score: float
    real_score: float
    confidence: float
    features: dict
    signals: list
    important_words: list
    timestamp: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "TruthLens API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": ["/analyze", "/history", "/stats", "/docs"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(request: ArticleRequest):
    """Analyze a news article for fake news indicators"""
    try:
        result = analyze_article(request.title, request.content)
        
        record = {
            "id": str(uuid.uuid4())[:8],
            "title": request.title[:100] + ("..." if len(request.title) > 100 else ""),
            "source": request.source,
            "url": request.url,
            "verdict": result["verdict"],
            "fake_score": result["fake_score"],
            "real_score": result["real_score"],
            "confidence": result["confidence"],
            "features": result["features"],
            "signals": result["signals"],
            "important_words": result["important_words"],
            "preprocessed_length": result["preprocessed_length"],
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Save to history
        history = load_history()
        history.insert(0, record)
        history = history[:100]  # Keep last 100
        save_history(history)
        
        return record
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/history")
async def get_history(limit: int = 20, skip: int = 0):
    """Get analysis history"""
    history = load_history()
    total = len(history)
    items = history[skip:skip + limit]
    return {
        "total": total,
        "items": items,
        "limit": limit,
        "skip": skip
    }


@app.get("/history/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get specific analysis by ID"""
    history = load_history()
    for item in history:
        if item["id"] == analysis_id:
            return item
    raise HTTPException(status_code=404, detail="Analysis not found")


@app.get("/stats")
async def get_stats():
    """Get platform statistics and analytics"""
    history = load_history()
    
    if not history:
        return {
            "total_analyzed": 0,
            "verdict_distribution": {},
            "avg_confidence": 0,
            "avg_fake_score": 0,
            "recent_trend": [],
        }
    
    total = len(history)
    
    verdict_dist = {}
    for item in history:
        v = item["verdict"]
        verdict_dist[v] = verdict_dist.get(v, 0) + 1
    
    avg_confidence = sum(i["confidence"] for i in history) / total
    avg_fake_score = sum(i["fake_score"] for i in history) / total
    
    # Last 7 analyses trend
    recent = history[:7]
    trend = [
        {
            "title": i["title"][:40],
            "verdict": i["verdict"],
            "fake_score": i["fake_score"],
            "timestamp": i["timestamp"]
        }
        for i in recent
    ]
    
    # Signal frequency
    signal_counts = {}
    for item in history:
        for sig in item.get("signals", []):
            label = sig["label"]
            signal_counts[label] = signal_counts.get(label, 0) + 1
    
    return {
        "total_analyzed": total,
        "verdict_distribution": verdict_dist,
        "avg_confidence": round(avg_confidence, 1),
        "avg_fake_score": round(avg_fake_score, 1),
        "recent_trend": trend,
        "signal_frequency": signal_counts,
        "fake_count": verdict_dist.get("FAKE", 0),
        "credible_count": verdict_dist.get("CREDIBLE", 0),
        "suspicious_count": verdict_dist.get("SUSPICIOUS", 0),
    }


@app.delete("/history")
async def clear_history():
    """Clear all analysis history"""
    save_history([])
    return {"message": "History cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
