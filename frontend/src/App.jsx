import { useEffect, useState } from "react";
import axios from "axios";
import "./neumorphism.css";

function App() {
  const [budgets, setBudgets] = useState([]);
  const [title, setTitle] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-preference");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme-preference", newTheme ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", newTheme ? "dark" : "light");
  };

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const API = "http://127.0.0.1:8000";

  const loadBudgets = async () => {
    try {
      const res = await axios.get(`${API}/budgets`);
      setBudgets(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const addAIExpense = async () => {
    if (!aiInput.trim()) return;
    try {
      await axios.post(`${API}/ai-expense`, { text: aiInput });
      setAiInput("");
      loadBudgets();
    } catch (e) {
      console.error(e);
    }
  };

  const addBudget = async () => {
    if (!title.trim() || !amount) return;
    try {
      await axios.post(`${API}/budgets`, {
        title,
        amount: parseFloat(amount),
        category
      });
      setTitle("");
      setAmount("");
      setCategory("");
      loadBudgets();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await axios.delete(`${API}/budgets/${id}`);
      loadBudgets();
    } catch (e) {
      console.error(e);
    }
  };

  const getAIAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await axios.get(`${API}/ai-summary`);
      setAiResponse(res.data.response || "");
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Render a small, safe markdown-lite output for the AI response.
  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderMarkdownLite = (md) => {
    if (!md) return "";
    const lines = escapeHtml(md).split(/\r?\n/);
    let out = "";
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
      if (inUl) { out += "</ul>"; inUl = false; }
      if (inOl) { out += "</ol>"; inOl = false; }
    };

    lines.forEach((ln) => {
      if (/^###\s+/.test(ln)) {
        closeLists();
        out += `<h3>${ln.replace(/^###\s+/, "")}</h3>`;
      } else if (/^\*\s+/.test(ln)) {
        if (!inUl) { closeLists(); inUl = true; out += "<ul>"; }
        out += `<li>${ln.replace(/^\*\s+/, "")}</li>`;
      } else if (/^\d+\.\s+/.test(ln)) {
        if (!inOl) { closeLists(); inOl = true; out += "<ol>"; }
        out += `<li>${ln.replace(/^\d+\.\s+/, "")}</li>`;
      } else if (ln.trim() === "") {
        closeLists();
        // small paragraph break
        out += "<p></p>";
      } else {
        closeLists();
        const replaced = ln.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        out += `<p>${replaced}</p>`;
      }
    });

    closeLists();
    return out;
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Gemma</h1>
            <p className="sub">A simple, clean budget manager</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <section className="card form-card" aria-labelledby="add-budget">
        <h2 id="add-budget" className="visually-hidden">Tell me your expenses / income</h2>

        <div className="ai-row">
          <input
            className="input"
            placeholder="Example: Spent 450 on dinner"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <button className="btn" onClick={addAIExpense} aria-label="Add via AI">
            Add via AI
          </button>
        </div>
      </section>

      <section className="list">
        {budgets.length === 0 ? (
          <div className="card empty">
            <p style={{ margin: 0 }}>No budgets yet — add an expense or try the AI input above.</p>
          </div>
        ) : (
          budgets.map((b) => (
            <article key={b[0]} className="card item-card">
              <div>
                <h3 className="item-title">{b[1]}</h3>
                <div className="meta">₹{b[2]} • {b[3]}</div>
              </div>
              <div className="actions">
                <button className="btn ghost" onClick={() => deleteBudget(b[0])} aria-label={`Delete ${b[1]}`}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="card ai-response">
        <div className="ai-top">
          <button className="btn primary" onClick={getAIAdvice} disabled={aiLoading}>
            {aiLoading ? "Loading..." : "Ask Gemma"}
          </button>
        </div>
        {aiLoading ? (
          <div className="skeleton-loader">
            <div className="skeleton-line" style={{ width: "80%", marginBottom: "12px" }}></div>
            <div className="skeleton-line" style={{ width: "100%", marginBottom: "12px" }}></div>
            <div className="skeleton-line" style={{ width: "90%", marginBottom: "12px" }}></div>
            <div className="skeleton-line" style={{ width: "85%", marginBottom: "12px" }}></div>
            <div className="skeleton-line" style={{ width: "70%" }}></div>
          </div>
        ) : (
          <div className="ai-render" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(aiResponse) }} />
        )}
      </section>
    </div>
  );
}

export default App;