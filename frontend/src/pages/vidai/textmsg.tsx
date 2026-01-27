import { useState } from 'react';
import Link from 'next/link';

interface TextMessage {
  id: string;
  sender: 'left' | 'right';
  text: string;
  timestamp: string;
}

interface Conversation {
  leftName: string;
  rightName: string;
  messages: TextMessage[];
}

const STORY_PRESETS = [
  { id: 'cheating', label: 'Caught Cheating', prompt: 'Partner discovers cheating through accidental text' },
  { id: 'wrong-number', label: 'Wrong Number', prompt: 'Strangers text the wrong number and chaos ensues' },
  { id: 'creepy', label: 'Creepy Encounter', prompt: 'Disturbing messages from an unknown number' },
  { id: 'revenge', label: 'Sweet Revenge', prompt: 'Someone gets the perfect revenge through text' },
  { id: 'wholesome', label: 'Wholesome Surprise', prompt: 'Heartwarming surprise revealed through messages' },
  { id: 'mystery', label: 'Mystery Unfolds', prompt: 'Mysterious texts that slowly reveal a shocking truth' },
  { id: 'comedy', label: 'Comedy Gold', prompt: 'Hilarious misunderstanding that escalates' },
  { id: 'plot-twist', label: 'Plot Twist', prompt: 'Normal conversation with a jaw-dropping twist ending' },
];

let nextMsgId = 1;

export default function ViralTextMessages() {
  const [conversation, setConversation] = useState<Conversation>({
    leftName: 'Alex',
    rightName: 'Jordan',
    messages: [],
  });
  const [newText, setNewText] = useState('');
  const [activeSender, setActiveSender] = useState<'left' | 'right'>('left');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = () => {
    if (!newText.trim()) return;
    const msg: TextMessage = {
      id: String(nextMsgId++),
      sender: activeSender,
      text: newText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
    setNewText('');
  };

  const removeMessage = (id: string) => {
    setConversation((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  };

  const generateFromPreset = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vidai/textmsg/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          leftName: conversation.leftName,
          rightName: conversation.rightName,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate conversation');
      const data = await res.json();
      setConversation((prev) => ({
        ...prev,
        messages: data.messages,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/vidai" style={styles.backLink}>&larr; VID.AI</Link>
      </nav>

      <h1 style={styles.heading}>Viral Text Message Generator</h1>
      <p style={styles.sub}>Create fake text conversations for storytelling videos. Build manually or auto-generate.</p>

      <div style={styles.nameRow}>
        <label style={styles.nameLabel}>
          Left (sender)
          <input
            style={styles.nameInput}
            value={conversation.leftName}
            onChange={(e) => setConversation((p) => ({ ...p, leftName: e.target.value }))}
          />
        </label>
        <label style={styles.nameLabel}>
          Right (receiver)
          <input
            style={styles.nameInput}
            value={conversation.rightName}
            onChange={(e) => setConversation((p) => ({ ...p, rightName: e.target.value }))}
          />
        </label>
      </div>

      <section style={styles.presetsSection}>
        <h2 style={styles.sectionTitle}>Story Presets</h2>
        <div style={styles.presetGrid}>
          {STORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              style={styles.presetBtn}
              onClick={() => generateFromPreset(preset.prompt)}
              disabled={loading}
            >
              <span style={styles.presetLabel}>{preset.label}</span>
              <span style={styles.presetDesc}>{preset.prompt}</span>
            </button>
          ))}
        </div>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.phoneSection}>
        <h2 style={styles.sectionTitle}>Preview</h2>
        <div style={styles.phone}>
          <div style={styles.phoneHeader}>
            <span style={styles.phoneTitle}>
              {conversation.leftName} & {conversation.rightName}
            </span>
          </div>

          <div style={styles.phoneMessages}>
            {conversation.messages.length === 0 && (
              <p style={styles.emptyMsg}>No messages yet. Add manually or pick a preset above.</p>
            )}
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.bubble,
                  ...(msg.sender === 'right' ? styles.bubbleRight : styles.bubbleLeft),
                }}
              >
                <span style={styles.bubbleSender}>
                  {msg.sender === 'left' ? conversation.leftName : conversation.rightName}
                </span>
                <p style={styles.bubbleText}>{msg.text}</p>
                <div style={styles.bubbleFooter}>
                  <span style={styles.bubbleTime}>{msg.timestamp}</span>
                  <button style={styles.removeBtn} onClick={() => removeMessage(msg.id)}>x</button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.phoneInput}>
            <div style={styles.senderToggle}>
              <button
                style={activeSender === 'left' ? styles.senderActive : styles.senderBtn}
                onClick={() => setActiveSender('left')}
              >
                {conversation.leftName}
              </button>
              <button
                style={activeSender === 'right' ? styles.senderActive : styles.senderBtn}
                onClick={() => setActiveSender('right')}
              >
                {conversation.rightName}
              </button>
            </div>
            <div style={styles.inputRow}>
              <input
                style={styles.msgInput}
                placeholder="Type a message..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMessage()}
              />
              <button style={styles.sendBtn} onClick={addMessage}>Send</button>
            </div>
          </div>
        </div>
      </section>

      {conversation.messages.length > 0 && (
        <div style={styles.exportBar}>
          <Link href="/vidai/video">
            <button style={styles.exportBtn}>Export to Video</button>
          </Link>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  nav: { marginBottom: '2rem' },
  backLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  heading: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '1.5rem' },
  nameRow: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  nameLabel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#94a3b8', fontSize: '0.85rem' },
  nameInput: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    fontSize: '0.95rem',
  },
  presetsSection: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  presetBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  presetLabel: { color: '#fff', fontWeight: 700, fontSize: '0.9rem' },
  presetDesc: { color: '#64748b', fontSize: '0.75rem' },
  error: { color: '#ef4444', margin: '1rem 0' },
  phoneSection: { marginBottom: '2rem' },
  phone: {
    background: '#000',
    borderRadius: '24px',
    border: '2px solid rgba(255,255,255,0.15)',
    maxWidth: '400px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  phoneHeader: {
    background: 'rgba(255,255,255,0.05)',
    padding: '0.75rem 1rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  phoneTitle: { fontWeight: 700, fontSize: '0.9rem' },
  phoneMessages: {
    padding: '1rem',
    minHeight: '300px',
    maxHeight: '500px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  emptyMsg: { color: '#64748b', textAlign: 'center', fontSize: '0.85rem', marginTop: '4rem' },
  bubble: {
    maxWidth: '75%',
    borderRadius: '16px',
    padding: '0.5rem 0.75rem',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.1)',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    background: '#3b82f6',
  },
  bubbleSender: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.125rem' },
  bubbleText: { margin: 0, fontSize: '0.9rem', lineHeight: 1.4 },
  bubbleFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' },
  bubbleTime: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontSize: '0.7rem',
    padding: '0 0.25rem',
  },
  phoneInput: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '0.75rem',
  },
  senderToggle: { display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' },
  senderBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#94a3b8',
    padding: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  senderActive: {
    flex: 1,
    background: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    color: '#fff',
    padding: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 700,
  },
  inputRow: { display: 'flex', gap: '0.5rem' },
  msgInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    fontSize: '0.9rem',
  },
  sendBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  exportBar: { textAlign: 'center' },
  exportBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.875rem 2.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
