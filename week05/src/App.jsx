import React from 'react'
import './styles/index.css'
import { lions } from './data/lions'
import ControlSection from './components/ControlSection'
import ViewOptionsSection from './components/ViewOptionsSection'
import AddFormSection from './components/AddFormSection'
import SummaryCardsSection from './components/SummaryCardsSection'
import DetailsSection from './components/DetailsSection'

function App() {
  return (
    <div className="container">
      <div className="dashboard-controls">
        <ControlSection lionCount={lions.length} />
        <AsyncControlSection />
        <ViewOptionsSection />
      </div>
      <AddFormSection />
      <SummaryCardsSection lions={lions} />
      <DetailsSection lions={lions} />
    </div>
  )
}

function AsyncControlSection() {
  return (
    <div className="controls-row">
      <button className="action-btn">랜덤 1명 추가</button>
      <button className="action-btn">랜덤 5명 추가</button>
      <button className="action-btn">전체 새로고침</button>
      <span className="status-text">준비 완료</span>
    </div>
  )
}

export default App
