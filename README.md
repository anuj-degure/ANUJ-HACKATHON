# CareBridge - Healthcare Coordination Platform

**"Connected Care. Coordinated Faster."**

A premium healthcare coordination platform designed for FIT FEST 2026 / FIT FEST Hackathon.

## 1. Problem Statement
Small clinics and patients often struggle to coordinate emergency and routine healthcare workflows (appointments, ambulances, blood requirements). CareBridge centralizes this into a single "Command Center."

## 2. Solution
CareBridge is a unified Care Coordination Hub that provides administrative management, appointment tracking, ambulance coordination, and blood requirement matching without offering medical diagnosis or advice.

## 3. Key Features
- **Command Center Dashboard:** Live stats, upcoming appointments, and emergency quick actions.
- **Appointments Module:** Seamlessly track and update patient appointments.
- **Ambulance Coordination:** Request, assign, and track ambulances with priority routing.
- **Blood Connect:** Filterable active blood requirements with fulfillment tracking.
- **Healthcare Nearby:** Directory of verified hospitals and facilities.
- **Activity Timeline:** Live unified feed of all coordination events.

## 4. Architecture & Technology Stack
- **Architecture:** Monolithic REST API serving a Single Page Application (SPA).
- **Backend:** Python, FastAPI, SQLAlchemy
- **Frontend:** Vanilla JavaScript, HTML5, Tailwind CSS (via CDN)
- **Database:** SQLite (Easily swappable to PostgreSQL via Prisma/SQLAlchemy for production)

## 5. Setup Instructions (Local)
1. Ensure Python 3.10+ is installed.
2. Clone this repository.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database (generates demo data):
   ```bash
   python -m backend.seed
   ```
5. Run the server:
   ```bash
   uvicorn backend.main:app --reload
   ```
6. Open your browser and navigate to `http://127.0.0.1:8000/`.

## 6. Demo Credentials
The application is pre-populated with a demo mode.
- **Email:** `demo@carebridge.app`
- **Password:** `demo123`
- *Note: Just click "Access Command Center" to enter the demo.*

## 7. Google Cloud Run Deployment
The application is fully containerized and Cloud Run ready.

### Deployment Commands:
Ensure you are authenticated with Google Cloud (`gcloud auth login`).

1. Build and push the Docker image:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT-ID]/carebridge
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy carebridge --image gcr.io/[PROJECT-ID]/carebridge --platform managed --allow-unauthenticated --port 8080
   ```

## 8. Responsible Use Disclaimer
*This platform supports administrative and emergency coordination workflows. It does not provide medical diagnosis, treatment recommendations, or clinical decision-making. Demo data is used for presentation purposes.*
