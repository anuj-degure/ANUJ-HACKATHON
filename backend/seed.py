from backend.database import SessionLocal, engine
from backend.models import Base, Patient, Appointment, AmbulanceRequest, BloodRequest, Facility, ActivityLog
from datetime import datetime, timedelta

def seed_db():
    print("Seeding database...")
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(Patient).count() > 0:
        print("Database already seeded.")
        return

    # Seed Patients
    patients = [
        Patient(full_name="John Doe", age=45, gender="Male", phone="555-0101", blood_group="O+", city="Metropolis", emergency_contact="Jane Doe (555-0102)"),
        Patient(full_name="Alice Smith", age=32, gender="Female", phone="555-0201", blood_group="A-", city="Metropolis", emergency_contact="Bob Smith (555-0202)"),
        Patient(full_name="Robert Johnson", age=68, gender="Male", phone="555-0301", blood_group="B+", city="Star City", emergency_contact="Mary Johnson (555-0302)"),
        Patient(full_name="Emily Davis", age=25, gender="Female", phone="555-0401", blood_group="AB+", city="Gotham", emergency_contact="Michael Davis (555-0402)"),
        Patient(full_name="William Brown", age=50, gender="Male", phone="555-0501", blood_group="O-", city="Metropolis", emergency_contact="Sarah Brown (555-0502)")
    ]
    db.add_all(patients)
    db.commit()

    # Get patients for foreign keys
    p_john = db.query(Patient).filter(Patient.full_name == "John Doe").first()
    p_alice = db.query(Patient).filter(Patient.full_name == "Alice Smith").first()
    
    today_str = datetime.utcnow().date().isoformat()
    tomorrow_str = (datetime.utcnow() + timedelta(days=1)).date().isoformat()

    # Seed Appointments
    appointments = [
        Appointment(patient_id=p_john.id, department="Cardiology", date=today_str, time="10:00", status="Scheduled"),
        Appointment(patient_id=p_alice.id, department="General Practice", date=today_str, time="11:30", status="Confirmed"),
        Appointment(patient_id=3, department="Orthopedics", date=tomorrow_str, time="09:00", status="Scheduled"),
        Appointment(patient_id=4, department="Dermatology", date=tomorrow_str, time="14:00", status="Scheduled")
    ]
    db.add_all(appointments)
    
    # Seed Ambulance Requests
    amb_requests = [
        AmbulanceRequest(pickup_location="123 Main St, Metropolis", destination_facility="City General", contact_number="555-9999", emergency_priority="High", people_count=1, status="En Route", assigned_ambulance="AMB-01"),
        AmbulanceRequest(pickup_location="456 Elm St, Star City", destination_facility="Star Med", contact_number="555-8888", emergency_priority="Critical", people_count=2, status="Requested")
    ]
    db.add_all(amb_requests)
    
    # Seed Blood Requests
    blood_requests = [
        BloodRequest(blood_group="O+", units_required=2, location="City General", contact_person="Dr. Adams", contact_number="555-7777", urgency="High", status="Open"),
        BloodRequest(blood_group="A-", units_required=1, location="Star Med", contact_person="Nurse Betty", contact_number="555-6666", urgency="Normal", status="Partially Fulfilled")
    ]
    db.add_all(blood_requests)
    
    # Seed Facilities
    facilities = [
        Facility(name="City General Hospital", type="Hospital", location="Downtown Metropolis", phone="555-1111", services="Emergency, Surgery, ICU", status="Available"),
        Facility(name="Star City Medical Center", type="Hospital", location="Star City Center", phone="555-2222", services="General, Pediatrics", status="Available"),
        Facility(name="Metropolis Blood Bank", type="Blood Bank", location="Westside Metropolis", phone="555-3333", services="Blood Donation, Plasma", status="Available"),
        Facility(name="Fast Response Ambulance", type="Ambulance Provider", location="Metropolis", phone="555-4444", services="ALS, BLS", status="Available")
    ]
    db.add_all(facilities)

    # Seed Activity Logs
    logs = [
        ActivityLog(text="Patient John Doe registered.", type="Patient"),
        ActivityLog(text="Ambulance requested at 123 Main St.", type="Ambulance"),
        ActivityLog(text="Blood requirement (O+) created at City General.", type="Blood")
    ]
    db.add_all(logs)
    
    db.commit()
    db.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_db()
