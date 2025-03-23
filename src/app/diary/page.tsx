//日记主页面
'use client'
import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Plus, Image as ImageIcon, Send, Calendar, Edit2, Trash2, X, Check, Sparkles, CalendarDays, Star, MessageSquare } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { getDiaryItemsByDate, createDiaryItem, uploadImage, updateDiaryItem, deleteDiaryItem, DiaryItem } from '@/lib/diary'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DiaryPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [diaryItems, setDiaryItems] = useState<DiaryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  // 生成周视图日期
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate)
    date.setDate(selectedDate.getDate() - 3 + i)
    return date
  })

  // 加载指定日期的日记
  useEffect(() => {
    const loadDiaryItems = async () => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const items = await getDiaryItemsByDate(formattedDate)
      setDiaryItems(items)
    }
    loadDiaryItems()
  }, [selectedDate])

  // 处理日期选择
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setIsDatePickerOpen(false)
  }

  // 处理图片选择
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  // 处理发送
  const handleSubmit = async () => {
    if (!inputText && !selectedImage) return
    setIsLoading(true)
    
    try {
      let imageUrl = null
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }
      
      const result = await createDiaryItem({
        content: inputText,
        diary_date: format(selectedDate, 'yyyy-MM-dd'),
        image_url: imageUrl || undefined
      })
      
      if (result.success) {
        // 重新加载日记列表
        const items = await getDiaryItemsByDate(format(selectedDate, 'yyyy-MM-dd'))
        setDiaryItems(items)
        
        // 清空输入
        setInputText('')
        setSelectedImage(null)
        setImagePreview(null)
      }
    } catch (error) {
      console.error('保存日记失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理编辑
  const handleEdit = (item: DiaryItem) => {
    setEditingId(item.id)
    setEditText(item.content)
  }

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  // 处理保存编辑
  const handleSaveEdit = async (id: string) => {
    setIsLoading(true)
    try {
      const result = await updateDiaryItem(id, { content: editText })
      if (result.success) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd')
        const items = await getDiaryItemsByDate(formattedDate)
        setDiaryItems(items)
        setEditingId(null)
        setEditText('')
      }
    } catch (error) {
      console.error('保存编辑失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理删除
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条日记吗？')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteDiaryItem(id)
      if (result.success) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd')
        const items = await getDiaryItemsByDate(formattedDate)
        setDiaryItems(items)
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理跳转到100件成功小事页面
  const handleGoToSuccessEvents = () => {
    router.push('/onboarding/events')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold text-gray-800">我的日记</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/chat')}
              className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI助手</span>
            </button>
            <button
              onClick={() => router.push('/milestone')}
              className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>画廊</span>
            </button>
            <button
              onClick={() => router.push('/onboarding/events')}
              className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>我的成功</span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-4 flex items-center">
          {/* 当前月日显示 */}
          <div 
            className="flex flex-col cursor-pointer hover:bg-primary/10 p-2 rounded-xl transition-colors relative"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <span className="text-sm text-primary/70 flex items-center gap-1">
              {format(selectedDate, 'M月', { locale: zhCN })}
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-3xl font-bold text-primary">
              {format(selectedDate, 'd', { locale: zhCN })}
            </span>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    if (date) handleDateChange(date)
                  }}
                  inline
                  locale={zhCN}
                  dateFormat="yyyy年MM月dd日"
                />
              </div>
            )}
          </div>

          {/* 周视图 */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-2">
              {weekDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${date.toDateString() === selectedDate.toDateString() 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-500 hover:bg-primary/10'}`}
                >
                  {format(date, 'd')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 日记列表区域 */}
      <div className="flex-1 px-6 py-4 space-y-6 pb-32">
        {diaryItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            今天还没有记录哦，来记录一个成功瞬间吧！
          </div>
        ) : (
          diaryItems.map(item => (
            <div key={item.id} className="relative pl-6 border-l-2 border-primary/30">
              <div className="absolute left-0 w-3 h-3 bg-primary rounded-full -translate-x-[7px]" />
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-primary">
                  {format(new Date(item.created_at), 'HH:mm')}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                    disabled={isLoading}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm rounded-full hover:bg-gray-100 transition-colors flex items-center"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      取消
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-3 py-1 text-sm text-primary rounded-full hover:bg-primary/10 transition-colors flex items-center"
                      disabled={isLoading}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700">{item.content}</p>
                  {item.image_url && (
                    <div className="mt-3">
                      <img 
                        src={item.image_url} 
                        alt="日记图片" 
                        className="rounded-2xl max-w-[200px] max-h-[200px] object-cover shadow-sm"
                        onError={(e) => {
                          console.error('图片加载失败:', item.image_url)
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* 底部输入区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md p-4 shadow-lg">
        {/* 图片预览区域 */}
        {imagePreview && (
          <div className="mb-4 relative inline-block ml-6">
            <img 
              src={imagePreview} 
              alt="预览" 
              className="w-20 h-20 object-cover rounded-2xl shadow-sm"
            />
            <button 
              onClick={() => {
                setSelectedImage(null)
                setImagePreview(null)
              }}
              className="absolute -top-2 -right-2 bg-primary w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors shadow-sm"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-4 px-2">
          {/* 图片上传按钮 */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            disabled={isLoading}
          >
            {selectedImage ? 
              <ImageIcon className="w-6 h-6 text-primary" /> : 
              <Plus className="w-6 h-6 text-primary" />
            }
          </button>

          {/* 文本输入框 */}
          <div className="flex-1 flex items-center bg-primary/5 rounded-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSubmit()
                }
              }}
              placeholder="记录一件成功的小事吧"
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-gray-700 placeholder-gray-400"
              disabled={isLoading}
            />
            {/* 发送按钮 */}
            <button 
              onClick={handleSubmit}
              disabled={(!inputText && !selectedImage) || isLoading}
              className={`px-4 py-2 rounded-full ${
                (inputText || selectedImage) && !isLoading
                  ? 'text-primary hover:bg-primary/10' 
                  : 'text-gray-300'
              } transition-colors`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}