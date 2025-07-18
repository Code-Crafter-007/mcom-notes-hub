"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import "./notes.css";

type Note = {
  id: number;
  title: string;
  subject: string;
  semester: number;
  price: number;
  description: string;
  file_url: string;
  rating?: number;
  students?: number;
  thumbnail?: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false); // hydration fix

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error.message);
      } else {
        setNotes(data || []);
      }
      setLoading(false);
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        rating: 4.6 + Math.random() * 0.4,
        students: Math.floor(Math.random() * 100) + 50,
        thumbnail: "📘",
      }))
    );
  }, [hasMounted]);

  const filteredNotes = notes.filter((note) => {
    const matchesSemester =
      selectedSemester === "all" ||
      note.semester.toString() === selectedSemester;
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  const notesGroupedBySemester = filteredNotes.reduce((groups, note) => {
    const sem = note.semester;
    if (!groups[sem]) groups[sem] = [];
    groups[sem].push(note);
    return groups;
  }, {} as Record<number, Note[]>);

  if (!hasMounted) return null;

  return (
    <div className="notes-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">All Notes</h1>
          <p className="page-subtitle">
            Choose from our comprehensive collection of M.Com notes
          </p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="semester-filters">
            <button
              className={`filter-btn ${
                selectedSemester === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedSemester("all")}
            >
              All Semesters
            </button>
            {[1, 2, 3, 4].map((sem) => (
              <button
                key={sem}
                className={`filter-btn ${
                  selectedSemester === sem.toString() ? "active" : ""
                }`}
                onClick={() => setSelectedSemester(sem.toString())}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        <div className="notes-grid">
          {loading ? (
            <p>Loading...</p>
          ) : filteredNotes.length === 0 ? (
            <div className="no-results">
              <h3>No notes found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : selectedSemester === "all" ? (
            Object.keys(notesGroupedBySemester)
              .sort()
              .map((sem) => (
                <div key={sem} className="semester-group">
                  <h2 className="semester-heading">Semester {sem}</h2>
                  <div className="notes-group-grid">
                    {notesGroupedBySemester[parseInt(sem)]?.map((note) => (
                      <div key={note.id} className="note-card card">
                        <div className="note-thumbnail">{note.thumbnail}</div>
                        <div className="note-content">
                          <div className="note-meta">
                            <span className="semester-badge">
                              Sem {note.semester}
                            </span>
                            <div className="rating">
                              <span className="stars">⭐</span>
                              <span>{note.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          <h3 className="note-title">{note.title}</h3>
                          <p className="note-subject">{note.subject}</p>
                          <p className="note-description">{note.description}</p>
                          <div className="note-stats">
                            <span>{note.students} students</span>
                          </div>
                          <div className="note-footer">
                            <span className="note-price">₹{note.price}</span>
                            <Link
                              href={`/notes/${note.id}`}
                              className="btn btn-primary"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="note-card card">
                <div className="note-thumbnail">{note.thumbnail}</div>
                <div className="note-content">
                  <div className="note-meta">
                    <span className="semester-badge">Sem {note.semester}</span>
                    <div className="rating">
                      <span className="stars">⭐</span>
                      <span>{note.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-subject">{note.subject}</p>
                  <p className="note-description">{note.description}</p>
                  <div className="note-stats">
                    <span>{note.students} students</span>
                  </div>
                  <div className="note-footer">
                    <span className="note-price">₹{note.price}</span>
                    <Link
                      href={`/notes/${note.id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
