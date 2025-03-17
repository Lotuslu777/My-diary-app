'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trophy, Sparkles, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getLatestAnalysis, StrengthAnalysis } from '@/lib/ai'

export default function AnalysisPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalysis = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const result = await getLatestAnalysis(user.id)
      if (result) {
        setAnalysis(result)
      }
      setIsLoading(false)
    }

    loadAnalysis()
  }, [router])

  const handleBack = () => {
    router.push('/onboarding/events')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">暂无分析结果</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-full"
          >
            返回记录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-sm z-10 p-4 shadow-sm">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          返回
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 整体分析 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            优势分析
          </h2>
          <p className="text-gray-600 whitespace-pre-line">{analysis.analysis_text}</p>
        </div>

        {/* 关键优势 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            关键优势
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.key_strengths?.map((strength, index) => (
              <div
                key={index}
                className="p-4 bg-primary/5 rounded-xl"
              >
                {strength}
              </div>
            ))}
          </div>
        </div>

        {/* 职业建议 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
            职业发展建议
          </h2>
          <div className="space-y-4">
            {analysis.career_suggestions?.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 border border-primary/10 rounded-xl"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        {/* 分类统计 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-medium flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            成功经历分布
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analysis.categories || {}).map(([category, count]) => (
              <div
                key={category}
                className="p-4 bg-primary/5 rounded-xl flex flex-col items-center"
              >
                <span className="text-2xl font-medium text-primary">{count}</span>
                <span className="text-sm text-gray-600">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}