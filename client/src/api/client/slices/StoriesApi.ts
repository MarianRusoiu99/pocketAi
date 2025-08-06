import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Stories API
export interface StoryRequest {
  n_chapters: number
  story_instructions: string
  primary_characters: string
  secondary_characters: string
  l_chapter: number
}

export interface StoryChapter {
  Number: number
  Title: string
  Content: string
  ImagePrompt: string
}

export interface Story {
  Title: string
  Summary: string
  Chapters: StoryChapter[]
  ThemesOrLessons: string[]
}

export interface StoryResponse {
  message: string
  status: string
  story?: Story
  story_text?: string  // Fallback when JSON parsing fails
  attempts: number
  parse_note?: string  // Additional info about parsing
  data?: any          // Raw response data for debugging
}

/**
 * Stories API slice
 * Handles all story generation related API calls
 */
const StoriesApi = {
  /**
   * Generate a new story with AI
   */
  generateStory: (requestData: StoryRequest) =>
    ApiClient.post<StoryResponse>(ApiRoutes.stories.generate, { data: requestData }),

  /**
   * Test the story generation endpoint
   */
  testConnection: () =>
    ApiClient.get<{ message: string; status: string }>(ApiRoutes.stories.test),
}

export default StoriesApi
