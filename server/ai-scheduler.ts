import OpenAI from "openai";
import { format, parseISO, addDays } from "date-fns";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface ContentScheduleEntry {
  title: string;
  description: string;
  content: string;
  copyIn: string;      // Texto integrado dentro del diseño
  copyOut: string;     // Texto para la descripción del post
  designInstructions: string; // Indicaciones para el departamento de diseño
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
  durationDays: number = 14,
  previousContent: string[] = []
): Promise<ContentSchedule> {
  try {
    // Format the start date using date-fns
    const formattedDate = format(parseISO(startDate), 'yyyy-MM-dd');
    const endDate = format(addDays(parseISO(startDate), durationDays), 'yyyy-MM-dd');
    
    // Prepare previous content section
    const previousContentSection = previousContent.length > 0
      ? `Previously used content (AVOID REPEATING THESE TOPICS AND IDEAS):
        ${previousContent.join('\n')}`
      : "No previous content history available.";
    
    const prompt = `
      Create a detailed social media content schedule for a project named "${projectName}".
      
      Project details:
      ${JSON.stringify(projectDetails, null, 2)}
      
      Schedule requirements:
      - Start date: ${formattedDate}
      - Duration: ${durationDays} days (until ${endDate})
      - Special specifications: ${specifications || "None provided"}
      
      ${previousContentSection}
      
      Generate entries for multiple platforms (Instagram, Facebook, TikTok, LinkedIn, Twitter) based on the project's target audience and objectives.
      
      For each content piece include:
      1. A title/headline
      2. Brief description of content
      3. Main content text - This will be used for general messaging
      4. Copy In - Text that will be integrated inside the design itself
      5. Copy Out - Text that will be used for post description/caption
      6. Design Instructions - Specific instructions for the design department on how to create visuals
      7. Platform - Be specific about which social network
      8. Posting date (YYYY-MM-DD format)
      9. Posting time (HH:MM format)
      10. Relevant hashtags (at least 5-10 hashtags for each post)
      11. A detailed reference image prompt that will be used to generate an AI image
      
      Platform-specific guidelines:
      - Instagram: Visual-focused with shorter captions, use of stories highlights, and Reels.
      - Facebook: More detailed text, link sharing, events, and community engagement.
      - TikTok: Very short, trendy, entertaining content with trending audio.
      - LinkedIn: Professional tone, industry insights, long-form content.
      - Twitter: Short, concise messages, trending topics, quick engagement.
      
      Return the schedule in the following JSON format:
      {
        "name": "Name of the schedule",
        "entries": [
          {
            "title": "string",
            "description": "string",
            "content": "string",
            "copyIn": "string",
            "copyOut": "string",
            "designInstructions": "string",
            "platform": "string",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "string",
            "referenceImagePrompt": "string"
          }
        ]
      }
      
      IMPORTANT REQUIREMENTS:
      - Ensure a good mix of content types (educational, promotional, engaging, etc.)
      - Vary posting times strategically based on each platform's best practices
      - Make each entry specific to its platform in format and style
      - Provide very detailed design instructions that a designer could follow
      - Design reference image prompts that will produce high-quality, professional-looking visualizations
      - The schedules should make sense as a cohesive campaign
      - DO NOT repeat or closely mimic any of the previously used content
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
