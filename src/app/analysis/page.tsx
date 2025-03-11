// 数据分析页面
export default function AnalysisPage() {
    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">你的成长画像</h1>
        
        {/* 关键词云 */}
        <section className="bg-white/10 rounded-lg p-4">
          <h2 className="text-lg mb-4">优势关键词</h2>
          {/* <KeywordCloud /> */}
        </section>
  
        {/* 趋势分析 */}
        <section className="bg-white/10 rounded-lg p-4">
          <h2 className="text-lg mb-4">成长趋势</h2>
          {/* <TrendChart /> */}
        </section>
  
        {/* AI 洞察 */}
        <section className="bg-white/10 rounded-lg p-4">
          <h2 className="text-lg mb-4">AI 洞察</h2>
          {/* <AIInsights /> */}
        </section>
      </div>
    )
  }