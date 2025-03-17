//新用户引导：填写100件事
'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Send, ChevronLeft, Star, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

const EXAMPLE_EVENTS = {
  study: [
    '考试取得好成绩',
    '掌握了一个难懂的知识点',
    '完成了一个高质量的作业',
    '帮助同学解决了学习问题'
  ],
  work: [
    '成功完成了一个项目',
    '解决了一个技术难题',
    '获得了领导的认可',
    '提出了创新的工作方案'
  ],
  life: [
    '养成了运动的习惯',
    '学会了一道新菜',
    '整理好了个人空间',
    '克服了一个坏习惯'
  ],
  hobby: [
    '学会了一首新歌',
    '完成了一幅画作',
    '掌握了一项运动技能',
    '创作了一篇文章'
  ],
  social: [
    '化解了一个误会',
    '帮助他人解决困难',
    '组织了一次成功的活动',
    '收到了真诚的感谢'
  ]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [events, setEvents] = useState<SuccessEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('study')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkFirstVisit = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 检查用户是否有任何成功事件记录
      const { count } = await supabase
        .from('success_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // 如果是首次访问（没有任何记录），进入引导页
      if (count === 0) {
        router.push('/onboarding/intro')
      } else {
        // 否则直接进入事件记录页
        router.push('/onboarding/events')
      }
    }

    checkFirstVisit()
  }, [router])

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newEvent = {
      content: currentEvent.trim(),
      category: selectedCategory,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('success_events')
      .insert([newEvent])
      .select()
      .single()

    if (!error && data) {
      setEvents(prev => [data, ...prev])
      setCurrentEvent('')
    }

    setIsLoading(false)
  }

  const handleBack = () => {
    router.push('/diary')
  }

  const progress = (events.length / 100) * 100

  return null // 重定向页面不需要渲染内容
}