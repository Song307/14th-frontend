function ControlSection({ lionCount }) {
  return (
    <div className="controls-row">
      <button className="action-btn">아기 사자 추가</button>
      <button className="action-btn">마지막 아기 사자 삭제</button>
      <span className="member-count-text">총 <span>{lionCount}</span>명</span>
    </div>
  )
}

export default ControlSection
