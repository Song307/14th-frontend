function ViewOptionsSection() {
  return (
    <div className="controls-row no-border">
      <div className="options-group">
        <label>파트</label>
        <select>
          <option>전체</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Design</option>
        </select>
      </div>
      <div className="options-group">
        <label>정렬</label>
        <select>
          <option>최신추가순</option>
          <option>이름순</option>
        </select>
      </div>
      <div className="options-group">
        <label>검색</label>
        <input type="text" placeholder="이름으로 검색" />
      </div>
    </div>
  )
}

export default ViewOptionsSection
