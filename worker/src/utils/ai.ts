/**
 * Workers AI integration utilities
 * Handles communication with Llama 3.3 model
 */

import { Message } from '../durable-objects/StudySession';

/**
 * System prompts for different difficulty levels
 */
const SYSTEM_PROMPTS = {
  beginner: `You are a patient and encouraging AI tutor helping a beginner learn programming and computer science concepts. 

Your teaching style:
- Use simple, everyday language and avoid jargon
- Break down complex concepts into small, digestible pieces
- Provide lots of concrete examples and analogies
- Encourage questions and celebrate understanding
- Use step-by-step explanations
- Include visual descriptions when helpful

IMPORTANT: Use plain text only. Do NOT use markdown formatting like **bold**, *italic*, or __underline__. Just write naturally.

Keep responses concise (2-4 paragraphs) unless the student asks for more detail.`,

  intermediate: `You are an AI tutor helping an intermediate-level student deepen their understanding of programming and computer science.

Your teaching style:
- Use technical terminology appropriately
- Provide clear explanations with some implementation details
- Include code examples when relevant
- Connect concepts to real-world applications
- Challenge the student with follow-up questions
- Balance theory with practice

IMPORTANT: Use plain text only. Do NOT use markdown formatting like **bold**, *italic*, or __underline__. Just write naturally.

Keep responses focused and informative (3-5 paragraphs).`,

  advanced: `You are an AI tutor working with an advanced student on sophisticated programming and computer science topics.

Your teaching style:
- Use precise technical language
- Discuss trade-offs, edge cases, and optimizations
- Reference algorithms, design patterns, and best practices
- Provide concise, high-level explanations
- Assume strong foundational knowledge
- Connect to research and industry practices

IMPORTANT: Use plain text only. Do NOT use markdown formatting like **bold**, *italic*, or __underline__. Just write naturally.

Keep responses concise and technical (2-4 paragraphs).`,
};

/**
 * Process a user message with Workers AI
 * @param ai - Workers AI binding
 * @param userMessage - The user's message
 * @param history - Conversation history
 * @param difficultyLevel - Current difficulty level
 * @returns AI response text
 */
export async function processMessage(
  ai: any,
  userMessage: string,
  history: Message[],
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<string> {
  try {
    // Get appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[difficultyLevel];

    // Format conversation history for the model
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formatHistory(history),
      { role: 'user', content: userMessage },
    ];

    // Call Workers AI with Llama 3.3
    const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
    });

    // Extract response text
    if (response && response.response) {
      return response.response.trim();
    }

    throw new Error('Invalid AI response format');

  } catch (error: any) {
    console.error('AI processing error:', error);
    
    // Fallback response
    return "I apologize, but I'm having trouble processing your question right now. Could you please try rephrasing it, or ask something else? I'm here to help!";
  }
}

/**
 * Format conversation history for the AI model
 * Limits to last 10 messages to stay within context window
 */
function formatHistory(history: Message[]): Array<{ role: string; content: string }> {
  // Take last 10 messages (5 exchanges)
  const recentHistory = history.slice(-10);
  
  return recentHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}

/**
 * Generate a suggested follow-up question based on the conversation
 */
export function generateFollowUpSuggestions(
  lastUserMessage: string,
  aiResponse: string
): string[] {
  const suggestions: string[] = [];

  // Simple keyword-based suggestions
  if (lastUserMessage.toLowerCase().includes('what is')) {
    suggestions.push('Can you give me an example?');
    suggestions.push('How is this used in practice?');
  }

  if (lastUserMessage.toLowerCase().includes('how')) {
    suggestions.push('Can you explain that in simpler terms?');
    suggestions.push('What are the key steps?');
  }

  if (aiResponse.toLowerCase().includes('example') || aiResponse.includes('```')) {
    suggestions.push('Can you explain this example step-by-step?');
    suggestions.push('What would happen if I changed this?');
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Can you explain more?');
    suggestions.push('Do you have another example?');
    suggestions.push('What should I learn next?');
  }

  return suggestions.slice(0, 3);
}