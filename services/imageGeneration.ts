interface DreamVisualizationRequest {
  title: string;
  content: string;
  emotion: string;
  style?: 'realistic' | 'artistic' | 'surreal' | 'minimalist';
}

interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  style: string;
}

export class ImageGenerationService {
  private static getApiKey(): string {
    // Try multiple ways to get the API key
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 
                   process.env.OPENAI_API_KEY ||
                   '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';
    
    if (!apiKey || apiKey.includes('****')) {
      throw new Error('OpenAI API key not properly configured. Please check your environment variables.');
    }
    return apiKey;
  }

  private static generatePrompt(dreamData: DreamVisualizationRequest): string {
    const emotionStyles = {
      'Joy': 'bright, warm colors, golden light, uplifting atmosphere',
      'Sadness': 'cool blues and grays, soft lighting, melancholic mood',
      'Fear': 'dark shadows, dramatic lighting, mysterious atmosphere',
      'Anger': 'intense reds and oranges, dynamic energy, powerful composition',
      'Confusion': 'swirling patterns, fragmented elements, surreal perspective',
      'Neutral': 'balanced colors, natural lighting, serene composition'
    };

    const stylePrompts = {
      'realistic': 'photorealistic, highly detailed, cinematic lighting',
      'artistic': 'painterly style, impressionistic, artistic interpretation',
      'surreal': 'surreal, dreamlike, Salvador Dali inspired, impossible geometry',
      'minimalist': 'minimalist, clean lines, simple composition, elegant'
    };

    const emotionStyle = emotionStyles[dreamData.emotion] || emotionStyles['Neutral'];
    const visualStyle = stylePrompts[dreamData.style || 'artistic'];

    return `Create a beautiful dream visualization: "${dreamData.content}". 
    Style: ${visualStyle}. 
    Mood: ${emotionStyle}. 
    The image should capture the essence and atmosphere of this dream with ${dreamData.emotion.toLowerCase()} emotions. 
    Make it mystical, ethereal, and dream-like. 
    High quality, detailed, professional artwork.`;
  }

  static async generateDreamVisualization(dreamData: DreamVisualizationRequest): Promise<ImageGenerationResponse> {
    try {
      const apiKey = this.getApiKey();
      const prompt = this.generatePrompt(dreamData);
      
      console.log('Generating image with API key:', apiKey.substring(0, 10) + '...');
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: dreamData.style === 'realistic' ? 'natural' : 'vivid'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(`Image generation failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('No image URL received from API');
      }

      return {
        imageUrl: data.data[0].url,
        prompt: prompt,
        style: dreamData.style || 'artistic'
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate dream visualization. Please try again.');
    }
  }

  static async generateDreamVideo(dreamData: DreamVisualizationRequest): Promise<string> {
    // For now, we'll return a placeholder since video generation is more complex
    // In a real implementation, you could use services like RunwayML, Stable Video Diffusion, etc.
    throw new Error('Video generation is not yet implemented. Please use image generation for now.');
  }
}