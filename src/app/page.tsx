'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 已登录，跳转到日记页面
        router.push('/diary')
      } else {
        // 未登录，跳转到登录页面
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router])
  
  // 返回一个加载中的界面，在重定向前显示
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-500">正在加载...</p>
    </div>
  )
}