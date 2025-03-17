import { supabase } from './supabase'

// DeepSeek API 配置
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.ai/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

// 检查API密钥是否配置
if (!DEEPSEEK_API_KEY) {
  console.error('DeepSeek API Key not configured')
}

export interface StrengthAnalysis {
  id?: string
  user_id: string
  analysis_text: string
  created_at?: string
  categories?: Record<string, number>
  key_strengths?: string[]
  career_suggestions?: string[]
}

// 分析用户的成功事件
export async function analyzeSuccessEvents(userId: string): Promise<StrengthAnalysis | null> {
  try {
    // 获取用户的所有成功事件
    const { data: events } = await supabase
      .from('success_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!events || events.length === 0) {
      return null
    }

    // 根据数据量调整分析深度
    const analysisType = events.length >= 100 ? '完整' : 
                        events.length >= 50 ? '阶段性' : 
                        '初步'

    // 准备提示词
    const prompt = `作为一位职业发展顾问，请${analysisType}分析以下${events.length}条成功经历：

${events.map(event => `- ${event.content} (类别: ${event.category || '未分类'})`).join('\n')}

${events.length >= 100 ? `
请提供详尽的分析：
1. 总结这些经历反映出的关键优势（4-6个），并详细说明每个优势的具体表现
2. 基于这些优势，推荐3-4个最适合的职业发展方向，并解释为什么适合
3. 对这些成功经历进行多维度分类统计，发现规律
4. 结合所有分析，给出未来发展建议` : 
events.length >= 50 ? `
请提供以下分析：
1. 总结这些经历反映出的关键优势（3-5个）
2. 基于这些优势，推荐2-3个适合的职业发展方向
3. 对这些成功经历按领域进行分类统计` : `
请提供初步分析：
1. 总结这些经历反映出的主要优势（2-3个）
2. 基于目前的观察，建议可以关注的发展方向（1-2个）
3. 对已有经历进行简单分类`}

请用中文回答，采用以下JSON格式：
{
  "key_strengths": ["优势1", "优势2", ...],
  "career_suggestions": ["职业方向1", "职业方向2", ...],
  "categories": {"领域1": 数量, "领域2": 数量, ...},
  "analysis_text": "整体分析文本"
}`

    // 调用我们的代理 API
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: events.length >= 100 ? 0.5 : 0.7,
        max_tokens: 2000
      })
    }).catch(error => {
      console.error('网络请求失败:', error)
      throw new Error(`网络请求失败: ${error.message}`)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API 调用失败:', errorData)
      throw new Error(`API 调用失败: ${response.status}`)
    }

    const aiResponse = await response.json()
    let analysis
    try {
      analysis = typeof aiResponse.choices[0].message.content === 'string' 
        ? JSON.parse(aiResponse.choices[0].message.content)
        : aiResponse.choices[0].message.content
    } catch (error) {
      console.error('解析AI响应失败:', error)
      throw new Error('AI响应格式错误')
    }

    // 保存分析结果到数据库
    const { data: savedAnalysis, error } = await supabase
      .from('strength_analysis')
      .insert([{
        user_id: userId,
        ...analysis
      }])
      .select()
      .single()

    if (error) {
      console.error('保存分析结果失败:', error)
      return null
    }

    return savedAnalysis
  } catch (error) {
    console.error('分析失败:', error)
    return null
  }
}

// 获取最新的分析结果
export async function getLatestAnalysis(userId: string): Promise<StrengthAnalysis | null> {
  try {
    const { data } = await supabase
      .from('strength_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return data
  } catch (error) {
    console.error('获取分析结果失败:', error)
    return null
  }
} 

