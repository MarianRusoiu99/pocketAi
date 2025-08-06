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
    l_chapter: 100
  })
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState<StoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'n_chapters' || name === 'l_chapter' ? parseInt(value) || 0 : value
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
              story: parsedStory
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
      
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">AI Story Generator</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Story Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Chapters
                  </label>
                  <input
                    type="number"
                    name="n_chapters"
                    value={formData.n_chapters}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Length (words)
                  </label>
                  <input
                    type="number"
                    name="l_chapter"
                    value={formData.l_chapter}
                    onChange={handleInputChange}
                    min="50"
                    max="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Story Instructions
                  </label>
                  <textarea
                    name="story_instructions"
                    value={formData.story_instructions}
                    onChange={handleInputChange}
                    placeholder="Describe the theme, setting, or plot of your story..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Characters
                  </label>
                  <input
                    type="text"
                    name="primary_characters"
                    value={formData.primary_characters}
                    onChange={handleInputChange}
                    placeholder="Main characters and their descriptions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Characters
                  </label>
                  <input
                    type="text"
                    name="secondary_characters"
                    value={formData.secondary_characters}
                    onChange={handleInputChange}
                    placeholder="Supporting characters..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-700">Generating your story...</p>
                <p className="text-sm text-blue-600 mt-2">This may take a few moments</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {story && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      story.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {story.story.Title}
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {story.story.Summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Chapters</h3>
                      {story.story.Chapters.map((chapter, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Chapter {chapter.Number}: {chapter.Title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {chapter.Content}
                          </p>
                          {chapter.ImagePrompt && (
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Themes & Lessons</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {story.story.ThemesOrLessons.map((theme, index) => (
                            <li key={index} className="text-gray-700">{theme}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!story.story && story.story_text && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-yellow-800 font-semibold mb-2">Story Content (Raw Format)</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        The story was generated successfully but couldn't be parsed into a structured format.
                        {story.parse_note && ` ${story.parse_note}`}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {story.story_text}
                      </pre>
                    </div>
                  </div>
                )}

                {!story.story && !story.story_text && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-center">
                      Story generation completed but no content was returned.
                    </p>
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
