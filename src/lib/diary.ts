import { supabase } from './supabase'

export interface DiaryItem {
  id: string
  content: string
  diary_date: string
  image_url?: string
  created_at: string
  updated_at: string
  user_id: string
}

// 获取指定日期的日记列表
export async function getDiaryItemsByDate(date: string): Promise<DiaryItem[]> {
  const { data, error } = await supabase
    .from('diary_items')
    .select('*')
    .eq('diary_date', date)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取日记失败:', error)
    return []
  }

  return data || []
}

// 创建新的日记项
export async function createDiaryItem(item: {
  content: string
  diary_date: string
  image_url?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('用户未登录')
    return { success: false, error: new Error('用户未登录') }
  }

  console.log('Current user:', user.id) // 添加日志

  const insertData = {
    ...item,
    user_id: user.id
  }
  console.log('Inserting data:', insertData) // 添加日志

  const { data, error } = await supabase
    .from('diary_items')
    .insert([insertData])
    .select()
    .single()

  if (error) {
    console.error('创建日记失败:', error)
    // 添加更详细的错误信息
    console.log('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    return { success: false, error }
  }

  return { success: true, data }
}

// 上传图片
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('上传图片失败: 用户未登录')
      return null
    }

    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      console.error('文件太大，请选择小于 5MB 的图片')
      return null
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    // 检查文件类型
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      console.error('不支持的文件类型，请选择 jpg、jpeg、png 或 gif 格式的图片')
      return null
    }

    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    console.log('准备上传图片:', {
      path: filePath,
      size: file.size,
      type: file.type
    })

    // 直接尝试上传文件
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('diary-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('上传图片失败:', uploadError)
      return null
    }

    console.log('文件上传成功:', uploadData)

    // 获取公开访问 URL
    const { data } = supabase.storage
      .from('diary-images')
      .getPublicUrl(filePath)

    console.log('上传成功，图片URL:', data.publicUrl)
    return data.publicUrl

  } catch (error) {
    console.error('上传图片过程中发生错误:', error)
    return null
  }
}

// 获取日期范围内的日记列表
export async function getDiaryItems(startDate: string, endDate: string): Promise<DiaryItem[]> {
  const { data, error } = await supabase
    .from('diary_items')
    .select('*')
    .gte('diary_date', startDate)
    .lte('diary_date', endDate)
    .order('diary_date', { ascending: false })

  if (error) {
    console.error('获取日记列表失败:', error)
    return []
  }

  return data || []
}

// 更新日记
export async function updateDiaryItem(
  id: string,
  updates: {
    content?: string
    image_url?: string | null
  }
): Promise<{ success: boolean; error?: any }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('用户未登录')
    return { success: false, error: new Error('用户未登录') }
  }

  // 先检查是否是用户自己的日记
  const { data: diary } = await supabase
    .from('diary_items')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!diary || diary.user_id !== user.id) {
    return { success: false, error: new Error('没有权限编辑此日记') }
  }

  const { error } = await supabase
    .from('diary_items')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('更新日记失败:', error)
    return { success: false, error }
  }

  return { success: true }
}

// 删除日记
export async function deleteDiaryItem(id: string): Promise<{ success: boolean; error?: any }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('用户未登录')
    return { success: false, error: new Error('用户未登录') }
  }

  // 先检查是否是用户自己的日记
  const { data: diary } = await supabase
    .from('diary_items')
    .select('user_id, image_url')
    .eq('id', id)
    .single()

  if (!diary || diary.user_id !== user.id) {
    return { success: false, error: new Error('没有权限删除此日记') }
  }

  // 如果有图片，先删除图片
  if (diary.image_url) {
    const imagePath = diary.image_url.split('/').slice(-2).join('/') // 获取 user_id/filename 格式的路径
    const { error: deleteImageError } = await supabase.storage
      .from('diary-images')
      .remove([imagePath])

    if (deleteImageError) {
      console.error('删除图片失败:', deleteImageError)
      // 继续删除日记条目，即使图片删除失败
    }
  }

  const { error } = await supabase
    .from('diary_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('删除日记失败:', error)
    return { success: false, error }
  }

  return { success: true }
} 