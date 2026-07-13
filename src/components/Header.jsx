export default function Header({ viewYear, viewMonth, onPrevMonth, onNextMonth }) {
  return (
    <div className="header">
      <div>
        <h1>アポ獲得トラッカー</h1>
        <div className="sub">新卒アポ獲得管理 / 個人目標は担当者ごとに設定</div>
      </div>
      <div className="month-nav">
        <button className="nav-btn" aria-label="前月" onClick={onPrevMonth}>
          ‹
        </button>
        <span className="month-nav-label">
          {viewYear}年{viewMonth}月
        </span>
        <button className="nav-btn" aria-label="翌月" onClick={onNextMonth}>
          ›
        </button>
      </div>
    </div>
  )
}
