import SummaryCard from './SummaryCard'

function SummaryCardsSection({ lions }) {
  return (
    <section className="cards-section">
      <h2 className="cards-title">아기 사자 자기소개</h2>
      <div className="cards-grid">
        {lions.map((lion) => (
          <SummaryCard key={lion.id} lion={lion} />
        ))}
      </div>
    </section>
  )
}

export default SummaryCardsSection
