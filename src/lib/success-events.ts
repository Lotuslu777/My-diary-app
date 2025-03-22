import { supabase } from './supabase'

export interface SuccessEvent {
  id: string
  content: string
  category?: string
  created_at: string
  user_id: string
}

// 获取用户的所有成功事件
export async function getUserSuccessEvents(userId: string): Promise<SuccessEvent[]> {
  try {
    const { data, error } = await supabase
      .from('success_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取成功事件失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取成功事件失败:', error)
    return []
  }
}

// 添加新的成功事件
export async function addSuccessEvent(
  userId: string, 
  content: string, 
  category?: string
): Promise<SuccessEvent | null> {
  try {
    const { data, error } = await supabase
      .from('success_events')
      .insert([{
        content,
        category,
        user_id: userId
      }])
      .select()
      .single()

    if (error) {
      console.error('添加成功事件失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('添加成功事件失败:', error)
    return null
  }
}

// 更新成功事件
export async function updateSuccessEvent(
  eventId: string,
  userId: string,
  updates: { content?: string; category?: string | null }
): Promise<SuccessEvent | null> {
  try {
    // 首先检查事件是否属于该用户
    const { data: event } = await supabase
      .from('success_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()

    if (!event) {
      console.error('无权更新此成功事件')
      return null
    }

    const { data, error } = await supabase
      .from('success_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('更新成功事件失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('更新成功事件失败:', error)
    return null
  }
}

// 删除成功事件
export async function deleteSuccessEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  try {
    // 首先检查事件是否属于该用户
    const { data: event } = await supabase
      .from('success_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()

    if (!event) {
      console.error('无权删除此成功事件')
      return false
    }

    const { error } = await supabase
      .from('success_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('删除成功事件失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('删除成功事件失败:', error)
    return false
  }
}