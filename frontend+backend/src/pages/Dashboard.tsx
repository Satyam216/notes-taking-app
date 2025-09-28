import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Trash2, StickyNote } from "lucide-react"; // ✅ icons

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ Fetch user & notes
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          navigate("/"); // redirect to login if not logged in
          return;
        }

        // ✅ Get user details from "users" table
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        if (userDataError) throw userDataError;
        if (!userData) {
          setError("User not found in database");
          setLoading(false);
          return;
        }

        setUser(userData);

        // ✅ Fetch notes only for this user
        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;
        setNotes(notesData || []);
      } catch (err: any) {
        console.error("Dashboard Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  // ✅ Add Note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([{ user_id: user.id, user_name:user.name, content: newNote }])
        .select();

      if (error) throw error;
      if (data) setNotes([data[0], ...notes]);
      setNewNote(""); // clear input
    } catch (err: any) {
      alert("Error adding note: " + err.message);
    }
  };

  // ✅ Delete Note
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err: any) {
      alert("Error deleting note: " + err.message);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // redirect to login page
  };

  // ✅ Loading/Error States
  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!user) return <p className="p-6">User not found. Please login.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-3xl"> {/* ✅ wider for PC */}
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <StickyNote className="text-blue-600" /> Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-600 hover:underline"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="mb-6 p-6 bg-white shadow rounded-lg text-center">
          <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>

        {/* Add Note Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Write your note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 border p-3 rounded-lg shadow-sm"
          />
          <button
            onClick={handleAddNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Notes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-3">Your Notes</h2>

          {notes.length === 0 ? (
            <p className="text-gray-500 text-center">No notes yet. Add one!</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
                >
                  <span>{note.content}</span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
