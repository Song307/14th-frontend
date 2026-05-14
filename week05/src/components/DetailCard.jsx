function DetailCard({ lion }) {
  return (
    <article className="details-card">
      <h3 className="details-card-name">{lion.name}</h3>
      <div className="details-grid">
        <div className="detail-group">
          <h4 className="detail-label">자기소개</h4>
          <p className="detail-description">{lion.bio}</p>
        </div>
        <div className="detail-group">
          <h4 className="detail-label">조직명</h4>
          <p className="detail-description">{lion.organization}</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-group">
          <h4 className="detail-label">파트</h4>
          <p className="detail-description">{lion.part}</p>
        </div>
        <div className="detail-group">
          <h4 className="detail-label">한 마디</h4>
          <p className="detail-description">{lion.comment}</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-group">
          <h4 className="detail-label">연락처</h4>
          <dl className="detail-contact-list">
            <dt>Email:</dt>
            <dd><a href={`mailto:${lion.email}`}>{lion.email}</a></dd>
            <dt>Phone:</dt>
            <dd><a href={`tel:${lion.phone}`}>{lion.phone}</a></dd>
            <dt>Website:</dt>
            <dd><a href={lion.website} target="_blank" rel="noopener noreferrer">{lion.website}</a></dd>
          </dl>
        </div>
        <div className="detail-group">
          <h4 className="detail-label">관심 기술</h4>
          <ul className="detail-tech-list">
            {lion.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export default DetailCard
