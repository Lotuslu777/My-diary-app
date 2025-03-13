// # 欢迎页面路由

'use client'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Heart } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
          好运积累：记录你的成功时刻，看见你的优势
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          通过记录日常的成功小事，发现自我优势，积累自信，实现梦想。
        </p>
        <Link 
          href="/auth/register" 
          className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
        >
          立即开始
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">发现优势</h3>
            <p className="text-gray-600">
              记录每一个成功瞬间，发现自己独特的优势和能力。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">积累自信</h3>
            <p className="text-gray-600">
              每一个小成就都是自信的积累，让你在面对挑战时更有力量。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">实现梦想</h3>
            <p className="text-gray-600">
              从小事做起，一步步朝着梦想前进，见证自己的成长。
            </p>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="text-center pb-20">
        <p className="text-gray-600 mb-4">已经有账号了？</p>
        <Link 
          href="/auth/login" 
          className="text-primary hover:text-primary/80 font-medium"
        >
          立即登录
        </Link>
      </div>
    </div>
  )
}
