import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ParticipantProfile {
    id: string;
    name: string;
    bio: string;
    linkedinUrl: string;
}

export interface NetworkingPair {
    participant1Id: string;
    participant2Id: string;
    reason: string;
}

export async function generateNetworkingMatches(
    participants: ParticipantProfile[]
): Promise<NetworkingPair[]> {
    if (participants.length < 2) return [];

    const prompt = `You are a networking matchmaker at a hackathon. Given the following participant profiles, suggest the best networking pairs based on complementary skills, shared interests, and potential for collaboration.

Participants:
${JSON.stringify(participants, null, 2)}

Return a JSON array of pairs with the format:
[
  {
    "participant1Id": "id1",
    "participant2Id": "id2",
    "reason": "Brief reason why they should connect"
  }
]

Rules:
- Each participant should appear in at most 2-3 pairs
- Focus on complementary skills (e.g., designer + developer, frontend + backend)
- Consider shared interests and potential for collaboration
- Return at most ${Math.min(participants.length * 2, 20)} pairs
- Return ONLY valid JSON, no markdown or extra text`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return [];

        const parsed = JSON.parse(content);
        const pairs = parsed.pairs || parsed.matches || parsed;
        return Array.isArray(pairs) ? pairs : [];
    } catch (error) {
        console.error('OpenAI API error:', error);
        return [];
    }
}

export default openai;
