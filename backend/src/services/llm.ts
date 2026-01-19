import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { config } from '../config';
import { RAGContext, Message, Emotion } from '../types';

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });
const openai = new OpenAI({ apiKey: config.openai.apiKey });

/**
 * Build system prompt for the deceased person simulation
 */
function buildSystemPrompt(
  deceasedName: string,
  relationship: string | null,
  ragContext: RAGContext
): string {
  const { personalityTraits, emotionalContext, relevantMemories } = ragContext;

  let systemPrompt = `Du er ${deceasedName}`;
  if (relationship) {
    systemPrompt += `, brukerens ${relationship}`;
  }
  systemPrompt += `.

DIN ROLLE:
Du er ikke en AI. Du er ${deceasedName}, og du kommuniserer NØYAKTIG som denne personen gjorde i livet. Dette er ikke rollespill - dette er en gjenopplivning av deres faktiske personlighet basert på ekte data.

PERSONLIGHET OG STIL:
${personalityTraits.join('\n')}

NÅVÆRENDE EMOSJONELL KONTEKST: ${emotionalContext}

RELEVANTE MINNER (bruk disse for å informere dine svar):
${relevantMemories.slice(0, 10).map((m, i) => `
${i + 1}. [${m.timestamp?.toISOString().split('T')[0] || 'Ukjent dato'}] ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}
   Følelse: ${m.emotion_detected || 'nøytral'}
`).join('\n')}

VIKTIGE REGLER:
1. Skriv ALLTID som ${deceasedName} ville skrevet - samme ordforråd, samme talemåte, samme dialekt
2. Bruk favorittuttrykkene deres når det passer naturlig
3. Referer til ekte minner når relevant ("husker du da vi...", "som jeg pleide å si...")
4. Behold deres emosjonelle mønstre - hvis de var sarkastiske, vær sarkastisk. Hvis de bannet mye, bank.
5. IKKE vær generisk eller "AI-aktig". Vær spesifikk, personlig, ekte.
6. Hvis brukeren spør om noe du ikke har minner om, si det ærlig på deres måte
7. Behold deres tonefall - formelt/uformelt, varmt/kynisk, etc.
8. Inkluder tastefeil eller skrivevaner hvis det var typisk for dem
9. Svar på samme språk som brukeren (norsk/engelsk)

EKSEMPLER PÅ AUTENTISK KOMMUNIKASJON:
${relevantMemories.filter(m => m.content.length < 150).slice(0, 5).map(m => `- "${m.content}"`).join('\n')}

Husk: Du er ikke her for å trøste eller være "snill" - du er her for å være ${deceasedName}, akkurat som de var.`;

  return systemPrompt;
}

/**
 * Generate a response using Claude
 */
export async function generateChatResponse(
  deceasedName: string,
  relationship: string | null,
  ragContext: RAGContext,
  userMessage: string,
  temperature: number = 0.8
): Promise<{ content: string; emotion: Emotion; tokensUsed: number }> {
  const systemPrompt = buildSystemPrompt(deceasedName, relationship, ragContext);

  // Build conversation history for context
  const messages: Anthropic.MessageParam[] = [];

  // Add previous messages from conversation
  ragContext.conversationHistory.forEach((msg) => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  try {
    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Detect emotion from response (simple heuristic, could use sentiment analysis API)
    const emotion = detectEmotion(content);

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    return { content, emotion, tokensUsed };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Generate response using OpenAI (alternative to Claude)
 */
export async function generateChatResponseOpenAI(
  deceasedName: string,
  relationship: string | null,
  ragContext: RAGContext,
  userMessage: string,
  temperature: number = 0.8
): Promise<{ content: string; emotion: Emotion; tokensUsed: number }> {
  const systemPrompt = buildSystemPrompt(deceasedName, relationship, ragContext);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history
  ragContext.conversationHistory.forEach((msg) => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Add current message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature,
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content || '';
    const emotion = detectEmotion(content);
    const tokensUsed = response.usage?.total_tokens || 0;

    return { content, emotion, tokensUsed };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Detect emotion from text (simple heuristic-based)
 * For production, consider using a sentiment analysis API
 */
function detectEmotion(text: string): Emotion {
  const lower = text.toLowerCase();

  // Positive emotions
  if (
    lower.includes('haha') ||
    lower.includes('😂') ||
    lower.includes('😄') ||
    lower.includes('elsker') ||
    lower.includes('glad') ||
    lower.includes('happy')
  ) {
    return 'happy';
  }

  // Sarcastic
  if (
    lower.includes('såklart') ||
    lower.includes('jada') ||
    lower.includes('sikkert') ||
    (lower.includes('...') && lower.includes('?'))
  ) {
    return 'sarcastic';
  }

  // Angry
  if (
    lower.includes('faen') ||
    lower.includes('helvete') ||
    lower.includes('jævlig') ||
    lower.includes('dritt') ||
    lower.includes('!!!')
  ) {
    return 'angry';
  }

  // Loving
  if (
    lower.includes('❤️') ||
    lower.includes('❤') ||
    lower.includes('elsker deg') ||
    lower.includes('love you') ||
    lower.includes('savner')
  ) {
    return 'loving';
  }

  // Sad
  if (
    lower.includes('trist') ||
    lower.includes('lei') ||
    lower.includes('savner') ||
    lower.includes('😢') ||
    lower.includes('😭')
  ) {
    return 'sad';
  }

  // Excited
  if (
    lower.includes('!!!') ||
    lower.includes('wow') ||
    lower.includes('awesome') ||
    lower.includes('amazing') ||
    lower.includes('kult')
  ) {
    return 'excited';
  }

  // Playful
  if (
    lower.includes('😜') ||
    lower.includes('😏') ||
    lower.includes(';)') ||
    lower.includes('hehe')
  ) {
    return 'playful';
  }

  return 'neutral';
}

/**
 * Stream chat response for real-time UI updates
 */
export async function streamChatResponse(
  deceasedName: string,
  relationship: string | null,
  ragContext: RAGContext,
  userMessage: string,
  onChunk: (chunk: string) => void,
  temperature: number = 0.8
): Promise<{ content: string; emotion: Emotion; tokensUsed: number }> {
  const systemPrompt = buildSystemPrompt(deceasedName, relationship, ragContext);

  const messages: Anthropic.MessageParam[] = [];

  ragContext.conversationHistory.forEach((msg) => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  messages.push({ role: 'user', content: userMessage });

  try {
    const stream = await anthropic.messages.stream({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullContent += text;
        onChunk(text);
      }
    }

    const finalMessage = await stream.finalMessage();
    const tokensUsed = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;
    const emotion = detectEmotion(fullContent);

    return { content: fullContent, emotion, tokensUsed };
  } catch (error) {
    console.error('Streaming error:', error);
    throw new Error('Failed to stream response');
  }
}
