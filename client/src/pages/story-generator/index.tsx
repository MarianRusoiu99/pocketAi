import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/button'
import { StoriesApi, type StoryRequest, type StoryResponse } from '../../api'

export default function StoryGenerator() {
  const { t } = useTranslation('translation')
  const [formData, setFormData] = useState<StoryRequest>({
    n_chapters: 1,
    story_instructions: '',
    primary_characters: '',
    secondary_characters: '',
    l_chapter: 100,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState<StoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'n_chapters' || name === 'l_chapter' ? parseInt(value) || 0 : value,
    }))
  }

  const generateStory = async () => {
    setIsLoading(true)
    setError(null)
    setStory(null)

    try {
      const response = await StoriesApi.generateStory(formData)
      if (response.success) {
        let processedStory = response.result

        // If we have story_text but no story object, try to parse it
        if (!processedStory.story && processedStory.story_text) {
          try {
            // Extract JSON from markdown code blocks if present
            let jsonContent = processedStory.story_text
            if (jsonContent.includes('```json')) {
              const startMarker = '```json\n'
              const endMarker = '\n```'
              const start = jsonContent.indexOf(startMarker)
              if (start !== -1) {
                const actualStart = start + startMarker.length
                const end = jsonContent.indexOf(endMarker, actualStart)
                if (end !== -1) {
                  jsonContent = jsonContent.substring(actualStart, end)
                }
              }
            }

            const parsedStory = JSON.parse(jsonContent)
            processedStory = {
              ...processedStory,
              story: parsedStory,
            }
            console.log('Successfully parsed story from story_text:', parsedStory)
          } catch (parseError) {
            console.warn('Failed to parse story_text as JSON:', parseError)
            // Keep the original response as-is
          }
        }

        setStory(processedStory)
      } else {
        setError(response.error || 'Failed to generate story')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Story Generator</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">AI Story Generator</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Story Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Number of Chapters</label>
                  <input
                    type="number"
                    name="n_chapters"
                    value={formData.n_chapters}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Chapter Length (words)</label>
                  <input
                    type="number"
                    name="l_chapter"
                    value={formData.l_chapter}
                    onChange={handleInputChange}
                    min="50"
                    max="500"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Story Instructions</label>
                  <textarea
                    name="story_instructions"
                    value={formData.story_instructions}
                    onChange={handleInputChange}
                    placeholder="Describe the theme, setting, or plot of your story..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Primary Characters</label>
                  <input
                    type="text"
                    name="primary_characters"
                    value={formData.primary_characters}
                    onChange={handleInputChange}
                    placeholder="Main characters and their descriptions..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Secondary Characters</label>
                  <input
                    type="text"
                    name="secondary_characters"
                    value={formData.secondary_characters}
                    onChange={handleInputChange}
                    placeholder="Supporting characters..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={generateStory}
                  disabled={isLoading || !formData.story_instructions.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Generating Story...' : 'Generate Story'}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading && (
              <div className="rounded-lg bg-blue-50 p-6 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-blue-700">Generating your story...</p>
                <p className="mt-2 text-sm text-blue-600">This may take a few moments</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <h3 className="mb-2 font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {story && (
              <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
                <div className="border-b pb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        story.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {story.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {story.attempts} attempt{story.attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {story.story && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-gray-900">{story.story.Title}</h2>
                      <p className="leading-relaxed text-gray-700">{story.story.Summary}</p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">Chapters</h3>
                      {story.story.Chapters.map((chapter, index) => (
                        <div key={index} className="mb-4 rounded-lg bg-gray-50 p-4">
                          <h4 className="mb-2 font-semibold text-gray-900">
                            Chapter {chapter.Number}: {chapter.Title}
                          </h4>
                          <p className="mb-3 leading-relaxed text-gray-700">{chapter.Content}</p>
                          {chapter.ImagePrompt && (
                            <div className="rounded border-l-4 border-blue-400 bg-blue-50 p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Image Prompt:</strong> {chapter.ImagePrompt}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {story.story.ThemesOrLessons && story.story.ThemesOrLessons.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900">Themes & Lessons</h3>
                        <ul className="list-inside list-disc space-y-1">
                          {story.story.ThemesOrLessons.map((theme, index) => (
                            <li key={index} className="text-gray-700">
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!story.story && story.story_text && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h3 className="mb-2 font-semibold text-yellow-800">Story Content (Raw Format)</h3>
                      <p className="mb-3 text-sm text-yellow-700">
                        The story was generated successfully but couldn't be parsed into a structured format.
                        {story.parse_note && ` ${story.parse_note}`}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">{story.story_text}</pre>
                    </div>
                  </div>
                )}

                {!story.story && !story.story_text && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-center text-gray-600">Story generation completed but no content was returned.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
