import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { chatLimiter } from '../middleware/rateLimit';
import { Conversation, Message, DeceasedPerson } from '../types';
import { buildRAGContext } from '../services/rag';
import { generateChatResponse, streamChatResponse } from '../services/llm';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /chat - Send a message and get response
 */
router.post('/', chatLimiter, async (req: Request, res: Response) => {
  try {
    const {
      deceasedPersonId,
      conversationId,
      message,
      stream = false,
      temperature = 0.8,
    } = req.body;

    if (!deceasedPersonId || !message) {
      return res.status(400).json({
        error: 'deceasedPersonId and message are required',
      });
    }

    // Verify access to deceased person
    const persons = await query<DeceasedPerson>(
      'SELECT * FROM deceased_persons WHERE id = $1 AND user_id = $2',
      [deceasedPersonId, req.userId]
    );

    if (persons.length === 0) {
      return res.status(404).json({ error: 'Deceased person not found' });
    }

    const person = persons[0];

    // Get or create conversation
    let conversation: Conversation;

    if (conversationId) {
      const conversations = await query<Conversation>(
        'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
        [conversationId, req.userId]
      );

      if (conversations.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      conversation = conversations[0];
    } else {
      // Create new conversation
      [conversation] = await query<Conversation>(
        `INSERT INTO conversations (id, user_id, deceased_person_id, title, message_count)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [uuid(), req.userId, deceasedPersonId, message.substring(0, 100), 0]
      );
    }

    // Get conversation history
    const history = await query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 20`,
      [conversation.id]
    );

    // Build RAG context
    const ragContext = await buildRAGContext(
      deceasedPersonId,
      message,
      history
    );

    // Save user message
    const [userMessage] = await query<Message>(
      `INSERT INTO messages (id, conversation_id, role, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [uuid(), conversation.id, 'user', message]
    );

    // Generate AI response
    if (stream) {
      // Set up SSE (Server-Sent Events) for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullContent = '';
      let emotion = null;
      let tokensUsed = 0;

      try {
        const result = await streamChatResponse(
          person.name,
          person.relationship,
          ragContext,
          message,
          (chunk) => {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            fullContent += chunk;
          },
          temperature
        );

        emotion = result.emotion;
        tokensUsed = result.tokensUsed;

        // Save assistant message
        const [assistantMessage] = await query<Message>(
          `INSERT INTO messages
           (id, conversation_id, role, content, emotion, memories_used, tokens_used, model_used, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           RETURNING *`,
          [
            uuid(),
            conversation.id,
            'assistant',
            fullContent,
            emotion,
            ragContext.relevantMemories.map((m) => m.id),
            tokensUsed,
            'claude-3-5-sonnet-20241022',
          ]
        );

        // Update conversation
        await query(
          `UPDATE conversations
           SET last_message_at = NOW(), message_count = message_count + 2
           WHERE id = $1`,
          [conversation.id]
        );

        // Update last interaction
        await query(
          'UPDATE deceased_persons SET last_interaction_at = NOW() WHERE id = $1',
          [deceasedPersonId]
        );

        // Send final event
        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            message: assistantMessage,
            conversationId: conversation.id,
            memoriesUsed: ragContext.relevantMemories,
          })}\n\n`
        );

        res.end();
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: 'Failed to generate response' })}\n\n`
        );
        res.end();
      }
    } else {
      // Non-streaming response
      const result = await generateChatResponse(
        person.name,
        person.relationship,
        ragContext,
        message,
        temperature
      );

      // Save assistant message
      const [assistantMessage] = await query<Message>(
        `INSERT INTO messages
         (id, conversation_id, role, content, emotion, memories_used, tokens_used, model_used, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [
          uuid(),
          conversation.id,
          'assistant',
          result.content,
          result.emotion,
          ragContext.relevantMemories.map((m) => m.id),
          result.tokensUsed,
          'claude-3-5-sonnet-20241022',
        ]
      );

      // Update conversation
      await query(
        `UPDATE conversations
         SET last_message_at = NOW(), message_count = message_count + 2
         WHERE id = $1`,
        [conversation.id]
      );

      // Update last interaction
      await query(
        'UPDATE deceased_persons SET last_interaction_at = NOW() WHERE id = $1',
        [deceasedPersonId]
      );

      res.json({
        conversationId: conversation.id,
        userMessage,
        assistantMessage,
        memoriesUsed: ragContext.relevantMemories.slice(0, 5), // Don't send all memories
        emotion: result.emotion,
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /chat/conversations - List all conversations
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { deceasedPersonId } = req.query;

    let conversations: Conversation[];

    if (deceasedPersonId) {
      conversations = await query<Conversation>(
        `SELECT c.* FROM conversations c
         JOIN deceased_persons d ON c.deceased_person_id = d.id
         WHERE c.user_id = $1 AND c.deceased_person_id = $2 AND d.user_id = $1
         ORDER BY c.last_message_at DESC`,
        [req.userId, deceasedPersonId]
      );
    } else {
      conversations = await query<Conversation>(
        `SELECT c.* FROM conversations c
         JOIN deceased_persons d ON c.deceased_person_id = d.id
         WHERE c.user_id = $1 AND d.user_id = $1
         ORDER BY c.last_message_at DESC`,
        [req.userId]
      );
    }

    res.json(conversations);
  } catch (error) {
    console.error('Failed to list conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /chat/conversations/:id - Get a specific conversation with messages
 */
router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get conversation
    const conversations = await query<Conversation>(
      `SELECT c.* FROM conversations c
       JOIN deceased_persons d ON c.deceased_person_id = d.id
       WHERE c.id = $1 AND c.user_id = $2 AND d.user_id = $2`,
      [id, req.userId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages
    const messages = await query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({
      conversation: conversations[0],
      messages: messages.reverse(), // Reverse to get chronological order
    });
  } catch (error) {
    console.error('Failed to get conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * DELETE /chat/conversations/:id - Delete a conversation
 */
router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const conversations = await query<Conversation>(
      `SELECT c.* FROM conversations c
       JOIN deceased_persons d ON c.deceased_person_id = d.id
       WHERE c.id = $1 AND c.user_id = $2 AND d.user_id = $2`,
      [id, req.userId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete conversation (cascades to messages)
    await query('DELETE FROM conversations WHERE id = $1', [id]);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
