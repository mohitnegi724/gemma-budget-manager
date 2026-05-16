import json
import sqlite3
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "database.db"


def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT DEFAULT 'expense',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


init_db()


class Budget(BaseModel):
    title: str
    amount: float
    category: str
    type: str = "expense"
    notes: str = ""


@app.get("/budgets")
def get_budgets():

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    rows = c.execute("""
        SELECT *
        FROM budgets
        ORDER BY created_at DESC
    """).fetchall()

    conn.close()

    return rows


@app.post("/budgets")
def create_budget(budget: Budget):

    if budget.amount <= 0:
        return {"error": "Amount must be positive"}

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("""
        INSERT INTO budgets(
            title,
            amount,
            category,
            type,
            notes
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        budget.title,
        budget.amount,
        budget.category,
        budget.type,
        budget.notes
    ))

    conn.commit()
    conn.close()

    return {"status": "created"}


@app.put("/budgets/{budget_id}")
def update_budget(budget_id: int, budget: Budget):

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("""
        UPDATE budgets
        SET
            title=?,
            amount=?,
            category=?,
            type=?,
            notes=?
        WHERE id=?
    """, (
        budget.title,
        budget.amount,
        budget.category,
        budget.type,
        budget.notes,
        budget_id
    ))

    conn.commit()
    conn.close()

    return {"status": "updated"}


@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int):

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute(
        "DELETE FROM budgets WHERE id=?",
        (budget_id,)
    )

    conn.commit()
    conn.close()

    return {"status": "deleted"}


@app.get("/ai-summary")
def ai_summary():

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    rows = c.execute("""
        SELECT title, amount, category, type
        FROM budgets
    """).fetchall()

    conn.close()

    prompt = f"""
    Analyze this budget data and give concise financial advice.

    Budget Data:
    {rows}
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "gemma4:31b",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    print("AI SUMMARY RESPONSE:")
    print(data)

    if "response" not in data:
        return {
            "error": "Invalid Ollama response",
            "details": data
        }

    return {
        "response": data["response"]
    }


@app.post("/ai-expense")
def ai_expense(user_input: dict):

    prompt = f"""
    Convert the following expense text into STRICT JSON.

    RULES:
    - Return ONLY valid JSON
    - No markdown
    - No explanation
    - No backticks
    - Translate Hindi text to English
    - All fields are mandatory
    - Never use "Miscellaneous" category
    - Choose the MOST specific category possible
    - If shopping platform is mentioned, infer category from item or platform context

    ALLOWED CATEGORIES:
    - Food
    - Groceries
    - Shopping
    - Electronics
    - Travel
    - Transport
    - Fuel
    - Entertainment
    - Bills
    - Utilities
    - Rent
    - Housing
    - Healthcare
    - Medical
    - Fitness
    - Salary
    - Freelance
    - Investment
    - Cashback
    - Refund
    - Insurance
    - Subscription
    - Education
    - Personal Care
    - Pets
    - Gifts
    - Income
    - Other

    CATEGORY RULES:
    - Amazon purchases → Shopping or Electronics
    - Swiggy/Zomato → Food
    - Uber/Ola → Transport
    - Netflix/Spotify/YouTube → Subscription
    - Salary payments → Salary
    - Cashback rewards → Cashback
    - Electricity/Internet/Mobile recharge → Utilities
    - Flight/Hotel → Travel
    - Medicines/Hospital → Medical
    - Gym/Protein powder → Fitness
    - Grocery/Ration/Vegetables → Groceries

    Schema:
    {{
        "title": "string",
        "amount": number,
        "category": "string",
        "type": "expense" or "income",
        "notes": "string"
    }}

    User Input:
    {user_input["text"]}
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "qwen2.5:7b",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    print("AI EXPENSE RESPONSE:")
    print(data)

    if "response" not in data:
        return {
            "error": "Invalid Ollama response",
            "details": data
        }

    raw = data["response"]

    try:

        cleaned = raw.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned.replace("```json", "")

        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```", "")

        cleaned = cleaned.strip()

        parsed = json.loads(cleaned)

        amount = float(parsed["amount"])

        if amount <= 0:
            return {
                "error": "Amount must be positive"
            }

        conn = sqlite3.connect(DB)
        c = conn.cursor()

        c.execute("""
            INSERT INTO budgets(
                title,
                amount,
                category,
                type,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            parsed["title"],
            amount,
            parsed["category"],
            parsed.get("type", "expense"),
            parsed.get("notes", "")
        ))

        conn.commit()
        conn.close()

        return {
            "status": "saved",
            "parsed": parsed
        }

    except Exception as e:

        return {
            "error": str(e),
            "raw_response": raw
        }
    