/**
 * Helper utility functions
 */

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomStr}`;
  }
  
  /**
   * Validate session ID format
   */
  export function isValidSessionId(sessionId: string): boolean {
    return /^session_[a-z0-9]+_[a-z0-9]+$/.test(sessionId);
  }
  
  /**
   * Truncate text to a maximum length
   */
  export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Calculate time elapsed in human-readable format
   */
  export function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }