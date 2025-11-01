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
        const body = (await request.json()) as { sessionId: string };
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
        const body = (await request.json()) as {
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

        // Update score/difficulty
        this.updateUnderstandingScore(body.userMessage);

        // Keep only last 50 messages
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
        return new Response(
          JSON.stringify({
            history: this.sessionData.history,
            difficultyLevel: this.sessionData.metrics.difficultyLevel,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Get progress metrics
      if (url.pathname === '/progress' && request.method === 'GET') {
        if (!this.sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({
            metrics: this.sessionData.metrics,
            messageCount: this.sessionData.history.length,
            sessionAge: Date.now() - this.sessionData.createdAt,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Set difficulty level (manual override)
      if (url.pathname === '/set-difficulty' && request.method === 'POST') {
        const body = (await request.json()) as {
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
   * Update understanding score based on conversation patterns (expanded cues + caps)
   * Leveling:
   *  - promote: >30 -> intermediate (from beginner), >60 -> advanced (from intermediate)
   *  - demote:  <55 -> intermediate (from advanced), <25 -> beginner (from intermediate)
   */
  private updateUnderstandingScore(message: string): void {
    if (!this.sessionData) return;
  
    // normalize: lowercase, strip apostrophes, remove other punct, collapse spaces
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/['’]/g, "")            // keep words together: don't -> dont
        .replace(/[\p{P}\p{S}]/gu, " ")  // other punctuation to space
        .replace(/\s+/g, " ")
        .trim();
  
    const m = normalize(message || "");
    const words = m.split(" "); // tokens
  
    // Build 1-gram, 2-gram, 3-gram sets for exact phrase checks
    const grams = new Set<string>();
    for (let i = 0; i < words.length; i++) {
      grams.add(words[i]); // 1-gram
      if (i + 1 < words.length) grams.add(words[i] + " " + words[i + 1]); // 2-gram
      if (i + 2 < words.length) grams.add(words[i] + " " + words[i + 1] + " " + words[i + 2]); // 3-gram
    }
  
    // Weighted cues (apostrophes removed in keys)
    const positiveWeights: Record<string, number> = {
      "ok": 8, "okay": 8, "k": 6,
      "got it": 10, "i understand": 12, "understood": 12,
      "makes sense": 10, "i see": 10, "clear now": 12,
      "thanks": 3, "thank you": 7, "that helps": 7, "helpful": 7,
      "great": 10, "awesome": 10, "perfect": 10, "nice": 6, "cool": 6,
      "works": 5, "resolved": 6, "solved": 6, "yes that helps": 6,
      "yup": 5, "yep": 5, "ok got it": 7
    };
  
    const negativeWeights: Record<string, number> = {
      "confused": -6,
      "dont understand": -7, // matches both "dont" (we strip apostrophes) and typed "dont"
      "what do you mean": -5, "can you explain": -5,
      "im lost": -7, "unclear": -5, "not sure": -4, "unsure": -4,
      "explain again": -5, "simplify": -4, "too hard": -6, "too difficult": -6,
      "slow down": -4, "still confused": -6,
      "no": -3, "nah": -3
    };
  
    // Collect matches by longest/highest-weight phrase to avoid double counting
    function sumMatches(weights: Record<string, number>): number {
      // sort phrases so longer ones come first (prefer 3-grams over 1-grams)
      const entries = Object.entries(weights).sort((a, b) => {
        const al = a[0].split(" ").length, bl = b[0].split(" ").length;
        if (bl !== al) return bl - al;
        return Math.abs(b[1]) - Math.abs(a[1]); // then by absolute weight
      });
      let total = 0;
      const used = new Set<string>(); // phrases we already counted
      for (const [phrase, w] of entries) {
        if (grams.has(phrase) && !used.has(phrase)) {
          total += w;
          // mark all sub-grams as used to avoid overlap like "ok" inside "ok got it"
          const tokens = phrase.split(" ");
          if (tokens.length === 3) {
            used.add(tokens[0] + " " + tokens[1]);
            used.add(tokens[1] + " " + tokens[2]);
            used.add(tokens[0]);
            used.add(tokens[1]);
            used.add(tokens[2]);
          }
          if (tokens.length === 2) {
            used.add(tokens[0]);
            used.add(tokens[1]);
          }
          used.add(phrase);
        }
      }
      return total;
    }
  
    let delta = 0;
    delta += sumMatches(positiveWeights);
    delta += sumMatches(negativeWeights);
  
    // cap per-turn movement
    delta = Math.max(-12, Math.min(15, delta));
  
    const prev = this.sessionData.metrics.understandingScore ?? 0;
    const next = Math.max(0, Math.min(100, prev + delta));
    this.sessionData.metrics.understandingScore = next;
  
    // Level transitions with hysteresis
    const lvl = this.sessionData.metrics.difficultyLevel;
    if (next > 60 && lvl === "intermediate") {
      this.sessionData.metrics.difficultyLevel = "advanced";
    } else if (next > 30 && lvl === "beginner") {
      this.sessionData.metrics.difficultyLevel = "intermediate";
    } else if (next < 55 && lvl === "advanced") {
      this.sessionData.metrics.difficultyLevel = "intermediate";
    } else if (next < 25 && lvl === "intermediate") {
      this.sessionData.metrics.difficultyLevel = "beginner";
    }
  }
}
