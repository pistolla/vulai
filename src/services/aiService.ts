/**
 * AI Service - Handles LLM interactions for data analysis, timeline generation, and fact-checking.
 * This is a foundational architecture that uses mock AI responses. When API keys (Gemini/OpenAI) 
 * are available, this module can seamlessly switch to the real API.
 */

export interface FactCheckResult {
  status: 'Correct' | 'Partially Correct' | 'Fake News';
  confidence: number;
  explanation: string;
}

export interface ScrapedNewsArticle {
  id: string;
  source: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
}

export class AIService {
  /**
   * Evaluates a news article's claims against official game data/telemetry.
   */
  async factCheckArticle(article: ScrapedNewsArticle, canonicalData: any): Promise<FactCheckResult> {
    // In a real implementation, we would send `article.title + excerpt` and `canonicalData` to Gemini/OpenAI
    // and ask it to output a JSON FactCheckResult.
    
    console.log(`[AIService] Fact-checking article: ${article.title}`);
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // MOCK IMPLEMENTATION based on keywords for demonstration
    const lowerTitle = article.title.toLowerCase();
    
    if (lowerTitle.includes('scandal') || lowerTitle.includes('fake') || lowerTitle.includes('shocking') || lowerTitle.includes('banned')) {
      return {
        status: 'Fake News',
        confidence: 0.95,
        explanation: 'The claims made in this article completely contradict the official telemetry data and referee logs.'
      };
    } else if (lowerTitle.includes('rumor') || lowerTitle.includes('might') || lowerTitle.includes('reportedly')) {
      return {
        status: 'Partially Correct',
        confidence: 0.65,
        explanation: 'While the base event occurred, the article exaggerates the impact and misreports the exact statistics.'
      };
    }
    
    return {
      status: 'Correct',
      confidence: 0.98,
      explanation: 'The article accurately reflects the official match events and verified statistics.'
    };
  }

  /**
   * Generates dynamic summaries from raw telemetry data.
   */
  async generateDynamicTimelineCard(telemetry: any): Promise<any> {
    console.log('[AIService] Generating dynamic timeline card from telemetry');
    return {
      title: 'AI Generated Match Insight',
      body: 'Based on the latest telemetry, the home team is dominating possession in the final third.'
    };
  }
}

export const aiService = new AIService();
