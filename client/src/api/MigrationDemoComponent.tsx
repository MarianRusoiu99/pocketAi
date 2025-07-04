import React, { useState } from 'react'

// Legacy import (deprecated)
// import { AnalyticsService } from '@/services'

// New API import
import { AnalyticsApi, type AnalyticsStats } from '../api'

/**
 * Migration Demo Component
 * Shows side-by-side comparison of legacy vs new API usage
 */
export const MigrationDemoComponent: React.FC = () => {
  const [legacyData, setLegacyData] = useState<any>(null)
  const [newData, setNewData] = useState<AnalyticsStats | null>(null)
  const [legacyError, setLegacyError] = useState<string | null>(null)
  const [newError, setNewError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Legacy approach (commented out as it's deprecated)
  const fetchWithLegacyService = async () => {
    setLoading(true)
    setLegacyError(null)
    
    try {
      // Legacy service call would be:
      // const analyticsService = new AnalyticsService()
      // const stats = await analyticsService.getStats()
      // setLegacyData(stats)
      
      // Simulating legacy response for demo
      setTimeout(() => {
        setLegacyData({
          totalUsers: 1000,
          totalPosts: 500,
          totalComments: 2000,
          activeUsers: 150
        })
        setLoading(false)
      }, 1000)
    } catch (error: any) {
      setLegacyError(error.message || 'Legacy service error')
      setLoading(false)
    }
  }

  // New API approach
  const fetchWithNewApi = async () => {
    setLoading(true)
    setNewError(null)
    
    const response = await AnalyticsApi.getStats()
    
    if (response.success) {
      setNewData(response.result)
    } else {
      setNewError(response.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Migration Demo</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Legacy Service Column */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Legacy Service (Deprecated)
          </h2>
          
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-red-800">Legacy Code Pattern:</h3>
            <pre className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
{`// Legacy approach
import { AnalyticsService } from '@/services'

const service = new AnalyticsService()
try {
  const stats = await service.getStats()
  // Use stats directly
} catch (error) {
  // Handle error
}`}
            </pre>
          </div>

          <button
            onClick={fetchWithLegacyService}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 mb-4"
          >
            {loading ? 'Loading...' : 'Fetch with Legacy Service'}
          </button>

          {legacyError && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
              Error: {legacyError}
            </div>
          )}

          {legacyData && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Legacy Response:</h3>
              <pre className="text-sm text-gray-700">
                {JSON.stringify(legacyData, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 text-sm text-red-600">
            <h4 className="font-semibold">Issues with Legacy:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Limited type safety</li>
              <li>Inconsistent error handling</li>
              <li>Service instantiation overhead</li>
              <li>No standardized response format</li>
            </ul>
          </div>
        </div>

        {/* New API Column */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            New API Client
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-green-800">New Code Pattern:</h3>
            <pre className="text-sm text-green-700 mt-2 whitespace-pre-wrap">
{`// New approach
import { AnalyticsApi } from '@/api'

const response = await AnalyticsApi.getStats()
if (response.success) {
  const stats = response.result
  // Use stats (fully typed)
} else {
  // Handle response.error
}`}
            </pre>
          </div>

          <button
            onClick={fetchWithNewApi}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mb-4"
          >
            {loading ? 'Loading...' : 'Fetch with New API'}
          </button>

          {newError && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
              Error: {newError}
            </div>
          )}

          {newData && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">New API Response:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Users: <strong>{newData.totalUsers}</strong></div>
                <div>Total Posts: <strong>{newData.totalPosts}</strong></div>
                <div>Total Comments: <strong>{newData.totalComments}</strong></div>
                <div>Active Users: <strong>{newData.activeUsers}</strong></div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-green-600">
            <h4 className="font-semibold">Benefits of New API:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Full TypeScript support</li>
              <li>Consistent response format</li>
              <li>Better error handling</li>
              <li>Modular architecture</li>
              <li>No service instantiation</li>
              <li>Standardized patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Feature</th>
                <th className="border border-gray-300 p-3 text-left text-red-600">Legacy Service</th>
                <th className="border border-gray-300 p-3 text-left text-green-600">New API Client</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Type Safety</td>
                <td className="border border-gray-300 p-3">❌ Limited/Any types</td>
                <td className="border border-gray-300 p-3">✅ Full TypeScript</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Error Handling</td>
                <td className="border border-gray-300 p-3">❌ Try/catch required</td>
                <td className="border border-gray-300 p-3">✅ Consistent response format</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Response Format</td>
                <td className="border border-gray-300 p-3">❌ Inconsistent</td>
                <td className="border border-gray-300 p-3">✅ Standardized ApiResponse</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Testability</td>
                <td className="border border-gray-300 p-3">❌ Hard to mock</td>
                <td className="border border-gray-300 p-3">✅ Easy to mock/test</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Code Organization</td>
                <td className="border border-gray-300 p-3">❌ Monolithic services</td>
                <td className="border border-gray-300 p-3">✅ Modular slices</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Performance</td>
                <td className="border border-gray-300 p-3">❌ Service instantiation</td>
                <td className="border border-gray-300 p-3">✅ Static methods</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Migration Steps */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Quick Migration Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Replace service imports with API slice imports</li>
          <li>Update method calls to use static API methods</li>
          <li>Add response success checking</li>
          <li>Update error handling logic</li>
          <li>Update TypeScript types from @/api</li>
          <li>Test thoroughly and remove legacy code</li>
        </ol>
        
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p className="text-blue-800">
            <strong>💡 Tip:</strong> Migrate one component at a time and test thoroughly. 
            The new API client provides better type safety and error handling out of the box.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MigrationDemoComponent
