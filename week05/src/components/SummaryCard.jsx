function SummaryCard({ lion }) {
  return (
    <article className={`profile-summary-card ${lion.myCard ? 'profile-summary-card--my-card' : ''}`}>
      <div className="profile-image-container">
        <img src={lion.imageUrl} alt={lion.name} className="profile-summary-image" />
        <span className="profile-badge">{lion.badge}</span>
      </div>
      <div className="profile-summary-content">
        <h3 className="profile-summary-name">{lion.name}</h3>
        <p className="profile-summary-part">{lion.part}</p>
        <p className="profile-summary-intro">{lion.intro}</p>
      </div>
    </article>
  )
}

export default SummaryCard
