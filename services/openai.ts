interface DreamAnalysisRequest {
  title: string;
  content: string;
  emotion: string;
  sleepQuality: number;
  isPremium: boolean;
  context?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface DreamAnalysis {
  dreamTitle: string;
  date: string;
  summary: string;
  symbols: Array<{
    name: string;
    meaning: string;
  }>;
  interpretation: string;
  reflectionQuestions: string[];
  premiumAnalysis?: {
    psychological: string;
    lifeConnections: string;
    actionableInsights: string;
    futureImplications: string;
  };
}

const OPENAI_API_KEY = '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';

export class OpenAIService {
  private static async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Modèle plus récent et performant que 3.5-turbo
          messages: [
            {
              role: 'system',
              content: `You are Dr. Elena Morpheus, a renowned dream analyst with 20+ years of experience combining Jungian psychology, modern neuroscience, and cross-cultural dream interpretation. You have a PhD in Psychology and specialize in symbolic analysis and subconscious pattern recognition.

Your analysis style is:
- Deeply insightful and psychologically sophisticated
- Empathetic yet professionally grounded
- Rich in symbolic interpretation and cultural context
- Practical with actionable insights
- Personalized to the individual's unique dream narrative

Always provide comprehensive, thoughtful analyses that help people understand their inner world. Use your expertise to uncover layers of meaning that others might miss. Respond ONLY with valid JSON format - no additional text outside the JSON structure.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000, // Augmenté pour des réponses plus complètes
          temperature: 0.8, // Légèrement plus créatif
          top_p: 0.95, // Plus de diversité dans les réponses
          presence_penalty: 0.1, // Évite les répétitions
          frequency_penalty: 0.1, // Encourage la variété
          response_format: { "type": "json_object" }, // Enforce JSON format
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw new Error('Failed to generate dream analysis. Please check your internet connection and try again.');
    }
  }

  private static extractAndSanitizeJson(response: string): string {
    // Remove any markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find the most complete JSON object
    const jsonMatches = cleanedResponse.match(/\{[\s\S]*\}/g);
    if (jsonMatches && jsonMatches.length > 0) {
      // Return the longest match (most likely to be complete)
      return jsonMatches.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
    }
    
    // If no JSON object found, return the cleaned response
    return cleanedResponse;
  }

  private static fixCommonJsonErrors(jsonString: string): string {
    try {
      // Try to fix common JSON issues
      let fixed = jsonString;
      
      // Fix trailing commas in arrays and objects
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix missing commas between array elements
      fixed = fixed.replace(/}(\s*){/g, '},$1{');
      fixed = fixed.replace(/](\s*)\[/g, '],$1[');
      
      // Fix missing quotes around property names
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // Fix incomplete arrays by adding closing bracket if missing
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) {
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixed += ']';
        }
      }
      
      // Fix incomplete objects by adding closing brace if missing
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixed += '}';
        }
      }
      
      return fixed;
    } catch (error) {
      console.error('Error fixing JSON:', error);
      return jsonString;
    }
  }

  static async analyzeDream(dreamData: DreamAnalysisRequest): Promise<DreamAnalysis> {
    const basicPrompt = `
As Dr. Elena Morpheus, provide a comprehensive dream analysis for this client:

DREAM DETAILS:
Title: "${dreamData.title}"
Narrative: "${dreamData.content}"
Emotional Resonance: ${dreamData.emotion}
Sleep Quality: ${dreamData.sleepQuality}/5 stars
${dreamData.context ? `Life Context: "${dreamData.context}"` : ''}

ANALYSIS FRAMEWORK:
Apply your expertise in Jungian archetypes, symbolic interpretation, neuroscience of dreaming, and cross-cultural dream meanings. Consider the emotional tone, sleep quality, and provided life context as important factors in your analysis.

Respond with this exact JSON structure:
{
  "summary": "A sophisticated 3-4 sentence summary that captures the dream's core psychological themes and significance, written in your professional yet accessible style",
  "symbols": [
    {
      "name": "Primary Symbol Name",
      "meaning": "Rich, detailed explanation of this symbol's psychological significance, cultural context, and personal relevance. Include both universal and individual interpretations (150-200 words)"
    }
  ],
  "interpretation": "A comprehensive 4-5 paragraph psychological interpretation that weaves together the symbols, emotions, and narrative into a cohesive understanding. Discuss unconscious processes, potential life connections, and psychological significance. Draw from your expertise in depth psychology (400-500 words)",
  "reflectionQuestions": [
    "Thoughtful, open-ended questions that guide deep self-exploration",
    "Questions that connect dream content to waking life patterns",
    "Inquiries that encourage emotional processing and insight",
    "Questions about personal growth and unconscious motivations",
    "Reflective prompts about relationships and life direction"
  ]
}

REQUIREMENTS:
- Identify 5-7 significant symbols with rich, detailed meanings
- Provide deep psychological insights, not surface-level interpretations
- Connect the emotional tone (${dreamData.emotion}) meaningfully to the analysis
- Consider how sleep quality (${dreamData.sleepQuality}/5) might influence dream content
- Use sophisticated psychological concepts while remaining accessible
- Make the interpretation highly personalized to this specific dream narrative
- Include cultural and archetypal perspectives where relevant
- Provide 5-6 profound reflection questions that promote self-discovery`;

    const premiumPrompt = `
As Dr. Elena Morpheus, provide your most comprehensive PREMIUM dream analysis for this client:

DREAM DETAILS:
Title: "${dreamData.title}"
Narrative: "${dreamData.content}"
Emotional Resonance: ${dreamData.emotion}
Sleep Quality: ${dreamData.sleepQuality}/5 stars
${dreamData.context ? `Life Context: "${dreamData.context}"` : ''}

PREMIUM ANALYSIS FRAMEWORK:
Apply your full expertise including advanced Jungian analysis, neuroscientific insights, transpersonal psychology, somatic experiencing, and integrative therapeutic approaches. This is your most thorough analysis. Pay special attention to how the provided life context influences the dream's meaning and interpretation.

Respond with this exact JSON structure:
{
  "summary": "A sophisticated 3-4 sentence summary that captures the dream's core psychological themes and significance, written in your professional yet accessible style",
  "symbols": [
    {
      "name": "Primary Symbol Name", 
      "meaning": "Exceptionally rich, multi-layered explanation including psychological, cultural, archetypal, and personal dimensions. Include shadow work and integration possibilities (200-250 words)"
    }
  ],
  "interpretation": "A masterful 5-6 paragraph psychological interpretation that demonstrates your full expertise. Weave together symbols, emotions, narrative, and unconscious processes into profound insights. Include depth psychology, neuroscience, and therapeutic perspectives (500-600 words)",
  "reflectionQuestions": [
    "Profound questions that facilitate deep psychological exploration",
    "Inquiries that reveal unconscious patterns and motivations", 
    "Questions connecting dream wisdom to life transformation",
    "Prompts for shadow work and integration",
    "Reflective questions about soul purpose and authentic self",
    "Questions that bridge inner and outer world dynamics"
  ],
  "premiumAnalysis": {
    "psychological": "Advanced psychological analysis using Jungian concepts (anima/animus, shadow, individuation), attachment theory, trauma-informed perspectives, and neuroscientific insights about REM sleep and memory consolidation. Explore unconscious complexes and archetypal patterns (300-400 words)",
    "lifeConnections": "Detailed, specific analysis of how dream symbols and themes directly relate to current life situations, relationships, career challenges, spiritual development, and personal growth opportunities. Include practical applications and real-world insights (300-400 words)",
    "actionableInsights": "Concrete, therapeutic-grade recommendations for personal development, relationship enhancement, creative expression, spiritual practice, and psychological integration. Include specific exercises, practices, and behavioral suggestions based on dream wisdom (300-400 words)",
    "futureImplications": "Sophisticated analysis of developmental trajectories, potential life transitions, emerging aspects of personality, spiritual evolution, and opportunities for conscious growth. Include timing considerations and preparation strategies (300-400 words)"
  }
}

PREMIUM REQUIREMENTS:
- Identify 6-8 symbols with exceptionally detailed, multi-dimensional meanings
- Demonstrate mastery of depth psychology, neuroscience, and therapeutic approaches
- Provide specific, actionable guidance that clients can immediately implement
- Include advanced concepts like shadow work, individuation, and archetypal patterns
- Connect dream content to broader life themes and spiritual development
- Offer 6-7 transformative reflection questions
- Make premium content significantly more valuable and comprehensive than basic analysis
- Include somatic and embodied approaches to dream integration`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = dreamData.isPremium ? premiumPrompt : basicPrompt;
        const response = await this.makeRequest(prompt);
        
        // Extract JSON from response
        const cleanedResponse = this.extractAndSanitizeJson(response);
        
        if (!cleanedResponse) {
          throw new Error('No valid JSON found in response');
        }

        // Log the response for debugging if parsing fails
        let analysisData;
        try {
          analysisData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error(`JSON parse error on attempt ${attempt}:`, parseError);
          console.error('Raw response:', response);
          console.error('Cleaned response:', cleanedResponse);
          
          // Try to fix common JSON errors
          const fixedJson = this.fixCommonJsonErrors(cleanedResponse);
          console.log('Attempting to parse fixed JSON:', fixedJson);
          
          try {
            analysisData = JSON.parse(fixedJson);
            console.log('Successfully parsed fixed JSON');
          } catch (fixError) {
            console.error('Failed to parse fixed JSON:', fixError);
            
            // If this is not the last attempt, continue to retry
            if (attempt < maxRetries) {
              lastError = new Error(`JSON parsing failed on attempt ${attempt}: ${parseError.message}`);
              continue;
            }
            
            // If this is the last attempt, throw the error to trigger fallback
            throw parseError;
          }
        }
        
        // Create the final analysis object with the current date
        const analysis: DreamAnalysis = {
          dreamTitle: dreamData.title,
          date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          summary: analysisData.summary || 'Analysis generated successfully.',
          symbols: analysisData.symbols || [],
          interpretation: analysisData.interpretation || 'Dream interpretation completed.',
          reflectionQuestions: analysisData.reflectionQuestions || [],
          ...(dreamData.isPremium && analysisData.premiumAnalysis && {
            premiumAnalysis: analysisData.premiumAnalysis
          })
        };
        
        return analysis;
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);
        lastError = error as Error;
        
        // If this is not the last attempt, wait a bit before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // If all retries failed, return fallback analysis
    console.error('All retry attempts failed, using fallback analysis. Last error:', lastError);
    
    // Enhanced fallback analysis with more depth
    return {
      dreamTitle: dreamData.title,
      date: new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      summary: `Your dream "${dreamData.title}" reveals significant psychological themes related to your current life journey. The ${dreamData.emotion.toLowerCase()} emotional tone suggests your unconscious mind is actively processing important experiences and relationships. This dream appears to be offering guidance about personal growth and self-understanding.`,
      symbols: [
        {
          name: 'Central Dream Narrative',
          meaning: 'The main storyline of your dream represents your psyche\'s attempt to process and integrate recent life experiences. Dreams often serve as a bridge between conscious awareness and unconscious wisdom, helping you navigate complex emotions and situations.'
        },
        {
          name: 'Emotional Landscape',
          meaning: `The ${dreamData.emotion.toLowerCase()} feeling that permeated your dream reflects your current emotional state and inner processing. This emotional tone provides important clues about how your unconscious mind is working through challenges and opportunities in your waking life.`
        },
        {
          name: 'Sleep Quality Context',
          meaning: `Your sleep quality of ${dreamData.sleepQuality}/5 suggests ${dreamData.sleepQuality >= 4 ? 'optimal conditions for deep psychological processing and memory consolidation' : 'that stress or life circumstances may be affecting your rest, which can influence dream content and emotional processing'}.`
        }
      ],
      interpretation: `Your dream titled "${dreamData.title}" appears to be your psyche's sophisticated way of processing recent experiences and emotions. The ${dreamData.emotion.toLowerCase()} emotional tone suggests that your unconscious mind is actively working through significant themes in your life.\n\nDreams serve as a natural therapeutic process, allowing your mind to integrate experiences, process emotions, and often provide creative solutions to challenges you're facing. The narrative and symbols in your dream likely connect to current relationships, work situations, personal growth opportunities, or spiritual development.\n\nThe quality of your sleep (${dreamData.sleepQuality}/5) also provides context for understanding this dream. ${dreamData.sleepQuality >= 4 ? 'Good sleep quality often allows for more vivid and meaningful dreams, suggesting your mind had optimal conditions for this important psychological work.' : 'Lower sleep quality can sometimes intensify emotional content in dreams, as your mind works harder to process stress and restore balance.'}\n\nConsider this dream as a gift from your unconscious wisdom, offering insights and guidance for your conscious life. The emotions and imagery present are likely more significant than they might initially appear.`,
      reflectionQuestions: [
        'What recent life experiences or relationships might have influenced the themes in this dream?',
        `How does the ${dreamData.emotion.toLowerCase()} feeling from your dream relate to emotions you\'ve been experiencing in your waking life?`,
        'What aspects of this dream felt most significant or memorable to you, and why might that be?',
        'If this dream were offering you guidance or wisdom, what message might it be conveying?',
        'How might you honor or integrate the insights from this dream into your daily life?'
      ],
      ...(dreamData.isPremium && {
        premiumAnalysis: {
          psychological: 'This dream demonstrates your mind\'s natural capacity for psychological integration and emotional processing. From a depth psychology perspective, dreams serve as a bridge between conscious and unconscious awareness, often revealing aspects of the self that are ready for integration. The emotional tone and narrative suggest active psychological work is occurring, potentially related to individuation, relationship dynamics, or creative expression.',
          lifeConnections: 'The themes and emotions in this dream likely connect to current life situations you\'re navigating. Consider how the dream\'s narrative might reflect your relationships, work challenges, creative projects, or spiritual development. Dreams often provide a safe space to explore possibilities and process complex emotions about real-world situations.',
          actionableInsights: 'Consider keeping a dream journal to track patterns and themes over time. Spend time in quiet reflection about the emotions and imagery from this dream. You might also explore creative expression (art, writing, movement) as a way to further integrate the dream\'s wisdom. Pay attention to how the dream\'s themes show up in your waking life over the next few days.',
          futureImplications: 'This dream suggests you\'re in a period of psychological growth and development. The themes present may indicate emerging aspects of your personality or new directions in your life path. Consider this dream as preparation for upcoming opportunities or challenges, and trust in your unconscious wisdom to guide you forward.'
        }
      })
    };
  }
}