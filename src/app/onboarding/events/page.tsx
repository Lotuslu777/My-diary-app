'use client'
import { useState, useEffect } from 'react'
import { Send, ChevronLeft, Trophy, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { analyzeSuccessEvents } from '@/lib/ai'
import toast from 'react-hot-toast'

interface SuccessEvent {
  id: string
  content: string
  category?: string
  created_at: string
}

const CATEGORIES = [
  { id: 'study', name: '学习成长', icon: '📚' },
  { id: 'work', name: '工作成就', icon: '💼' },
  { id: 'life', name: '生活突破', icon: '🌟' },
  { id: 'hobby', name: '兴趣特长', icon: '🎯' },
  { id: 'social', name: '人际关系', icon: '🤝' },
]

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<SuccessEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 加载已保存的成功事件
  useEffect(() => {
    const loadEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('success_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setEvents(data)
      }
      setIsLoading(false)
    }

    loadEvents()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEvent.trim()) return
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newEvent = {
        content: currentEvent.trim(),
        category: selectedCategory || null,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('success_events')
        .insert([newEvent])
        .select()
        .single()

      if (!error && data) {
        const updatedEvents = [data, ...events]
        setEvents(updatedEvents)
        setCurrentEvent('')

        // 在特定节点触发AI分析
        if (updatedEvents.length === 25) {
          toast.loading('正在生成初步分析报告...')
          const analysis = await analyzeSuccessEvents(user.id)
          if (analysis) {
            toast.success('初步分析完成！快去看看你的优势吧')
            router.push('/analysis')
          }
        } else if (updatedEvents.length === 50) {
          toast.loading('正在生成阶段性分析报告...')
          const analysis = await analyzeSuccessEvents(user.id)
          if (analysis) {
            toast.success('阶段性分析完成！发现了更多你的特点')
            router.push('/analysis')
          }
        } else if (updatedEvents.length === 100) {
          toast.loading('正在生成完整优势分析报告...')
          const analysis = await analyzeSuccessEvents(user.id)
          if (analysis) {
            toast.success('恭喜完成100个成功记录！快来看看完整的优势分析吧')
            router.push('/analysis')
          }
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/diary')
  }

  // 处理标签选择
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId)
  }

  // 添加手动触发分析的函数
  const handleAnalyze = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setIsLoading(true)
      toast.loading('正在生成分析报告...')
      const analysis = await analyzeSuccessEvents(user.id)
      
      if (analysis) {
        toast.success('分析完成！')
        router.push('/analysis')
      } else {
        toast.error('分析生成失败，请重试')
      }
    } catch (error) {
      console.error('分析失败:', error)
      toast.error('分析生成失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-sm z-10 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">{events.length}/100</span>
            </div>
            {events.length >= 25 && (
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4" />
                查看分析
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 进度提示 */}
      {events.length < 100 && (
        <div className="px-6 py-3 bg-primary/5 text-center">
          <p className="text-sm text-primary flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {events.length === 0 ? (
              '开始记录你的成功时刻吧！'
            ) : events.length < 25 ? (
              `再记录 ${25 - events.length} 条成功经历，即可获得初步分析`
            ) : events.length < 50 ? (
              `已达到初步分析条件！点击上方按钮查看分析报告，或继续记录到 ${50 - events.length} 条获得更详细的分析`
            ) : (
              `再记录 ${100 - events.length} 条成功经历，即可获得完整优势分析`
            )}
          </p>
        </div>
      )}

      {/* 可选的分类标签 */}
      <div className="px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-all
                ${selectedCategory === category.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-primary/5'}`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 事件列表 */}
      <div className="flex-1 px-6 py-4 space-y-4 pb-32">
        {events.map(event => (
          <div 
            key={event.id}
            className="p-4 bg-white rounded-xl shadow-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              {event.category ? CATEGORIES.find(c => c.id === event.category)?.icon : '✨'}
            </div>
            <p className="text-gray-700">{event.content}</p>
          </div>
        ))}
      </div>

      {/* 底部输入区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={currentEvent}
              onChange={(e) => setCurrentEvent(e.target.value)}
              className="flex-1 px-4 py-3 bg-primary/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={selectedCategory ? `记录一个关于${CATEGORIES.find(c => c.id === selectedCategory)?.name}的成功时刻...` : "记录一个让你感到骄傲的时刻..."}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!currentEvent.trim() || isLoading}
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 