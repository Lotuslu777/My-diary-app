'use client'
import { Plus } from "lucide-react"

export function DiaryInput() {
  return (
    <div className="p-4 flex items-center space-x-4">
      <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
      <input
        type="text"
        placeholder="今天最令你骄傲的一件事是什么？"
        className="flex-1 bg-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
    </div>
  )
} 