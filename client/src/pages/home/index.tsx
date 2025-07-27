import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation('translation')
  return (
    <>
      <Helmet>
        <title>About - Story Generator</title>
      </Helmet>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
              About Story Generator
            </h1>
            
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg mb-6">
                Welcome to our AI-powered Story Generator! This application combines the power of 
                PocketBase and Rivet to create engaging, personalized children's stories.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Enter your story instructions and character details</li>
                <li>Choose the number of chapters and length</li>
                <li>Our AI generates a complete story with chapters, themes, and image prompts</li>
                <li>Each story is unique and tailored to your specifications</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li><strong>PocketBase:</strong> Backend database and API</li>
                <li><strong>Rivet:</strong> AI workflow orchestration</li>
                <li><strong>OpenAI:</strong> Story generation AI</li>
                <li><strong>React + TypeScript:</strong> Frontend interface</li>
                <li><strong>Tailwind CSS:</strong> Styling and design</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Dynamic story generation with custom characters</li>
                <li>Chapter-based storytelling structure</li>
                <li>Image prompts for visual storytelling</li>
                <li>Themes and lessons for educational value</li>
                <li>Responsive design for all devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
