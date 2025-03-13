import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  nickname: string
  age?: string
  major?: string
  mbti?: string
}

// 注册
export async function signUp(email: string, password: string) {
  try {
    // 创建认证用户
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) throw authError

    return { 
      success: true, 
      message: '注册邮件已发送，请查收邮件并点击验证链接'
    }
  } catch (error) {
    console.error('注册失败:', error)
    return { success: false, error }
  }
}

// 更新用户资料
export async function updateProfile(profile: Omit<UserProfile, 'id' | 'email'>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          email: user.email,
          ...profile
        }
      ])

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error('更新资料失败:', error)
    return { success: false, error }
  }
}

// 登录
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    console.error('登录失败:', error)
    return { success: false, error }
  }
}

// 登出
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('登出失败:', error)
    return { success: false, error }
  }
}

// 获取当前用户
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 获取用户资料
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 检查是否已登录
export async function checkAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch {
    return false
  }
}