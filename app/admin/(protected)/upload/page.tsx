'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import './upload.css'; // ✅ Import the CSS

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState('');
  const [noteInfo, setNoteInfo] = useState({
    title: '',
    subject: '',
    semester: 1,
    price: '',
  });

  const handleUpload = async () => {
    if (!file || !userId || !noteInfo.title) {
      alert('Please fill all fields and select a file.');
      return;
    }

    setUploading(true);
    const filePath = `notes/${Date.now()}-${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('notes')
      .upload(filePath, file);

    if (storageError) {
      alert('Upload failed: ' + storageError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('notes').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('purchases').insert({
      user_id: userId,
      title: noteInfo.title,
      subject: noteInfo.subject,
      semester: noteInfo.semester,
      price: Number(noteInfo.price),
      note_url: publicUrl,
    });

    setUploading(false);

    if (insertError) {
      alert('Insert failed: ' + insertError.message);
    } else {
      alert('Note uploaded successfully!');
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2 className="upload-title">Upload a Note (Admin Only)</h2>
        <div className="upload-form">
          <input
            className="upload-input"
            type="text"
            placeholder="User UUID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            className="upload-input"
            type="text"
            placeholder="Note Title"
            value={noteInfo.title}
            onChange={(e) => setNoteInfo({ ...noteInfo, title: e.target.value })}
          />
          <input
            className="upload-input"
            type="text"
            placeholder="Subject"
            value={noteInfo.subject}
            onChange={(e) => setNoteInfo({ ...noteInfo, subject: e.target.value })}
          />
          <input
            className="upload-input"
            type="number"
            placeholder="Semester"
            value={noteInfo.semester}
            onChange={(e) => setNoteInfo({ ...noteInfo, semester: parseInt(e.target.value) })}
          />
          <input
            className="upload-input"
            type="number"
            placeholder="Price"
            value={noteInfo.price}
            onChange={(e) => setNoteInfo({ ...noteInfo, price: e.target.value })}
          />
          <input
            className="upload-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
