'use server'

import { supabase } from '@/lib/supabase'
import type { FeedPost, FeedComment } from '@/lib/types'

// Create a feed post
export async function createFeedPost(
  userId: string,
  contentType: 'text' | 'image' | 'video' | 'product' | 'live',
  title: string | null,
  description: string | null,
  mediaUrls?: string[],
  productIds?: string[],
  listingId?: string,
  liveSessionId?: string
): Promise<{ success: boolean; post?: FeedPost; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        user_id: userId,
        content_type: contentType,
        title,
        description,
        media_urls: mediaUrls || [],
        product_ids: productIds || [],
        listing_id: listingId,
        live_session_id: liveSessionId,
        status: 'published',
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, post: data as FeedPost }
  } catch (error) {
    console.error('Error creating feed post:', error)
    return { success: false, error: 'Failed to create post' }
  }
}

// Get feed for user (vertical scroll/TikTok style)
export async function getFeed(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{
  success: boolean
  posts?: (FeedPost & { author: any; liked_by_current_user: boolean })[]
  error?: string
}> {
  try {
    // Get posts from followed users and explore
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        author:users!user_id(id, full_name, avatar_url, rating),
        feed_likes(user_id)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const enrichedPosts = (posts || []).map((post: any) => ({
      ...post,
      author: post.author?.[0] || null,
      liked_by_current_user: (post.feed_likes || []).some(
        (like: any) => like.user_id === userId
      ),
    }))

    return { success: true, posts: enrichedPosts }
  } catch (error) {
    console.error('Error fetching feed:', error)
    return { success: false, error: 'Failed to fetch feed' }
  }
}

// Get trending posts
export async function getTrendingPosts(
  limit = 20
): Promise<{
  success: boolean
  posts?: (FeedPost & { author: any; engagement_score: number })[]
  error?: string
}> {
  try {
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        author:users!user_id(id, full_name, avatar_url, rating)
      `)
      .eq('status', 'published')
      .order('like_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    const enrichedPosts = (posts || []).map((post: any) => ({
      ...post,
      author: post.author?.[0] || null,
      engagement_score:
        post.like_count * 1 +
        post.comment_count * 2 +
        post.share_count * 3 +
        post.view_count * 0.1,
    }))

    return { success: true, posts: enrichedPosts }
  } catch (error) {
    console.error('Error fetching trending posts:', error)
    return { success: false, error: 'Failed to fetch trending posts' }
  }
}

// Like/unlike a post
export async function togglePostLike(
  postId: string,
  userId: string
): Promise<{ success: boolean; liked: boolean; error?: string }> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('feed_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('feed_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error

      // Decrement like count
      await supabase.rpc('decrement_post_likes', { post_id: postId })

      return { success: true, liked: false }
    } else {
      // Like
      const { error } = await supabase.from('feed_likes').insert({
        post_id: postId,
        user_id: userId,
      })

      if (error) throw error

      // Increment like count
      await supabase.rpc('increment_post_likes', { post_id: postId })

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, liked: false, error: 'Failed to toggle like' }
  }
}

// Add comment to post
export async function addCommentToPost(
  postId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<{ success: boolean; comment?: FeedComment; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('feed_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId,
      })
      .select()
      .single()

    if (error) throw error

    // Increment comment count
    await supabase.rpc('increment_post_comments', { post_id: postId })

    return { success: true, comment: data as FeedComment }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}

// Get comments for a post
export async function getPostComments(
  postId: string,
  limit = 20,
  offset = 0
): Promise<{
  success: boolean
  comments?: (FeedComment & { author: any })[]
  error?: string
}> {
  try {
    const { data: comments, error } = await supabase
      .from('feed_comments')
      .select(`
        *,
        author:users!user_id(id, full_name, avatar_url, rating)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const enrichedComments = (comments || []).map((comment: any) => ({
      ...comment,
      author: comment.author?.[0] || null,
    }))

    return { success: true, comments: enrichedComments }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: 'Failed to fetch comments' }
  }
}

// Get user's posts
export async function getUserPosts(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ success: boolean; posts?: FeedPost[]; error?: string }> {
  try {
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, posts: posts as FeedPost[] }
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return { success: false, error: 'Failed to fetch user posts' }
  }
}

// Record view for a post
export async function recordPostView(postId: string): Promise<void> {
  try {
    await supabase.rpc('increment_post_views', { post_id: postId })
  } catch (error) {
    console.error('Error recording post view:', error)
  }
}

// Share post (increment share count)
export async function sharePost(postId: string): Promise<void> {
  try {
    await supabase.rpc('increment_post_shares', { post_id: postId })
  } catch (error) {
    console.error('Error recording share:', error)
  }
}

// Delete a post (soft delete)
export async function deletePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('feed_posts')
      .update({ status: 'deleted' })
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Failed to delete post' }
  }
}
