import { useState } from 'react';
import './App.css';

function MarkdownRenderer({ text }) {
  const lines = text.split('\n');
  return (
    <div className="markdown">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
        if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) return <label key={i} className="checkbox-item"><input type="checkbox" /> {line.slice(6)}</label>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i}>{line.slice(2)}</li>;
        if (line.trim() === '') return <br key={i} />;
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
      })}
    </div>
  );
}

function App() {
  const [document, setDocument] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!document.trim()) {
      setError('Please paste a document.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small',
            messages: [
              {
                role: 'user',
                content: `You are a Crisis-to-Action Translator. Analyze this document and provide:

1. PLAIN LANGUAGE SUMMARY (2 sentences max)
2. KEY FACTS YOU NEED TO KNOW (5 bullet points max)
3. WHAT YOU MUST DO (3-5 action items with checkboxes)
4. DEADLINE (specific date or "Not specified")
5. URGENCY LEVEL (High/Medium/Low)
6. IF YOU DON'T ACT (consequences)

TONE: Simple, kind, clear. Assume the reader is stressed.

DOCUMENT:
${document}`
              }
            ],
            max_tokens: 1500
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error.message || 'API error');
        return;
      }

      setResult(data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your internet connection.');
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Crisis-to-Action Translator</h1>
        <p>Turn confusing documents into clear action plans</p>

        <div className="persona-box">
          <strong>👤 Who this is for:</strong> People like Maria — a single mom who just
          received a 4-page housing assistance denial letter full of legal language. She
          doesn't know if she can appeal, what the deadline is, or what to do next.
          Paste in any confusing document and we'll break it down into plain language
          and clear next steps.
        </div>
      </header>

      <main>
        <div className="input-section">
          <label htmlFor="document">Paste your document here:</label>

          <textarea
            id="document"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste any document: government letter, medical notice, school form, bill, eviction notice, etc."
            rows="10"
          />

          <div className="disclaimer-box">
            <strong>⚠️ Important:</strong> This AI summarizes documents to help you
            understand them — it does not provide legal, medical, or financial advice.
            Always verify details with the original document and consult a qualified
            professional before making important decisions.
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="result-section">
            <h2>✅ Analysis Complete</h2>

            <div className="result-content">
              <MarkdownRenderer text={result} />
            </div>

            <div className="human-review-note">
              🧑 <strong>Human review recommended:</strong> This AI does not make final
              decisions on your behalf. A caseworker, legal aid advisor, or qualified
              professional should review any next steps that affect your housing, health,
              or finances.
            </div>

            <button
              onClick={() => {
                setDocument('');
                setResult('');
                setError('');
              }}
              className="reset-button"
            >
              Analyze Another Document
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Powered by Mistral AI | Built for clarity in crisis</p>
        <p style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
          AI responses may be inaccurate. Always consult a qualified professional for important decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;
