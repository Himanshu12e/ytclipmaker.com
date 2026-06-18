import type { TranscriptSegment } from "./transcript";
import { formatTime } from "./transcript";

export interface GeneratedClip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  hook_score: number;
  viral_score: number;
  transcript_snippet: string;
  reasoning: string;
}

export async function analyzeTranscriptForClips(
  segments: TranscriptSegment[],
  videoTitle: string
): Promise<GeneratedClip[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const transcriptText = segments
    .map((s) => `[${formatTime(s.start)}-${formatTime(s.start + s.duration)}] ${s.text}`)
    .join("\n");

  const prompt = `You are an expert viral content curator for short-form video clips (TikTok, Instagram Reels, YouTube Shorts).

Analyze this YouTube video transcript and identify the ${Math.min(10, Math.max(3, Math.floor(segments.length / 20)))} most engaging, shareable moments that would make great short clips.

VIDEO TITLE: "${videoTitle}"

TRANSCRIPT:
${transcriptText}

For each clip, provide:
1. A catchy, engaging title (5-10 words)
2. Start time in seconds (use the timestamp from the transcript)
3. End time in seconds (aim for 15-60 second clips)
4. Hook score (1-10): How attention-grabbing is the opening moment?
5. Viral potential (1-10): How likely is this to be shared/going viral?
6. A brief transcript snippet (the key 1-2 sentences)
7. Brief reasoning for why this moment is engaging

Return ONLY a valid JSON array (no markdown, no code fences) with this structure:
[
  {
    "title": "string",
    "start_time": number,
    "end_time": number,
    "hook_score": number,
    "viral_score": number,
    "transcript_snippet": "string",
    "reasoning": "string"
  }
]

Rules:
- Clips should be 15-60 seconds long
- Start_time must be >= 0 and end_time must be <= video length
- Hook score and viral score must be between 1-10
- Do NOT include the same content twice
- Focus on moments with: emotional peaks, surprising statements, controversy, humor, controversy, strong opinions, or compelling stories
- Each clip should tell a mini-story or deliver a complete thought
- Ensure start_time < end_time for every clip`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a viral content expert. You analyze video transcripts and identify the most engaging, shareable moments for short-form clips. Always return valid JSON only, no markdown.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  let parsed: unknown;
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  const totalDuration =
    segments.length > 0
      ? segments[segments.length - 1].start + segments[segments.length - 1].duration
      : 0;

  const clips: GeneratedClip[] = parsed.map(
    (clip: Record<string, unknown>, index: number) => ({
      id: `clip-${index + 1}`,
      title: String(clip.title || `Clip ${index + 1}`),
      start_time: Math.max(0, Math.min(Number(clip.start_time) || 0, totalDuration)),
      end_time: Math.max(
        Number(clip.start_time) + 5,
        Math.min(Number(clip.end_time) || Number(clip.start_time) + 30, totalDuration)
      ),
      duration: 0,
      hook_score: Math.min(10, Math.max(1, Number(clip.hook_score) || 5)),
      viral_score: Math.min(10, Math.max(1, Number(clip.viral_score) || 5)),
      transcript_snippet: String(clip.transcript_snippet || ""),
      reasoning: String(clip.reasoning || ""),
    })
  );

  return clips.map((clip) => ({
    ...clip,
    duration: clip.end_time - clip.start_time,
  }));
}
