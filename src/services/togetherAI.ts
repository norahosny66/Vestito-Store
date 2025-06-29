// Together AI service for image generation
const TOGETHER_API_URL = 'https://api.together.xyz/v1/images/generations';

export interface CustomizationRequest {
  prompt: string;
  imageUrl: string;
}

export interface CustomizationResponse {
  success: boolean;
  imageData?: string; // base64 encoded image
  error?: string;
}

export const generateCustomizedImage = async (
  request: CustomizationRequest
): Promise<CustomizationResponse> => {
  try {
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('Together AI API key not found. Please add VITE_TOGETHER_API_KEY to your environment variables.');
    }
    
    console.log('Generating customized image with prompt:', request.prompt);
    console.log('Using image URL:', request.imageUrl);
    
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-kontext-dev",
        prompt: request.prompt,
        image_url: request.imageUrl,
        width: 768,
        height: 1024,
        steps: 20,
        n: 1,
        response_format: "b64_json"
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Together AI API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      return {
        success: true,
        imageData: data.data[0].b64_json,
      };
    } else {
      throw new Error('No image data received from Together AI');
    }
  } catch (error) {
    console.error('Error generating customized image:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Helper function to convert base64 to blob URL for display
export const base64ToImageUrl = (base64Data: string): string => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to image URL:', error);
    return '';
  }
};