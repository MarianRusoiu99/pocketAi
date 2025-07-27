import React from 'react';
import { Helmet } from 'react-helmet';
import StoryGenerator from '../../components/story-generator';

export default function StoriesPage() {
  return (
    <>
      <Helmet>
        <title>AI Story Generator - Create Amazing Stories</title>
        <meta name="description" content="Generate personalized children's stories with AI. Create unique tales with custom characters, themes, and chapters." />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              AI Story Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create magical, personalized stories for children with the power of AI. 
              Just describe your story idea, characters, and preferences - we'll generate 
              a complete story with chapters, themes, and image prompts!
            </p>
          </div>
          <StoryGenerator />
        </div>
      </div>
    </>
  );
}
