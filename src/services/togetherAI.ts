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
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    
    console.log('🔍 Checking Together AI API key...');
    console.log('🔑 API key present:', !!apiKey);
    console.log('🔑 API key length:', apiKey?.length || 0);
    console.log('🔑 API key starts with:', apiKey?.substring(0, 10) + '...' || 'undefined');
    
    if (!apiKey || apiKey === 'your_together_api_key_here') {
      const errorMsg = `
❌ Together AI API key not configured properly!

To fix this issue:

1. 🔑 Get your API key from: https://api.together.xyz/settings/api-keys

2. 📝 For local development:
   - Create a .env file in your project root
   - Add: VITE_TOGETHER_API_KEY=your_actual_api_key_here

3. 🚀 For Netlify deployment:
   - Go to your Netlify site dashboard
   - Navigate to Site settings > Environment variables  
   - Add: VITE_TOGETHER_API_KEY = your_actual_api_key_here
   - Redeploy your site

4. 🔄 After adding the key, refresh the page and try again.

Current status: ${apiKey ? 'Key present but invalid' : 'Key missing'}
      `.trim();
      
      console.error(errorMsg);
      throw new Error('Together AI API key not configured. Please check the console for setup instructions.');
    }
    
    console.log('✅ API key validated, generating customized image...');
    console.log('🎨 Prompt:', request.prompt);
    console.log('🖼️ Using image URL:', request.imageUrl);
    
    const requestBody = {
      model: "black-forest-labs/FLUX.1-kontext-dev",
      prompt: request.prompt,
      image_url: request.imageUrl,
      width: 768,
      height: 1024,
      steps: 20,
      n: 1,
      response_format: "b64_json"
    };
    
    console.log('📤 Sending request to Together AI...');
    
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Together AI API error response:', errorText);
      
      let errorMessage = `Together AI API error (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If we can't parse the error, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      // Provide specific guidance for common errors
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your Together AI API key and try again.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (response.status === 402) {
        errorMessage = 'Insufficient credits. Please check your Together AI account balance.';
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('📊 Response data structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      hasB64Json: !!(data.data?.[0]?.b64_json),
      imageDataLength: data.data?.[0]?.b64_json?.length || 0
    });
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      console.log('✅ Image generated successfully');
      return {
        success: true,
        imageData: data.data[0].b64_json,
      };
    } else {
      console.error('❌ No image data in response:', data);
      throw new Error('No image data received from Together AI');
    }
  } catch (error) {
    console.error('❌ Error generating customized image:', error);
    
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

// Helper function to check if Together AI is properly configured
export const checkTogetherAIConfig = (): { configured: boolean; message: string } => {
  const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
  
  if (!apiKey) {
    return {
      configured: false,
      message: 'VITE_TOGETHER_API_KEY environment variable is not set'
    };
  }
  
  if (apiKey === 'your_together_api_key_here') {
    return {
      configured: false,
      message: 'VITE_TOGETHER_API_KEY is set to placeholder value'
    };
  }
  
  if (apiKey.length < 10) {
    return {
      configured: false,
      message: 'VITE_TOGETHER_API_KEY appears to be invalid (too short)'
    };
  }
  
  return {
    configured: true,
    message: 'Together AI API key is properly configured'
  };
};