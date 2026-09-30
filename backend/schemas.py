from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PatientBase(BaseModel):
    full_name: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = None
    blood_group: str
    city: str
    emergency_contact: str
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    registration_date: datetime
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    patient_id: int
    department: str
    date: str
    time: str
    status: Optional[str] = "Scheduled"

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    class Config:
        from_attributes = True

class AmbulanceRequestBase(BaseModel):
    pickup_location: str
    destination_facility: str
    contact_number: str
    emergency_priority: str
    people_count: int
    status: Optional[str] = "Requested"
    assigned_ambulance: Optional[str] = None

class AmbulanceRequestCreate(AmbulanceRequestBase):
    pass

class AmbulanceRequest(AmbulanceRequestBase):
    id: int
    request_time: datetime
    class Config:
        from_attributes = True

class BloodRequestBase(BaseModel):
    blood_group: str
    units_required: int
    units_fulfilled: Optional[int] = 0
    location: str
    contact_person: str
    contact_number: str
    urgency: str
    status: Optional[str] = "Open"

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequest(BloodRequestBase):
    id: int
    request_time: datetime
    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    name: str
    type: str
    location: str
    phone: str
    services: str
    status: Optional[str] = "Available"

class FacilityCreate(FacilityBase):
    pass

class Facility(FacilityBase):
    id: int
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    text: str
    type: str

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
    time: datetime
    class Config:
        from_attributes = True
