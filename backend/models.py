from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Users

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # STUDENT / STAFF
    office = db.Column(db.String(50), nullable=True)  # only for STAFF
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Tickets
class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)

    office = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="OPEN")
    priority = db.Column(db.String(20), default="LOW")

    sla_hours = db.Column(db.Integer, default=24)
    due_at = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    rejection_reason = db.Column(db.Text, nullable=True)
    last_updated_at = db.Column(
    db.DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow
)


# Reports (join existing issue)
class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)

    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"))
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Ticket Updates (Timeline)
class TicketUpdate(db.Model):
    __tablename__ = "ticket_updates"
    id = db.Column(db.Integer, primary_key=True)

    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"))
    message = db.Column(db.String(255))
    by_role = db.Column(db.String(20))  # STAFF, STUDENT, SYSTEM

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


from sqlalchemy import event, select, func

@event.listens_for(Report, "after_insert")
def update_ticket_priority(mapper, connection, target):
    ticket_id = target.ticket_id

    # Count reports using connection (not session)
    report_count_query = select(func.count()).where(Report.ticket_id == ticket_id)
    result = connection.execute(report_count_query)
    report_count = result.scalar()

    # Determine priority
    if report_count >= 10:
        new_priority = "HIGH"
    elif report_count >= 5:
        new_priority = "MEDIUM"
    else:
        new_priority = "LOW"

    # Update ticket directly using connection
    connection.execute(
        Ticket.__table__.update()
        .where(Ticket.id == ticket_id)
        .values(priority=new_priority)
    )

# --- ticket history ---
class TicketHistory(db.Model):
    __tablename__ = "ticket_history"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # CREATED, JOINED, STATUS_CHANGED
    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=True)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

