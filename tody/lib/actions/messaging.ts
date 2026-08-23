'use server'

import { supabase } from '@/lib/supabase'
import type { Conversation, Message } from '@/lib/types'

// Get or create conversation between two users
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
  try {
    // Ensure consistent ordering of participants
    const [participant1, participant2] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    // Check if conversation exists
    let { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_1_id', participant1)
      .eq('participant_2_id', participant2)
      .single()

    if (error && error.code === 'PGRST116') {
      // Not found, create new
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: participant1,
          participant_2_id: participant2,
        })
        .select()
        .single()

      if (createError) throw createError
      conversation = newConversation
    } else if (error) {
      throw error
    }

    return { success: true, conversation: conversation as Conversation }
  } catch (error) {
    console.error('Error getting/creating conversation:', error)
    return { success: false, error: 'Failed to get conversation' }
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, message: message as Message }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

// Get messages in a conversation
export async function getConversationMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Reverse to show oldest first
    return { success: true, messages: (messages || []).reverse() as Message[] }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages' }
  }
}

// Get conversations for user
export async function getUserConversations(userId: string, limit = 50, offset = 0): Promise<{
  success: boolean
  conversations?: (Conversation & { otherUser: any; lastMessage: Message | null })[]
  error?: string
}> {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(
        `
        *,
        participant1:users!participant_1_id(id, full_name, avatar_url),
        participant2:users!participant_2_id(id, full_name, avatar_url)
      `
      )
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsLast: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Enrich with other user and last message
    const enriched = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const otherUserId =
          conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
        const otherUser =
          conv.participant_1_id === userId ? conv.participant2?.[0] : conv.participant1?.[0]

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          otherUser,
          lastMessage: lastMessage || null,
        }
      })
    )

    return { success: true, conversations: enriched }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return { success: false, error: 'Failed to fetch conversations' }
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return { success: false, error: 'Failed to mark messages as read' }
  }
}

// Get unread message count for user
export async function getUnreadMessageCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { data, count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .in(
        'conversation_id',
        await supabase
          .from('conversations')
          .select('id')
          .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
          .then((res: any) => res.data?.map((c: any) => c.id) || [])
      )
      .eq('is_read', false)
      .neq('sender_id', userId)

    if (error) throw error
    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Error getting unread count:', error)
    return { success: false, error: 'Failed to get unread count' }
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) throw error

    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (convError) throw convError
    return { success: true }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return { success: false, error: 'Failed to delete conversation' }
  }
}

// Search messages
export async function searchMessages(
  conversationId: string,
  query: string
): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, messages: (messages || []).reverse() as Message[] }
  } catch (error) {
    console.error('Error searching messages:', error)
    return { success: false, error: 'Failed to search messages' }
  }
}
