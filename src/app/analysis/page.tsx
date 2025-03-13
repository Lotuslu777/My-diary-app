'use client'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Edit2, ChevronRight, Star, Lightbulb } from 'lucide-react'

interface Profile {
  nickname: string
  age?: number
  major?: string
  mbti?: string
}

interface Strength {
  keyword: string
  description: string
  relatedEntries: number
}

export default function AnalysisPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  
  // 模拟的优势数据
  const mockStrengths: Strength[] = [
    { keyword: '学习能力', description: '你有很强的自主学习能力，经常主动学习新知识', relatedEntries: 12 },
    { keyword: '分析思维', description: '你善于分析问题并找到解决方案', relatedEntries: 8 },
    { keyword: '自我驱动', description: '你有很强的自我激励能力，能持续保持进步', relatedEntries: 15 },
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profile)
        setEditedProfile(profile)
      }
    }
    getUser()
  }, [])

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return

    const { error } = await supabase
      .from('profiles')
      .update({
        age: editedProfile.age,
        major: editedProfile.major,
        mbti: editedProfile.mbti
      })
      .eq('id', user.id)

    if (!error) {
      setProfile(editedProfile)
      setIsEditing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部个人信息卡片 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">关于我</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:text-primary/80 flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditing ? '取消' : '编辑'}
            </button>
          </div>

          {isEditing ? (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄
                </label>
                <input
                  type="number"
                  value={editedProfile?.age || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev!, age: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="输入你的年龄"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  专业
                </label>
                <input
                  type="text"
                  value={editedProfile?.major || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev!, major: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="输入你的专业"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MBTI
                </label>
                <input
                  type="text"
                  value={editedProfile?.mbti || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev!, mbti: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="输入你的MBTI类型"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            // 展示模式
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <span className="w-20">邮箱：</span>
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-20">年龄：</span>
                <span className="text-gray-900">{profile?.age || '未设置'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-20">专业：</span>
                <span className="text-gray-900">{profile?.major || '未设置'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-20">MBTI：</span>
                <span className="text-gray-900">{profile?.mbti || '未设置'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI 洞察部分 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">你的优点</h2>
          </div>

          {/* 优势标签 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {mockStrengths.map((strength) => (
              <button
                key={strength.keyword}
                className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full flex items-center gap-2 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>{strength.keyword}</span>
                <span className="text-xs text-primary/70">({strength.relatedEntries})</span>
              </button>
            ))}
          </div>

          {/* AI 建议 */}
          <div className="space-y-4">
            <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-between group transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-900">你的优势适合做什么类型的工作？</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>

            <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-between group transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-900">如何发挥优势实现你的目标？</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}