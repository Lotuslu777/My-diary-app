'use client'

export function DiaryList() {
  return (
    <div className="space-y-4 py-4">
      {/* 示例日记项 */}
      <div className="relative pl-8 border-l border-white/20">
        <div className="absolute left-0 w-2 h-2 bg-white rounded-full -translate-x-[5px]" />
        <div className="mb-2">
          <span className="text-sm opacity-60">09:12</span>
          <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">工作</span>
        </div>
        <p className="text-white">今天完成了产品原型设计！</p>
        
      </div>
    </div>
  )
} 