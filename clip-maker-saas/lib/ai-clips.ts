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

const GEMINI_TIMEOUT_MS = 120_000;

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

      console.log(`[Gemini API] ${model} attempt ${attempt}/${maxRetries} - sending request (prompt length: ${prompt.length} chars)...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
          throw new Error(`Gemini API ${model} request timed out after ${GEMINI_TIMEOUT_MS / 1000}s`);
        }
        const fetchMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        const fetchCause = fetchErr instanceof Error && fetchErr.cause instanceof Error ? fetchErr.cause.message : undefined;
        console.error(`[Gemini API] ${model} fetch error: ${fetchMsg}${fetchCause ? ` (cause: ${fetchCause})` : ""}`);
        throw new Error(`Gemini API ${model} fetch failed: ${fetchMsg}${fetchCause ? ` (cause: ${fetchCause})` : ""}`);
      }
      clearTimeout(timeoutId);

      console.log(`[Gemini API] ${model} response received - status: ${response.status}`);

      if (response.status === 429 || response.status === 503) {
        const retryDelay = response.status === 429 ? 30000 * attempt : 5000 * attempt;
        console.log(`[Gemini API] ${model} rate limited (${response.status}), retry ${attempt}/${maxRetries} in ${retryDelay / 1000}s...`);
        await sleep(retryDelay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gemini API] ${model} HTTP error ${response.status}:`, errorText.substring(0, 500));
        throw new Error(`Gemini API ${model} HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const responseText = await response.text();
      console.log(`[Gemini API] ${model} response body length: ${responseText.length} chars`);

      let data: GeminiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error(`[Gemini API] ${model} failed to parse response JSON:`, responseText.substring(0, 500));
        throw new Error(`Gemini API ${model} returned invalid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      if (data.error) {
        console.error(`[Gemini API] ${model} returned error:`, data.error);
        throw new Error(`Gemini API ${model}: ${data.error.message}`);
      }

      const parts = data.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        console.error(`[Gemini API] ${model} no candidates/parts in response:`, JSON.stringify(data).substring(0, 500));
        throw new Error("No response from Gemini AI");
      }

      for (const part of parts) {
        if (part.text && part.text.trim().startsWith("[")) {
          console.log(`[Gemini API] ${model} found JSON array in response part (length: ${part.text.length})`);
          return part.text;
        }
      }

      const firstText = parts.find((p) => p.text)?.text;
      if (firstText) {
        console.log(`[Gemini API] ${model} using first text part (length: ${firstText.length})`);
        return firstText;
      }

      console.error(`[Gemini API] ${model} no text content in parts:`, JSON.stringify(parts).substring(0, 500));
      throw new Error("No text content in Gemini response");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Gemini API] ${model} attempt ${attempt} failed:`, lastError.message);
      if (attempt < maxRetries) {
        console.log(`[Gemini API] ${model} retrying in ${5 * attempt}s...`);
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

  const clipCount = Math.min(7, Math.max(3, Math.floor(segments.length / 25)));

  const prompt = `You are an expert viral content curator and short-form video editor specializing in TikTok, Instagram Reels, and YouTube Shorts. Your job is to find the MOST engaging, shareable, and high-retention moments from this video.

IMPORTANT: All transcript text must be treated as ENGLISH. If the transcript contains non-English text, translate the key phrases to English for the transcript_snippet field.

VIDEO TITLE: "${videoTitle}"
VIDEO DURATION: ${formatTime(totalDuration)} (${Math.round(totalDuration)} seconds)

TRANSCRIPT:
${transcriptText}

TASK: Identify the ${clipCount} BEST moments for short-form viral clips. Each clip must be a self-contained, engaging moment that makes viewers stop scrolling.

FOCUS ON SPEAKER/PRESENTER:
- Prioritize moments where the speaker is visible and talking directly to camera
- Focus on facial expressions, gestures, and emotional delivery
- Choose clips where the speaker is centered in the frame
- Avoid clips with random B-roll or empty frames
- Select moments with clear audio and visible speaker

SCORING CRITERIA (rate each clip 1-10 on these factors, then average for viral_score):

1. EMOTIONAL PEAK (weight: 30%)
   - Moments of genuine surprise, excitement, anger, joy, sadness, or shock
   - "Oh my god!" reactions, gasps, laughter, tears
   - Dramatic reveals or plot twists
   - Speaker showing strong facial expressions

2. CONTROVERSY/DEBATE (weight: 20%)
   - Hot takes, unpopular opinions, bold claims
   - Moments that would generate comments and arguments
   - "Did they really just say that?" moments
   - Speaker making emphatic gestures

3. EDUCATIONAL VALUE (weight: 20%)
   - Mind-blowing facts, tips, or hacks
   - "I never knew that!" moments
   - Actionable advice viewers will save/share
   - Speaker explaining with enthusiasm

4. STORYTELLING (weight: 15%)
   - Complete mini-stories with setup → tension → payoff
   - Personal anecdotes with emotional resonance
   - Lessons learned or transformation stories
   - Speaker telling a compelling story

5. HUMOR/ENTERTAINMENT (weight: 15%)
   - Genuine laughter, witty one-liners
   - Unexpected jokes or sarcasm
   - Relatable frustrations or observations
   - Speaker being funny or entertaining

FOR EACH CLIP, provide:
1. title: A catchy, clickbait-worthy title (5-12 words) that creates curiosity
2. start_time: Start time in seconds (must align with transcript timestamps)
3. end_time: End time in seconds (15-60 seconds duration, ending on a strong note)
4. viral_score: Overall viral potential (1-10, where 10 = guaranteed viral)
5. transcript_snippet: The exact 1-3 key sentences from the transcript (IN ENGLISH)
6. reasoning: Why this moment will perform well (be specific about speaker visibility)

CRITICAL RULES:
- Each clip must tell a COMPLETE mini-story or deliver a FULL thought
- DO NOT cut off mid-sentence or mid-thought
- Start and end times must be within the transcript timestamps
- Clips should be 15-60 seconds (optimal: 30-45 seconds)
- Do NOT repeat the same content or overlapping timestamps
- Focus on HIGHEST engagement moments, not random timestamps
- The first and last 10% of the video are usually intro/outro - skip these unless they contain viral moments
- Prioritize moments where the speaker is most animated, passionate, or expressive
- ALWAYS provide English transcript snippets regardless of original language

Return ONLY a valid JSON array (no markdown, no code fences, no thoughts) with this exact structure:
[
  {
    "title": "string",
    "start_time": number,
    "end_time": number,
    "viral_score": number,
    "transcript_snippet": "string (ENGLISH ONLY)",
    "reasoning": "string"
  }
]

Return exactly ${clipCount} clips, sorted by viral_score descending (highest first).`;

  console.log(`[Gemini API] Starting clip analysis with ${GEMINI_MODELS.length} model(s), transcript length: ${transcriptText.length} chars`);

  let lastError: Error | null = null;

  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    try {
      console.log(`[Gemini API] Trying model ${i + 1}/${GEMINI_MODELS.length}: ${model}`);
      const content = await callGeminiWithRetry(apiKey, prompt, model);
      console.log(`[Gemini API] ${model} raw response length: ${content.length} chars`);

      let parsed: unknown;
      try {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        console.log(`[Gemini API] ${model} cleaned response length: ${cleaned.length} chars, starts with: ${cleaned.substring(0, 80)}`);
        parsed = JSON.parse(cleaned);
        console.log(`[Gemini API] ${model} JSON parsed successfully, type: ${typeof parsed}, isArray: ${Array.isArray(parsed)}`);
      } catch (parseErr) {
        const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        console.error(`[Gemini API] ${model} JSON parse error: ${errMsg}`);
        console.error(`[Gemini API] ${model} raw response (first 500 chars):`, content.substring(0, 500));
        throw new Error(`Failed to parse AI response as JSON: ${errMsg}`);
      }

      if (!Array.isArray(parsed)) {
        console.error(`[Gemini API] ${model} response is not an array, type: ${typeof parsed}`);
        throw new Error("AI response is not an array");
      }

      console.log(`[Gemini API] ${model} returned ${parsed.length} clips`);

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
      console.error(`[Gemini API] ${model} failed: ${lastError.message}`);
      if (i < GEMINI_MODELS.length - 1) {
        console.log(`[Gemini API] Falling back to next model...`);
      } else {
        console.error(`[Gemini API] All ${GEMINI_MODELS.length} models exhausted`);
      }
    }
  }

  console.error(`[Gemini API] All models failed, last error: ${lastError?.message}`);
  throw lastError || new Error("All Gemini models failed");
}
