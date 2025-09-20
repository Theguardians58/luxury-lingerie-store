'use server';

// Define the structure of a chat message
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// This is the secure server function that communicates with the Gemini API
export async function askChatbot(history: ChatMessage[], newMessage: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: 'API key is not configured.' };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // This is the "persona" and instruction set for our AI assistant.
  const systemPrompt = `You are a helpful and elegant customer service assistant for a luxury lingerie brand called "Éclat Lingerie Fine". 
    Your tone should be sophisticated, friendly, and professional. 
    Your goal is to answer customer questions about products, sizing, shipping, and returns. 
    - Our brand sells bras, panties, and sleepwear.
    - We offer sizes from XS to XL, and bra sizes from 32A to 40F.
    - Shipping is free on orders over $100. Standard shipping takes 3-5 business days. Express shipping is available for $15.
    - We have a 30-day return policy for unworn items with tags attached.
    - Do not answer questions that are not related to lingerie, fashion, or our store policies. Politely decline to answer such questions.
    Keep your answers concise and helpful.`;

  // Combine the system prompt with the chat history
  const fullHistory: ChatMessage[] = [
    ...history,
    {
      role: 'user',
      parts: [{ text: newMessage }],
    },
  ];

  const payload = {
    contents: fullHistory,
    systemInstruction: {
        parts: [{ text: systemPrompt }]
    },
    generationConfig: {
        maxOutputTokens: 500,
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("API Error Response:", await response.text());
      return { error: `API request failed with status ${response.status}` };
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botResponse) {
        return { error: "Received an empty response from the AI." };
    }

    return { response: botResponse };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { error: 'An unexpected error occurred.' };
  }
}
