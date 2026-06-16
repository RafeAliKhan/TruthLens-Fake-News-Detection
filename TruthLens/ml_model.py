"""
TruthLens ML Model - Fake News Detection
Uses TF-IDF + Logistic Regression with NLP preprocessing
"""

import re
import pickle
import numpy as np
from pathlib import Path
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Ensure NLTK data available
for pkg in ['stopwords', 'wordnet', 'punkt']:
    try:
        nltk.data.find(f'corpora/{pkg}')
    except LookupError:
        nltk.download(pkg, quiet=True)

MODEL_PATH = Path(__file__).parent / "truthlens_model.pkl"

STOP_WORDS = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# ─── NLP Preprocessing ────────────────────────────────────────────────────────

def preprocess_text(text: str) -> str:
    """Full NLP preprocessing pipeline"""
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' URL ', text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # Tokenize
    tokens = text.split()
    
    # Remove stopwords and lemmatize
    tokens = [
        lemmatizer.lemmatize(token)
        for token in tokens
        if token not in STOP_WORDS and len(token) > 2
    ]
    
    return ' '.join(tokens)


def extract_features(text: str) -> dict:
    """Extract linguistic features for analysis display"""
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Sensationalism indicators
    sensational_words = {
        'shocking', 'bombshell', 'exclusive', 'breaking', 'urgent', 'alert',
        'exposed', 'scandal', 'secret', 'leaked', 'conspiracy', 'hoax',
        'propaganda', 'fake', 'fraud', 'corrupt', 'crisis', 'emergency'
    }
    
    # Credibility indicators
    credible_words = {
        'according', 'research', 'study', 'evidence', 'data', 'official',
        'reported', 'confirmed', 'analysis', 'statistics', 'survey', 'published'
    }
    
    text_lower = text.lower()
    word_set = set(text_lower.split())
    
    sensational_count = len(word_set & sensational_words)
    credible_count = len(word_set & credible_words)
    
    exclamation_count = text.count('!')
    question_count = text.count('?')
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    
    avg_sentence_length = np.mean([len(s.split()) for s in sentences]) if sentences else 0
    
    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "sensational_words": sensational_count,
        "credible_indicators": credible_count,
        "exclamation_marks": exclamation_count,
        "caps_ratio": round(caps_ratio * 100, 1),
        "question_marks": question_count,
    }

# ─── Synthetic Training Data ──────────────────────────────────────────────────

FAKE_SAMPLES = [
    "BREAKING: Scientists SHOCKED by secret government cover-up exposed leaked documents prove conspiracy against citizens urgent alert share now",
    "You won't believe what THEY don't want you to know about the new world order conspiracy exclusive bombshell revelation",
    "Shocking scandal exposed corrupt politician caught red-handed hoax perpetrated against innocent public wake up sheeple",
    "URGENT: Deep state agenda revealed crisis actor crisis hoax government propaganda machine working against freedom truth seekers",
    "Exclusive: Secret cabal controls world economy exposed whistleblower claims shocking truth about globalist agenda finally revealed",
    "Breaking news mainstream media hiding truth from public government cover-up massive conspiracy proves everything we suspected",
    "Leaked documents prove what they don't want you to know about vaccine hoax dangerous experiment on citizens",
    "BOMBSHELL: Famous celebrity caught in massive fraud scheme exposed by anonymous sources exclusive interview reveals shocking details",
    "Secret society members finally exposed global conspiracy to control population using 5G towers mind control technology",
    "ALERT: Government agents spotted surveillance van outside home of truth seeker who exposed their dark secret agenda",
    "Outrageous scandal rocks establishment as whistleblower exposes decades of corruption hidden from honest hardworking citizens everywhere",
    "They are lying to you about climate change the real truth will shock you massive hoax exposed today",
    "Hollywood elites panic as their satanic rituals are exposed by brave truth teller who risked everything to tell us",
    "WAKE UP SHEEPLE the fluoride in water is making you stupid this is not a conspiracy it is proven fact",
    "EXCLUSIVE: Secret cure for cancer suppressed by big pharma for decades finally revealed by brave doctor risking career",
    "Politicians in shocking secret meeting caught discussing plan to take away your freedoms rights exposed by brave journalist",
    "Mind-blowing revelation aliens among us government hiding truth for decades new evidence proves everything conspiracy theorists claimed true",
    "URGENT WARNING dangerous new law will steal your money rights freedoms share before they delete this important truth",
    "Fake mainstream news lying again real truth exposed by independent journalists government media complex pushing propaganda agenda",
    "Shocking video proves moon landing was hoax filmed in studio documents leaked from NASA archives prove conspiracy",
]

REAL_SAMPLES = [
    "Federal Reserve announced interest rate decision following months of analysis economic data showing inflation trends according to officials",
    "Researchers at Stanford University published findings in Nature journal showing significant correlation between diet and cardiovascular health outcomes",
    "City council approved new infrastructure budget after months of public hearings and environmental impact assessment reports reviewed",
    "The Department of Labor released monthly employment statistics showing moderate job growth across multiple sectors of economy",
    "International climate summit concluded with agreement on emissions reduction targets following negotiations between representatives from member nations",
    "Supreme Court issued ruling on constitutional challenge presented by civil liberties organizations following three years of litigation",
    "New study published in medical journal found evidence supporting effectiveness of treatment protocol for patients with chronic conditions",
    "Technology company reported quarterly earnings results meeting analyst expectations according to financial disclosure filed with regulators",
    "Congressional committee held hearing on proposed legislation to address infrastructure funding challenges facing municipalities across the country",
    "World Health Organization updated guidelines for disease prevention based on systematic review of clinical evidence from multiple countries",
    "Local school district announced updated curriculum following review by education board and input from teachers and parents",
    "State environmental agency released report on water quality monitoring results from testing conducted across municipal water systems",
    "University researchers received federal grant to study renewable energy solutions as part of broader national energy strategy",
    "Transportation department completed traffic study showing proposed changes would reduce congestion based on modeling and historical data",
    "Public health officials confirmed cases of seasonal illness and reminded residents about available vaccination options at community clinics",
    "Legislative session concluded with passage of budget bill allocating funds across state departments following compromise between parties",
    "Federal investigation into financial fraud resulted in charges against executives following eighteen months of evidence gathering by prosecutors",
    "Scientists from multiple institutions collaborated on climate research paper analyzing decades of temperature and precipitation data collected globally",
    "Municipal elections concluded with results certified by election officials after canvassing boards reviewed ballots from all precincts",
    "Academic conference brought together researchers to present findings on artificial intelligence applications in healthcare and medical diagnostics",
]

# ─── Model Training ────────────────────────────────────────────────────────────

def train_model():
    """Train and save the fake news detection model"""
    print("Training TruthLens ML model...")
    
    texts = FAKE_SAMPLES + REAL_SAMPLES
    labels = [1] * len(FAKE_SAMPLES) + [0] * len(REAL_SAMPLES)  # 1=fake, 0=real
    
    preprocessed = [preprocess_text(t) for t in texts]
    
    X_train, X_test, y_train, y_test = train_test_split(
        preprocessed, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 3),
            sublinear_tf=True,
            min_df=1,
        )),
        ('clf', LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {acc:.2%}")
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(pipeline, f)
    
    print(f"Model saved to {MODEL_PATH}")
    return pipeline


def load_model():
    """Load existing model or train new one"""
    if MODEL_PATH.exists():
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    return train_model()


# ─── Prediction ───────────────────────────────────────────────────────────────

_model = None

def get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model


def analyze_article(title: str, content: str) -> dict:
    """Full analysis pipeline for a news article"""
    full_text = f"{title} {content}"
    
    model = get_model()
    preprocessed = preprocess_text(full_text)
    
    # Prediction
    prediction = model.predict([preprocessed])[0]
    proba = model.predict_proba([preprocessed])[0]
    
    fake_score = float(proba[1])  # probability of fake
    real_score = float(proba[0])  # probability of real
    
    # Determine verdict
    if fake_score >= 0.75:
        verdict = "FAKE"
        confidence = fake_score
    elif fake_score >= 0.45:
        verdict = "SUSPICIOUS"
        confidence = fake_score
    elif real_score >= 0.75:
        verdict = "CREDIBLE"
        confidence = real_score
    else:
        verdict = "UNCERTAIN"
        confidence = max(fake_score, real_score)
    
    # Feature analysis
    features = extract_features(full_text)
    
    # Generate analysis signals
    signals = []
    
    if features["sensational_words"] > 2:
        signals.append({
            "type": "warning",
            "label": "Sensational Language",
            "description": f"Found {features['sensational_words']} sensationalist words",
            "severity": "high"
        })
    
    if features["caps_ratio"] > 5:
        signals.append({
            "type": "warning", 
            "label": "Excessive Capitalization",
            "description": f"{features['caps_ratio']}% of text is uppercase",
            "severity": "medium"
        })
    
    if features["exclamation_marks"] > 2:
        signals.append({
            "type": "warning",
            "label": "Emotional Punctuation",
            "description": f"{features['exclamation_marks']} exclamation marks detected",
            "severity": "medium"
        })
    
    if features["credible_indicators"] > 2:
        signals.append({
            "type": "positive",
            "label": "Credibility Markers",
            "description": f"{features['credible_indicators']} credible source indicators found",
            "severity": "low"
        })
    
    if features["avg_sentence_length"] > 30:
        signals.append({
            "type": "neutral",
            "label": "Complex Sentence Structure",
            "description": f"Average sentence length: {features['avg_sentence_length']} words",
            "severity": "low"
        })
    
    # TF-IDF top features (keywords)
    tfidf = model.named_steps['tfidf']
    clf = model.named_steps['clf']
    
    feature_names = tfidf.get_feature_names_out()
    text_vector = tfidf.transform([preprocessed])
    nonzero_indices = text_vector.nonzero()[1]
    
    # Get important words
    important_words = []
    if len(nonzero_indices) > 0:
        scores = [(feature_names[i], float(text_vector[0, i])) for i in nonzero_indices]
        scores.sort(key=lambda x: x[1], reverse=True)
        important_words = [{"word": w, "weight": round(s, 3)} for w, s in scores[:10]]
    
    return {
        "verdict": verdict,
        "fake_score": round(fake_score * 100, 1),
        "real_score": round(real_score * 100, 1),
        "confidence": round(confidence * 100, 1),
        "features": features,
        "signals": signals,
        "important_words": important_words,
        "preprocessed_length": len(preprocessed.split()),
    }


if __name__ == "__main__":
    train_model()
    
    test = analyze_article(
        "SHOCKING: Government EXPOSED in massive cover-up!",
        "You won't believe what they are hiding from you. Exclusive leaked documents prove conspiracy."
    )
    print(f"Test result: {test['verdict']} ({test['confidence']}% confidence)")