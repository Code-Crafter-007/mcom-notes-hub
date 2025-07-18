"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from '@supabase/supabase-js'; // ✅ Make sure this is imported

import { supabase } from "@/lib/supabaseClient";
import "./Navbar.css";

export default function Navbar() {
const [user, setUser] = useState<User | null>(null); // ✅ correct
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // 🔄 Realtime login state detection
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link href="/" className="nav-logo">
            <span className="logo-text">M.Com Notes Hub</span>
          </Link>

          <div className={`nav-links ${isMenuOpen ? "nav-links-open" : ""}`}>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/notes" className="nav-link">Notes</Link>
            <Link href="/pyqs" className="nav-link">PYQs</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>

            {!user && (
              <Link href="/login" className="btn btn-primary nav-btn">Login</Link>
            )}
            
            {user && (
              <button onClick={handleLogout} className="btn nav-btn logout-btn">
                Logout
              </button>
            )}

            <Link href="/admin/login" className="btn admin-login-btn nav-btn">Admin Login</Link>

          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
