import type { TranscriptSegment } from "./transcript";
import { formatTime } from "./transcript";

export interface GeneratedClip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  viral_score: number;
  transcript_snippet: string;
  reasoning: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(
  apiKey: string,
  prompt: string,
  model: string,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (response.status === 429 || response.status === 503) {
        const retryDelay = response.status === 429 ? 30000 * attempt : 5000 * attempt;
        console.log(`[Gemini API] ${model} rate limited (${response.status}), retry ${attempt}/${maxRetries} in ${retryDelay / 1000}s...`);
        await sleep(retryDelay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API ${model} HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API ${model}: ${data.error.message}`);
      }

      const parts = data.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("No response from Gemini AI");
      }

      for (const part of parts) {
        if (part.text && part.text.trim().startsWith("[")) {
          return part.text;
        }
      }

      const firstText = parts.find((p) => p.text)?.text;
      if (firstText) return firstText;

      throw new Error("No text content in Gemini response");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        console.log(`[Gemini API] ${model} attempt ${attempt} failed: ${lastError.message}, retrying...`);
        await sleep(5000 * attempt);
      }
    }
  }

  throw lastError || new Error(`Gemini ${model} failed after ${maxRetries} retries`);
}

function truncateTranscript(segments: TranscriptSegment[], maxChars = 30000): string {
  const lines = segments.map(
    (s) => `[${formatTime(s.start)}-${formatTime(s.start + s.duration)}] ${s.text}`
  );

  let result = "";
  for (const line of lines) {
    if (result.length + line.length > maxChars) break;
    result += line + "\n";
  }
  return result;
}

export async function analyzeTranscriptForClips(
  segments: TranscriptSegment[],
  videoTitle: string
): Promise<GeneratedClip[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const transcriptText = truncateTranscript(segments);

  const totalDuration =
    segments.length > 0
      ? segments[segments.length - 1].start + segments[segments.length - 1].duration
      : 0;

  const clipCount = Math.min(5, Math.max(3, Math.floor(segments.length / 30)));

  const prompt = `You are an expert viral content curator for short-form video clips (TikTok, Instagram Reels, YouTube Shorts).

Analyze this YouTube video transcript and identify the ${clipCount} most engaging, shareable moments that would make great short clips.

VIDEO TITLE: "${videoTitle}"
VIDEO DURATION: ${formatTime(totalDuration)} (${Math.round(totalDuration)} seconds)

TRANSCRIPT:
${transcriptText}

For each clip, provide:
1. A catchy, engaging title (5-10 words)
2. Start time in seconds (use the timestamp from the transcript)
3. End time in seconds (aim for 15-60 second clips)
4. Viral potential (1-10): How likely is this to be shared/going viral?
5. A brief transcript snippet (the key 1-2 sentences)
6. Brief reasoning for why this moment is engaging

Return ONLY a valid JSON array (no markdown, no code fences, no thoughts) with this structure:
[
  {
    "title": "string",
    "start_time": number,
    "end_time": number,
    "viral_score": number,
    "transcript_snippet": "string",
    "reasoning": "string"
  }
]

Rules:
- Clips should be 15-60 seconds long
- Start_time must be >= 0 and end_time must be <= ${Math.round(totalDuration)}
- Viral score must be between 1-10
- Do NOT include the same content twice
- Focus on moments with: emotional peaks, surprising statements, controversy, humor, strong opinions, or compelling stories
- Each clip should tell a mini-story or deliver a complete thought
- Ensure start_time < end_time for every clip
- Return exactly ${clipCount} clips`;

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[Gemini API] Trying model: ${model}`);
      const content = await callGeminiWithRetry(apiKey, prompt, model);
      console.log(`[Gemini API] ${model} succeeded, parsing response...`);

      let parsed: unknown;
      try {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error(`[Gemini API] Failed to parse ${model} response:`, content.substring(0, 500));
        throw new Error("Failed to parse AI response as JSON");
      }

      if (!Array.isArray(parsed)) {
        throw new Error("AI response is not an array");
      }

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
          viral_score: Math.min(10, Math.max(1, Number(clip.viral_score) || 5)),
          transcript_snippet: String(clip.transcript_snippet || ""),
          reasoning: String(clip.reasoning || ""),
        })
      );

      return clips.map((clip) => ({
        ...clip,
        duration: clip.end_time - clip.start_time,
      }));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Gemini API] ${model} failed:`, lastError.message);
      if (model !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
        console.log(`[Gemini API] Falling back to next model...`);
      }
    }
  }

  throw lastError || new Error("All Gemini models failed");
}
