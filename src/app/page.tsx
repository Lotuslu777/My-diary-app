'use client'
import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Plus, Image as ImageIcon, Send, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// 日记项类型定义
interface DiaryItem {
  id: string
  content: string
  imageUrl?: string
  timestamp: Date
  tags: string[]
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [diaryItems, setDiaryItems] = useState<DiaryItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 生成周视图日期
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate)
    date.setDate(selectedDate.getDate() - 3 + i)
    return date
  })

  // 处理日期选择
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setIsDatePickerOpen(false)
  }

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  // 自动识别标签
  const extractTags = (content: string): string[] => {
    // 简单的标签识别逻辑，可以根据需要调整
    const keywords = ['工作', '学习', '运动', '生活', '阅读']
    return keywords.filter(tag => content.includes(tag))
  }

  // 处理发送
  const handleSubmit = () => {
    if (!inputText && !selectedImage) return
    
    const newItem: DiaryItem = {
      id: Date.now().toString(), // 临时ID
      content: inputText,
      imageUrl: imagePreview || undefined,
      timestamp: new Date(),
      tags: extractTags(inputText)
    }
    
    setDiaryItems(prev => [newItem, ...prev])
    
    // 清空输入
    setInputText('')
    setSelectedImage(null)
    setImagePreview(null)
  }

  // 按日期筛选日记
  const filteredDiaryItems = diaryItems.filter(item => 
    format(item.timestamp, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* 顶部日历区域 */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-sm z-10 p-4 shadow-sm">
        <div className="flex items-center space-x-4">
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
      </div>

      {/* 日记列表区域 */}
      <div className="flex-1 px-6 py-4 space-y-6 pb-32">
        {filteredDiaryItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            今天还没有记录哦，来记录一个成功瞬间吧！
          </div>
        ) : (
          filteredDiaryItems.map(item => (
            <div key={item.id} className="relative pl-6 border-l-2 border-primary/30">
              <div className="absolute left-0 w-3 h-3 bg-primary rounded-full -translate-x-[7px]" />
              <div className="mb-2">
                <span className="text-sm text-primary">
                  {format(item.timestamp, 'HH:mm')}
                </span>
                {item.tags.map(tag => (
                  <span key={tag} className="ml-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-700">{item.content}</p>
              {item.imageUrl && (
                <div className="mt-3">
                  <img 
                    src={item.imageUrl} 
                    alt="日记图片" 
                    className="rounded-2xl max-w-[200px] max-h-[200px] object-cover shadow-sm"
                  />
                </div>
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
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
              placeholder="记录一件成功的小事吧"
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {/* 发送按钮 */}
            <button 
              onClick={handleSubmit}
              disabled={!inputText && !selectedImage}
              className={`px-4 py-2 rounded-full ${
                inputText || selectedImage 
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