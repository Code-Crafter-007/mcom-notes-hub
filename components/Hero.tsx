"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "./Hero.css"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="hero">
      <div className="hero-background"></div>
      <div className="container">
        <div className="hero-content">
          <div className={`hero-text ${isVisible ? "fade-in" : ""}`}>
            <h1 className="hero-title">
              Ace Your <span className="highlight">M.Com Exams</span> with Expert Notes
            </h1>
            <p className="hero-subtitle">
              Curated study materials for M.Com EA Group (Rajasthan University). Score high with our comprehensive notes
              and previous year questions.
            </p>
            <div className="hero-buttons">
              <Link href="/notes" className="btn btn-primary">
                Explore Notes
              </Link>
              <Link href="/pyqs" className="btn btn-outline">
                View PYQs
              </Link>
            </div>
          </div>
          <div className={`hero-image ${isVisible ? "slide-in-right" : ""}`}>
            <div className="hero-card">
              <div className="card-icon">📚</div>
              <h3>1000+ Students</h3>
              <p>Already scoring high</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
