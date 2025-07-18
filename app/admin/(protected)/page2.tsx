"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminPanelPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [notes, setNotes] = useState<any[]>([]);
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "note" | "pyq";
    id: number;
  } | null>(null);

  const [noteIdJustCreated, setNoteIdJustCreated] = useState<string | null>(
    null
  );
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [editingNoteBasic, setEditingNoteBasic] = useState<any>(null);
  const [editingNoteDetails, setEditingNoteDetails] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "",
    price: "",
    description: "",
    tags: "",
    file: null as File | null,
  });

  const [detailsFormData, setDetailsFormData] = useState({
    features: "",
    topics: "",
    pages: "",
    language: "",
    format: "",
    last_updated: "",
  });

  const [pyqFormData, setPyqFormData] = useState({
    title: "",
    subject: "",
    semester: "",
    year: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchNotes();
    fetchPyqs();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setNotes(data);
  };

  const fetchPyqs = async () => {
    const { data, error } = await supabase
      .from("pyqs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPyqs(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePyqInputChange = (e: any) => {
    setPyqFormData({ ...pyqFormData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any, type: "note" | "pyq") => {
    const file = e.target.files?.[0];
    if (type === "note") setFormData({ ...formData, file });
    else setPyqFormData({ ...pyqFormData, file });
  };

  const startEdit = async (noteId: string) => {
    const { data: basic } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();
    const { data: details } = await supabase
      .from("note_details")
      .select("*")
      .eq("note_id", noteId)
      .single();
    setEditingNoteBasic(basic);
    setEditingNoteDetails(details);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteBasic || !editingNoteDetails) return;

    const { error: basicErr } = await supabase
      .from("notes")
      .update({
        title: editingNoteBasic.title,
        subject: editingNoteBasic.subject,
        semester: editingNoteBasic.semester,
        price: editingNoteBasic.price,
        description: editingNoteBasic.description,
        tags: editingNoteBasic.tags,
      })
      .eq("id", editingNoteBasic.id);

    const { error: detailsErr } = await supabase
      .from("note_details")
      .update({
        features: editingNoteDetails.features,
        topics: editingNoteDetails.topics,
        pages: editingNoteDetails.pages,
        language: editingNoteDetails.language,
        format: editingNoteDetails.format,
        last_updated: editingNoteDetails.last_updated,
      })
      .eq("note_id", editingNoteBasic.id);

    if (!basicErr && !detailsErr) {
      alert("Updated successfully!");
      setEditingNoteBasic(null);
      setEditingNoteDetails(null);
      fetchNotes();
    } else {
      alert("Failed to update. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return alert("Please select a file.");

    try {
      const ext = formData.file.name.split(".").pop();
      const filename = `${Date.now()}-${formData.title.replace(
        /\s/g,
        "-"
      )}.${ext}`;
      const filepath = `admin_uploads/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(filepath, formData.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(filepath);
      const fileUrl = urlData.publicUrl;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return alert("Not authenticated");

      const { data: insertedNote, error: insertError } = await supabase
        .from("notes")
        .insert([
          {
            title: formData.title,
            subject: formData.subject,
            semester: formData.semester,
            price: formData.price,
            description: formData.description,
            tags: formData.tags,
            file_url: fileUrl,
            uploaded_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setNoteIdJustCreated(insertedNote.id);
      setShowDetailsForm(true);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteIdJustCreated) return;

    const { error } = await supabase.from("note_details").insert([
      {
        note_id: noteIdJustCreated,
        features: detailsFormData.features.split(",").map((f) => f.trim()),
        topics: detailsFormData.topics.split(",").map((t) => t.trim()),
        pages: Number(detailsFormData.pages),
        language: detailsFormData.language,
        format: detailsFormData.format,
        last_updated: detailsFormData.last_updated,
      },
    ]);

    if (!error) {
      alert("Note + details saved!");
      setFormData({
        title: "",
        subject: "",
        semester: "",
        price: "",
        description: "",
        tags: "",
        file: null,
      });
      setDetailsFormData({
        features: "",
        topics: "",
        pages: "",
        language: "",
        format: "",
        last_updated: "",
      });
      setShowDetailsForm(false);
      fetchNotes();
    } else {
      alert("Failed to save details: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const table = confirmDelete.type === "note" ? "notes" : "pyqs";

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", confirmDelete.id); 
    if (!error) {
      if (confirmDelete.type === "note") {
        setNotes((prev) => prev.filter((n) => n.id !== confirmDelete.id));
      } else {
        setPyqs((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      }
      alert("Deleted successfully");
      setConfirmDelete(null);
    }
  };

  const handlePyqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pyqFormData.file) return alert("Please select a file.");

    try {
      const ext = pyqFormData.file.name.split(".").pop();
      const filename = `${Date.now()}-${pyqFormData.title.replace(
        /\s/g,
        "-"
      )}.${ext}`;
      const filepath = `pyq_uploads/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("pyqs")
        .upload(filepath, pyqFormData.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("pyqs")
        .getPublicUrl(filepath);
      const fileUrl = urlData.publicUrl;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return alert("Not authenticated");

      const { error: insertError } = await supabase.from("pyqs").insert([
        {
          title: pyqFormData.title,
          subject: pyqFormData.subject,
          semester: pyqFormData.semester,
          year: pyqFormData.year,
          file_url: fileUrl,
          uploaded_by: session.user.id,
        },
      ]);

      if (!insertError) {
        alert("PYQ uploaded successfully!");
        setPyqFormData({
          title: "",
          subject: "",
          semester: "",
          year: "",
          file: null,
        });
        fetchPyqs();
      } else {
        alert("Failed to upload PYQ: " + insertError.message);
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage notes + PYQs</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-tabs">
          {["upload", "manage", "upload_pyqs", "manage_pyqs"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "upload" && "Upload Notes"}
              {tab === "manage" && "Manage Notes"}
              {tab === "upload_pyqs" && "Upload PYQs"}
              {tab === "manage_pyqs" && "Manage PYQs"}
            </button>
          ))}
        </div>

        {/* -------------------- Upload Notes Form -------------------- */}
        {activeTab === "upload" && (
          <>
            <form onSubmit={handleSubmit} className="upload-form">
              <h2 className="step-title">Step 1: Upload Note</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>File (PDF)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "note")}
                    accept=".pdf"
                    className="file-input"
                    required
                  />
                  <div className="file-upload-text">
                    <span className="upload-icon">📁</span>
                    <p>
                      {formData.file
                        ? `Selected: ${formData.file.name}`
                        : "Click or drag to upload"}
                    </p>
                  </div>
                </div>
              </div>
              <button type="submit" className="upload-btn">
                Upload Note
              </button>
            </form>

            {showDetailsForm && (
              <form onSubmit={handleDetailsSubmit} className="details-form">
                <h2 className="step-title">Step 2: Add Note Details</h2>
                <div className="form-group">
                  <label>Features (comma separated)</label>
                  <input
                    value={detailsFormData.features}
                    onChange={(e) =>
                      setDetailsFormData({
                        ...detailsFormData,
                        features: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Topics (comma separated)</label>
                  <input
                    value={detailsFormData.topics}
                    onChange={(e) =>
                      setDetailsFormData({
                        ...detailsFormData,
                        topics: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pages</label>
                    <input
                      type="number"
                      value={detailsFormData.pages}
                      onChange={(e) =>
                        setDetailsFormData({
                          ...detailsFormData,
                          pages: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <input
                      value={detailsFormData.language}
                      onChange={(e) =>
                        setDetailsFormData({
                          ...detailsFormData,
                          language: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Format</label>
                    <input
                      value={detailsFormData.format}
                      onChange={(e) =>
                        setDetailsFormData({
                          ...detailsFormData,
                          format: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Updated</label>
                    <input
                      type="date"
                      value={detailsFormData.last_updated}
                      onChange={(e) =>
                        setDetailsFormData({
                          ...detailsFormData,
                          last_updated: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <button type="submit">Save Note Details</button>
              </form>
            )}
          </>
        )}

        {/* -------------------- Manage Notes -------------------- */}
        {activeTab === "manage" && (
          <div className="note-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3>{note.title}</h3>
                  <span>📚 {note.subject}</span>
                </div>
                <p>💸 ₹{note.price}</p>
                <div className="note-actions">
                  <button onClick={() => startEdit(note.id)}>✏️ Edit</button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ type: "note", id: note.id })
                    }
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------------------- Upload PYQs -------------------- */}
      {activeTab === "upload_pyqs" && (
  <form onSubmit={handlePyqSubmit} className="upload-form">
    <h2 className="step-title">Upload PYQs</h2>

    <div className="form-row">
      <div className="form-group">
        <label>Title</label>
        <input
          name="title"
          value={pyqFormData.title}
          onChange={handlePyqInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input
          name="subject"
          value={pyqFormData.subject}
          onChange={handlePyqInputChange}
          required
        />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>Semester</label>
        <select
          name="semester"
          value={pyqFormData.semester}
          onChange={handlePyqInputChange}
          required
        >
          <option value="">Select</option>
          {[1, 2, 3, 4].map((s) => (
            <option key={s} value={s}>{`Semester ${s}`}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Year</label>
        <input
          name="year"
          value={pyqFormData.year}
          onChange={handlePyqInputChange}
          required
        />
      </div>
    </div>

    <div className="form-group">
      <label>File (PDF)</label>
      <div className="file-upload-area">
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "pyq")}
          accept=".pdf"
          className="file-input"
          required
        />
        <div className="file-upload-text">
          <span className="upload-icon">📁</span>
          <p>
            {pyqFormData.file
              ? `Selected: ${pyqFormData.file.name}`
              : "Click or drag to upload"}
          </p>
        </div>
      </div>
    </div>

    <button type="submit" className="upload-btn">
      Upload PYQ
    </button>
  </form>
)}


        {/* -------------------- Manage PYQs -------------------- */}
        {activeTab === "manage_pyqs" && (
          <div className="note-list">
            {pyqs.map((pyq) => (
              <div key={pyq.id} className="note-card">
                <div className="note-header">
                  <h3>{pyq.title}</h3>
                  <span>📚 {pyq.subject}</span>
                </div>
                <p>
                  🗓️ Year: {pyq.year} | 🎓 Semester: {pyq.semester}
                </p>
                <div className="note-actions">
                  <button disabled>✏️ Edit</button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ type: "pyq", id: pyq.id })
                    }
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <p>
              Are you sure you want to delete this{" "}
              {confirmDelete.type.toUpperCase()}?
            </p>
            <div className="confirm-buttons">
              <button onClick={handleDelete}>Yes, Delete</button>
              <button onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
