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

// 聊天回复接口
export interface ChatResponse {
  message: string
  error?: string
}

// AI 聊天功能 - 基于用户历史记录鼓励用户
export async function getChatResponse(userId: string, userMessage: string): Promise<ChatResponse> {
  try {
    // 获取用户的成功事件和分析结果
    const [events, analysis] = await Promise.all([
      getUserRecentEvents(userId),
      getLatestAnalysis(userId)
    ])

    // 构建系统提示和上下文
    const systemPrompt = `你是用户的朋友和成长伙伴，语气温暖自然，富有同理心。你的目标是：

帮助用户面对当前的挑战，像一个亲密的朋友那样支持他们。请按照以下自然的对话流程来回应：

首先，真诚理解用户当前的感受，用温暖的语气表达共情。

接着，自然地引用用户过去的成功经历（具体提及1-2个相关事例），就像你们共同经历过似的，提醒他们自己曾经的成就。

然后，友善地指出你看到的用户优势，并解释为什么这些优势在当前情况下会有帮助，语气亲切，如同老朋友间的鼓励。

最后，给予温暖而具体的建议和支持，像朋友间的聊天自然结束，不要使用说教的语气。

重要的是保持自然流畅的对话感，不要使用明显的分段标记或编号，避免过于公式化的语言。使用日常对话中会有的语气词、转折词，让整个回复像是朋友间真实的对话。

如果用户的历史记录不足（少于10条或找不到相关记录），请调整为：

首先，以朋友的口吻表达理解和支持。

然后，自然地提及记录成功经历的价值，就像朋友间的建议那样，而不是教导。

接着，基于用户当前的问题，给予一个贴心的、具体的小建议。

最后，用鼓励的话自然地结束对话，表达你对他们的信心。

始终保持自然、温暖、真诚的语气，像真正的朋友那样交流，避免机械化或过于专业的表达方式。不要使用空洞的鼓励，保持真实和具体。`

    // 准备用户历史记录和分析上下文
    let contextContent = ""
    const hasEnoughRecords = events.length >= 10
    
    if (events.length > 0) {
      contextContent += "用户的成功事件记录:\n"
      events.forEach((event, i) => {
        contextContent += `${i+1}. ${event.content} (${event.category || '未分类'})\n`
      })
      contextContent += `\n记录总数: ${events.length} 条\n`
    } else {
      contextContent += "用户尚未记录任何成功事件。\n"
    }
    
    if (analysis) {
      contextContent += "\n用户的优势分析:\n"
      if (analysis.key_strengths && analysis.key_strengths.length > 0) {
        contextContent += "核心优势: " + analysis.key_strengths.join(", ") + "\n"
      }
      if (analysis.career_suggestions && analysis.career_suggestions.length > 0) {
        contextContent += "适合方向: " + analysis.career_suggestions.join(", ") + "\n"
      }
      if (analysis.analysis_text) {
        contextContent += "详细分析: " + analysis.analysis_text.substring(0, 500) + "...\n"
      }
    }

    // 提示 AI 认真判断相关性
    const relevanceInstructions = `
补充说明：在回复时，请注意找出用户历史记录中与当前话题相关的内容：

- 即使有很多记录，如果没有与当前问题相关的内容，请采用更通用的支持方式，但仍保持朋友间交谈的自然语气。
  
- 尝试找出间接相关的经历，比如用户在学习中展现的毅力可能与工作中的挑战相关，因为这反映了他们面对困难的态度。

- 整体上，让对话自然流畅，像是两个朋友在咖啡厅里聊天时会有的真实互动。
`

    // 调用我们的代理 API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt + relevanceInstructions },
          { 
            role: "user", 
            content: `嗨，这些是我过去的一些经历和成就，希望能帮你更好地了解我：\n\n${contextContent}\n\n${hasEnoughRecords ? '希望你能根据这些记录中与我当前问题相关的部分来给我一些建议。' : '我才刚开始记录我的成功经历，希望你能给我一些通用但有用的建议。'}`
          },
          { 
            role: "assistant", 
            content: hasEnoughRecords 
              ? "嗨！我看了你分享的经历，真的很棒。每次看到你的成长和成就都很开心。有什么最近困扰你的事情吗？或者有什么想聊的？" 
              : "嗨！很高兴你开始记录自己的成功经历了，这是认识自己的好方法。有什么我能帮到你的吗？无论是什么困扰或想法，都可以和我分享。"
          },
          { role: "user", content: userMessage }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`AI 聊天响应错误: ${response.status}`)
    }

    const aiResponse = await response.json()
    return {
      message: aiResponse.choices[0]?.message?.content || "抱歉，我现在无法生成回复。"
    }
  } catch (error) {
    console.error('AI 聊天错误:', error)
    return {
      message: "抱歉，出现了一点技术问题，请稍后再试。",
      error: String(error)
    }
  }
}

// 获取用户的最近成功事件记录
async function getUserRecentEvents(userId: string, limit = 20): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('success_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return data || []
  } catch (error) {
    console.error('获取用户事件失败:', error)
    return []
  }
} 

