import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 350 },
  { id: 2, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", price: 250 },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", price: 550 }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<h1>Welcome to Library Book Management System</h1>");
  }

  if (req.method === "GET" && pathname === "/books") {
    return sendJson(res, 200, books);
  }

  if (req.method === "POST" && pathname === "/add-book") {
    try {
      const book = await readRequestBody(req);
      if (book.id === undefined || !book.title || !book.author ||
          book.price === undefined || book.price === null) {
        return sendJson(res, 400, {
          message: "Required fields: id, title, author and price"
        });
      }

      if (books.some(item => item.id === Number(book.id))) {
        return sendJson(res, 409, { message: "Book ID already exists" });
      }

      const newBook = {
        id: Number(book.id),
        title: String(book.title),
        author: String(book.author),
        price: Number(book.price)
      };

      if (!Number.isFinite(newBook.price)) {
        return sendJson(res, 400, { message: "Price must be a valid number" });
      }

      books.push(newBook);
      return sendJson(res, 201, {
        message: "Book added successfully",
        book: newBook
      });
    } catch (error) {
      return sendJson(res, 400, { message: error.message });
    }
  }

  if (req.method === "GET" && pathname === "/about") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<h1>About</h1><p>This application manages library books using Node.js.</p>");
  }

  if (req.method === "GET" && pathname === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");
    return fs.readFile(filePath, "utf8", (error, data) => {
      if (error) {
        return sendJson(res, 500, { message: "Unable to read the home page" });
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  }

  return sendJson(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
