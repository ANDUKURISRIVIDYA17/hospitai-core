# 🏨 HospitAI: Emotional Workforce Management System (EWMS)

HospitAI is an enterprise B2B SaaS architecture designed to transform traditional, rigid hospitality staffing logistics into protective, empathetic infrastructure. By deploying non-invasive ambient computing layers, predictive stress scheduling, and real-time generative upskilling, HospitAI helps frontline workers offload administrative burdens, bridge the "inexperience gap," and act as resilient emotional anchors for travelers.

## 🚀 Core Features & Pillars

### 1. Ambient Tasking Layer (Passive Data Capture)
* **The Problem:** Workers are trapped in a "transactional trap," staring down at legacy Property Management System (PMS) screens or tablets typing data while stressed guests stand waiting.
* **The Solution:** Frontline staff wear discreet earpieces. HospitAI asynchronously processes natural ambient conversation streams via **Gemini 2.5 Flash**, strips conversational filler, and structure actionable logistics payloads directly into backend server databases without human screen intervention.

### 2. Resilience-Based Scheduling (Psychological Shielding)
* **The Problem:** Inexperienced frontline staff absorb traveler friction (delays, disruptions), leading to emotional burnout and operational freezing.
* **The Solution:** The engine analyzes incoming structural triggers (flight tracking delays, weather vectors, room occupancy spikes) via **BigQuery ML** to generate a shifting **Lobby Stress Index (LSI)**. When LSI triggers breach safety thresholds, real-time micro-dose coaching scripts are broadcast to worker wearables to de-escalate tension and protect mental wellness.

### 3. The Enterprise Empathy Ledger (EEL)
* **The Problem:** Legacy metric dashboards evaluate performance purely on robotic speed parameters (e.g., checkout under 3 minutes), punishing meaningful human interaction.
* **The Solution:** Shifts corporate standing to track and reward spontaneous micro-moments of organic human compassion. Workers use autonomous digital "Delight Wallets" to deliver context-aware comfort items (e.g., hot herbal teas for sick guests, customized transit routing cards) which are tracked as core business value metrics.

---

## 🛠️ Technical Stack Architecture

* **Orchestration Brain:** Google GenAI SDK (Gemini 2.5 Flash)
* **Data Warehousing & ML Analytics:** Google BigQuery ML & Vertex AI 
* **Streaming Telemetry pipelines:** Google Cloud Pub/Sub
* **Interactive Operations GUI Frontend:** Streamlit Framework Core

---

## 🧑‍💻 Quick Start: Local Sandbox Deployment

To prototype or test the core computational parsing layer of HospitAI inside your local Python sandbox terminal, follow the layout instructions below.

### 1. Installation
Clone the repository workspace down and run the pip installation wrapper:
```bash
pip install streamlit google-genai pandas
```

### 2. Authentication Environment Configuration
Export your verified Google AI Studio secure access key token directly into your active runtime terminal layout:

**Windows PowerShell:**
```powershell
\$env:GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"
```

**Mac / Linux Terminal:**
```bash
export GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"
```

### 3. Initialize Interactive Web Dashboard Engine
Boot up the Streamlit server dashboard pipeline directly from your local terminal workspace:
```bash
python -m streamlit run app.py
```

---

## 🔒 Security, Compliance & Data Privacy
HospitAI is built natively with zero-trust architecture protocols. All ambient conversation audio data is ingested statelessly in-memory, handled transiently by the Gemini API endpoint layer, and instantly destroyed post-JSON parsing validation. No customer or employee audio waveforms are persisted locally, ensuring strict alignment with enterprise employee privacy thresholds and global compliance guidelines.
