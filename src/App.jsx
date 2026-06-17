import { useState } from 'react';
import './App.css';

function App() {
  const [document, setDocument] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!document.trim()) {
      setError('Please paste a document');
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

TONE: Simple, kind, clear. Assume reader is stressed.

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

      const analysis = data.choices[0].message.content;
      setResult(analysis);
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Check your API key and internet.');
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Crisis-to-Action Translator</h1>
        <p>Turn confusing documents into clear action plans</p>
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
      </footer>
    </div>
  );
}

export default App;