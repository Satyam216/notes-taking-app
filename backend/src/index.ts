import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET as string;

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

// ✅ Middleware: Verify JWT
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ✅ Login route – frontend Supabase session JWT verify karke apna token do
app.post("/api/login", async (req, res) => {
  const { supabaseToken } = req.body;

  try {
    // Supabase se user info validate karna
    const { data, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid Supabase token" });
    }

    // Apna JWT banakar frontend ko bhejna
    const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Protected route: Create note
app.post("/api/notes", authenticateToken, async (req: any, res) => {
  const { content } = req.body;
  const user = req.user;

  const { data, error } = await supabase
    .from("notes")
    .insert([{ user_id: user.id, content }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ✅ Protected route: Get notes
app.get("/api/notes", authenticateToken, async (req: any, res) => {
  const user = req.user;

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ✅ Protected route: Delete note
app.delete("/api/notes/:id", authenticateToken, async (req: any, res) => {
  const user = req.user;
  const { id } = req.params;

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Note deleted" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
