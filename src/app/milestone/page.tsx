'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar, Award, User, Search, ArrowUpDown, Trophy, Sparkles, Flame, BarChart, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getLatestAnalysis, StrengthAnalysis } from '@/lib/ai'
import { getDiaryItems, DiaryItem } from '@/lib/diary'
import { getMilestoneStats, generateUserMilestones, MilestoneStats, UserMilestone } from '@/lib/milestone'

// 定义标签类型与颜色
const tagColors: Record<string, string> = {
  '学习成长': 'bg-blue-100 text-blue-600',
  '工作成就': 'bg-purple-100 text-purple-600',
  '心情': 'bg-pink-100 text-pink-600',
  '喜欢': 'bg-green-100 text-green-600',
  '发型': 'bg-yellow-100 text-yellow-600',
  '帽子': 'bg-red-100 text-red-600',
  '房子': 'bg-indigo-100 text-indigo-600',
  '和平': 'bg-cyan-100 text-cyan-600',
  '继续': 'bg-emerald-100 text-emerald-600',
  '李妈': 'bg-violet-100 text-violet-600',
  '抽签': 'bg-amber-100 text-amber-600',
  '结婚': 'bg-rose-100 text-rose-600',
  // 为未知标签提供默认颜色
  'default': 'bg-gray-100 text-gray-600',
}

// 获取标签的颜色类名
const getTagColorClass = (tag: string | null | undefined) => {
  if (!tag) return tagColors['default']
  return tagColors[tag] || tagColors['default']
}

// 里程碑类型对应的图标
const milestoneIcons: Record<string, React.ReactNode> = {
  weekly: <Calendar className="w-5 h-5 text-blue-500" />,
  monthly: <BarChart className="w-5 h-5 text-purple-500" />,
  yearly: <Trophy className="w-5 h-5 text-amber-500" />,
  achievement: <Star className="w-5 h-5 text-emerald-500" />,
  streak: <Flame className="w-5 h-5 text-red-500" />,
}

export default function MilestonePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'calendar' | 'milestones' | 'about'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [diaryData, setDiaryData] = useState<DiaryItem[]>([])
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null)
  const [stats, setStats] = useState<MilestoneStats | null>(null)
  const [milestones, setMilestones] = useState<UserMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('璟')
  const [userGender, setUserGender] = useState('女')
  const [userDescription, setUserDescription] = useState('职业：web3 创业公司项目管理，Ai专业，23岁。远程工作，同时自己在做自媒体\n\n喜欢读书，深度思考和交流，学习一些新的东西。观察事物的底层逻辑。\n\n愿望是财富自由，环游世界，四处旅居，还有练出马甲线。也正在为这些努力中。')
  
  // 按日期分组的日记数据
  const diaryByDate = diaryData.reduce<Record<string, DiaryItem[]>>((acc, item) => {
    const date = item.diary_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})

  // 日期范围内的日期数组
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (user.user_metadata) {
        setUserName(user.user_metadata.name || '璟')
        setUserGender(user.user_metadata.gender || '女')
        setUserDescription(user.user_metadata.description || '职业：web3 创业公司项目管理，Ai专业，23岁。远程工作，同时自己在做自媒体\n\n喜欢读书，深度思考和交流，学习一些新的东西。观察事物的底层逻辑。\n\n愿望是财富自由，环游世界，四处旅居，还有练出马甲线。也正在为这些努力中。')
      }
      
      setUserId(user.id)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, activeTab])

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      // 获取当月的日记数据
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
      const diaryItems = await getDiaryItems(start, end)
      setDiaryData(diaryItems)

      // 获取分析结果
      const result = await getLatestAnalysis(userId)
      if (result) {
        setAnalysis(result)
      }
      
      // 获取里程碑统计
      const milestoneStats = await getMilestoneStats(userId)
      if (milestoneStats) {
        setStats(milestoneStats)
      }
      
      // 生成里程碑
      const userMilestones = await generateUserMilestones(userId)
      setMilestones(userMilestones)
      
      setIsLoading(false)
    }

    loadData()
  }, [userId, currentMonth])

  const handleBack = () => {
    router.push('/diary')
  }

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
          <h1 className="text-xl font-semibold text-center">画廊</h1>
          <div className="w-6"></div> {/* 空元素用于平衡布局 */}
        </div>
        
        {/* 选项卡导航 */}
        <div className="flex justify-around mt-4">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'calendar' ? 'bg-primary text-white' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4 mr-1" />
            <span>日历</span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'milestones' ? 'bg-primary text-white' : 'text-gray-600'
            }`}
          >
            <Award className="w-4 h-4 mr-1" />
            <span>里程碑</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              activeTab === 'about' ? 'bg-primary text-white' : 'text-gray-600'
            }`}
          >
            <User className="w-4 h-4 mr-1" />
            <span>关于我</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 日历视图 */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* 月份选择器 */}
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-medium">
                {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
              </h2>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 transform rotate-180" />
              </button>
            </div>
            
            {/* 日历网格 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {/* 星期标题 */}
              <div className="grid grid-cols-7 mb-2 text-center text-gray-500 text-sm">
                {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                  <div key={i} className="py-2">{day}</div>
                ))}
              </div>
              
              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-2">
                {/* 填充月初前的空白 */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="aspect-square"></div>
                ))}
                
                {/* 月份日期 */}
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const dayItems = diaryByDate[dateStr] || []
                  const hasItems = dayItems.length > 0
                  
                  return (
                    <div 
                      key={dateStr}
                      className={`relative aspect-square rounded-xl border border-gray-100 flex flex-col items-center justify-center p-1
                                ${hasItems ? 'bg-primary/5' : ''} 
                                hover:border-primary/30 transition-colors cursor-pointer`}
                      onClick={() => router.push(`/diary?date=${dateStr}`)}
                    >
                      <span className={`text-sm ${hasItems ? 'text-primary font-medium' : 'text-gray-600'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* 日记条数标识 */}
                      {hasItems && (
                        <span className="text-xs px-2 py-0.5 mt-1 rounded-full truncate max-w-full bg-primary/10 text-primary">
                          {dayItems.length}条
                        </span>
                      )}
                      
                      {/* 显示条目数 */}
                      {dayItems.length > 1 && (
                        <span className="absolute bottom-1 right-1 text-xs bg-primary text-white w-4 h-4 flex items-center justify-center rounded-full">
                          {dayItems.length}
                        </span>
                      )}
                    </div>
                  )
                })}
                
                {/* 填充月末后的空白 */}
                {Array.from({ length: (7 - endOfMonth(currentMonth).getDay() - 1) % 7 }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="aspect-square"></div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 里程碑视图 */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Award className="w-5 h-5 text-primary mr-2" />
                成长里程碑
              </h3>
              
              {milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无里程碑</p>
                  <p className="text-sm mt-2">记录更多成功经历，解锁里程碑成就！</p>
                </div>
              ) : (
                /* 时间轴 */
                <div className="space-y-6 pl-4 border-l-2 border-primary/20">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="relative">
                      <div className="absolute left-0 w-4 h-4 bg-primary rounded-full -translate-x-[18px]" />
                      <div className="bg-primary/5 p-4 rounded-xl ml-2">
                        <div className="flex items-center mb-1">
                          {milestoneIcons[milestone.type] || <Sparkles className="w-5 h-5 text-primary" />}
                          <span className="text-sm text-gray-500 ml-2">{milestone.title}</span>
                        </div>
                        <p className="text-base font-medium">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 成就汇总 */}
            {stats && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-3">成就汇总</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1 p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm text-gray-600">本周记录</span>
                    <span className="text-2xl font-bold text-blue-500">{stats.weeklyCount}条</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-3 bg-purple-50 rounded-xl">
                    <span className="text-sm text-gray-600">本月记录</span>
                    <span className="text-2xl font-bold text-purple-500">{stats.monthlyCount}条</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-3 bg-amber-50 rounded-xl">
                    <span className="text-sm text-gray-600">累计记录</span>
                    <span className="text-2xl font-bold text-amber-500">{stats.totalCount}条</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-3 bg-red-50 rounded-xl">
                    <span className="text-sm text-gray-600">连续坚持</span>
                    <span className="text-2xl font-bold text-red-500">{stats.streakDays}天</span>
                  </div>
                </div>
                
                {stats.mostActiveDay && stats.mostActiveDayCount && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">最活跃日</span>
                      <span className="text-lg font-bold text-emerald-500">{stats.mostActiveDay}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 关于我 */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* 用户信息 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="w-5 h-5 text-primary mr-2" />
                关于你
              </h3>
              
              {/* 基本资料展示 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-cyan-400">姓名</label>
                    <div className="w-full p-2 border rounded-lg text-gray-700 bg-gray-50">
                      {userName}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-cyan-400">性别</label>
                    <div className="w-full p-2 border rounded-lg text-gray-700 bg-gray-50">
                      {userGender}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm text-cyan-400">自我描述</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="p-4 bg-white border rounded-lg">
                      {userDescription.split('\n\n').map((paragraph, index) => (
                        <p key={index} className={`text-sm text-gray-700 ${index > 0 ? 'mt-2' : ''}`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => router.push('/profile')}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm"
                  >
                    编辑资料
                  </button>
                </div>
              </div>
            </div>
            
            {/* 优势分析 */}
            {analysis && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Award className="w-5 h-5 text-primary mr-2" />
                  我的优势
                </h3>
                <div className="space-y-4">
                  {analysis.key_strengths?.map((strength, index) => (
                    <div
                      key={index}
                      className="p-4 bg-primary/5 rounded-xl"
                    >
                      {strength}
                    </div>
                  ))}
                  
                  {(!analysis.key_strengths || analysis.key_strengths.length === 0) && (
                    <p className="text-center text-gray-600 py-4">
                      记录更多成功事件，解锁你的优势分析
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* 分类统计 */}
            {analysis && analysis.categories && Object.keys(analysis.categories).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-primary mr-2" />
                  我的关注点
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analysis.categories).map(([category, count]) => (
                    <div
                      key={category}
                      className={`p-4 rounded-xl flex flex-col items-center ${getTagColorClass(category)}`}
                    >
                      <span className="text-2xl font-medium">{count}</span>
                      <span className="text-sm">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 更多分析入口 */}
            <div className="p-6 flex justify-center">
              <button 
                onClick={() => router.push('/analysis')}
                className="px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                查看完整分析
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 