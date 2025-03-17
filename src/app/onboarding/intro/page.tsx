'use client'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function IntroPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 图标 */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        {/* 标题和说明 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            发现你的100个闪光时刻
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            每个人都有属于自己的精彩瞬间<br />
            让我们一起回顾那些让你感到骄傲的时刻<br />
            它们将成为你继续前进的动力
          </p>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={() => router.push('/onboarding/events')}
          className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-full text-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          开始记录
        </button>

        {/* 补充说明 */}
        <p className="text-sm text-gray-500">
          记录100件成功的小事，帮助你发现自己的优势特点
        </p>
      </div>
    </div>
  )
} 