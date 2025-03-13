'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/auth'

interface ProfileForm {
  nickname: string
  age: string
  major: string
  mbti: string
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>({
    nickname: '',
    age: '',
    major: '',
    mbti: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await updateProfile(form)
      if (result.success) {
        router.push('/onboarding')
      } else {
        setError('保存失败，请稍后重试')
      }
    } catch {
      setError('保存时发生错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          完善个人资料
        </h1>

        <p className="text-gray-600 text-center mb-8">
          告诉我多一些，可以更懂你哦~
        </p>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              昵称
            </label>
            <input
              type="text"
              required
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入昵称"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年龄
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="选填"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              专业/职业
            </label>
            <input
              type="text"
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="选填"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MBTI 性格类型
            </label>
            <input
              type="text"
              value={form.mbti}
              onChange={(e) => setForm({ ...form, mbti: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="选填"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '保存中...' : '保存并继续'}
          </button>
        </form>
      </div>
    </div>
  )
} 