import OpenAI from "openai";
import { format, parseISO, addDays } from "date-fns";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface ContentScheduleEntry {
  title: string;
  description: string;
  content: string;
  platform: string;
  postDate: string; // ISO string format
  postTime: string; // HH:MM format
  hashtags: string;
  referenceImagePrompt?: string;
}

export interface ContentSchedule {
  name: string;
  entries: ContentScheduleEntry[];
}

/**
 * Generates a content schedule for social media using GPT-4o
 */
export async function generateSchedule(
  projectName: string,
  projectDetails: any,
  startDate: string,
  specifications?: string,
  durationDays: number = 14
): Promise<ContentSchedule> {
  try {
    // Format the start date using date-fns
    const formattedDate = format(parseISO(startDate), 'yyyy-MM-dd');
    const endDate = format(addDays(parseISO(startDate), durationDays), 'yyyy-MM-dd');
    
    const prompt = `
      Create a detailed social media content schedule for a project named "${projectName}".
      
      Project details:
      ${JSON.stringify(projectDetails, null, 2)}
      
      Schedule requirements:
      - Start date: ${formattedDate}
      - Duration: ${durationDays} days (until ${endDate})
      - Special specifications: ${specifications || "None provided"}
      
      Generate entries for multiple platforms (Instagram, Facebook, TikTok, LinkedIn, Twitter) based on the project's target audience and objectives.
      
      For each content piece include:
      1. A title/headline
      2. Brief description of content
      3. Actual suggested content/caption
      4. Platform
      5. Posting date (YYYY-MM-DD format)
      6. Posting time (HH:MM format)
      7. Relevant hashtags
      8. A reference image prompt that could be used to generate an image for the post
      
      Return the schedule in the following JSON format:
      {
        "name": "Name of the schedule",
        "entries": [
          {
            "title": "string",
            "description": "string",
            "content": "string",
            "platform": "string",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "string",
            "referenceImagePrompt": "string"
          }
        ]
      }
      
      Ensure a good mix of content types (educational, promotional, engaging, etc.) and vary posting times strategically.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const scheduleText = response.choices[0].message.content;
    if (!scheduleText) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(scheduleText) as ContentSchedule;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${(error as Error).message}`);
  }
}

/**
 * Generates a reference image prompt for a social media post
 */
export async function generateReferenceImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data[0]?.url) {
      throw new Error("No image URL returned from DALL-E");
    }

    return response.data[0].url;
  } catch (error) {
    console.error("Error generating reference image:", error);
    throw new Error(`Failed to generate reference image: ${(error as Error).message}`);
  }
}
