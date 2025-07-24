import React from 'react';
import StoryGenerator from '../../components/story-generator';

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <StoryGenerator />
      </div>
    </div>
  );
}
