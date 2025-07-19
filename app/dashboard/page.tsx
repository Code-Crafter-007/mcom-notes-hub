  "use client";

  import { useEffect, useState } from "react";
  import { supabase } from "@/lib/supabaseClient";
  import { useRouter } from "next/navigation";
  import "./dashboard.css";

  export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("👨‍🎓");
    const [course, setCourse] = useState("");
    const [testimonialText, setTestimonialText] = useState("");
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(true); // ⏳ for initial load

    // 🧠 Fetch user on load
    useEffect(() => {
      const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setUser(data.user);
          setName(data.user?.user_metadata?.name || "");
          setEmail(data.user?.email || "");
        }
        setLoading(false); // ✅ stop loading once user is fetched
      };
      fetchUser();
    }, []);

    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };

    const handleUpdateProfile = async () => {
      const { data, error } = await supabase.auth.updateUser({
        email,
        data: { name },
      });

      if (error) {
        alert("Error updating profile: " + error.message);
      } else {
        alert("Profile updated successfully!");
        setUser(data.user);
        setIsModalOpen(false);
      }
    };

    const handleTestimonialSubmit = async () => {
      const { error } = await supabase.from("testimonials").insert([
        {
          name,
          email,
          avatar,
          course,
          rating,
          message: testimonialText,
        },
      ]);
      if (error) {
        alert("Error submitting testimonial: " + error.message);
      } else {
        alert("Testimonial submitted successfully!");
        setTestimonialText("");
        setRating(5);
        setAvatar("👨‍🎓");
        setCourse("");
      }
    };



    return (
      <div className="profile-container">
        {/* Profile Section */}
        <div className="profile-card">
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Name:</strong> {user?.user_metadata?.name || "Not set"}
          </p>

          <div className="button-group">
            <button className="edit-button" onClick={() => setIsModalOpen(true)}>
              ✏️ Edit Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Only 1 Tab: Testimonial */}
        <div className="dashboard-tabs">
          <button className="active-tab">✍️ Write Testimonial</button>
        </div>

        <div className="tab-content">
          <div className="testimonial-form">
            <h3>Write a Testimonial</h3>

            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
            />

            <label>Course:</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. M.Com Semester 1"
            />

            <label>Avatar (e.g., 👨‍🎓 👩‍🎓):</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Enter an emoji avatar"
            />

            <label>Message:</label>
            <textarea
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Write your testimonial here..."
              rows={4}
            />

            <label>Rating (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />

            <button className="submit-button" onClick={handleTestimonialSubmit}>
              ✅ Submit
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Edit Profile</h3>

              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />

              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />

              <div className="modal-buttons">
                <button className="save-button" onClick={handleUpdateProfile}>
                  💾 Save
                </button>
                <button
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
