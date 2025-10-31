/**
 * Main Cloudflare Worker entry point for AI Study Buddy
 * Handles API endpoints for session management, chat, and progress tracking
 */

import { StudySession } from './durable-objects/StudySession';
import { processMessage } from './utils/ai';
import { generateSessionId } from './utils/helpers';

export { StudySession };

interface Env {
  AI: any;
  STUDY_SESSION: DurableObjectNamespace;
}

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders,
  });
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Create error response
 */
function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      // Route: Start new study session
      if (url.pathname === '/api/session/start' && request.method === 'POST') {
        const sessionId = generateSessionId();
        
        // Initialize Durable Object for this session
        const id = env.STUDY_SESSION.idFromName(sessionId);
        const stub = env.STUDY_SESSION.get(id);
        
        await stub.fetch(new Request('https://internal/init', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        }));

        return jsonResponse({
          sessionId,
          message: 'Study session created successfully',
        });
      }

      // Route: Send chat message
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        const body = await request.json() as {
          sessionId: string;
          message: string;
        };

        if (!body.sessionId || !body.message) {
          return errorResponse('Missing sessionId or message', 400);
        }

        // Get Durable Object for this session
        const id = env.STUDY_SESSION.idFromName(body.sessionId);
        const stub = env.STUDY_SESSION.get(id);

        // Get conversation history
        const historyResponse = await stub.fetch(
          new Request('https://internal/history', { method: 'GET' })
        );
        const historyData = await historyResponse.json() as any;
        const history = historyData.history || [];
        const difficultyLevel = historyData.difficultyLevel || 'beginner';

        // Process message with AI
        const aiResponse = await processMessage(
          env.AI,
          body.message,
          history,
          difficultyLevel
        );

        // Save message and response to Durable Object
        await stub.fetch(new Request('https://internal/add-message', {
          method: 'POST',
          body: JSON.stringify({
            userMessage: body.message,
            aiResponse,
          }),
        }));

        return jsonResponse({
          response: aiResponse,
          sessionId: body.sessionId,
        });
      }

      // Route: Get progress for a session
      if (url.pathname.startsWith('/api/progress/') && request.method === 'GET') {
        const sessionId = url.pathname.split('/').pop();
        
        if (!sessionId) {
          return errorResponse('Missing sessionId', 400);
        }

        const id = env.STUDY_SESSION.idFromName(sessionId);
        const stub = env.STUDY_SESSION.get(id);

        const progressResponse = await stub.fetch(
          new Request('https://internal/progress', { method: 'GET' })
        );
        
        return new Response(progressResponse.body, {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Route: Get session history
      if (url.pathname === '/api/history' && request.method === 'POST') {
        const body = await request.json() as { sessionId: string };
        
        if (!body.sessionId) {
          return errorResponse('Missing sessionId', 400);
        }

        const id = env.STUDY_SESSION.idFromName(body.sessionId);
        const stub = env.STUDY_SESSION.get(id);

        const historyResponse = await stub.fetch(
          new Request('https://internal/history', { method: 'GET' })
        );
        
        return new Response(historyResponse.body, {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Route: Update difficulty
      if (url.pathname === '/api/difficulty' && request.method === 'POST') {
        const body = await request.json() as {
          sessionId: string;
          level: 'beginner' | 'intermediate' | 'advanced';
        };

        if (!body.sessionId || !body.level) {
          return errorResponse('Missing sessionId or level', 400);
        }

        const id = env.STUDY_SESSION.idFromName(body.sessionId);
        const stub = env.STUDY_SESSION.get(id);

        await stub.fetch(new Request('https://internal/set-difficulty', {
          method: 'POST',
          body: JSON.stringify({ level: body.level }),
        }));

        return jsonResponse({
          message: 'Difficulty updated successfully',
          level: body.level,
        });
      }

      // Route: Health check
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'AI Study Buddy',
        });
      }

      // 404 for unknown routes
      return errorResponse('Route not found', 404);

    } catch (error: any) {
      console.error('Worker error:', error);
      return errorResponse(
        error.message || 'Internal server error',
        500
      );
    }
  },
};