'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, ChevronLeft, Sparkles, Smile, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getChatResponse } from '@/lib/ai'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)

      // 添加欢迎消息
      setMessages([
        {
          id: '1',
          content: '你好！我是你的个人成长伙伴。根据你记录的成功事件，我能看出你有很多优势和潜力。有什么想和我聊的吗？',
          isUser: false,
          timestamp: new Date()
        }
      ])
    }

    checkAuth()
  }, [router])

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !userId || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // 添加用户消息
    const userMessageObj = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessageObj])
    setIsLoading(true)

    try {
      // 获取AI回复
      const response = await getChatResponse(userId, userMessage)
      
      if (response.error) {
        toast.error('获取回复失败，请重试')
        console.error(response.error)
      }

      // 添加AI回复
      setMessages(prev => [
        ...prev, 
        {
          id: (Date.now() + 1).toString(),
          content: response.message,
          isUser: false,
          timestamp: new Date()
        }
      ])
    } catch (error) {
      console.error('聊天错误:', error)
      toast.error('获取回复失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/diary')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white z-10 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="font-medium text-lg">AI 小助手</h1>
          </div>
          <div className="w-10"></div> {/* 为了平衡布局 */}
        </div>
      </div>

      {/* 聊天消息区 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                msg.isUser
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white shadow-sm rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm rounded-xl rounded-tl-none p-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* 用于自动滚动的空div */}
        <div ref={bottomRef} />
      </div>

      {/* 底部输入区 */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <div className="flex items-center px-3 py-2 bg-gray-100 rounded-full flex-1">
            <Smile className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              className="bg-transparent flex-1 focus:outline-none"
              disabled={isLoading || !userId}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !userId}
            className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
} 