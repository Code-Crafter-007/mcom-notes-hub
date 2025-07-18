"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/Spinner";
import "./note-detail.css";

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: noteData, error: noteErr } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      const { data: detailData, error: detailErr } = await supabase
        .from("note_details")
        .select("*")
        .eq("note_id", noteId)
        .single();

      if (noteErr || detailErr) {
        console.error("Error fetching data:", noteErr || detailErr);
      }

      setNote(noteData);
      setDetails(detailData);
      setLoading(false);
    };  

    fetchData();
  }, [noteId]);

const handleViewPDF = () => {
  if (!note?.file_url) {
    alert("No PDF available for this note.");
    console.log("Note File Path: ", note?.file_url);
    return;
  }

  console.log("📄 Opening direct PDF URL:", note.file_url);
  window.open(note.file_url, "_blank");
};


  if (loading || !note || !details) return <Spinner />;

  return (
    <div className="note-detail-page fade-in">
      <div className="note-detail-grid">
        {/* Left Side */}
        <div className="note-preview">
          <div className="preview-card">
            <div className="preview-thumbnail">📘</div>

            <div className="price-section">
              {note.price === 0 ? (
                <>
                  <span className="original-price">₹50</span>
                  <span className="free-label">FREE 🎉</span>
                </>
              ) : (
                <span className="current-price">₹{note.price}</span>
              )}
            </div>

            <button className="preview-btn" onClick={handleViewPDF}>
              📄 View PDF
            </button>
          </div>

          <div className="note-stats">
            <h4>Note Stats</h4>
            <div className="stat-item">
              <span className="stat-label">Semester:</span>
              <span className="stat-value">{note.semester}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Language:</span>
              <span className="stat-value">{details.language}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pages:</span>
              <span className="stat-value">{details.pages}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Format:</span>
              <span className="stat-value">{details.format}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Updated:</span>
              <span className="stat-value">{details.last_updated}</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div>
          <div className="breadcrumb">
            <a href="/">Home</a> / <a href="/notes">Notes</a> /{" "}
            <span>{note.title}</span>
          </div>

          <h1 className="note-title">{note.title}</h1>

          <div className="note-meta">
            <span className="semester-badge">Semester {note.semester}</span>
            <span className="rating">⭐ 4.8</span>
            <span className="students">156 students</span>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "topics" ? "active" : ""}`}
              onClick={() => setActiveTab("topics")}
            >
              Topics
            </button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <>
                <div className="description">{note.description}</div>
                <ul className="feature-list">
                  {details.features?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            )}

            {activeTab === "topics" && (
              <ul className="topics-list">
                {details.topics?.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
