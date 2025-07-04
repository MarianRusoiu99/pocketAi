import React, { useState, useEffect } from 'react'
import {
  AnalyticsApi,
  AuthApi,
  PostsApi,
  CommentsApi,
  RealtimeApi,
  type AnalyticsStats,
  type Post,
  type Comment,
  type User
} from '../api'

/**
 * Example component demonstrating the new API structure usage
 * This shows how to use the modular API slices in React components
 */
export const ApiExampleComponent: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Example: Fetch analytics stats
  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await AnalyticsApi.getStats()
      if (response.success) {
        setStats(response.result)
        console.log('Analytics stats:', response.result)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch analytics stats')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Example: Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await PostsApi.list({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      if (response.success) {
        setPosts(response.result.posts)
        console.log('Posts fetched:', response.result)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch posts')
      console.error('Posts error:', err)
    }
  }

  // Example: Get current user
  const fetchCurrentUser = async () => {
    try {
      const response = await AuthApi.getCurrentUser()
      if (response.success) {
        setCurrentUser(response.result)
        console.log('Current user:', response.result)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch current user')
      console.error('Auth error:', err)
    }
  }

  // Example: Login user
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthApi.login({ email, password })
      if (response.success) {
        console.log('Login successful:', response.result)
        // Store token in localStorage or context
        localStorage.setItem('pocketbase_auth_token', response.result.token)
        setCurrentUser(response.result.user)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Login failed')
      console.error('Login error:', err)
    }
  }

  // Example: Create a new post
  const createPost = async (title: string, content: string) => {
    try {
      const response = await PostsApi.create({
        title,
        content,
        status: 'published'
      })
      
      if (response.success) {
        console.log('Post created:', response.result)
        // Refresh posts list
        fetchPosts()
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to create post')
      console.error('Create post error:', err)
    }
  }

  // Example: Like a post
  const likePost = async (postId: string) => {
    try {
      const response = await PostsApi.like(postId)
      if (response.success) {
        console.log('Post liked:', response.result)
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: response.result.likesCount, isLiked: response.result.isLiked }
            : post
        ))
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to like post')
      console.error('Like error:', err)
    }
  }

  // Example: Add a comment
  const addComment = async (postId: string, content: string) => {
    try {
      const response = await CommentsApi.create({
        postId,
        content
      })
      
      if (response.success) {
        console.log('Comment added:', response.result)
        // Update posts to reflect new comment count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ))
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to add comment')
      console.error('Comment error:', err)
    }
  }

  // Example: Connect to realtime
  const connectRealtime = async () => {
    try {
      const response = await RealtimeApi.connect()
      if (response.success) {
        console.log('Realtime connected:', response.result)
        
        // Subscribe to notifications channel
        await RealtimeApi.subscribe({
          channel: 'notifications',
          events: ['new_comment', 'new_like', 'new_post']
        })
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to connect to realtime')
      console.error('Realtime error:', err)
    }
  }

  // Example: Track analytics event
  const trackEvent = async (eventType: string, eventData: any) => {
    try {
      await AnalyticsApi.trackEvent({
        userId: currentUser?.id || 'anonymous',
        eventType,
        eventData,
        sessionId: 'example-session'
      })
      console.log('Event tracked:', { eventType, eventData })
    } catch (err) {
      console.error('Failed to track event:', err)
    }
  }

  useEffect(() => {
    // Initialize data on component mount
    fetchCurrentUser()
    fetchStats()
    fetchPosts()
    connectRealtime()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Usage Examples</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Analytics Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Analytics Stats'}
        </button>
        
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold">Total Users</h3>
              <p className="text-2xl">{stats.totalUsers}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold">Total Posts</h3>
              <p className="text-2xl">{stats.totalPosts}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold">Total Comments</h3>
              <p className="text-2xl">{stats.totalComments}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold">Active Users</h3>
              <p className="text-2xl">{stats.activeUsers}</p>
            </div>
          </div>
        )}
      </section>

      {/* Auth Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        {currentUser ? (
          <div className="bg-green-100 p-4 rounded">
            <p>Logged in as: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <p>Role: {currentUser.role}</p>
          </div>
        ) : (
          <div className="bg-yellow-100 p-4 rounded">
            <p>Not logged in</p>
            <button
              onClick={() => handleLogin('demo@example.com', 'password')}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Demo Login
            </button>
          </div>
        )}
      </section>

      {/* Posts Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Posts</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={fetchPosts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Posts
          </button>
          <button
            onClick={() => createPost('New Post', 'This is a new post created via API')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Post
          </button>
        </div>
        
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded p-4">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-600 mb-2">{post.excerpt || post.content.substring(0, 100)}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {post.author.name}</span>
                <span>{post.likesCount} likes</span>
                <span>{post.commentsCount} comments</span>
                <button
                  onClick={() => likePost(post.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {post.isLiked ? 'Unlike' : 'Like'}
                </button>
                <button
                  onClick={() => addComment(post.id, 'Great post!')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Add Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Tracking Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Event Tracking</h2>
        <div className="flex gap-4">
          <button
            onClick={() => trackEvent('page_view', { page: 'api_example' })}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Track Page View
          </button>
          <button
            onClick={() => trackEvent('button_click', { button: 'demo_button' })}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Track Button Click
          </button>
        </div>
      </section>
    </div>
  )
}

export default ApiExampleComponent
