import { Platform } from 'react-native';

interface AIResponse {
  response: string;
  error?: string;
}

const API_CONFIG = {
  url: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1024,
  timeout: 30000
};

export const sendMessageToAI = async (
  message: string,
  apiKey: string
): Promise<AIResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.maxTokens,
        messages: [{ role: 'user', content: message }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return { response: data.content[0].text };
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      response: '',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
