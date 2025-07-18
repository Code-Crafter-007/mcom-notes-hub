"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import './pyqs.css'

interface PyqItem {
  id: string
  title: string
  subject: string
  semester: string
  year: string
  file_url: string
  uploaded_at: string
}

const Pyqs: React.FC = () => {
  const [pyqs, setPyqs] = useState<PyqItem[]>([])
  const [filteredPyqs, setFilteredPyqs] = useState<PyqItem[]>([])
  const [semesterFilter, setSemesterFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPyqs = async () => {
      const { data, error } = await supabase
        .from('pyqs')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) console.error("Error fetching PYQs:", error.message)
      else {
        setPyqs(data || [])
        setFilteredPyqs(data || [])
      }
      setLoading(false)
    }

    fetchPyqs()
  }, [])

  const handleFilter = () => {
    let filtered = [...pyqs]
    if (semesterFilter) filtered = filtered.filter(p => p.semester === semesterFilter)
    if (yearFilter) filtered = filtered.filter(p => p.year === yearFilter)
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(lower) || p.subject.toLowerCase().includes(lower)
      )
    }
    setFilteredPyqs(filtered)
  }

  useEffect(() => {
    handleFilter()
  }, [semesterFilter, yearFilter, searchQuery])

  const getUniqueSemesters = () => Array.from(new Set(pyqs.map(p => p.semester)))
  const getUniqueYears = () => Array.from(new Set(pyqs.map(p => p.year)))

  const handleViewPDF = (fileUrl: string) => {
    if (!fileUrl) {
      alert("No file URL provided.")
      return
    }

    // ✅ Use the file_url directly (already a full URL)
    window.open(fileUrl, "_blank")
  }

  return (
    <div className="pyqs-page container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">Semester</label>
          <select className="filter-select" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
            <option value="">All</option>
            {getUniqueSemesters().map((sem) => <option key={sem} value={sem}>{sem}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Year</label>
          <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">All</option>
            {getUniqueYears().map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="pyqs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="pyq-card skeleton-card" key={i}>
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-badges shimmer"></div>
              <div className="skeleton-subject shimmer"></div>
              <div className="skeleton-meta shimmer"></div>
              <div className="skeleton-btn shimmer"></div>
            </div>
          ))}
        </div>
      ) : filteredPyqs.length === 0 ? (
        <p className="text-center">No PYQs found.</p>
      ) : (
        <div className="pyqs-grid">
          {filteredPyqs.map((item) => (
            <div className="pyq-card" key={item.id}>
              <div className="pyq-header">
                <h3 className="pyq-title">{item.title}</h3>
                <div className="pyq-meta">
                  <span className="year-badge">{item.year}</span>
                  <span className="semester-badge">{item.semester}</span>
                </div>
              </div>
              <p className="pyq-subject">📘 {item.subject}</p>
              <div className="pyq-details">
                <p className="detail-item">📅 Uploaded: {new Date(item.uploaded_at).toLocaleDateString()}</p>
              </div>
              <button className="download-btn" onClick={() => handleViewPDF(item.file_url)}>
                📥 View PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Pyqs
