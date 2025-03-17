import { NextResponse } from 'next/server'

// DeepSeek API 配置
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API Key not configured' },
        { status: 500 }
      )
    }

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: "你是一位专业的职业发展顾问，需要根据用户的成功经历分析其核心优势并提供职业建议"
          },
          ...body.messages
        ],
        stream: false,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek API Error:', errorData)
      return NextResponse.json(
        { error: `API 调用失败: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API 代理错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}