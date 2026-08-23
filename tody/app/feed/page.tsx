'use client'

import { useEffect, useState, useCallback } from 'react'
import { getFeed, getTrendingPosts, togglePostLike, addCommentToPost, recordPostView } from '@/lib/actions/feed'
import type { FeedPost } from '@/lib/types'

interface FeedPostWithData extends FeedPost {
  author: any
  liked_by_current_user: boolean
  comments_count: number
  showing_comments: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPostWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending'>('for_you')
  const [currentUserId] = useState('') // TODO: Get from auth context
  const [newComment, setNewComment] = useState<Record<string, string>>({})

  useEffect(() => {
    loadFeed()
  }, [activeTab])

  const loadFeed = async () => {
    setLoading(true)
    if (activeTab === 'for_you') {
      const result = await getFeed(currentUserId)
      if (result.success && result.posts) {
        setPosts(
          result.posts.map((p) => ({
            ...p,
            showing_comments: false,
            comments_count: p.comment_count,
          }))
        )
      }
    } else {
      const result = await getTrendingPosts()
      if (result.success && result.posts) {
        setPosts(
          result.posts.map((p) => ({
            ...p,
            showing_comments: false,
            comments_count: p.comment_count,
          }))
        )
      }
    }
    setLoading(false)
  }

  const handleLike = useCallback(
    async (postId: string) => {
      const result = await togglePostLike(postId, currentUserId)
      if (result.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked_by_current_user: result.liked,
                  like_count: result.liked ? p.like_count + 1 : p.like_count - 1,
                }
              : p
          )
        )
      }
    },
    [currentUserId]
  )

  const handleAddComment = async (postId: string) => {
    if (!newComment[postId]?.trim()) return

    const result = await addCommentToPost(postId, currentUserId, newComment[postId])
    if (result.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comment_count: p.comment_count + 1,
              }
            : p
        )
      )
      setNewComment((prev) => ({ ...prev, [postId]: '' }))
    }
  }

  const handlePostView = useCallback(async (postId: string) => {
    await recordPostView(postId)
  }, [])

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-700 p-4 sticky top-0 z-10 bg-black/80 backdrop-blur">
        <h1 className="text-2xl font-bold">Tody Feed</h1>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`pb-2 px-2 font-semibold ${
              activeTab === 'for_you'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`pb-2 px-2 font-semibold ${
              activeTab === 'trending'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400">No posts yet. Follow some sellers to see content!</div>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="h-screen snap-start flex flex-col bg-gradient-to-b from-gray-900 to-black border-b border-gray-700"
              onViewportEnter={() => handlePostView(post.id)}
            >
              {/* Video/Image Background */}
              <div className="flex-1 relative overflow-hidden bg-black">
                {post.content_type === 'video' && post.media_urls.length > 0 ? (
                  <video
                    src={post.media_urls[0]}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                  />
                ) : post.content_type === 'image' && post.media_urls.length > 0 ? (
                  <img
                    src={post.media_urls[0]}
                    alt={post.title || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold mb-4">{post.title}</h2>
                      <p className="text-xl text-gray-200">{post.description}</p>
                    </div>
                  </div>
                )}

                {/* Author Info Overlay (Bottom Left) */}
                <div className="absolute bottom-20 left-4 right-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatar_url || '/default-avatar.png'}
                      alt={post.author?.full_name || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div>
                      <p className="font-semibold">{post.author?.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-300">{post.author?.rating || 0}★</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Sidebar (Right Side) */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-6 text-center">
                {/* Like Button */}
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex flex-col items-center gap-1 hover:scale-110 transition"
                >
                  <div className="bg-gray-800 rounded-full p-3 hover:bg-red-500 transition">
                    <svg
                      className={`w-6 h-6 ${post.liked_by_current_user ? 'fill-red-500' : 'fill-white'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white">{post.like_count}</span>
                </button>

                {/* Comment Button */}
                <button className="flex flex-col items-center gap-1 hover:scale-110 transition">
                  <div className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white">{post.comments_count}</span>
                </button>

                {/* Share Button */}
                <button className="flex flex-col items-center gap-1 hover:scale-110 transition">
                  <div className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.06c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.44 9.31 6.77 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.77 0 1.44-.3 1.96-.77l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white">{post.share_count}</span>
                </button>
              </div>

              {/* Post Details & Comments (Bottom) */}
              <div className="bg-gray-900 border-t border-gray-700 p-4 max-h-1/4 overflow-y-auto">
                {post.title && <h3 className="font-bold text-lg mb-1">{post.title}</h3>}
                {post.description && <p className="text-sm text-gray-300 mb-3">{post.description}</p>}

                {/* Comment Input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-gray-700"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
