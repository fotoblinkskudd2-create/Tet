import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function BrutalHonestyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/brutal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Noe gikk galt');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Feil: ${(error as Error).message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .brutal-page {
          min-height: 100vh;
          background: #000;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .smoke-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .smoke {
          position: absolute;
          width: 2px;
          height: 60px;
          background: linear-gradient(
            to top,
            rgba(255, 0, 0, 0.3),
            rgba(255, 255, 255, 0.05),
            transparent
          );
          filter: blur(8px);
          animation: rise var(--duration) ease-in infinite;
          opacity: 0;
        }

        .smoke:nth-child(1) {
          left: 10%;
          --duration: 8s;
          animation-delay: 0s;
        }
        .smoke:nth-child(2) {
          left: 25%;
          --duration: 10s;
          animation-delay: 2s;
        }
        .smoke:nth-child(3) {
          left: 50%;
          --duration: 9s;
          animation-delay: 4s;
        }
        .smoke:nth-child(4) {
          left: 75%;
          --duration: 11s;
          animation-delay: 1s;
        }
        .smoke:nth-child(5) {
          left: 90%;
          --duration: 10s;
          animation-delay: 3s;
        }

        @keyframes rise {
          0% {
            bottom: 0;
            opacity: 0;
            transform: translateX(0) scale(1);
          }
          10% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.3;
            transform: translateX(20px) scale(1.5);
          }
          100% {
            bottom: 100%;
            opacity: 0;
            transform: translateX(-20px) scale(2);
          }
        }

        .header {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(255, 0, 0, 0.5);
          position: relative;
          z-index: 2;
        }

        .header h1 {
          color: #fff;
          margin: 0;
          font-size: 2rem;
          text-shadow: 0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6);
          font-weight: 900;
          letter-spacing: 2px;
        }

        .header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0.5rem 0 0;
          font-style: italic;
        }

        .chat-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .message {
          margin-bottom: 1.5rem;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-user {
          text-align: right;
        }

        .message-assistant {
          text-align: left;
        }

        .message-bubble {
          display: inline-block;
          max-width: 70%;
          padding: 1rem 1.5rem;
          border-radius: 20px;
          word-wrap: break-word;
        }

        .message-user .message-bubble {
          background: linear-gradient(135deg, #ff3333, #ff0000);
          color: #fff;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
          border: 2px solid #ff0000;
        }

        .message-assistant .message-bubble {
          background: rgba(30, 30, 30, 0.9);
          color: #ff3333;
          border: 2px solid #ff0000;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
          text-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
        }

        .input-area {
          padding: 1.5rem;
          background: rgba(20, 20, 20, 0.95);
          border-top: 2px solid #ff0000;
          box-shadow: 0 -4px 20px rgba(255, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        }

        .input-form {
          display: flex;
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .input-field {
          flex: 1;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #ff0000;
          border-radius: 25px;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }

        .input-field:focus {
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          border-color: #ff3333;
        }

        .input-field::placeholder {
          color: rgba(255, 51, 51, 0.5);
        }

        .send-button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ff0000, #cc0000);
          border: 2px solid #ff0000;
          border-radius: 25px;
          color: #fff;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.7);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-indicator {
          text-align: center;
          color: #ff3333;
          padding: 1rem;
          font-style: italic;
        }

        /* Scrollbar styling */
        .chat-container::-webkit-scrollbar {
          width: 8px;
        }

        .chat-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
        }

        .chat-container::-webkit-scrollbar-thumb {
          background: #ff0000;
          border-radius: 4px;
        }

        .chat-container::-webkit-scrollbar-thumb:hover {
          background: #ff3333;
        }
      `}</style>

      <div className="brutal-page">
        {/* Smoke effect */}
        <div className="smoke-container">
          <div className="smoke"></div>
          <div className="smoke"></div>
          <div className="smoke"></div>
          <div className="smoke"></div>
          <div className="smoke"></div>
        </div>

        {/* Header */}
        <div className="header">
          <h1>🔥 BRUTAL ÆRLIGHET 🔥</h1>
          <p>En nådeløs, sardonisk venn som sier sannheten uansett hvor vond den er</p>
        </div>

        {/* Chat messages */}
        <div className="chat-container">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#ff3333', marginTop: '2rem' }}>
              <p style={{ fontSize: '1.2rem' }}>
                Velkommen til brutal ærlighet. Jeg skjærer gjennom bullshit.
              </p>
              <p style={{ opacity: 0.7 }}>Still meg et spørsmål, del et problem, eller fortell en hemmelighet...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message message-${msg.role}`}
            >
              <div className="message-bubble">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="loading-indicator">
              Formulerer brutal sannhet...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv din hemmelighet, problemet ditt, eller spørsmålet..."
              className="input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-button"
            >
              {loading ? 'Venter...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
