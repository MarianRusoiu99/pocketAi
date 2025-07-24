import React, { useState } from 'react';
import { Button } from '../ui/button';

// Import POCKETBASE_URL from env
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

interface StoryGenerationData {
    story_instructions: string;
    primary_characters: string;
    secondary_characters: string;
    n_chapters: number;
    l_chapter: number;
}

interface RivetResult {
    success: boolean;
    data?: {
        story: string;
        metadata: {
            executionTime: number;
            graphId: string;
            timestamp: string;
        };
    };
    error?: {
        message: string;
        details?: any;
    };
}

export default function StoryGenerator() {
    const [formData, setFormData] = useState<StoryGenerationData>({
        story_instructions: 'Write a heartwarming story about friendship and adventure.',
        primary_characters: 'Emma, a curious 7-year-old girl, and Max, her loyal golden retriever',
        secondary_characters: 'Mrs. Wilson, the kind elderly neighbor, and Tom, Emma\'s best friend',
        n_chapters: 3,
        l_chapter: 200
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RivetResult | null>(null);

    const handleInputChange = (field: keyof StoryGenerationData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateStory = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/stories/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: {
                    message: 'Failed to connect to the server',
                    details: error
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const testRivetHealth = async () => {
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/rivet/health`);
            const data = await response.json();
            alert(`Rivet Health: ${data.success ? 'Healthy' : 'Error'}\n${JSON.stringify(data.data, null, 2)}`);
        } catch (error) {
            alert('Failed to check Rivet health');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Story Generator with Rivet</h1>
                    <Button 
                        onClick={testRivetHealth} 
                        variant="outline"
                        className="text-sm"
                    >
                        Test Rivet Health
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="story_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                                Story Instructions
                            </label>
                            <textarea
                                id="story_instructions"
                                value={formData.story_instructions}
                                onChange={(e) => handleInputChange('story_instructions', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe what kind of story you want..."
                            />
                        </div>

                        <div>
                            <label htmlFor="primary_characters" className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Characters
                            </label>
                            <textarea
                                id="primary_characters"
                                value={formData.primary_characters}
                                onChange={(e) => handleInputChange('primary_characters', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the main characters..."
                            />
                        </div>

                        <div>
                            <label htmlFor="secondary_characters" className="block text-sm font-medium text-gray-700 mb-2">
                                Secondary Characters
                            </label>
                            <textarea
                                id="secondary_characters"
                                value={formData.secondary_characters}
                                onChange={(e) => handleInputChange('secondary_characters', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe supporting characters..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="n_chapters" className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Chapters
                                </label>
                                <input
                                    type="number"
                                    id="n_chapters"
                                    value={formData.n_chapters}
                                    onChange={(e) => handleInputChange('n_chapters', parseInt(e.target.value) || 1)}
                                    min="1"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="l_chapter" className="block text-sm font-medium text-gray-700 mb-2">
                                    Words per Chapter
                                </label>
                                <input
                                    type="number"
                                    id="l_chapter"
                                    value={formData.l_chapter}
                                    onChange={(e) => handleInputChange('l_chapter', parseInt(e.target.value) || 100)}
                                    min="50"
                                    max="1000"
                                    step="50"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={generateStory} 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Generating Story...' : 'Generate Story with Rivet'}
                        </Button>
                    </div>

                    {/* Results Panel */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Generated Story</h2>
                        
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="ml-2">Processing with Rivet...</span>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                {result.success ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-sm font-medium text-green-800">Story Generated Successfully</span>
                                        </div>
                                        
                                        {result.data?.metadata && (
                                            <div className="text-xs text-green-600 mb-3">
                                                Execution Time: {result.data.metadata.executionTime}ms | 
                                                Graph: {result.data.metadata.graphId} |
                                                Time: {new Date(result.data.metadata.timestamp).toLocaleTimeString()}
                                            </div>
                                        )}

                                        <div className="bg-white rounded border p-3 max-h-96 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700">
                                                {result.data?.story || 'No story content returned'}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                            <span className="text-sm font-medium text-red-800">Generation Failed</span>
                                        </div>
                                        
                                        <p className="text-sm text-red-600 mb-2">
                                            {result.error?.message || 'Unknown error'}
                                        </p>
                                        
                                        {result.error?.details && (
                                            <details className="text-xs text-red-500">
                                                <summary className="cursor-pointer">Error Details</summary>
                                                <pre className="mt-2 whitespace-pre-wrap">
                                                    {JSON.stringify(result.error.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && !loading && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Fill in the story details and click "Generate Story" to begin.</p>
                                <p className="text-sm mt-2">The story will be generated using your Rivet AI workflow.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* API Information */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">API Endpoints</h3>
                <div className="text-xs text-gray-600 space-y-1">
                    <p><code>POST {POCKETBASE_URL}/api/stories/generate</code> - Generate single story</p>
                    <p><code>POST {POCKETBASE_URL}/api/stories/generate/batch</code> - Generate multiple stories</p>
                    <p><code>GET {POCKETBASE_URL}/api/health</code> - System health check</p>
                    <p><code>GET {POCKETBASE_URL}/api/rivet/health</code> - Rivet service health</p>
                    <p><code>GET {POCKETBASE_URL}/api/test</code> - Test basic functionality</p>
                </div>
            </div>
        </div>
    );
}
