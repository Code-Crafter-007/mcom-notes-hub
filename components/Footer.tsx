"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import "./Footer.css";

export default function Footer() {
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("subject")
        .not("subject", "is", null);

      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }

      // Get unique subject names
      const uniqueSubjects = Array.from(
        new Set(data.map((item) => item.subject))
      );
      setSubjects(uniqueSubjects);
    };

    fetchSubjects();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">M.Com Notes Hub</h3>
            <p className="footer-description">
              Your trusted partner for M.Com exam success. Quality notes and PYQs to help you achieve your academic
              goals.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">📧</a>
              <a href="#" className="social-link">📱</a>
              <a href="#" className="social-link">💬</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/notes">All Notes</Link></li>
              <li><Link href="/pyqs">PYQs</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Subjects</h4>
            <ul className="footer-links">
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <li key={index}>
                    <Link href={`/notes?subject=${encodeURIComponent(subject)}`}>{subject}</Link>
                  </li>
                ))
              ) : (
                <li>Loading...</li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="contact-info">
              <p>📧 codecrafted011@gmail.com</p>
              <p>📱 +91 9876543210</p>
              <p>💬 WhatsApp Support</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 M.Com Notes Hub. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
