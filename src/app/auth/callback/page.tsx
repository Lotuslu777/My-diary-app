'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // 邮箱验证后直接跳转到登录页
    router.push('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">邮箱验证成功</div>
        <div className="text-gray-600">正在跳转到登录页面...</div>
      </div>
    </div>
  )
} 