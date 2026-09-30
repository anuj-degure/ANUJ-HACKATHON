from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from datetime import datetime

from backend.database import engine, get_db
from backend import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareBridge API", description="API for CareBridge Healthcare Coordination Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- DASHBOARD STATS ---
@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    
    todays_appointments = db.query(models.Appointment).filter(models.Appointment.date == str(today)).count()
    pending_requests = db.query(models.AmbulanceRequest).filter(models.AmbulanceRequest.status.in_(["Requested", "Assigned"])).count()
    active_ambulances = db.query(models.Facility).filter(models.Facility.type == "Ambulance Provider", models.Facility.status == "Available").count()
    open_blood_requests = db.query(models.BloodRequest).filter(models.BloodRequest.status == "Open").count()
    
    return {
        "todays_appointments": todays_appointments,
        "pending_requests": pending_requests,
        "active_ambulances": active_ambulances,
        "open_blood_requests": open_blood_requests
    }

# --- PATIENTS ---
@app.get("/api/patients", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

@app.post("/api/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    db.add(models.ActivityLog(text=f"New patient registered: {db_patient.full_name}", type="Patient"))
    db.commit()
    return db_patient

# --- APPOINTMENTS ---
@app.get("/api/appointments", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

@app.post("/api/appointments", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    db.add(models.ActivityLog(text=f"Appointment booked for Patient #{db_appointment.patient_id}", type="Appointment"))
    db.commit()
    return db_appointment

@app.put("/api/appointments/{id}/status", response_model=schemas.Appointment)
def update_appointment_status(id: int, status: str, db: Session = Depends(get_db)):
    db_app = db.query(models.Appointment).filter(models.Appointment.id == id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db_app.status = status
    db.commit()
    db.refresh(db_app)
    db.add(models.ActivityLog(text=f"Appointment #{id} status changed to {status}", type="Appointment"))
    db.commit()
    return db_app

# --- AMBULANCE REQUESTS ---
@app.get("/api/ambulance-requests", response_model=List[schemas.AmbulanceRequest])
def read_ambulance_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AmbulanceRequest).offset(skip).limit(limit).all()

@app.post("/api/ambulance-requests", response_model=schemas.AmbulanceRequest)
def create_ambulance_request(request: schemas.AmbulanceRequestCreate, db: Session = Depends(get_db)):
    db_req = models.AmbulanceRequest(**request.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    db.add(models.ActivityLog(text=f"Ambulance requested for {db_req.pickup_location}", type="Ambulance"))
    db.commit()
    return db_req

@app.put("/api/ambulance-requests/{id}/status", response_model=schemas.AmbulanceRequest)
def update_ambulance_status(id: int, status: str, assigned_ambulance: str = None, db: Session = Depends(get_db)):
    db_req = db.query(models.AmbulanceRequest).filter(models.AmbulanceRequest.id == id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    db_req.status = status
    if assigned_ambulance:
        db_req.assigned_ambulance = assigned_ambulance
    db.commit()
    db.refresh(db_req)
    db.add(models.ActivityLog(text=f"Ambulance Request #{id} status changed to {status}", type="Ambulance"))
    db.commit()
    return db_req

# --- BLOOD REQUESTS ---
@app.get("/api/blood-requests", response_model=List[schemas.BloodRequest])
def read_blood_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.BloodRequest).offset(skip).limit(limit).all()

@app.post("/api/blood-requests", response_model=schemas.BloodRequest)
def create_blood_request(request: schemas.BloodRequestCreate, db: Session = Depends(get_db)):
    db_req = models.BloodRequest(**request.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    db.add(models.ActivityLog(text=f"Blood requirement created - {db_req.blood_group}", type="Blood"))
    db.commit()
    return db_req

@app.put("/api/blood-requests/{id}/status", response_model=schemas.BloodRequest)
def update_blood_status(id: int, status: str, units_fulfilled: int = None, db: Session = Depends(get_db)):
    db_req = db.query(models.BloodRequest).filter(models.BloodRequest.id == id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    db_req.status = status
    if units_fulfilled is not None:
        if units_fulfilled > db_req.units_required:
            raise HTTPException(status_code=400, detail="Fulfilled units cannot exceed required units")
        db_req.units_fulfilled = units_fulfilled
    db.commit()
    db.refresh(db_req)
    db.add(models.ActivityLog(text=f"Blood Request #{id} status changed to {status}", type="Blood"))
    db.commit()
    return db_req

# --- FACILITIES ---
@app.get("/api/facilities", response_model=List[schemas.Facility])
def read_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Facility).offset(skip).limit(limit).all()

# --- ACTIVITY LOGS ---
@app.get("/api/activity", response_model=List[schemas.ActivityLog])
def read_activity(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.time.desc()).offset(skip).limit(limit).all()

# --- FRONTEND SERVING ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=frontend_path), name="static")
app.mount("/css", StaticFiles(directory=os.path.join(frontend_path, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(frontend_path, "js")), name="js")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse(os.path.join(frontend_path, "index.html"))

