import { Memory, DataSourceType, Emotion } from '../types';

/**
 * Data parsers for different message formats
 * These extract messages/memories from various export formats
 */

export interface ParsedMessage {
  timestamp: Date | null;
  sender: string | null;
  content: string;
  mediaUrls: string[];
  participants: string[];
  emotion: Emotion | null;
}

/**
 * Parse WhatsApp chat export (plain text format)
 * Format: [DD/MM/YYYY, HH:MM:SS] Sender: Message
 */
export function parseWhatsAppExport(fileContent: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  const lines = fileContent.split('\n');

  // WhatsApp format: [14/01/2024, 15:30:45] John Doe: Hello there
  const messageRegex = /\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)/;

  const participants = new Set<string>();

  for (const line of lines) {
    const match = line.match(messageRegex);

    if (match) {
      const [, date, time, sender, content] = match;

      // Parse date (DD/MM/YYYY)
      const [day, month, year] = date.split('/').map(Number);
      const [hour, minute, second] = time.split(':').map(Number);
      const timestamp = new Date(year, month - 1, day, hour, minute, second);

      participants.add(sender.trim());

      // Detect media attachments
      const mediaUrls: string[] = [];
      const mediaRegex = /<attached: (.+?)>/g;
      let mediaMatch;
      while ((mediaMatch = mediaRegex.exec(content)) !== null) {
        mediaUrls.push(mediaMatch[1]);
      }

      // Remove media placeholders from content
      let cleanContent = content.replace(/<attached: .+?>/g, '').trim();

      // Skip system messages
      if (
        cleanContent.includes('Messages and calls are end-to-end encrypted') ||
        cleanContent.includes('created group') ||
        cleanContent.includes('left') ||
        cleanContent.includes('joined')
      ) {
        continue;
      }

      if (cleanContent.length > 0 || mediaUrls.length > 0) {
        messages.push({
          timestamp,
          sender: sender.trim(),
          content: cleanContent,
          mediaUrls,
          participants: Array.from(participants),
          emotion: detectEmotionFromText(cleanContent),
        });
      }
    }
  }

  return messages;
}

/**
 * Parse iMessage export (SQLite database or JSON export)
 * This is a simplified version - real iMessage parsing requires SQLite queries
 */
export function parseIMessageExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const messages: ParsedMessage[] = [];

    if (!Array.isArray(data)) {
      throw new Error('Invalid iMessage export format');
    }

    for (const msg of data) {
      messages.push({
        timestamp: msg.date ? new Date(msg.date) : null,
        sender: msg.is_from_me ? 'Me' : (msg.handle || 'Unknown'),
        content: msg.text || '',
        mediaUrls: msg.attachments || [],
        participants: [msg.handle].filter(Boolean),
        emotion: detectEmotionFromText(msg.text || ''),
      });
    }

    return messages;
  } catch (error) {
    console.error('Failed to parse iMessage export:', error);
    return [];
  }
}

/**
 * Parse email export (Gmail Takeout MBOX or JSON)
 */
export function parseEmailExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const messages: ParsedMessage[] = [];

    if (!Array.isArray(data)) {
      throw new Error('Invalid email export format');
    }

    for (const email of data) {
      const content = `Subject: ${email.subject || 'No Subject'}\n\n${email.body || ''}`;

      messages.push({
        timestamp: email.date ? new Date(email.date) : null,
        sender: email.from || 'Unknown',
        content,
        mediaUrls: email.attachments || [],
        participants: [email.from, ...(email.to || [])].filter(Boolean),
        emotion: detectEmotionFromText(email.body || ''),
      });
    }

    return messages;
  } catch (error) {
    console.error('Failed to parse email export:', error);
    return [];
  }
}

/**
 * Parse Facebook export (JSON format)
 */
export function parseFacebookExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const messages: ParsedMessage[] = [];

    // Facebook export has nested structure
    const conversations = data.messages || data.conversations || [];

    for (const conversation of conversations) {
      const msgs = conversation.messages || [];

      for (const msg of msgs) {
        messages.push({
          timestamp: msg.timestamp_ms ? new Date(msg.timestamp_ms) : null,
          sender: msg.sender_name || 'Unknown',
          content: msg.content || '',
          mediaUrls: (msg.photos || []).map((p: any) => p.uri),
          participants: conversation.participants?.map((p: any) => p.name) || [],
          emotion: detectEmotionFromText(msg.content || ''),
        });
      }
    }

    return messages;
  } catch (error) {
    console.error('Failed to parse Facebook export:', error);
    return [];
  }
}

/**
 * Parse Instagram export (JSON format)
 */
export function parseInstagramExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const messages: ParsedMessage[] = [];

    // Instagram posts and stories
    const posts = data.posts || [];

    for (const post of posts) {
      const content = [
        post.caption || '',
        ...(post.comments || []).map((c: any) => `Comment: ${c.text}`),
      ].join('\n');

      messages.push({
        timestamp: post.taken_at ? new Date(post.taken_at * 1000) : null,
        sender: post.user?.username || 'Me',
        content,
        mediaUrls: post.media_url ? [post.media_url] : [],
        participants: [],
        emotion: detectEmotionFromText(content),
      });
    }

    return messages;
  } catch (error) {
    console.error('Failed to parse Instagram export:', error);
    return [];
  }
}

/**
 * Parse Twitter/X export (JSON format)
 */
export function parseTwitterExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const messages: ParsedMessage[] = [];

    const tweets = data.tweets || data || [];

    for (const tweet of tweets) {
      messages.push({
        timestamp: tweet.created_at ? new Date(tweet.created_at) : null,
        sender: tweet.user?.screen_name || 'Me',
        content: tweet.full_text || tweet.text || '',
        mediaUrls: (tweet.entities?.media || []).map((m: any) => m.media_url),
        participants: [],
        emotion: detectEmotionFromText(tweet.full_text || tweet.text || ''),
      });
    }

    return messages;
  } catch (error) {
    console.error('Failed to parse Twitter export:', error);
    return [];
  }
}

/**
 * Parse plain text diary/notes
 */
export function parseDiaryText(textContent: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  const lines = textContent.split('\n\n'); // Split by paragraphs

  for (const paragraph of lines) {
    const trimmed = paragraph.trim();
    if (trimmed.length < 10) continue; // Skip very short paragraphs

    // Try to extract date from start of paragraph
    const dateRegex = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
    const dateMatch = trimmed.match(dateRegex);

    let timestamp: Date | null = null;
    let content = trimmed;

    if (dateMatch) {
      try {
        const dateStr = dateMatch[1];
        const parts = dateStr.split(/[\/\-\.]/);
        const [day, month, year] = parts.map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        timestamp = new Date(fullYear, month - 1, day);
        content = trimmed.substring(dateMatch[0].length).trim();
      } catch {
        // Invalid date, use null
      }
    }

    messages.push({
      timestamp,
      sender: 'Author',
      content,
      mediaUrls: [],
      participants: [],
      emotion: detectEmotionFromText(content),
    });
  }

  return messages;
}

/**
 * Simple emotion detection from text
 */
function detectEmotionFromText(text: string): Emotion | null {
  if (!text) return null;

  const lower = text.toLowerCase();

  // Happy indicators
  if (
    /😂|😄|😊|🥰|❤️|haha|lol|glad|happy|elsker|love/.test(lower)
  ) {
    return 'happy';
  }

  // Sad indicators
  if (
    /😢|😭|💔|trist|lei|sad|sorrow|savner|miss/.test(lower)
  ) {
    return 'sad';
  }

  // Angry indicators
  if (
    /😠|😡|faen|helvete|jævlig|dritt|fuck|angry|pissed/.test(lower)
  ) {
    return 'angry';
  }

  // Loving indicators
  if (
    /❤️|💕|💖|elsker|love you|jeg elsker deg|my love/.test(lower)
  ) {
    return 'loving';
  }

  // Excited indicators
  if (
    /!!!|wow|amazing|awesome|incredible|fantastic|kult/.test(lower)
  ) {
    return 'excited';
  }

  // Playful indicators
  if (
    /😜|😏|😉|;-?\)|hehe|hihi/.test(lower)
  ) {
    return 'playful';
  }

  return 'neutral';
}

/**
 * Main parser dispatcher
 */
export function parseDataSource(
  sourceType: DataSourceType,
  fileContent: string
): ParsedMessage[] {
  switch (sourceType) {
    case 'whatsapp':
      return parseWhatsAppExport(fileContent);
    case 'imessage':
      return parseIMessageExport(fileContent);
    case 'email':
      return parseEmailExport(fileContent);
    case 'facebook':
      return parseFacebookExport(fileContent);
    case 'instagram':
      return parseInstagramExport(fileContent);
    case 'twitter':
      return parseTwitterExport(fileContent);
    case 'diary':
      return parseDiaryText(fileContent);
    default:
      return parseDiaryText(fileContent); // Fallback to diary parser
  }
}

/**
 * Validate data source file
 */
export function validateDataSourceFile(
  sourceType: DataSourceType,
  fileContent: string
): { valid: boolean; error?: string } {
  if (!fileContent || fileContent.trim().length === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Try parsing
  try {
    const messages = parseDataSource(sourceType, fileContent);

    if (messages.length === 0) {
      return {
        valid: false,
        error: 'No messages found in file. Check format.',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse file: ${(error as Error).message}`,
    };
  }
}
