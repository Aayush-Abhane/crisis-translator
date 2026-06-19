import { useState } from 'react';
import './App.css';

function parseSection(text) {
  const sections = {};
  const parts = text.split(/^###\s+/m);
  parts.forEach(part => {
    const newline = part.indexOf('\n');
    if (newline === -1) return;
    const title = part.slice(0, newline).trim().replace(/^[0-9]+\.\s*/, '').replace(/[⚠️]/g, '').trim();
    const body = part.slice(newline + 1).trim();
    sections[title.toUpperCase()] = body;
  });
  return sections;
}

function renderLines(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return null;
    if (line.startsWith('- [ ] ') || line.startsWith('* [ ] '))
      return (
        <label key={i} className="check-row">
          <input type="checkbox" /> <span>{line.slice(6)}</span>
        </label>
      );
    if (line.startsWith('- ') || line.startsWith('* '))
      return <li key={i}>{renderBold(line.slice(2))}</li>;
    return <p key={i}>{renderBold(line)}</p>;
  });
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
}

function getStatusStyle(body) {
  const upper = body.toUpperCase();
  if (upper.includes('APPROVED')) return 'status-approved';
  if (upper.includes('DENIED')) return 'status-denied';
  if (upper.includes('REDUCED')) return 'status-reduced';
  if (upper.includes('VERIFICATION')) return 'status-verify';
  return 'status-other';
}

function getStatusIcon(body) {
  const upper = body.toUpperCase();
  if (upper.includes('APPROVED')) return '✅';
  if (upper.includes('DENIED')) return '❌';
  if (upper.includes('REDUCED')) return '⚠️';
  if (upper.includes('VERIFICATION')) return '📋';
  return '❓';
}

function getUrgencyStyle(body) {
  const upper = body.toUpperCase();
  if (upper.startsWith('HIGH')) return 'urgency-high';
  if (upper.startsWith('MEDIUM')) return 'urgency-medium';
  return 'urgency-low';
}

function ResultCards({ text }) {
  const sections = parseSection(text);

  const STATUS_KEY = Object.keys(sections).find(k => k.includes('DECISION') || k.includes('STATUS'));
  const SUMMARY_KEY = Object.keys(sections).find(k => k.includes('SUMMARY'));
  const DEADLINE_KEY = Object.keys(sections).find(k => k.includes('DEADLINE'));
  const FACTS_KEY = Object.keys(sections).find(k => k.includes('FACTS'));
  const ACTIONS_KEY = Object.keys(sections).find(k => k.includes('MUST DO') || k.includes('ACTION'));
  const URGENCY_KEY = Object.keys(sections).find(k => k.includes('URGENCY'));
  const CONSEQUENCES_KEY = Object.keys(sections).find(k => k.includes("DON'T ACT") || k.includes('CONSEQUENCES'));
  const HELP_KEY = Object.keys(sections).find(k => k.includes('HELP'));

  return (
    <div className="result-cards">

      {STATUS_KEY && sections[STATUS_KEY] && (
        <div className={`card status-card ${getStatusStyle(sections[STATUS_KEY])}`}>
          <span className="status-icon">{getStatusIcon(sections[STATUS_KEY])}</span>
          <div>
            <div className="card-label">Decision Status</div>
            <div className="status-text">{sections[STATUS_KEY]}</div>
          </div>
        </div>
      )}

      {SUMMARY_KEY && sections[SUMMARY_KEY] && (
        <div className="card summary-card">
          <div className="card-label">📄 Plain Language Summary</div>
          <div className="card-body">{renderLines(sections[SUMMARY_KEY])}</div>
        </div>
      )}

      {DEADLINE_KEY && sections[DEADLINE_KEY] && (
        <div className="card deadline-card">
          <div className="card-label">⏰ Deadline — Do Not Miss</div>
          <div className="card-body">{renderLines(sections[DEADLINE_KEY])}</div>
        </div>
      )}

      <div className="card-row">
        {FACTS_KEY && sections[FACTS_KEY] && (
          <div className="card facts-card">
            <div className="card-label">📋 Key Facts</div>
            <ul className="facts-list">{renderLines(sections[FACTS_KEY])}</ul>
          </div>
        )}
        {URGENCY_KEY && sections[URGENCY_KEY] && (
          <div className={`card urgency-card ${getUrgencyStyle(sections[URGENCY_KEY])}`}>
            <div className="card-label">🚦 Urgency Level</div>
            <div className="card-body">{renderLines(sections[URGENCY_KEY])}</div>
          </div>
        )}
      </div>

      {ACTIONS_KEY && sections[ACTIONS_KEY] && (
        <div className="card actions-card">
          <div className="card-label">✅ What You Must Do</div>
          <div className="actions-list">{renderLines(sections[ACTIONS_KEY])}</div>
        </div>
      )}

      {CONSEQUENCES_KEY && sections[CONSEQUENCES_KEY] && (
        <div className="card consequences-card">
          <div className="card-label">🚨 If You Don't Act</div>
          <div className="card-body">{renderLines(sections[CONSEQUENCES_KEY])}</div>
        </div>
      )}

      {HELP_KEY && sections[HELP_KEY] && (
        <div className="card help-card">
          <div className="card-label">🤝 Free Help Available</div>
          <div className="card-body">{renderLines(sections[HELP_KEY])}</div>
        </div>
      )}
    </div>
  );
}

function HITLCheckpoint({ onAllChecked }) {
  const [checked, setChecked] = useState({
    readOriginal: false,
    verifiedDeadline: false,
    understand: false,
    hasPlan: false
  });

  const toggle = (key) => {
    const updated = { ...checked, [key]: !checked[key] };
    setChecked(updated);
    onAllChecked(Object.values(updated).every(Boolean));
  };

  const items = [
    { key: 'readOriginal', label: 'I have read the original letter (not just this summary)' },
    { key: 'verifiedDeadline', label: 'I have verified the deadline matches my original letter' },
    { key: 'understand', label: 'I understand why this decision was made' },
    { key: 'hasPlan', label: 'I have a plan for what I want to do next' }
  ];

  const allDone = Object.values(checked).every(Boolean);

  return (
    <div className="hitl-checkpoint">
      <h3>⚠️ Human Verification — Required</h3>
      <p className="hitl-subtitle">AI can make mistakes. YOU must verify before taking action.</p>
      <ul className="checklist">
        {items.map(({ key, label }) => (
          <li key={key}>
            <label className="check-row">
              <input type="checkbox" checked={checked[key]} onChange={() => toggle(key)} />
              <span>{label}</span>
            </label>
          </li>
        ))}
      </ul>
      {allDone
        ? <div className="hitl-ready">✅ You're ready to take action. See next steps below.</div>
        : <div className="hitl-warning">Complete all checkboxes before proceeding.</div>
      }
    </div>
  );
}

function App() {
  const [document, setDocument] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allVerified, setAllVerified] = useState(false);

  const handleAnalyze = async () => {
    if (!document.trim()) { setError('Please paste a document.'); return; }
    setLoading(true);
    setError('');
    setResult('');
    setAllVerified(false);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer XE9ifGku1vlFFg3i4Iutio3OrZapK3VS`,
        },
        body: JSON.stringify({
          model: 'mistral-small',
          messages: [{
            role: 'user',
            content: `You are a Crisis-to-Action Translator helping stressed families understand confusing government letters (like SNAP/food assistance, housing, medical, or school notices).

Analyze this document and provide ALL of the following sections using exactly these headers. Use simple, kind language. Assume the reader is stressed.

### 1. PLAIN LANGUAGE SUMMARY
2-3 sentences. What does this letter mean in simple terms?

### 2. DECISION STATUS
One line: APPROVED / DENIED / REDUCED / VERIFICATION NEEDED — and what it means simply.

### 3. ⚠️ DEADLINE — DO NOT MISS
Exact date. Days remaining. What happens if missed.

### 4. KEY FACTS
Up to 5 bullet points with the most important numbers or facts.

### 5. WHAT YOU MUST DO
3-5 action items as checkboxes using "- [ ]" format. Most urgent first.

### 6. URGENCY LEVEL
Start with: High / Medium / Low. Then explain why in one sentence.

### 7. IF YOU DON'T ACT
2-3 bullet points on real consequences for this family.

### 8. FREE HELP AVAILABLE
Call 211 for free legal aid. Any specific numbers from the letter.

DOCUMENT:
${document}`
          }],
          max_tokens: 1500
        })
      });

      const data = await response.json();
      if (data.error) { setError(data.error.message || 'API error'); return; }
      setResult(data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setError('Network error. Check your internet connection.');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Lucify SNAP</h1>
        <p>Turn confusing documents into clear action plans</p>
        <div className="persona-box">
          <strong>👤 Built for families like Maria's</strong> — a single mom who received
          a 4-page SNAP denial letter full of legal language. She doesn't know if she can
          appeal, what the deadline is, or what to do next. Paste any confusing government
          letter and we'll break it into plain language and clear next steps.
        </div>
      </header>

      <main>
        <div className="input-section">
          <label htmlFor="document">Paste your SNAP letter to Lucify your document:</label>
          <textarea
            id="document"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste your SNAP letter here..."
            rows="10"
          />
          <div className="disclaimer-box">
            <strong>⚠️ Important:</strong> This AI translates documents to help you understand them —
            it does NOT provide legal, medical, or financial advice. Always verify with the original
            document. For free help, call <strong>211</strong>.
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="analyze-button">
            {loading ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {result && (
          <div className="result-section">
            <h2>✅ Analysis Complete</h2>
            <ResultCards text={result} />
            <HITLCheckpoint onAllChecked={setAllVerified} />
            {allVerified && (
              <div className="next-steps-box">
                <h3>📞 Your Next Steps</h3>
                <p><strong>Step 1:</strong> Call the office listed in your letter to confirm and ask questions.</p>
                <p><strong>Step 2:</strong> Call <strong>211</strong> for free legal aid or SNAP assistance.</p>
                <p><strong>Step 3:</strong> Take action before your deadline. Don't wait.</p>
                <a href="tel:211" className="call-button">📞 Call 211 for Free Help</a>
              </div>
            )}
            <div className="legal-limits">
              <h3>⚖️ What This App Cannot Do</h3>
              <p>✗ Provide legal advice &nbsp;|&nbsp; ✗ Guarantee outcomes &nbsp;|&nbsp; ✗ Replace the official office &nbsp;|&nbsp; ✗ Submit appeals for you</p>
              <p style={{ marginTop: '8px' }}><strong>Only a real person or legal professional can make final decisions for your situation.</strong></p>
            </div>
            <button
              onClick={() => { setDocument(''); setResult(''); setError(''); setAllVerified(false); }}
              className="reset-button"
            >Analyze Another Document</button>
          </div>
        )}
      </main>

      <footer>
        <p>Powered by Mistral AI | Lucify SNAP — Built for clarity in crisis</p>
        <p style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
          AI responses may be inaccurate. Always consult a qualified professional. Free help: call 211.
        </p>
      </footer>
    </div>
  );
}

export default App;
