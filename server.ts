import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Define __dirname and __filename in ESM environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial mock database tables
interface Package {
  id: number;
  title: string;
  img_url: string;
  duration: string;
  theme: string;
  price_stars: number;
  description: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  package_id: number;
  package_name: string;
  date: string;
  group_size: number;
  status: string;
  notes: string;
  created_at: string;
}

const INITIAL_PACKAGES: Package[] = [
  {
    id: 1,
    title: "Mesmerizing Kerala Backwaters tour",
    img_url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    duration: "4 Days / 3 Nights",
    theme: "Nature, Leisure & Romantic houseboat",
    price_stars: 4,
    description: "Discover Kerala backwaters and scenic houseboats with custom itineraries, gourmet meals, and tranquil lagoons."
  },
  {
    id: 3,
    title: "Spiritual Madurai & Rameswaram Temple Trail",
    img_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    duration: "3 Days / 2 Nights",
    theme: "Heritage, Divine Architecture & History",
    price_stars: 4,
    description: "Explore the architectural marvel of Meenakshi Amman Temple and the sacred seaside corridors of Ramanathaswamy Temple."
  },
  {
    id: 4,
    title: "Untouched Kanyakumari Sunset & Sunrise Escape",
    img_url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    duration: "2 Days / 1 Night",
    theme: "Scenic Views, Beaches & Monumental tours",
    price_stars: 3,
    description: "Witness the magnificent confluence of three oceans, the Vivekananda Rock Memorial, and the ancient Thiruvalluvar Statue."
  }
];

// Seed some initial inquiries
const inquiries: Inquiry[] = [
  {
    id: 101,
    name: "Arun Kumar",
    email: "arun.kumar@gmail.com",
    phone: "+91 9876543210",
    package_id: 1,
    package_name: "Mesmerizing Kerala Backwaters tour",
    date: "2026-07-15",
    group_size: 4,
    status: "Pending",
    notes: "Requires vegetarian meals on the houseboat and extra bed.",
    created_at: "2026-06-21 14:32"
  },
  {
    id: 102,
    name: "Deepika R",
    email: "deepika@yahoo.com",
    phone: "+91 8122334455",
    package_id: 3,
    package_name: "Spiritual Madurai & Rameswaram Temple Trail",
    date: "2026-08-01",
    group_size: 2,
    status: "Contacted",
    notes: "Would love a bilingual English/Tamil guide.",
    created_at: "2026-06-22 09:15"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Get all holiday packages
  app.get("/api/packages", (req, res) => {
    res.json(INITIAL_PACKAGES);
  });

  // API Route: Get all inquiries
  app.get("/api/enquiries", (req, res) => {
    res.json(inquiries);
  });

  // API Route: Post new inquiry
  app.post("/api/enquiries", (req, res) => {
    try {
      const { name, email, phone, package_id, date, group_size, notes } = req.body;

      if (!name || !email || !phone || !package_id) {
        return res.status(400).json({ error: "Name, email, phone and package are required." });
      }

      const selectedPackage = INITIAL_PACKAGES.find(p => p.id === Number(package_id));
      const package_name = selectedPackage ? selectedPackage.title : "Custom Tour Plan";

      const newInquiry: Inquiry = {
        id: inquiries.length > 0 ? inquiries[inquiries.length - 1].id + 1 : 101,
        name: String(name),
        email: String(email),
        phone: String(phone),
        package_id: Number(package_id),
        package_name,
        date: String(date || new Date().toISOString().split('T')[0]),
        group_size: Number(group_size) || 1,
        status: "Pending",
        notes: String(notes || ""),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      inquiries.unshift(newInquiry); // Insert at beginning
      res.status(201).json({ success: true, inquiry: newInquiry });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Update inquiry status
  app.put("/api/enquiries/:id", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    if (status) {
      inquiry.status = String(status);
    }
    res.json({ success: true, inquiry });
  });

  // API Route: Delete inquiry
  app.delete("/api/enquiries/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = inquiries.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    inquiries.splice(index, 1);
    res.json({ success: true, message: `Inquiry #${id} deleted successfully` });
  });

  // API Route: SQL Terminal Runner - Simulates direct MySQL client interaction!
  app.post("/api/sql-run", (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const normalizedQuery = query.trim().toUpperCase().replace(/\s+/g, " ");

    try {
      // 1. SELECT * FROM PACKAGES
      if (normalizedQuery.includes("SELECT") && normalizedQuery.includes("FROM PACKAGES")) {
        return res.json({
          status: "success",
          type: "SELECT",
          columns: ["id", "title", "duration", "theme", "price_stars"],
          rows: INITIAL_PACKAGES.map(p => ({
            id: p.id,
            title: p.title,
            duration: p.duration,
            theme: p.theme,
            price_stars: p.price_stars
          }))
        });
      }

      // 2. SELECT * FROM INQUIRIES
      if (normalizedQuery.includes("SELECT") && normalizedQuery.includes("FROM INQUIRIES") || normalizedQuery.includes("FROM ENQUIRIES")) {
        return res.json({
          status: "success",
          type: "SELECT",
          columns: ["id", "name", "email", "phone", "package_name", "date", "group_size", "status"],
          rows: inquiries.map(i => ({
            id: i.id,
            name: i.name,
            email: i.email,
            phone: i.phone,
            package_name: i.package_name,
            date: i.date,
            group_size: i.group_size,
            status: i.status
          }))
        });
      }

      // 3. SHOW TABLES
      if (normalizedQuery.startsWith("SHOW TABLES")) {
        return res.json({
          status: "success",
          type: "SHOW",
          columns: ["Tables_in_madurai_travels"],
          rows: [
            { Tables_in_madurai_travels: "packages" },
            { Tables_in_madurai_travels: "inquiries" },
            { Tables_in_madurai_travels: "vehicles" }
          ]
        });
      }

      // 4. DESCRIBE PACKAGES
      if (normalizedQuery.startsWith("DESCRIBE PACKAGES") || normalizedQuery.startsWith("EXPLAIN PACKAGES")) {
        return res.json({
          status: "success",
          type: "DESCRIBE",
          columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
          rows: [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: "NULL", Extra: "auto_increment" },
            { Field: "title", Type: "varchar(255)", Null: "NO", Key: "", Default: "NULL", Extra: "" },
            { Field: "img_url", Type: "text", Null: "YES", Key: "", Default: "NULL", Extra: "" },
            { Field: "duration", Type: "varchar(100)", Null: "NO", Key: "", Default: "NULL", Extra: "" },
            { Field: "theme", Type: "varchar(100)", Null: "YES", Key: "", Default: "NULL", Extra: "" },
            { Field: "price_stars", Type: "int(1)", Null: "NO", Key: "", Default: "1", Extra: "" }
          ]
        });
      }

      // 5. DESCRIBE INQUIRIES
      if (normalizedQuery.startsWith("DESCRIBE INQUIRIES") || normalizedQuery.startsWith("DESCRIBE ENQUIRIES")) {
        return res.json({
          status: "success",
          type: "DESCRIBE",
          columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
          rows: [
            { Field: "id", Type: "int(11)", Null: "NO", Key: "PRI", Default: "NULL", Extra: "auto_increment" },
            { Field: "name", Type: "varchar(100)", Null: "NO", Key: "", Default: "NULL", Extra: "" },
            { Field: "email", Type: "varchar(100)", Null: "NO", Key: "", Default: "NULL", Extra: "" },
            { Field: "phone", Type: "varchar(20)", Null: "NO", Key: "", Default: "NULL", Extra: "" },
            { Field: "package_id", Type: "int(11)", Null: "NO", Key: "MUL", Default: "NULL", Extra: "" },
            { Field: "date", Type: "date", Null: "YES", Key: "", Default: "NULL", Extra: "" },
            { Field: "group_size", Type: "int(5)", Null: "YES", Key: "", Default: "1", Extra: "" },
            { Field: "status", Type: "enum('Pending','Contacted','Completed')", Null: "NO", Key: "", Default: "Pending", Extra: "" },
            { Field: "notes", Type: "text", Null: "YES", Key: "", Default: "NULL", Extra: "" }
          ]
        });
      }

      // Default message for other queries (simulate write or query run)
      if (normalizedQuery.startsWith("INSERT")) {
        return res.json({
          status: "success",
          type: "INSERT",
          columns: ["Affected Rows", "Last Insert ID"],
          rows: [
            { "Affected Rows": 1, "Last Insert ID": inquiries.length > 0 ? inquiries[inquiries.length - 1].id + 2 : 101 }
          ]
        });
      }

      if (normalizedQuery.startsWith("UPDATE")) {
        return res.json({
          status: "success",
          type: "UPDATE",
          columns: ["Affected Rows", "Matched Rows"],
          rows: [
            { "Affected Rows": 1, "Matched Rows": 1 }
          ]
        });
      }

      // Mock output for custom SELECTS or unrecognized queries
      return res.json({
        status: "success",
        type: "GENERIC",
        columns: ["Status", "Message"],
        rows: [
          { Status: "OK", Message: "Query executed successfully, but returned an empty set or matched 0 rows." }
        ]
      });

    } catch (e: any) {
      return res.status(400).json({ error: `MySQL syntax error near: ${query.substring(0, 10)}...` });
    }
  });

  // Handle Vite integration in Dev mode or Static serving in Prod mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("  🚀 Server is running!");
    console.log("");
    console.log(`  ➜  Local:   http://localhost:${PORT}`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}`);
    console.log("");
  });
}

startServer();
