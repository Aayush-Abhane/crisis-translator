import { useState } from 'react';
import './App.css';

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
            'Authorization': 'Bearer XE9ifGku1vlFFg3i4Iutio3OrZapK3VS',
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
      setError('Network error. Please check your internet connection or API key.');
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Crisis-to-Action Translator</h1>
        <p>Turn confusing documents into clear action plans</p>
        <h3 style={{ marginBottom: "10px" }}>
      ⚠️ AI Disclaimer
    </h3>

    <p>
      This application uses Artificial Intelligence to summarize and explain
      documents. While it strives to provide accurate information, AI can make
      mistakes, misunderstand context, or omit important details.
    </p>

    <p style={{ marginTop: "10px" }}>
      <strong>Please verify all important information using the original
      document.</strong> Do not rely solely on this application for legal,
      medical, financial, educational, or government-related decisions.
    </p>

        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: '8px',
            padding: '12px',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          <strong>⚠️ Disclaimer:</strong> This application uses artificial
          intelligence to summarize and interpret documents. AI-generated
          responses may contain mistakes, omit important information, or be
          inaccurate. Always verify important details with the original
          document and consult the appropriate organization or qualified
          professional before making legal, medical, financial, or other
          significant decisions.
        </div>
      </header>

      <main>
        <div className="input-section">
          <label htmlFor="document">Paste your document here:</label>

          <textarea
            id="document"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste any document: government letter, medical notice, school form, bill, etc."
            rows="10"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-button"
          >
            {loading ? 'Analyzing with Mistral AI...' : 'Analyze Document'}
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
              <pre>{result}</pre>
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

        <p
          style={{
            marginTop: '10px',
            fontSize: '12px',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: 0.9,
            lineHeight: '1.5',
          }}
        >
          <strong>Disclaimer:</strong> This AI assistant may produce inaccurate,
          incomplete, or outdated information. Always review the original
          document and consult qualified professionals for legal, medical,
          financial, or other important decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;