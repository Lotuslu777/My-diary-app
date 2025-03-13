'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { signUp } from '@/lib/auth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const result = await signUp(email, password)
      if (result.success) {
        setMessage(result.message || '注册邮件已发送，请查收邮件并点击验证链接')
      } else {
        setError('注册失败，请稍后重试')
      }
    } catch {
      setError('注册时发生错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4">
      <Link 
        href="/welcome"
        className="absolute top-8 left-8 text-gray-600 hover:text-primary flex items-center"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        返回
      </Link>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          创建账号
        </h1>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 text-sm text-green-600 bg-green-50 rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入邮箱"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入密码"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          已有账号？
          <Link href="/auth/login" className="text-primary hover:text-primary/80 ml-1">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
} 