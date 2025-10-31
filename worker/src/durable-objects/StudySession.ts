/**
 * Durable Object for managing individual study sessions
 * Stores conversation history, performance metrics, and learning progress
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  totalMessages: number;
  topicsDiscussed: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  understandingScore: number; // 0-100
  lastInteraction: number;
}

export interface SessionState {
  sessionId: string;
  history: Message[];
  metrics: PerformanceMetrics;
  createdAt: number;
}

export class StudySession {
  private state: DurableObjectState;
  private sessionData: SessionState | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  /**
   * Initialize session data from storage or create new
   */
  private async ensureInitialized(): Promise<void> {
    if (this.sessionData) return;

    const stored = await this.state.storage.get<SessionState>('session');
    
    if (stored) {
      this.sessionData = stored;
    } else {
      this.sessionData = {
        sessionId: '',
        history: [],
        metrics: {
          totalMessages: 0,
          topicsDiscussed: [],
          difficultyLevel: 'beginner',
          understandingScore: 0,
          lastInteraction: Date.now(),
        },
        createdAt: Date.now(),
      };
    }
  }

  /**
   * Save current state to storage
   */
  private async save(): Promise<void> {
    if (this.sessionData) {
      await this.state.storage.put('session', this.sessionData);
    }
  }

  /**
   * Handle incoming requests to this Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    await this.ensureInitialized();

    const url = new URL(request.url);

    try {
      // Initialize session
      if (url.pathname === '/init' && request.method === 'POST') {
        const body = await request.json() as { sessionId: string };
        if (this.sessionData) {
          this.sessionData.sessionId = body.sessionId;
          await this.save();
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Add message to history
      if (url.pathname === '/add-message' && request.method === 'POST') {
        const body = await request.json() as {
          userMessage: string;
          aiResponse: string;
        };

        if (!this.sessionData) {
          return new Response(JSON.stringify({ error: 'Session not initialized' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const timestamp = Date.now();

        // Add user message
        this.sessionData.history.push({
          role: 'user',
          content: body.userMessage,
          timestamp,
        });

        // Add AI response
        this.sessionData.history.push({
          role: 'assistant',
          content: body.aiResponse,
          timestamp: timestamp + 1,
        });

        // Update metrics
        this.sessionData.metrics.totalMessages += 2;
        this.sessionData.metrics.lastInteraction = timestamp;

        // Update understanding score based on conversation patterns
        this.updateUnderstandingScore(body.userMessage);

        // Limit history to last 50 messages
        if (this.sessionData.history.length > 50) {
          this.sessionData.history = this.sessionData.history.slice(-50);
        }

        await this.save();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get conversation history
      if (url.pathname === '/history' && request.method === 'GET') {
        if (!this.sessionData) {
          return new Response(JSON.stringify({ history: [], difficultyLevel: 'beginner' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          history: this.sessionData.history,
          difficultyLevel: this.sessionData.metrics.difficultyLevel,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get progress metrics
      if (url.pathname === '/progress' && request.method === 'GET') {
        if (!this.sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          metrics: this.sessionData.metrics,
          messageCount: this.sessionData.history.length,
          sessionAge: Date.now() - this.sessionData.createdAt,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Set difficulty level
      if (url.pathname === '/set-difficulty' && request.method === 'POST') {
        const body = await request.json() as {
          level: 'beginner' | 'intermediate' | 'advanced';
        };

        if (!this.sessionData) {
          return new Response(JSON.stringify({ error: 'Session not initialized' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        this.sessionData.metrics.difficultyLevel = body.level;
        await this.save();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error: any) {
      console.error('Durable Object error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Update understanding score based on conversation patterns
   */
  private updateUnderstandingScore(message: string): void {
    if (!this.sessionData) return;

    const lowerMessage = message.toLowerCase();
    
    // Indicators of understanding
    const positiveIndicators = [
      'i understand', 'got it', 'makes sense', 'i see',
      'thanks', 'clear', 'helpful', 'thank you',
    ];
    
    // Indicators of confusion
    const negativeIndicators = [
      'confused', 'don\'t understand', 'what do you mean',
      'can you explain', 'i\'m lost', 'unclear',
    ];

    let scoreAdjustment = 0;

    positiveIndicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) {
        scoreAdjustment += 5;
      }
    });

    negativeIndicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) {
        scoreAdjustment -= 3;
      }
    });

    // Update score within bounds [0, 100]
    this.sessionData.metrics.understandingScore = Math.max(
      0,
      Math.min(100, this.sessionData.metrics.understandingScore + scoreAdjustment)
    );

    // Auto-adjust difficulty based on understanding score
    if (this.sessionData.metrics.understandingScore > 80 &&
        this.sessionData.metrics.difficultyLevel === 'beginner') {
      this.sessionData.metrics.difficultyLevel = 'intermediate';
    } else if (this.sessionData.metrics.understandingScore > 90 &&
               this.sessionData.metrics.difficultyLevel === 'intermediate') {
      this.sessionData.metrics.difficultyLevel = 'advanced';
    } else if (this.sessionData.metrics.understandingScore < 40 &&
               this.sessionData.metrics.difficultyLevel === 'advanced') {
      this.sessionData.metrics.difficultyLevel = 'intermediate';
    } else if (this.sessionData.metrics.understandingScore < 30 &&
               this.sessionData.metrics.difficultyLevel === 'intermediate') {
      this.sessionData.metrics.difficultyLevel = 'beginner';
    }
  }
}