import { redirect } from 'next/navigation'

export default function HomePage() {
  //后续需根据登录状态-是重定向到首页还是登录页面
  redirect('/diary')
}