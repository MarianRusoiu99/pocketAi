// Example usage component showing the new modular structure
import React, { useEffect, useState } from 'react'
import { getServices, createPost, getPosts, login, logout, getCurrentUser } from './index'

export function ExampleUsage() {
  const [posts, setPosts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const services = getServices()

  useEffect(() => {
    // Initialize app
    initializeApp()
    
    // Cleanup subscriptions on unmount
    return () => {
      services.realtime.unsubscribeAll()
    }
  }, [])

  async function initializeApp() {
    try {
      // Check authentication
      const currentUser = getCurrentUser()
      setUser(currentUser)

      // Load posts
      const postsResponse = await getPosts()
      setPosts(postsResponse.items)

      // Set up real-time updates for new posts
      await services.realtime.subscribeToNewPosts((newPost: any) => {
        setPosts(prev => [newPost, ...prev])
      })

    } catch (error) {
      console.error('Failed to initialize app:', error)
    }
  }

  async function handleLogin(email: string, password: string) {
    try {
      const authData = await login(email, password)
      setUser(authData.record)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  async function handleCreatePost(title: string, content: string) {
    try {
      const newPost = await createPost({
        title,
        content,
        published: true,
      })
      setPosts(prev => [newPost, ...prev])
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  function handleLogout() {
    logout()
    setUser(null)
  }

  return (
    <div>
      <h1>Blog App</h1>
      
      {/* Auth section */}
      <div>
        {user ? (
          <div>
            Welcome, {user.name}! 
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => handleLogin('test@example.com', 'password')}>
              Login
            </button>
          </div>
        )}
      </div>

      {/* Posts section */}
      <div>
        <h2>Posts ({posts.length})</h2>
        {user && (
          <button onClick={() => handleCreatePost('Test Post', 'Test content')}>
            Create Post
          </button>
        )}
        
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>Created: {new Date(post.created).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExampleUsage
