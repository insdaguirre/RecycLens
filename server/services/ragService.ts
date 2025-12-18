/**
 * RAG Service client for querying recycling regulations.
 */

export interface RAGQueryRequest {
  material: string;
  location: string;
  condition?: string;
  context?: string;
}

export interface RAGQueryResponse {
  regulations: string;
  sources: string[];
}

/**
 * Query RAG service for recycling regulations.
 * 
 * @param material - Primary material (e.g., "Plastic", "Glass")
 * @param location - User location (e.g., "Ithaca, NY", "Albany, NY 12201")
 * @param condition - Item condition (e.g., "clean", "soiled")
 * @param context - Additional context from user
 * @returns RAG query response with regulations and sources, or null if query fails
 */
export async function queryRAG(
  material: string,
  location: string,
  condition: string = '',
  context: string = ''
): Promise<RAGQueryResponse | null> {
  const ragServiceUrl = process.env.RAG_SERVICE_URL;
  const timeoutMs = Number(process.env.RAG_TIMEOUT_MS || 30000);
  
  // If RAG service URL is not configured, return null (graceful degradation)
  if (!ragServiceUrl) {
    console.warn('RAG_SERVICE_URL not configured, skipping RAG query');
    return null;
  }
  
  try {
    const response = await fetch(`${ragServiceUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        material,
        location,
        condition: condition || '',
        context: context || '',
      }),
      // RAG can be slow on first request (index load + embeddings). Default to 30s.
      signal: AbortSignal.timeout(timeoutMs),
    });
    
    if (!response.ok) {
      console.error(`RAG service error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: RAGQueryResponse = await response.json();
    return data;
    
  } catch (error) {
    // Log error but don't throw - allow main flow to continue without RAG
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('RAG service request timed out');
    } else {
      console.error('RAG service error:', error);
    }
    return null;
  }
}

