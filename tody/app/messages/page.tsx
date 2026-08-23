'use client'

import { useEffect, useState } from 'react'
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from '@/lib/actions/messaging'
import type { Conversation, Message } from '@/lib/types'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<(Conversation & { otherUser: any })[]>([])
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { otherUser: any }) | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [userId] = useState('') // TODO: Get from auth context

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    const userId = 'temp-user-id' // TODO: Get from auth
    const result = await getUserConversations(userId)

    if (result.success && result.conversations) {
      setConversations(result.conversations)
    }
    setLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    const result = await getConversationMessages(conversationId, 50)
    if (result.success && result.messages) {
      setMessages(result.messages)
      // Mark as read
      const userId = 'temp-user-id' // TODO: Get from auth
      await markMessagesAsRead(conversationId, userId)
    }
  }

  const handleSelectConversation = async (conversation: Conversation & { otherUser: any }) => {
    setSelectedConversation(conversation)
    await loadMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim()) return

    setSendingMessage(true)
    const userId = 'temp-user-id' // TODO: Get from auth
    const result = await sendMessage(selectedConversation.id, userId, messageText)

    if (result.success && result.message) {
      setMessages((prev) => [...prev, result.message as Message])
      setMessageText('')
    }
    setSendingMessage(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-gray-600">Your conversations</p>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              <p>No conversations yet</p>
              <p className="text-xs">Send a message to start chatting</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 border-b text-left transition hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={conversation.otherUser?.avatar_url || '/default-avatar.png'}
                    alt={conversation.otherUser?.full_name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{conversation.otherUser?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage
                        ? conversation.lastMessage.content
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 hidden md:flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedConversation.otherUser?.avatar_url || '/default-avatar.png'}
                  alt={selectedConversation.otherUser?.full_name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedConversation.otherUser?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">⭐ {selectedConversation.otherUser?.rating || 0}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === userId
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none shadow'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender_id === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-semibold">No conversation selected</p>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
