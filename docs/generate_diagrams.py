"""
Génère un PDF avec tous les diagrammes UML du projet PFE.
Chaque diagramme sur une page séparée (A3 paysage pour plus d'espace).
"""
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "UML_Diagrams.pdf")
PAGE = landscape(A3)
W, H = PAGE

# Theme colors (matching app)
FOREST  = HexColor('#047857')
FOREST2 = HexColor('#065f46')
ROYAL   = HexColor('#1e3a8a')
ROYAL2  = HexColor('#1e40af')
EMERALD = HexColor('#10b981')
LIGHT   = HexColor('#e6f4ee')
LIGHT2  = HexColor('#dbeafe')
TEXT    = HexColor('#0f172a')
MUTED   = HexColor('#64748b')
LINE    = HexColor('#cbd5e1')

c = canvas.Canvas(OUT, pagesize=PAGE)
c.setTitle("Arabic Quality Platform - UML Diagrams")
c.setAuthor("Badr Zayani - PFE 2026")

# ─────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────

def page_header(title, subtitle=""):
    c.setFillColor(HexColor('#060b1a'))
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, H - 35, title)
    if subtitle:
        c.setFont("Helvetica", 11)
        c.setFillColor(HexColor('#94a3b8'))
        c.drawString(40, H - 52, subtitle)
    c.setFillColor(HexColor('#10b981'))
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(W - 40, H - 35, "Arabic Quality Platform")
    c.setFillColor(HexColor('#94a3b8'))
    c.setFont("Helvetica", 9)
    c.drawRightString(W - 40, H - 52, "Badr Zayani - PFE 2026")
    c.setFillColor(TEXT)

def page_footer(page_num, total):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(40, 30, W - 40, 30)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(40, 18, "PFE - Arabic Quality Platform - UML Diagrams")
    c.drawRightString(W - 40, 18, f"Page {page_num} / {total}")
    c.setFillColor(TEXT)

def box(x, y, w, h, fill=LIGHT, stroke=FOREST, radius=8, line_width=1.5):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line_width)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def text_in_box(x, y, w, h, text, font="Helvetica-Bold", size=11, color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(x + w/2, y + h/2 - size/3, text)

def actor(cx, cy, label, color=FOREST):
    r = 8
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(2)
    c.circle(cx, cy + 20, r, fill=1, stroke=0)
    c.line(cx, cy + 12, cx, cy - 8)
    c.line(cx - 11, cy + 4, cx + 11, cy + 4)
    c.line(cx, cy - 8, cx - 9, cy - 22)
    c.line(cx, cy - 8, cx + 9, cy - 22)
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(cx, cy - 36, label)

def ellipse(cx, cy, rw, rh, label, fill=LIGHT, stroke=FOREST, font_size=8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1.2)
    c.ellipse(cx - rw, cy - rh, cx + rw, cy + rh, fill=1, stroke=1)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", font_size)
    if len(label) > 20:
        words = label.split()
        if len(words) >= 2:
            mid = len(words) // 2
            line1 = " ".join(words[:mid])
            line2 = " ".join(words[mid:])
            c.drawCentredString(cx, cy + font_size/2 + 1, line1)
            c.drawCentredString(cx, cy - font_size/2 - 1, line2)
        else:
            c.drawCentredString(cx, cy - font_size/3, label)
    else:
        c.drawCentredString(cx, cy - font_size/3, label)

def arrow(x1, y1, x2, y2, color=MUTED, dash=None, width=1, head=True, label=None):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    if dash:
        c.setDash(dash)
    c.line(x1, y1, x2, y2)
    if dash:
        c.setDash()
    if head:
        ang = math.atan2(y2 - y1, x2 - x1)
        ah = 6
        p1x = x2 - ah * math.cos(ang - math.pi/7)
        p1y = y2 - ah * math.sin(ang - math.pi/7)
        p2x = x2 - ah * math.cos(ang + math.pi/7)
        p2y = y2 - ah * math.sin(ang + math.pi/7)
        path = c.beginPath()
        path.moveTo(x2, y2)
        path.lineTo(p1x, p1y)
        path.lineTo(p2x, p2y)
        path.close()
        c.setFillColor(color)
        c.drawPath(path, fill=1, stroke=0)
    if label:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7.5)
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + 6
        c.drawCentredString(mx, my, label)

# ─────────────────────────────────────────────────────────────────────
#  PAGE 1 - Cover
# ─────────────────────────────────────────────────────────────────────
c.setFillColor(HexColor('#060b1a'))
c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillColor(HexColor('#047857'))
c.circle(W * 0.15, H * 0.85, 220, fill=1, stroke=0)
c.setFillColor(HexColor('#1e3a8a'))
c.circle(W * 0.85, H * 0.15, 280, fill=1, stroke=0)

c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 48)
c.drawCentredString(W/2, H/2 + 80, "Arabic Quality Platform")
c.setFillColor(HexColor('#6ee7b7'))
c.setFont("Helvetica", 22)
c.drawCentredString(W/2, H/2 + 40, "UML Design Document")
c.setFillColor(HexColor('#94a3b8'))
c.setFont("Helvetica-Oblique", 13)
c.drawCentredString(W/2, H/2 + 10, "Quality assessment of Arabic teaching for non-native speakers")

c.setFillColor(HexColor('#cbd5e1'))
c.setFont("Helvetica-Bold", 12)
c.drawCentredString(W/2, H/2 - 50, "Diagrams included")

diagrams = [
    "1. Use Case Diagram",
    "2. Class Diagram (Domain Model)",
    "3. Sequence Diagram - Registration Approval Workflow",
    "4. State Machine - Evaluation Request Lifecycle",
    "5. Architecture Diagram (3-tier + Keycloak)",
    "6. Entity-Relationship Diagram (ERD)",
    "7. Deployment Diagram (Docker Containers)",
    "8. Activity Diagram - Full Evaluation Cycle",
]
c.setFont("Helvetica", 11)
c.setFillColor(HexColor('#94a3b8'))
for i, d in enumerate(diagrams):
    c.drawCentredString(W/2, H/2 - 75 - i * 18, d)

c.setFillColor(HexColor('#64748b'))
c.setFont("Helvetica", 10)
c.drawCentredString(W/2, 60, "Badr Zayani - mohamed.zayani-e@erlm.tn")
c.drawCentredString(W/2, 45, "Projet de Fin d'Etudes - 2026")
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 2 - USE CASE DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("1. Use Case Diagram",
            "Actors and their interactions with the platform")

c.setStrokeColor(ROYAL)
c.setLineWidth(2)
c.setFillColor(HexColor('#f1f5f9'))
c.roundRect(220, 90, W - 440, H - 200, 12, fill=1, stroke=1)
c.setFillColor(ROYAL)
c.setFont("Helvetica-Bold", 12)
c.drawString(240, H - 130, "Arabic Quality Platform")
c.setFillColor(TEXT)

# Actors left
actor(110, H - 200, "Visitor")
actor(110, H - 320, "Entity Manager", ROYAL)
actor(110, H - 460, "Evaluator", FOREST)
actor(110, H - 590, "Admin Reviewer", FOREST2)

# Actors right
actor(W - 110, H - 220, "Field Reviewer", ROYAL2)
actor(W - 110, H - 360, "Platform Admin", FOREST)
actor(W - 110, H - 520, "Keycloak (sys)", MUTED)
actor(W - 110, H - 650, "Email Service", MUTED)

# Use cases - Visitor
ellipse(310, H - 200, 65, 20, "Register institution")
# Entity Manager
ellipse(310, H - 280, 55, 20, "Log in (OIDC)")
ellipse(440, H - 280, 65, 20, "Submit eval request")
ellipse(310, H - 340, 55, 18, "Track status")
ellipse(440, H - 340, 60, 18, "View results / PDF")
# Evaluator
ellipse(310, H - 430, 55, 18, "View inbox")
ellipse(440, H - 430, 55, 18, "Review answers")
ellipse(560, H - 430, 55, 18, "Adjust ratings")
ellipse(310, H - 480, 55, 18, "Issue decision")
# Admin Reviewer
ellipse(310, H - 580, 65, 20, "Admin approval")
ellipse(450, H - 580, 60, 20, "Reject w/ reason")
# Field Reviewer
ellipse(W - 320, H - 240, 60, 20, "Field approval")
ellipse(W - 320, H - 290, 65, 20, "Final decision")
# Platform Admin
ellipse(W - 320, H - 360, 65, 20, "Manage users")
ellipse(W - 320, H - 410, 60, 20, "Manage catalog")
ellipse(W - 320, H - 460, 60, 20, "View analytics")
ellipse(W - 470, H - 360, 65, 20, "Approve registrations")
ellipse(W - 470, H - 410, 60, 20, "Distribute requests")
ellipse(W - 470, H - 460, 55, 20, "View audit log")
# Keycloak
ellipse(W - 320, H - 520, 60, 20, "Authenticate")
ellipse(W - 320, H - 570, 65, 20, "Provision user")
# Email
ellipse(W - 320, H - 650, 60, 20, "Send email")

# Connections
arrow(135, H - 195, 245, H - 200, head=False)
arrow(135, H - 320, 255, H - 280, head=False)
arrow(135, H - 320, 375, H - 280, head=False)
arrow(135, H - 320, 255, H - 340, head=False)
arrow(135, H - 320, 380, H - 340, head=False)
arrow(135, H - 460, 255, H - 430, head=False)
arrow(135, H - 460, 385, H - 430, head=False)
arrow(135, H - 460, 505, H - 430, head=False)
arrow(135, H - 460, 255, H - 480, head=False)
arrow(135, H - 590, 245, H - 580, head=False)
arrow(135, H - 590, 390, H - 580, head=False)
arrow(W - 135, H - 220, W - 380, H - 240, head=False)
arrow(W - 135, H - 220, W - 385, H - 290, head=False)
arrow(W - 135, H - 360, W - 385, H - 360, head=False)
arrow(W - 135, H - 360, W - 380, H - 410, head=False)
arrow(W - 135, H - 360, W - 380, H - 460, head=False)
arrow(W - 135, H - 360, W - 535, H - 360, head=False)
arrow(W - 135, H - 360, W - 530, H - 410, head=False)
arrow(W - 135, H - 360, W - 525, H - 460, head=False)
arrow(W - 135, H - 520, W - 380, H - 520, head=False)
arrow(W - 135, H - 520, W - 385, H - 570, head=False)
arrow(W - 135, H - 650, W - 380, H - 650, head=False)

# Legend
c.setFillColor(LIGHT)
c.setStrokeColor(LINE)
c.roundRect(W - 280, 60, 250, 50, 6, fill=1, stroke=1)
c.setFillColor(TEXT)
c.setFont("Helvetica-Bold", 9)
c.drawString(W - 270, 92, "Legend")
c.setFont("Helvetica", 8)
c.drawString(W - 270, 78, "Stick figure = Actor (human or system)")
c.drawString(W - 270, 66, "Ellipse = Use case")

page_footer(2, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 3 - CLASS DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("2. Class Diagram",
            "Core domain entities and their relationships")

def uml_class(x, y, w, name, attrs, fill=LIGHT):
    attr_h = 12
    head_h = 22
    body_h = max(len(attrs) * attr_h + 6, 30)
    total_h = head_h + body_h
    c.setFillColor(fill)
    c.setStrokeColor(FOREST)
    c.setLineWidth(1.2)
    c.rect(x, y - total_h, w, total_h, fill=1, stroke=1)
    c.setFillColor(FOREST2)
    c.rect(x, y - head_h, w, head_h, fill=1, stroke=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(x + w/2, y - 15, name)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 7.5)
    for i, a in enumerate(attrs):
        c.drawString(x + 6, y - head_h - 11 - i * attr_h, a)
    return total_h

uml_class(60, H - 90, 150, "User", [
    "- id: Long", "- kcId: UUID", "- email: String",
    "- fullName: String", "- role: Role", "- active: boolean"])
uml_class(240, H - 90, 140, "Role", [
    "- id: Long", "- code: String",
    "- nameAr: String", "- nameEn: String"])
uml_class(410, H - 90, 160, "EducationalEntity", [
    "- id: Long", "- name: String", "- country: String",
    "- city: String", "- manager: User", "- active: boolean"])
uml_class(600, H - 90, 190, "RegistrationRequest", [
    "- id: Long", "- entityName: String", "- managerName: String",
    "- email: String", "- status: ENUM(3)",
    "- reviewedBy: User", "- rejectionReason: String"])
uml_class(820, H - 90, 200, "EvaluationRequest", [
    "- id: Long", "- requestNumber: String", "- entity: Entity",
    "- status: RequestStatus(13)", "- finalScore: Decimal",
    "- finalPercentage: Decimal", "- locked: boolean"])

uml_class(60, H - 280, 160, "EvaluationCategory", [
    "- id: Long", "- code: String", "- nameAr / nameEn",
    "- displayOrder: int", "- active: boolean"])
uml_class(250, H - 280, 150, "Question", [
    "- id: Long", "- category: Category", "- textAr / textEn",
    "- requiresAttachment", "- active: boolean"])
uml_class(430, H - 280, 150, "EvaluationValue", [
    "- id: Long", "- code: A/B/C/D",
    "- labelAr / labelEn", "- numericScore: Decimal"])
uml_class(610, H - 280, 180, "RequiredDocument", [
    "- id: Long", "- category: Category",
    "- labelAr / labelEn", "- mandatory: boolean",
    "- displayOrder: int"])
uml_class(820, H - 280, 200, "EvaluationAnswer", [
    "- id: Long", "- request: EvaluationRequest",
    "- question: Question", "- initialValue: Value",
    "- finalValue: Value", "- evaluatorNote: String"])

uml_class(60, H - 480, 180, "WorkflowDecision", [
    "- id: Long", "- request: EvalRequest",
    "- stage: INIT/ADMIN/FIELD",
    "- decision: APPR/REJECT/INFO",
    "- decidedBy: User", "- notes: String"])
uml_class(270, H - 480, 170, "RequestAssignment", [
    "- id: Long", "- request: EvalRequest",
    "- stage: INIT/ADMIN/FIELD",
    "- assignedUser: User", "- isAuto: boolean"])
uml_class(470, H - 480, 160, "FinalReport", [
    "- id: Long", "- request: EvalRequest",
    "- fileUuid: UUID", "- language: ar/en",
    "- sha256: String"])
uml_class(660, H - 480, 170, "Notification", [
    "- id: Long", "- user: User",
    "- eventType: String", "- titleAr / titleEn",
    "- isRead: boolean"])
uml_class(860, H - 480, 170, "AuditLog", [
    "- id: Long", "- userId: Long",
    "- actionType: String", "- entityType: String",
    "- beforeValue: JSON", "- afterValue: JSON"])

# Relationships
arrow(240, H - 130, 210, H - 130, color=FOREST, label="1..*")
arrow(410, H - 140, 210, H - 140, color=FOREST, label="manages 1:1")
arrow(820, H - 150, 790, H - 150, color=FOREST, label="submits 1:*")
arrow(250, H - 310, 220, H - 310, color=ROYAL, label="1:*")
arrow(610, H - 340, 220, H - 340, color=ROYAL, label="has 1:*")
arrow(820, H - 310, 400, H - 310, color=ROYAL, label="answered 1:*")
arrow(920, H - 220, 920, H - 280, color=FOREST, dash=(3,3), label="1:*")
arrow(150, H - 480, 150, H - 280, color=FOREST, dash=(3,3), label="1:* (1-3)")
arrow(550, H - 480, 870, H - 220, color=FOREST, dash=(3,3), label="1:1")

page_footer(3, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 4 - SEQUENCE DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("3. Sequence Diagram",
            "Registration approval - Admin approves -> Keycloak user + email")

lifelines = [
    ("Visitor", 130, FOREST),
    ("Angular SPA", 290, ROYAL),
    ("Spring Boot API", 470, FOREST2),
    ("MySQL", 630, MUTED),
    ("Keycloak", 790, ROYAL2),
    ("MailHog SMTP", 940, FOREST),
    ("Admin", 1080, FOREST),
]

TOP_Y = H - 100
BOT_Y = 80
for name, x, col in lifelines:
    box(x - 55, TOP_Y - 28, 110, 28, fill=col, stroke=col, radius=6)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(x, TOP_Y - 18, name)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.setDash(3, 3)
    c.line(x, TOP_Y - 28, x, BOT_Y)
    c.setDash()

def msg(from_x, to_x, y, label, dash=None):
    color = ROYAL if not dash else MUTED
    arrow(from_x, y, to_x, y, color=color, dash=dash, width=1.2, head=True)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 8.5)
    if from_x < to_x:
        c.drawString(from_x + 6, y + 3, label)
    else:
        c.drawRightString(from_x - 6, y + 3, label)

def activation(x, y_top, y_bottom):
    c.setFillColor(HexColor('#fef3c7'))
    c.setStrokeColor(HexColor('#92400e'))
    c.setLineWidth(0.8)
    c.rect(x - 4, y_bottom, 8, y_top - y_bottom, fill=1, stroke=1)

y = TOP_Y - 60
msg(130, 290, y, "1. Fill registration form")
activation(290, y, y - 10)
y -= 18
msg(290, 470, y, "2. POST /public/registration-requests")
activation(470, y, y - 30)
y -= 18
msg(470, 630, y, "3. INSERT registration_request (PENDING)")
activation(630, y, y - 8)
y -= 18
msg(630, 470, y - 4, "201 Created", dash=(3,3))

y -= 30
c.setFillColor(HexColor('#fde68a'))
c.setStrokeColor(HexColor('#92400e'))
c.rect(40, y - 10, W - 80, 20, fill=1, stroke=1)
c.setFillColor(TEXT)
c.setFont("Helvetica-Bold", 9)
c.drawString(50, y - 2, "loop [admin checks queue periodically]")

y -= 28
msg(1080, 290, y, "4. Open /admin/registrations", dash=(3,3))
y -= 18
msg(290, 470, y, "5. GET /admin/registrations?status=PENDING")
y -= 18
msg(470, 630, y, "6. SELECT WHERE status=PENDING")
y -= 18
msg(630, 470, y - 4, "List of pending", dash=(3,3))
y -= 18
msg(470, 290, y - 2, "JSON page", dash=(3,3))

y -= 25
msg(1080, 290, y, "7. Click Review -> Approve")
y -= 18
msg(290, 470, y, "8. POST /admin/registrations/{id}/approve")
activation(470, y - 4, y - 130)
y -= 22
msg(470, 790, y, "9. createUser(email, role, lang)")
activation(790, y, y - 28)
y -= 18
msg(790, 790, y, "10. Hash password + generate UUID")
y -= 18
msg(790, 470, y - 4, "kcId (UUID)", dash=(3,3))

y -= 22
msg(470, 630, y, "11. INSERT users (kc_id, email, role_id)")
y -= 18
msg(470, 630, y, "12. INSERT educational_entities")
y -= 18
msg(470, 630, y, "13. UPDATE registration_request SET status=APPROVED")

y -= 25
msg(470, 940, y, "14. sendWelcome(email) [@Async]", dash=(2,2))
y -= 18
msg(790, 940, y, "15. sendSetPasswordEmail()", dash=(2,2))

y -= 22
msg(470, 290, y - 4, "200 OK { entityId, userId, kcId }", dash=(3,3))
y -= 18
msg(290, 1080, y, "Toast: 'Approved + email sent'", dash=(3,3))

y -= 30
c.setFillColor(HexColor('#fffbeb'))
c.setStrokeColor(HexColor('#92400e'))
c.rect(60, y - 25, 700, 30, fill=1, stroke=1)
c.setFillColor(HexColor('#92400e'))
c.setFont("Helvetica-Oblique", 8.5)
c.drawString(70, y - 8, "Note: email failures are non-blocking (caught + logged). Transaction commits even if SMTP unreachable.")

page_footer(4, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 5 - STATE DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("4. State Machine Diagram",
            "Lifecycle of an EvaluationRequest - 13 states governed by role-based transitions")

c.setFillColor(TEXT)
c.circle(120, H - 200, 8, fill=1, stroke=0)

states = [
    (180, H - 215, 100, 36, "DRAFT", LIGHT),
    (320, H - 215, 130, 36, "PENDING_REVIEW", LIGHT),
    (490, H - 215, 150, 36, "UNDER_EVALUATION", LIGHT2),
    (700, H - 290, 140, 34, "INFO_REQUESTED", HexColor('#fef3c7')),
    (700, H - 215, 150, 36, "APPROVED_INITIAL", HexColor('#d1fae5')),
    (700, H - 145, 140, 34, "REJECTED_INITIAL", HexColor('#fee2e2')),
    (900, H - 215, 140, 36, "PENDING_ADMIN", LIGHT2),
    (900, H - 145, 140, 34, "REJECTED_ADMIN", HexColor('#fee2e2')),
    (900, H - 380, 140, 36, "APPROVED_ADMIN", HexColor('#d1fae5')),
    (700, H - 380, 140, 36, "PENDING_FIELD", LIGHT2),
    (480, H - 380, 140, 36, "REJECTED_FINAL", HexColor('#fee2e2')),
    (480, H - 455, 140, 36, "APPROVED_FINAL", HexColor('#a7f3d0')),
    (290, H - 455, 140, 36, "COMPLETED", HexColor('#10b981')),
]

for (x, y, w, h, label, fill) in states:
    box(x, y, w, h, fill=fill, stroke=FOREST, radius=10, line_width=1.5)
    color = colors.white if label == "COMPLETED" else TEXT
    text_in_box(x, y, w, h, label, font="Helvetica-Bold", size=10, color=color)

trans = [
    (128, H - 200, 180, H - 197, "create"),
    (280, H - 197, 320, H - 197, "submit()"),
    (450, H - 197, 490, H - 197, "assign()"),
    (640, H - 197, 700, H - 197, "evaluate->approve"),
    (640, H - 206, 700, H - 273, "request info"),
    (640, H - 188, 700, H - 145, "reject"),
    (700, H - 273, 700, H - 215, "info provided"),
    (850, H - 197, 900, H - 197, "->admin"),
    (900, H - 215, 900, H - 145, "reject admin"),
    (970, H - 215, 970, H - 380, "approve admin"),
    (900, H - 362, 840, H - 362, "->field"),
    (700, H - 362, 620, H - 362, "reject final"),
    (550, H - 380, 550, H - 455, "approve final"),
    (480, H - 437, 430, H - 437, "score+report"),
]
for t in trans:
    arrow(*t[:4], color=FOREST2, label=t[4], width=1.2)

c.setStrokeColor(TEXT)
c.setFillColor(colors.white)
c.setLineWidth(2)
c.circle(220, H - 437, 11, fill=1, stroke=1)
c.setFillColor(TEXT)
c.circle(220, H - 437, 6, fill=1, stroke=0)

c.setFillColor(LIGHT)
c.setStrokeColor(LINE)
c.roundRect(60, 60, W - 120, 55, 6, fill=1, stroke=1)
c.setFillColor(TEXT)
c.setFont("Helvetica-Bold", 9)
c.drawString(75, 95, "Legend")
c.setFont("Helvetica", 8)
c.drawString(75, 82, "DRAFT/PENDING/UNDER_EVALUATION - In-progress states")
c.drawString(75, 70, "APPROVED_INITIAL/ADMIN - Successful intermediate transitions")
c.setFillColor(HexColor('#fee2e2'))
c.rect(440, 75, 12, 12, fill=1, stroke=0)
c.setFillColor(TEXT)
c.drawString(458, 78, "REJECTED_* - Terminal failure (can re-submit)")
c.setFillColor(HexColor('#10b981'))
c.rect(440, 92, 12, 12, fill=1, stroke=0)
c.setFillColor(TEXT)
c.drawString(458, 95, "COMPLETED - Report available, request locked")

page_footer(5, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 6 - ARCHITECTURE DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("5. Architecture Diagram",
            "3-tier modular monolith with Keycloak delegation (OAuth2/OIDC)")

box(80, H - 200, 220, 80, fill=HexColor('#dcfce7'), stroke=FOREST, radius=12)
c.setFillColor(FOREST2)
c.setFont("Helvetica-Bold", 11)
c.drawString(95, H - 140, "Client Layer")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(95, H - 156, "Angular 17 SPA")
c.drawString(95, H - 168, "keycloak-angular + Tailwind")
c.drawString(95, H - 180, "ngx-translate (AR/EN, RTL/LTR)")
c.drawString(95, H - 192, "Three.js hero crystal")

box(380, H - 200, 220, 80, fill=HexColor('#dbeafe'), stroke=ROYAL, radius=12)
c.setFillColor(ROYAL)
c.setFont("Helvetica-Bold", 11)
c.drawString(395, H - 140, "Identity Provider")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(395, H - 156, "Keycloak 24")
c.drawString(395, H - 168, "Realm: arabic-quality")
c.drawString(395, H - 180, "5 realm roles - 2 OAuth clients")
c.drawString(395, H - 192, "PKCE S256, MFA-ready")

box(680, H - 200, 220, 80, fill=HexColor('#dcfce7'), stroke=FOREST, radius=12)
c.setFillColor(FOREST2)
c.setFont("Helvetica-Bold", 11)
c.drawString(695, H - 140, "API Layer")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(695, H - 156, "Spring Boot 3.2")
c.drawString(695, H - 168, "OAuth2 Resource Server")
c.drawString(695, H - 180, "AOP audit, @Async emails")
c.drawString(695, H - 192, "iText 7 PDF, Apache POI Excel")

box(980, H - 200, 130, 80, fill=HexColor('#fef3c7'), stroke=HexColor('#92400e'), radius=12)
c.setFillColor(HexColor('#92400e'))
c.setFont("Helvetica-Bold", 11)
c.drawString(995, H - 140, "Notifications")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(995, H - 156, "MailHog (dev)")
c.drawString(995, H - 168, "SMTP :1025")
c.drawString(995, H - 180, "Thymeleaf bilingual")
c.drawString(995, H - 192, "WebSocket (planned)")

modules_y = H - 300
modules = ["auth", "users", "entities", "catalog", "requests", "evaluation",
           "workflow", "scoring", "audit", "notifications", "reports", "assignment"]
c.setFillColor(MUTED)
c.setFont("Helvetica-Bold", 10)
c.drawString(60, modules_y, "Business Modules (modular monolith - DDD bounded contexts)")

mx = 60
my = modules_y - 30
for m in modules:
    box(mx, my, 90, 28, fill=LIGHT, stroke=FOREST2, radius=6, line_width=1)
    text_in_box(mx, my, 90, 28, m, font="Helvetica-Bold", size=9)
    mx += 95
    if mx > W - 100:
        mx = 60
        my -= 32

db_y = H - 450
box(80, db_y - 90, 320, 80, fill=HexColor('#f0fdf4'), stroke=FOREST, radius=12)
c.setFillColor(FOREST2)
c.setFont("Helvetica-Bold", 11)
c.drawString(95, db_y - 30, "Persistence - Application DB")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(95, db_y - 46, "MySQL 8 - 16 tables + 2 views")
c.drawString(95, db_y - 58, "Flyway-managed migrations")
c.drawString(95, db_y - 70, "audit_log: immuable")
c.drawString(95, db_y - 82, "users.kc_id ↔ Keycloak UUID")

box(480, db_y - 90, 220, 80, fill=HexColor('#dbeafe'), stroke=ROYAL, radius=12)
c.setFillColor(ROYAL)
c.setFont("Helvetica-Bold", 11)
c.drawString(495, db_y - 30, "Persistence - Keycloak DB")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(495, db_y - 46, "PostgreSQL 16")
c.drawString(495, db_y - 58, "Users, sessions, credentials")
c.drawString(495, db_y - 70, "Internal to Keycloak container")

box(780, db_y - 90, 220, 80, fill=HexColor('#fafaf9'), stroke=MUTED, radius=12)
c.setFillColor(MUTED)
c.setFont("Helvetica-Bold", 11)
c.drawString(795, db_y - 30, "File Storage")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(795, db_y - 46, "Local FS /uploads (dev)")
c.drawString(795, db_y - 58, "S3-compatible (production)")
c.drawString(795, db_y - 70, "Generated PDF reports")
c.drawString(795, db_y - 82, "User-uploaded documents")

arrow(300, H - 160, 380, H - 160, color=ROYAL, label="OIDC+PKCE", width=1.5)
arrow(380, H - 170, 300, H - 170, color=ROYAL, dash=(3,3), label="JWT", width=1.2)
arrow(300, H - 180, 680, H - 180, color=FOREST, label="REST + Bearer", width=1.5)
arrow(680, H - 165, 600, H - 165, color=ROYAL, dash=(3,3), label="JWKS verify", width=1.2)
arrow(900, H - 160, 980, H - 160, color=HexColor('#92400e'), label="SMTP", width=1.2)

page_footer(6, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 7 - ERD
# ─────────────────────────────────────────────────────────────────────
page_header("6. Entity-Relationship Diagram (ERD)",
            "16 tables + 2 views - Flyway-managed - Audit-grade traceability")

def er_table(x, y, w, name, cols, fill=LIGHT):
    row_h = 11
    head_h = 20
    body_h = len(cols) * row_h + 6
    total = head_h + body_h
    c.setFillColor(fill)
    c.setStrokeColor(FOREST)
    c.setLineWidth(1.2)
    c.rect(x, y - total, w, total, fill=1, stroke=1)
    c.setFillColor(FOREST2)
    c.rect(x, y - head_h, w, head_h, fill=1, stroke=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x + 6, y - 14, name)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 7)
    for i, col in enumerate(cols):
        prefix = ""
        if col.startswith("*"):
            prefix = "PK "
            col = col[1:].strip()
        elif col.startswith("#"):
            prefix = "FK "
            col = col[1:].strip()
        c.drawString(x + 6, y - head_h - 9 - i * row_h, prefix + col)

er_table(50, H - 90, 130, "users", [
    "*id: BIGINT", "kc_id: CHAR(36) UQ", "email UQ", "full_name",
    "#role_id", "preferred_lang", "is_active", "created_at"])
er_table(195, H - 90, 100, "roles", [
    "*id: BIGINT", "code: VARCHAR(50)", "name_ar, name_en"])
er_table(310, H - 90, 145, "registration_requests", [
    "*id", "entity_name, manager_name", "country, city",
    "email, phone", "status: ENUM", "#reviewed_by_user_id",
    "reviewed_at", "created_at"])
er_table(470, H - 90, 130, "educational_entities", [
    "*id", "name, country, city", "#manager_user_id UQ",
    "is_active"])
er_table(615, H - 90, 145, "evaluation_categories", [
    "*id", "code: VARCHAR(50) UQ", "name_ar, name_en",
    "description_ar, description_en", "display_order", "is_active"])
er_table(775, H - 90, 130, "questions", [
    "*id", "#category_id", "text_ar, text_en",
    "requires_attachment", "display_order", "is_active"])
er_table(920, H - 90, 160, "category_required_documents", [
    "*id", "#category_id", "label_ar, label_en",
    "is_mandatory", "display_order"])

er_table(50, H - 260, 130, "evaluation_values", [
    "*id", "code: A/B/C/D", "label_ar, label_en",
    "numeric_score: DEC", "display_order", "is_active"])
er_table(195, H - 260, 125, "grading_scale", [
    "*id", "min_percentage", "max_percentage",
    "label_ar, label_en", "color_hex"])
er_table(335, H - 260, 150, "evaluation_requests", [
    "*id", "request_number: UQ", "#entity_id",
    "#submitted_by_user_id", "status: ENUM(13)",
    "submitted_at", "final_score", "final_percentage",
    "#final_grade_id", "is_locked"])
er_table(500, H - 260, 165, "evaluation_request_categories", [
    "*id", "#request_id", "#category_id",
    "UQ(request_id, category_id)"])
er_table(680, H - 260, 145, "evaluation_answers", [
    "*id", "#request_id", "#question_id",
    "#initial_value_id", "#final_value_id",
    "answer_text", "evaluator_note",
    "#edited_by_evaluator_id"])
er_table(840, H - 260, 145, "evaluation_attachments", [
    "*id", "#request_id", "#category_id", "#answer_id",
    "file_uuid, sha256", "original_name",
    "mime_type, size_bytes", "storage_path"])

er_table(50, H - 480, 135, "request_assignments", [
    "*id", "#request_id", "stage: ENUM",
    "#assigned_user_id", "#assigned_by_user_id",
    "is_auto", "assigned_at, completed_at"])
er_table(200, H - 480, 135, "workflow_decisions", [
    "*id", "#request_id", "stage: 3 stages",
    "decision: APPR/REJ/INFO", "notes: TEXT",
    "#decided_by_user_id", "decided_at"])
er_table(350, H - 480, 130, "final_reports", [
    "*id", "#request_id UQ", "file_uuid",
    "storage_path", "language: ar/en", "sha256",
    "generated_at"])
er_table(495, H - 480, 135, "notifications", [
    "*id", "#user_id", "event_type",
    "title_ar, title_en", "message_ar, message_en",
    "is_read", "sent_via_email"])
er_table(645, H - 480, 140, "audit_log", [
    "*id", "#user_id", "user_email",
    "action_type", "entity_type, entity_id",
    "before_value: JSON", "after_value: JSON",
    "ip_address", "created_at"])
er_table(800, H - 480, 130, "system_settings", [
    "*key: VARCHAR(100)", "value: TEXT",
    "description", "updated_at",
    "#updated_by_user_id"])
er_table(945, H - 480, 135, "registration_documents", [
    "*id", "#registration_id", "file_uuid",
    "original_name", "mime_type, size_bytes",
    "storage_path, sha256"])

# Some relationship lines
c.setStrokeColor(FOREST)
c.setLineWidth(1)
c.line(180, H - 130, 195, H - 130)  # users-roles
c.line(310, H - 165, 295, H - 165)  # regreq-reviewer
c.line(470, H - 130, 455, H - 130)  # entity-user
c.line(905, H - 130, 920, H - 130)  # category-docs

c.setFillColor(LIGHT)
c.setStrokeColor(LINE)
c.roundRect(40, 50, 280, 55, 6, fill=1, stroke=1)
c.setFillColor(TEXT)
c.setFont("Helvetica-Bold", 9)
c.drawString(55, 85, "Legend")
c.setFont("Helvetica", 8)
c.drawString(55, 72, "PK = Primary key")
c.drawString(150, 72, "FK = Foreign key")
c.drawString(55, 60, "UQ = Unique constraint")
c.drawString(150, 60, "ENUM = MySQL enum")

page_footer(7, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 8 - DEPLOYMENT DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("7. Deployment Diagram",
            "Docker Compose dev stack + production target topology")

c.setFillColor(HexColor('#f0fdf4'))
c.setStrokeColor(FOREST)
c.setLineWidth(2)
c.setDash(5, 3)
c.roundRect(40, H - 470, W - 80, 380, 16, fill=1, stroke=1)
c.setDash()
c.setFillColor(FOREST2)
c.setFont("Helvetica-Bold", 14)
c.drawString(60, H - 110, "Developer machine - Docker Compose")
c.setFont("Helvetica", 9)
c.setFillColor(MUTED)
c.drawString(60, H - 126, "Network: aq-network - Volume mounts for persistence")

def container(x, y, w, h, name, port, details, color=FOREST):
    box(x, y, w, h, fill=colors.white, stroke=color, radius=10, line_width=1.5)
    c.setFillColor(color)
    c.rect(x, y + h - 28, w, 28, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 10, y + h - 18, name)
    c.setFont("Helvetica", 9)
    c.drawRightString(x + w - 10, y + h - 18, port)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 9)
    for i, line in enumerate(details):
        c.drawString(x + 10, y + h - 45 - i * 13, line)

container(80, H - 280, 220, 130, "Angular dev server", ":4200",
         ["ng serve", "Vite HMR - TypeScript", "Bearer token via interceptor",
          "Lazy-loaded modules", "Standalone components"], ROYAL)
container(330, H - 280, 220, 130, "Spring Boot JAR", ":8080",
         ["java 17 -jar app.jar", "Tomcat embedded", "HikariCP pool",
          "Profile: dev", "DevTools hot reload"], FOREST)
container(580, H - 280, 220, 130, "aq-keycloak", ":8180",
         ["Image: quay.io/keycloak:24", "Realm import on start",
          "Admin: admin/admin", "Master + arabic-quality", "JVM ~512 MB"], ROYAL2)
container(830, H - 280, 240, 130, "aq-mailhog", ":1025/:8025",
         ["Image: mailhog/mailhog", "SMTP server :1025",
          "UI :8025 (browser)", "No auth, no relay", "In-memory storage"], HexColor('#92400e'))

container(80, H - 440, 280, 130, "aq-mysql", ":3306",
         ["Image: mysql:8.0", "Database: arabic_quality_db",
          "Volume: mysql_data", "utf8mb4 unicode_ci",
          "Flyway migrates on startup"], FOREST)
container(390, H - 440, 220, 130, "aq-keycloak-db", "(internal)",
         ["Image: postgres:16", "Database: keycloak",
          "Volume: keycloak_db_data", "Reachable only from",
          "Keycloak container"], ROYAL2)
container(640, H - 440, 220, 130, "Volume /uploads", "(local FS)",
         ["Mount: ./uploads", "PDF reports generated",
          "User-uploaded docs", "UUID-named files",
          "SHA-256 integrity"], MUTED)

box(890, H - 440, 180, 130, fill=HexColor('#fafaf9'), stroke=MUTED, radius=10)
c.setFillColor(MUTED)
c.setFont("Helvetica-Bold", 11)
c.drawString(905, H - 122, "User browser")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(905, H - 145, "Chrome / Firefox / Edge")
c.drawString(905, H - 158, "OIDC redirect flow")
c.drawString(905, H - 171, "Bearer token in memory")
c.drawString(905, H - 184, "WebSocket for notifications")
c.drawString(905, H - 197, "Localhost dev URLs")

arrow(300, H - 230, 330, H - 230, color=FOREST, label="REST", width=1.5)
arrow(330, H - 240, 300, H - 240, color=FOREST, dash=(3,3), label="JSON", width=1.2)
arrow(550, H - 230, 580, H - 230, color=ROYAL2, label="Admin API", width=1.2)
arrow(580, H - 250, 550, H - 250, color=ROYAL2, dash=(3,3), label="JWKS", width=1.2)
arrow(550, H - 270, 830, H - 270, color=HexColor('#92400e'), label="SMTP :1025", width=1.2)
arrow(440, H - 280, 360, H - 320, color=FOREST, label="JDBC", width=1.2)
arrow(690, H - 280, 500, H - 320, color=ROYAL2, label="JDBC", width=1.2)
arrow(440, H - 410, 360, H - 410, color=MUTED, dash=(3,3), label="write files", width=1.2)

c.setFillColor(HexColor('#fff7ed'))
c.setStrokeColor(HexColor('#92400e'))
c.setLineWidth(2)
c.roundRect(40, 50, W - 80, 60, 12, fill=1, stroke=1)
c.setFillColor(HexColor('#9a3412'))
c.setFont("Helvetica-Bold", 11)
c.drawString(55, 88, "Production target topology")
c.setFont("Helvetica", 9)
c.setFillColor(TEXT)
c.drawString(55, 73, "Nginx (TLS + reverse proxy) -> Angular static (CDN) - Spring Boot JAR (PM2/systemd) - Keycloak cluster")
c.drawString(55, 60, "MySQL managed (RDS/CloudSQL) - PostgreSQL for Keycloak - S3-compatible storage - SMTP via SendGrid/Mailgun - CI/CD via GitHub Actions")

page_footer(8, 9)
c.showPage()

# ─────────────────────────────────────────────────────────────────────
#  PAGE 9 - ACTIVITY DIAGRAM
# ─────────────────────────────────────────────────────────────────────
page_header("8. Activity Diagram",
            "Full evaluation cycle - from public registration to official report issuance")

lanes = [
    ("Entity Manager", 120, ROYAL),
    ("Platform Admin", 320, FOREST),
    ("System / Keycloak", 520, ROYAL2),
    ("Evaluator", 720, FOREST2),
    ("Admin Reviewer", 880, FOREST),
    ("Field Reviewer", 1050, ROYAL),
]

for name, x, color in lanes:
    box(x - 80, H - 110, 160, 28, fill=color, stroke=color, radius=4)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(x, H - 100, name)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.setDash(2, 2)
    c.line(x + 80, H - 110, x + 80, 80)
    c.setDash()

c.setFillColor(TEXT)
c.circle(120, H - 140, 8, fill=1, stroke=0)

def act(x, y, w, label, fill=LIGHT):
    box(x - w/2, y - 18, w, 36, fill=fill, stroke=FOREST, radius=18, line_width=1.2)
    text_in_box(x - w/2, y - 18, w, 36, label, font="Helvetica", size=9)

def decision(x, y, label="?"):
    r = 16
    c.setFillColor(HexColor('#fef3c7'))
    c.setStrokeColor(HexColor('#92400e'))
    c.setLineWidth(1.2)
    path = c.beginPath()
    path.moveTo(x, y + r)
    path.lineTo(x + r, y)
    path.lineTo(x, y - r)
    path.lineTo(x - r, y)
    path.close()
    c.drawPath(path, fill=1, stroke=1)
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(x, y - 3, label)

act(120, H - 175, 150, "Submit registration")
arrow(120, H - 148, 120, H - 157, color=FOREST2)

act(320, H - 175, 150, "Review registration", fill=HexColor('#dcfce7'))
arrow(195, H - 175, 245, H - 175, color=FOREST2)

decision(320, H - 230, "?")
arrow(320, H - 193, 320, H - 214, color=FOREST2)
c.setFillColor(TEXT)
c.setFont("Helvetica", 8)
c.drawString(335, H - 220, "approve")
c.drawString(255, H - 240, "reject")

act(320, H - 280, 140, "Reject + email")
arrow(290, H - 240, 290, H - 262, color=HexColor('#dc2626'))

c.setStrokeColor(TEXT)
c.setFillColor(colors.white)
c.setLineWidth(2)
c.circle(320, H - 320, 9, fill=1, stroke=1)
c.setFillColor(TEXT)
c.circle(320, H - 320, 5, fill=1, stroke=0)
arrow(320, H - 298, 320, H - 312, color=TEXT)

act(520, H - 230, 160, "Create Keycloak user", fill=HexColor('#dbeafe'))
arrow(340, H - 230, 440, H - 230, color=FOREST2)

act(520, H - 280, 160, "Create local profile + entity", fill=HexColor('#dbeafe'))
arrow(520, H - 248, 520, H - 262, color=ROYAL2)

act(520, H - 330, 160, "Send welcome email", fill=HexColor('#dbeafe'))
arrow(520, H - 298, 520, H - 312, color=ROYAL2)

act(120, H - 390, 150, "Log in (Keycloak)")
arrow(440, H - 330, 195, H - 388, color=ROYAL2, dash=(2,2), label="welcome email", width=1)

act(120, H - 440, 150, "Submit evaluation request")
arrow(120, H - 408, 120, H - 422, color=FOREST2)

act(520, H - 440, 160, "Auto-distribute to evaluator", fill=HexColor('#dbeafe'))
arrow(195, H - 440, 440, H - 440, color=FOREST2)

act(720, H - 440, 150, "Review answers + adjust", fill=HexColor('#dcfce7'))
arrow(600, H - 440, 645, H - 440, color=ROYAL2)

decision(720, H - 495, "?")
arrow(720, H - 458, 720, H - 479, color=FOREST2)

act(720, H - 550, 140, "Issue decision")
arrow(720, H - 511, 720, H - 532, color=FOREST2)

act(880, H - 550, 150, "Administrative review", fill=HexColor('#dcfce7'))
arrow(790, H - 550, 805, H - 550, color=FOREST2)

act(1050, H - 550, 150, "Field review + final decision", fill=HexColor('#fde68a'))
arrow(955, H - 550, 975, H - 550, color=FOREST2)

act(520, H - 620, 180, "Compute score + generate PDF", fill=HexColor('#a7f3d0'))
arrow(1050, H - 568, 700, H - 620, color=FOREST2, dash=(2,2), label="approve final")

act(120, H - 620, 150, "Receive result + report")
arrow(430, H - 620, 195, H - 620, color=FOREST2, dash=(2,2), label="email + dashboard")

c.setStrokeColor(TEXT)
c.setFillColor(colors.white)
c.setLineWidth(2)
c.circle(120, H - 680, 11, fill=1, stroke=1)
c.setFillColor(TEXT)
c.circle(120, H - 680, 6, fill=1, stroke=0)
arrow(120, H - 638, 120, H - 668, color=FOREST2)

page_footer(9, 9)
c.showPage()

c.save()
print(f"OK PDF generated at {OUT}")
