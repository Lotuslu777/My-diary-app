import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, differenceInWeeks, differenceInMonths, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { DiaryItem, getDiaryItems } from './diary'
import { getLatestAnalysis, StrengthAnalysis } from './ai'
import { supabase } from './supabase'

export interface MilestoneStats {
  weeklyCount: number
  monthlyCount: number
  totalCount: number
  streakDays: number
  mostActiveCategory?: string
  mostActiveCategoryCount?: number
  monthlyAverage: number
  mostActiveDay?: string
  mostActiveDayCount?: number
}

export interface UserMilestone {
  id: string
  title: string
  description: string
  date: string
  type: 'weekly' | 'monthly' | 'yearly' | 'achievement' | 'streak'
  icon?: string
}

// 获取用户的里程碑统计数据
export async function getMilestoneStats(userId: string): Promise<MilestoneStats | null> {
  try {
    const now = new Date()
    
    // 获取本周、本月和全部的日记数据
    const [weeklyDiaries, monthlyDiaries, allDiaries, analysis] = await Promise.all([
      getDiaryItems(
        format(startOfWeek(now, { locale: zhCN }), 'yyyy-MM-dd'),
        format(endOfWeek(now, { locale: zhCN }), 'yyyy-MM-dd')
      ),
      getDiaryItems(
        format(startOfMonth(now), 'yyyy-MM-dd'),
        format(endOfMonth(now), 'yyyy-MM-dd')
      ),
      getDiaryItems(
        '2000-01-01', // 一个足够早的日期
        format(now, 'yyyy-MM-dd')
      ),
      getLatestAnalysis(userId)
    ])
    
    if (allDiaries.length === 0) {
      return {
        weeklyCount: 0,
        monthlyCount: 0,
        totalCount: 0,
        streakDays: 0,
        monthlyAverage: 0
      }
    }
    
    // 计算连续记录天数
    const streakDays = calculateStreakDays(allDiaries)
    
    // 分类统计
    let mostActiveCategory: string | undefined
    let mostActiveCategoryCount: number | undefined
    
    if (analysis?.categories && Object.keys(analysis.categories).length > 0) {
      const categories = Object.entries(analysis.categories)
        .sort((a, b) => b[1] - a[1])
      
      if (categories.length > 0) {
        mostActiveCategory = categories[0][0]
        mostActiveCategoryCount = categories[0][1]
      }
    }
    
    // 计算月平均记录数
    const oldestDiary = allDiaries[allDiaries.length - 1]
    const oldestDate = new Date(oldestDiary.created_at)
    const monthsActive = Math.max(1, differenceInMonths(now, oldestDate) + 1)
    const monthlyAverage = parseFloat((allDiaries.length / monthsActive).toFixed(1))
    
    // 计算最活跃日
    const dayCount: Record<string, number> = {}
    allDiaries.forEach(diary => {
      const date = new Date(diary.created_at)
      const dayName = format(date, 'EEEE', { locale: zhCN })
      dayCount[dayName] = (dayCount[dayName] || 0) + 1
    })
    
    let mostActiveDay: string | undefined
    let mostActiveDayCount = 0
    
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > mostActiveDayCount) {
        mostActiveDay = day
        mostActiveDayCount = count
      }
    })
    
    return {
      weeklyCount: weeklyDiaries.length,
      monthlyCount: monthlyDiaries.length,
      totalCount: allDiaries.length,
      streakDays,
      mostActiveCategory,
      mostActiveCategoryCount,
      monthlyAverage,
      mostActiveDay,
      mostActiveDayCount
    }
  } catch (error) {
    console.error('获取里程碑统计失败:', error)
    return null
  }
}

// 计算连续记录天数
function calculateStreakDays(diaries: DiaryItem[]): number {
  if (diaries.length === 0) return 0
  
  // 按日期分组
  const diaryByDate: Record<string, DiaryItem[]> = {}
  diaries.forEach(diary => {
    const date = diary.diary_date
    if (!diaryByDate[date]) {
      diaryByDate[date] = []
    }
    diaryByDate[date].push(diary)
  })
  
  // 获取所有有记录的日期并排序
  const datesWithEntries = Object.keys(diaryByDate).sort().reverse()
  if (datesWithEntries.length === 0) return 0
  
  // 检查最新记录是否是今天的
  const today = format(new Date(), 'yyyy-MM-dd')
  const latestDate = datesWithEntries[0]
  
  // 如果最新记录不是今天的，看看是不是昨天的
  if (latestDate !== today) {
    const latestDateObj = new Date(latestDate)
    const dayDiff = differenceInDays(new Date(), latestDateObj)
    if (dayDiff > 1) return 0 // 如果超过1天没记录，连续记录中断
  }
  
  // 计算连续记录天数
  let streakDays = 1
  for (let i = 0; i < datesWithEntries.length - 1; i++) {
    const currentDate = new Date(datesWithEntries[i])
    const nextDate = new Date(datesWithEntries[i + 1])
    
    // 如果两个日期相差超过1天，则连续记录中断
    if (differenceInDays(currentDate, nextDate) > 1) {
      break
    }
    
    streakDays++
  }
  
  return streakDays
}

// 生成用户里程碑
export async function generateUserMilestones(userId: string): Promise<UserMilestone[]> {
  try {
    const stats = await getMilestoneStats(userId)
    if (!stats) return []
    
    const milestones: UserMilestone[] = []
    const now = new Date()
    
    // 添加周度里程碑
    if (stats.weeklyCount >= 3) {
      milestones.push({
        id: `weekly-${format(now, 'yyyy-ww')}`,
        title: '本周记录',
        description: `本周已记录${stats.weeklyCount}条日记，坚持！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'weekly'
      })
    }
    
    // 添加月度里程碑
    if (stats.monthlyCount >= 10) {
      milestones.push({
        id: `monthly-${format(now, 'yyyy-MM')}`,
        title: '月度坚持',
        description: `本月已记录${stats.monthlyCount}条成就，继续加油！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'monthly'
      })
    }
    
    // 添加连续记录里程碑
    if (stats.streakDays >= 3) {
      milestones.push({
        id: `streak-${stats.streakDays}`,
        title: '连续记录',
        description: `已连续记录${stats.streakDays}天，习惯养成中！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'streak'
      })
    }
    
    // 添加分类里程碑
    if (stats.mostActiveCategory && stats.mostActiveCategoryCount && stats.mostActiveCategoryCount >= 5) {
      milestones.push({
        id: `category-${stats.mostActiveCategory}`,
        title: '擅长领域',
        description: `「${stats.mostActiveCategory}」类别记录最多，共${stats.mostActiveCategoryCount}条！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'achievement'
      })
    }
    
    // 添加最活跃日里程碑
    if (stats.mostActiveDay && stats.mostActiveDayCount && stats.mostActiveDayCount >= 5) {
      milestones.push({
        id: `active-day`,
        title: '最活跃日',
        description: `${stats.mostActiveDay}是你记录最活跃的一天，共${stats.mostActiveDayCount}条记录！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'achievement'
      })
    }
    
    // 添加累计里程碑
    if (stats.totalCount >= 10) {
      milestones.push({
        id: `total-${Math.floor(stats.totalCount / 10) * 10}`,
        title: '成就累积',
        description: `已累计记录${stats.totalCount}条成就，持续进步中！`,
        date: format(now, 'yyyy-MM-dd'),
        type: 'achievement'
      })
    }
    
    return milestones
  } catch (error) {
    console.error('生成里程碑失败:', error)
    return []
  }
} 