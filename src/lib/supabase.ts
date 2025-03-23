import { createClient } from '@supabase/supabase-js'

// 获取环境变量或使用默认值（仅用于构建）
// 注意：这里添加了默认值仅用于防止构建失败，实际使用时需要在 Vercel 设置正确的环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-for-build.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build'

// 环境变量检查，在运行时显示警告
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined') { // 仅在浏览器环境中执行
    console.warn('警告: Supabase 环境变量未设置。请确保在 Vercel 环境变量中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。')
  }
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
}) 