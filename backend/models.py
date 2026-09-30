from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    phone = Column(String)
    email = Column(String, nullable=True)
    blood_group = Column(String)
    city = Column(String)
    emergency_contact = Column(String)
    registration_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    department = Column(String)
    date = Column(String)
    time = Column(String)
    status = Column(String, default="Scheduled") 
    patient = relationship("Patient", back_populates="appointments")

class AmbulanceRequest(Base):
    __tablename__ = "ambulance_requests"
    id = Column(Integer, primary_key=True, index=True)
    pickup_location = Column(String)
    destination_facility = Column(String)
    contact_number = Column(String)
    emergency_priority = Column(String)
    people_count = Column(Integer)
    request_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Requested")
    assigned_ambulance = Column(String, nullable=True)

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    id = Column(Integer, primary_key=True, index=True)
    blood_group = Column(String)
    units_required = Column(Integer)
    units_fulfilled = Column(Integer, default=0)
    location = Column(String)
    contact_person = Column(String)
    contact_number = Column(String)
    urgency = Column(String)
    request_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Open")

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    location = Column(String)
    phone = Column(String)
    services = Column(String)
    status = Column(String, default="Available")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    time = Column(DateTime, default=datetime.utcnow)
    type = Column(String)
