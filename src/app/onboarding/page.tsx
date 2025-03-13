//新用户引导：填写100件事
'use client'
import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'

interface SuccessEvent {
  id: string
  content: string
}

const EXAMPLE_EVENTS = [
  '一次考试取得好成绩',
  '完成了一次比赛或活动',
  '学会了一项新技能或语言',
  '独立完成一个工作项目',
  '为家人或朋友做了一顿可口的饭菜',
  '养成了一个好习惯（如坚持运动、早睡等）'
]

export default function OnboardingPage() {
  const [events, setEvents] = useState<SuccessEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEvent.trim()) return

    const newEvent: SuccessEvent = {
      id: Date.now().toString(),
      content: currentEvent.trim()
    }

    setEvents(prev => [...prev, newEvent])
    setCurrentEvent('')
  }

  const handleSkip = () => {
    // TODO: 处理跳过逻辑
    console.log('跳过填写')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* 头部说明 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            你知道吗？其实你有很多的闪光点！
          </h1>
          <p className="text-gray-600 text-lg">
            试着回忆一下人生中那些让你骄傲的成功瞬间吧！<br />
            这些成功经历能帮助你发现你的优势，<br />
            在未来遇到困难时，成为支持你的证据。
          </p>
        </div>

        {/* 进度显示 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">已记录 {events.length}/100 件</span>
            <span className="text-sm text-primary">{Math.floor(events.length)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(events.length / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={currentEvent}
              onChange={(e) => setCurrentEvent(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="记录一件成功的小事..."
            />
            <button
              type="submit"
              disabled={!currentEvent.trim()}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* 已添加列表 */}
        {events.length > 0 && (
          <div className="mb-12 space-y-3">
            {events.map(event => (
              <div 
                key={event.id}
                className="p-4 bg-white rounded-xl shadow-sm"
              >
                {event.content}
              </div>
            ))}
          </div>
        )}

        {/* 示例提示 */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h3 className="font-medium mb-4">💡 一些示例：</h3>
          <div className="grid grid-cols-2 gap-3">
            {EXAMPLE_EVENTS.map((example, index) => (
              <button
                key={index}
                onClick={() => setCurrentEvent(example)}
                className="p-3 text-left text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-primary"
          >
            暂时跳过
          </button>
          <button
            onClick={() => {/* TODO: 处理完成逻辑 */}}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            开始使用
          </button>
        </div>
      </div>
    </div>
  )
}