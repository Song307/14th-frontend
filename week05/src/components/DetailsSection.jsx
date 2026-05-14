import DetailCard from './DetailCard'

function DetailsSection({ lions }) {
  return (
    <section className="details-section">
      <h2 className="details-title">상세 정보</h2>
      {lions.map((lion) => (
        <DetailCard key={lion.id} lion={lion} />
      ))}
    </section>
  )
}

export default DetailsSection
