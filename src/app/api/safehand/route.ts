import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { mode, input, userProfile, conversationHistory, score } = await req.json();

    let systemPrompt = '';
    let messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (mode === 'analyze') {
      // ... (analyze mode remains the same)
      systemPrompt = `You are a cybersecurity expert protecting a ${userProfile}. Analyze the text for scam indicators (urgency, emotional manipulation). Return a JSON with { riskScore: 'Low'|'Medium'|'High', explanation: string, redFlags: string[] }.`;
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ];
    } else if (mode === 'simulate') {
      systemPrompt = `You are a gamified scam simulation AI. You have two roles: Scammer and Mentor.
The user's profile is: ${userProfile}. The current score is: ${score}.

1.  **Scammer Persona**: Continue the scam conversation based on the history. Be persuasive and adapt to the user's replies.
2.  **Mentor Persona**: After the user's reply, evaluate their action.

Your response MUST be a JSON object with the following keys:
-   "scammerResponse": (string) Your next message as the scammer. Make this an empty string if the game is over.
-   "feedback": (string) Your educational feedback on the user's last reply.
-   "scoreChange": (number) A score adjustment. +10 for identifying a red flag, +5 for being cautious, -5 for revealing minor info, -10 for falling for a trick.
-   "isGameOver": (boolean) Set to true if the user has been successfully scammed, has completely avoided the scam, or after 4-5 turns.
-   "summary": (string) If isGameOver is true, provide a final summary of the user's performance. Otherwise, this is an empty string.

If the conversation history is empty, start a new scam with an opening message and set "scoreChange" to 0.`;
      
      messages = [{ role: 'system', content: systemPrompt }];
      if (conversationHistory && conversationHistory.length > 0) {
        messages = messages.concat(conversationHistory);
      }
      if (input) {
        messages.push({ role: 'user', content: input });
      }

    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;

    if (!responseContent) {
        return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
    }

    try {
        const jsonResponse = JSON.parse(responseContent);
        return NextResponse.json(jsonResponse);
    } catch (e) {
        console.error('Failed to parse AI response as JSON:', responseContent);
        return NextResponse.json({ error: 'Invalid JSON response from AI' }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
