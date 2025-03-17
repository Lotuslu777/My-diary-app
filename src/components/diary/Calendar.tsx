// 日历选择组件
'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const today = new Date()
  
  // 生成周视图日期
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(today.getDate() - 3 + i)
    return date
  })

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        {/* 当前月日显示 */}
        <div className="flex flex-col">
          <span className="text-sm opacity-80">
            {format(selectedDate, 'M月', { locale: zhCN })}
          </span>
          <span className="text-2xl font-bold">
            {format(selectedDate, 'd', { locale: zhCN })}
          </span>
        </div>

        {/* 周视图 */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-2">
            {weekDates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${date.toDateString() === selectedDate.toDateString() 
                    ? 'border-2 border-white' 
                    : 'opacity-60'}`}
              >
                {format(date, 'd')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 