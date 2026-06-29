import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const SYSTEM_PROMPT =
  'You are a cricket analytics assistant. Provide a short, clear cricket-specific answer based on the match context provided.'

function ContextPanel({ systemPrompt, matchState, userQuestion }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <span
          className="inline-block transition-transform duration-200 text-[9px]"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        View AI context
      </button>
      {open && (
        <div className="mt-1.5 bg-gray-900 rounded-md p-2.5 font-mono text-[11px] text-gray-300 space-y-2 border border-gray-700">
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">System prompt</p>
            <pre className="whitespace-pre-wrap break-words">{systemPrompt}</pre>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Match state JSON</p>
            <pre className="whitespace-pre-wrap break-words overflow-x-auto">
              {JSON.stringify(matchState, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">User question</p>
            <pre className="whitespace-pre-wrap break-words">{userQuestion}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_MESSAGE = {
  role: 'assistant',
  content:
    "Hello! I'm your cricket analytics AI assistant. Ask me anything about the match, predictions, or player performance!",
}

function loadStoredMessages(matchId) {
  try {
    const saved = sessionStorage.getItem(`ai-chat-${matchId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return [DEFAULT_MESSAGE]
}

export default function AIChat({ matchId, matchContext, matchState }) {
  const [messages, setMessages] = useState(() => loadStoredMessages(matchId))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesContainerRef = useRef(null)
  const prevMessageCountRef = useRef(0)

  useEffect(() => {
    setMessages(loadStoredMessages(matchId))
    prevMessageCountRef.current = loadStoredMessages(matchId).length
  }, [matchId])

  useEffect(() => {
    sessionStorage.setItem(`ai-chat-${matchId}`, JSON.stringify(messages))
  }, [messages, matchId])

  const resolvedMatchState =
    matchState ||
    (typeof matchContext === 'string'
      ? { context: matchContext }
      : matchContext || { matchId })

  // Scroll only inside the chat panel when a new message is added — never the whole page
  useEffect(() => {
    if (messages.length <= prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length
      return
    }
    prevMessageCountRef.current = messages.length
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const contextString =
      typeof matchContext === 'string'
        ? matchContext
        : JSON.stringify(resolvedMatchState)

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await axios.post(`${API_BASE}/ai/chat`, {
        question: userMessage,
        context: contextString || 'Cricket match analytics, statistics, and predictions',
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            response.data.answer ||
            "I apologize, but I couldn't generate a response at this time.",
          contextMeta: {
            systemPrompt: SYSTEM_PROMPT,
            matchState: resolvedMatchState,
            userQuestion: userMessage,
          },
        },
      ])
    } catch (error) {
      console.error('Error chatting with AI:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          contextMeta: {
            systemPrompt: SYSTEM_PROMPT,
            matchState: resolvedMatchState,
            userQuestion: userMessage,
          },
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🤖</span>
          AI Assistant
        </h2>
        <span className="text-xs font-semibold bg-purple-600 text-white px-3 py-1 rounded-full">
          Powered by Cohere
        </span>
      </div>

      <div
        ref={messagesContainerRef}
        className="h-64 overflow-y-auto mb-4 space-y-3 p-2 bg-gray-50 rounded-lg"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white'
                  : 'bg-purple-100 text-gray-800'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && msg.contextMeta && (
                <ContextPanel
                  systemPrompt={msg.contextMeta.systemPrompt}
                  matchState={msg.contextMeta.matchState}
                  userQuestion={msg.contextMeta.userQuestion}
                />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-purple-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the match, predictions, or players..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {['Who will win?', 'Best player?', 'Run rate?', 'Next wicket?'].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
