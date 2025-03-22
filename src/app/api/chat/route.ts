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
        messages: body.messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DeepSeek API Error:', errorData)
      return NextResponse.json(
        { error: `聊天API调用失败: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('聊天API代理错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 