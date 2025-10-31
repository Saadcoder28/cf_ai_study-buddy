/**
 * API client for communicating with Cloudflare Worker backend
 */

// Use environment variable for API URL, fallback to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * Create a new study session
 */
export async function createSession(): Promise<{ sessionId: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a chat message
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<{ response: string; sessionId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get progress for a session
 */
export async function getProgress(sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/progress/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get progress: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get conversation history
 */
export async function getHistory(sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update difficulty level
 */
export async function updateDifficulty(
  sessionId: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/difficulty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      level,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update difficulty: ${response.statusText}`);
  }

  return response.json();
}