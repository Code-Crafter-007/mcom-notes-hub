"use client"

import { useEffect, useState } from "react"
import "./WhyUseNotes.css"

const features = [
  {
    icon: "📖",
    title: "Updated Syllabus",
    description: "All notes are aligned with the latest M.Com EA Group syllabus",
  },
  {
    icon: "⚡",
    title: "Easy to Read",
    description: "Well-structured content with clear explanations and examples",
  },
  {
    icon: "⏰",
    title: "Saves Time",
    description: "Skip lengthy textbooks and focus on exam-relevant content",
  },
  {
    icon: "🎯",
    title: "High Success Rate",
    description: "Proven track record of helping students achieve top scores",
  },
]

export default function WhyUseNotes() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("why-use-notes")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="why-use-notes" className="section why-section">
      <div className="container">
        <h2 className={`section-title ${isVisible ? "fade-in" : ""}`}>Why Use These Notes?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card card ${isVisible ? "fade-in" : ""}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
