from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLData(BaseModel):
    url: str
    title: str

active_connections: list[WebSocket] = []

def generate_snark(domain, title):
    domain = domain.lower()
    if "reddit.com" in domain or "instagram.com" in domain:
        return "Shouldn't you be focusing on your S5 assignments?"
    elif "github.com" in domain:
        return "Oh, trying to look productive for the Nexus club? Cute."
    elif "stackoverflow.com" in domain:
        return "Copy-pasting your way to your B.Tech degree, I see."
    elif "bing.com" in domain:
        return "Who on earth uses Bing voluntarily?"
    return "Another completely useless tab."

def send_hod_email(target_title, target_url):
    sender_email = "6234@mbcpeermade.com" 
    sender_password = "itab kyiz avsi bspr" # Insert your generated App Password here
    receiver_email = "irfanzakheer@gmail.com"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = "URGENT: S5 Productivity Violation Detected"
    
    body = (
        "Dear HOD,\n\n"
        "This is an automated alert from Outcognito Mode.\n\n"
        "A student was just caught slacking off during active class hours. "
        "Instead of working on their assignments, they were looking at:\n\n"
        f"Title: {target_title}\n"
        f"URL: {target_url}\n\n"
        "Please take appropriate disciplinary action.\n\n"
        "Regards,\n"
        "The Outcognito Snitch"
    )
    
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("HOD has been successfully notified.")
    except Exception as e:
        print(f"Failed to email HOD: {e}")

@app.get("/")
async def root():
    return {"message": "Outcognito Backend is running live!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

@app.post("/track")
async def track_url(data: URLData, background_tasks: BackgroundTasks):
    domain = data.url.lower()
    points = 10
    
    if any(x in domain for x in ["youtube.com", "netflix.com", "instagram.com", "reddit.com"]):
        points = 50
    elif "stackoverflow.com" in domain or "github.com" in domain:
        points = 0

    snark = generate_snark(domain, data.title)
    
    # Boss Mode Time Check
    current_hour = datetime.now().hour
    if points == 50 and 9 <= current_hour <= 16:
        background_tasks.add_task(send_hod_email, data.title, data.url)
    
    payload = {"url": data.url, "title": data.title, "points": points, "snark": snark}
    
    for connection in active_connections:
        await connection.send_text(json.dumps(payload))
        
    return {"status": "broadcasted", "data": payload}

@app.post("/panic")
async def trigger_panic(data: URLData, background_tasks: BackgroundTasks):
    # Combine the panic alert with the actual data they were trying to hide
    alert_title = f"🚨 ATTEMPTED TO DELETE BROWSING HISTORY 🚨\n\nLast viewed tab: {data.title}"
    
    background_tasks.add_task(
        send_hod_email, 
        alert_title, 
        data.url
    )
    return {"status": "panic_alert_sent"}