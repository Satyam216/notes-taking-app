import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/"); // agar login nhi h to Signup page bhej do
      } else {
        setUserEmail(data.user.email as string );
      }
    };
    getUser();
  }, [navigate]);

  const handleAddNote = () => {
    if (newNote.trim() === "") return;
    setNotes([...notes, newNote]);
    setNewNote("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen p-6">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <p className="mb-4">Welcome, <span className="font-semibold">{userEmail}</span> 👋</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleAddNote}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul className="w-full max-w-md space-y-2">
        {notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
        {notes.map((note, idx) => (
          <li
            key={idx}
            className="border p-2 rounded bg-gray-100"
          >
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
