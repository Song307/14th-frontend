function AddFormSection() {
  return (
    <section className="form-section form-section--hidden">
      <h2 className="form-title">아기 사자 추가</h2>
      <form className="add-form">
        <div className="form-row--two-cols">
          <div className="form-group">
            <label>이름</label>
            <input type="text" placeholder="이름을 입력하세요" />
          </div>
          <div className="form-group">
            <label>파트</label>
            <select>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Design</option>
            </select>
          </div>
        </div>

        <div className="form-row--two-cols">
          <div className="form-group">
            <label>관심 기술</label>
            <input type="text" placeholder="관심 기술을 입력하세요" />
          </div>
          <div className="form-group">
            <label>한 줄 소개</label>
            <input type="text" placeholder="한 줄 소개를 입력하세요" />
          </div>
        </div>

        <div className="form-group">
          <label>자기소개</label>
          <textarea placeholder="자기소개를 입력하세요"></textarea>
        </div>

        <div className="form-row--two-cols">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="이메일을 입력하세요" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="전화번호를 입력하세요" />
          </div>
        </div>

        <div className="form-row--two-cols">
          <div className="form-group">
            <label>Website</label>
            <input type="url" placeholder="웹사이트 URL을 입력하세요" />
          </div>
          <div className="form-group">
            <label>한 마디</label>
            <input type="text" placeholder="한 마디를 입력하세요" />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--tertiary">랜덤 값 채우기</button>
          <button type="submit" className="btn btn--primary">추가하기</button>
          <button type="button" className="btn btn--secondary">취소</button>
        </div>
      </form>
    </section>
  )
}

export default AddFormSection
