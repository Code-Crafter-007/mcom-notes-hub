"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import "./FeaturedNotes.css";

export default function FeaturedNotes() {
  const [featuredNotes, setFeaturedNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6); // Fetch latest 6 notes

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      if (data) {
        const enhancedNotes = data.map((note) => ({
          ...note,
          rating: 4.5 + Math.random() * 0.5,
          students: Math.floor(Math.random() * 100) + 20,
          thumbnail: "📘", // or choose based on subject
        }));
        setFeaturedNotes(enhancedNotes);
      }
    };

    fetchNotes();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Featured Notes</h2>
        <div className="notes-grid">
          {featuredNotes.map((note) => (
            <div key={note.id} className="note-card card">
              <div className="note-thumbnail">{note.thumbnail}</div>
              <div className="note-content">
                <div className="note-meta">
                  <span className="semester-badge">Sem {note.semester}</span>
                  <div className="rating">
                    <span className="stars">⭐</span>
                    <span>{note.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="note-title">{note.title}</h3>
                <p className="note-subject">{note.subject}</p>
                <div className="note-stats">
                  <span>{note.students} students</span>
                </div>
                <div className="note-footer">
                  <span className="note-price">₹{note.price}</span>
                  <Link href={`/notes/${note.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: "3rem" }}>
          <Link href="/notes" className="btn btn-secondary">
            View All Notes
          </Link>
        </div>
      </div>
    </section>
  );
}
