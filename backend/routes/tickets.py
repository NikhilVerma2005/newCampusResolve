from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from models import db, Ticket, Report
from services.routing import route_ticket
import re
from models import TicketHistory


tickets_bp = Blueprint("tickets_bp", __name__, url_prefix="/api/tickets")


@tickets_bp.route("", methods=["POST"])
def create_ticket():
    data = request.json

    title = data.get("title")
    location = data.get("location")
    description = data.get("description")
    student_id = data.get("student_id")

    office = route_ticket(location)
    due_at = datetime.utcnow() + timedelta(hours=24)

    ticket = Ticket(
        title = title,
        location = location,
        office = office,
        due_at = due_at
    )
    db.session.add(ticket)
    db.session.flush()  # <-- generates ticket.id without committing

    history = TicketHistory(
    ticket_id=ticket.id,
    action="CREATED",
    new_status="OPEN",
    note="Ticket created by student"
    )
    db.session.add(history)

    report = Report(
        ticket_id = ticket.id,
        student_id = student_id,
        description = description
    )
    db.session.add(report)
    
    db.session.commit()

    return jsonify({
        "message": "Ticket created",
        "ticket_id" : ticket.id,
        "office" : office
    }), 201

# --- suggestions ---
def normalize(text):
    return set(re.findall(r"\w+",text.lower()))


@tickets_bp.route("/suggestions", methods=["GET"])
def suggest_tickets():
    query = request.args.get("query", "")
    location = request.args.get("location", "")

    if not query or not location:
        return jsonify([])

    keywords = normalize(query)

    tickets = Ticket.query.filter(
        # Ticket.location == location,
        Ticket.location.ilike(location),

        Ticket.status.in_(["OPEN", "IN_PROGRESS"])
    ).all()

    suggestions = []

    for t in tickets:
        title_words = normalize(t.title)
        overlap = keywords.intersection(title_words)

        if len(overlap) >= 1:
            report_count = Report.query.filter_by(ticket_id=t.id).count()
            suggestions.append({
                "ticket_id": t.id,
                "title": t.title,
                "location": t.location,
                "office": t.office,
                "status": t.status,
                "report_count": report_count
            })

    return jsonify(suggestions)


# -----join existing ticket----


@tickets_bp.route("/<int:ticket_id>/join", methods=["POST"])
def join_ticket(ticket_id):
    data = request.get_json()

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if ticket.status in ["RESOLVED", "REJECTED"]:
        return jsonify({"error": "Cannot join finalised ticket"}), 400

    # Prevent duplicate join
    existing = Report.query.filter_by(
        ticket_id=ticket_id,
        student_id=data["student_id"]
    ).first()

    if existing:
        return jsonify({"error": "Already joined this ticket"}), 400

    try:
        # Add timelines
        history = TicketHistory(
        ticket_id=ticket.id,
        action="JOINED",
        note=f"Student {data['student_id']} joined"
        )
        db.session.add(history)        

        # Add report
        report = Report(
            ticket_id=ticket_id,
            student_id=data["student_id"],
            description=data["description"]
        )
        db.session.add(report)
        db.session.commit()

        report_count = Report.query.filter_by(ticket_id=ticket_id).count()

        return jsonify({
            "message": "Joined existing ticket",
            "ticket_id": ticket.id,
            "new_priority": ticket.priority,
            "report_count": report_count
        }), 200


    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Join failed"}), 500


#--- ticket status (open-> in progress/discarded-> resolved)---

@tickets_bp.route("/<int:ticket_id>/status", methods=["PATCH"])
def update_ticket_status(ticket_id):
    data = request.get_json()

    if "status" not in data:
        return jsonify({"error": "New status required"}), 400

    new_status = data["status"]

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    current_status = ticket.status

    ALLOWED_TRANSITIONS = {
        "OPEN": ["IN_PROGRESS", "REJECTED"],
        "IN_PROGRESS": ["RESOLVED"],
        "RESOLVED": [],
        "REJECTED": []
    }

    # Check if transition is allowed
    if new_status not in ALLOWED_TRANSITIONS.get(current_status, []):
        return jsonify({
            "error": f"Cannot change status from {current_status} to {new_status}"
        }), 400

    # If rejecting → require reason
    if new_status == "REJECTED":
        reason = data.get("reason")
        if not reason:
            return jsonify({"error": "Rejection reason required"}), 400
        ticket.rejection_reason = reason

    ticket.status = new_status

    try:
        old_status = current_status

        history = TicketHistory(
            ticket_id=ticket.id,
            action="STATUS_CHANGED",
            old_status=old_status,
            new_status=new_status,
            note=data.get("reason")
        )
        db.session.add(history)

        db.session.commit()
        return jsonify({
            "message": "Status updated successfully",
            "ticket_id": ticket.id,
            "old_status": current_status,
            "new_status": new_status
        }), 200
    except:
        db.session.rollback()
        return jsonify({"error": "Status update failed"}), 500


#--- get timeline view api ---
@tickets_bp.route("/<int:ticket_id>/timeline", methods=["GET"])
def get_ticket_timeline(ticket_id):
    history = TicketHistory.query.filter_by(ticket_id=ticket_id)\
        .order_by(TicketHistory.created_at.asc()).all()

    result = []

    for h in history:
        result.append({
            "action": h.action,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "note": h.note,
            "timestamp": h.created_at.isoformat()
        })

    return jsonify(result)


# --- top tickets ---
@tickets_bp.route("/top", methods=["GET"])
def top_tickets():
    tickets = Ticket.query.filter(
        Ticket.status.in_(["OPEN", "IN_PROGRESS"])
    ).all()

    result = []

    for t in tickets:
        report_count = Report.query.filter_by(ticket_id=t.id).count()
        result.append({
            "ticket_id": t.id,
            "title": t.title,
            "priority": t.priority,
            "status": t.status,
            "report_count": report_count
        })

    # Sort by priority then report count
    priority_order = {"HIGH": 1, "MEDIUM": 2, "LOW": 3}

    result.sort(
        key=lambda x: (
            priority_order.get(x["priority"], 99),
            -x["report_count"]
        )
    )

    return jsonify(result[:6])
