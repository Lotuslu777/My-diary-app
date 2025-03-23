'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, User, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // 假设从用户元数据中加载数据
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // 尝试从用户元数据中加载个人信息
      if (user.user_metadata) {
        setName(user.user_metadata.name || '璟')
        setGender(user.user_metadata.gender || '女')
        setDescription(user.user_metadata.description || '职业：web3 创业公司项目管理，Ai专业，23岁。远程工作，同时自己在做自媒体\n\n喜欢读书，深度思考和交流，学习一些新的东西。观察事物的底层逻辑。\n\n愿望是财富自由，环游世界，四处旅居，还有练出马甲线。也正在为这些努力中。')
      }
      
      setIsLoading(false)
    }
    
    loadUserProfile()
  }, [router])
  
  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // 保存到用户元数据
      console.log('正在保存用户数据:', { name, gender, description })
      
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          name,
          gender,
          description
        }
      })
      
      if (error) {
        console.error('更新个人资料失败:', error)
        alert('更新个人资料失败')
      } else {
        console.log('保存成功，更新后的用户数据:', data)
        alert('保存成功！')
        router.push('/milestone')
      }
    } catch (error) {
      console.error('更新个人资料错误:', error)
      alert('更新个人资料错误')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleBack = () => {
    router.push('/milestone')
  }
  
  return (
    <div className="min-h-screen bg-secondary">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-sm z-10 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            返回
          </button>
          <h1 className="text-xl font-semibold text-center">编辑资料</h1>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <Save className="w-5 h-5 mr-1" />
            保存
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <User className="w-5 h-5 text-primary mr-2" />
            个人资料
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-cyan-400">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="请输入姓名"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-cyan-400">性别</label>
                <input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="请输入性别"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-cyan-400">自我描述</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">
                  简要描述下自己，AI 朋友会更懂你哦。
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  比如：你的职业、学习工作状态、兴趣爱好、喜欢的/讨厌的事物、愿望和梦想等等。
                </p>
                
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 border rounded-lg text-gray-700 focus:ring-2 focus:ring-primary/30 focus:outline-none min-h-[200px]"
                  placeholder="请输入自我描述"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
