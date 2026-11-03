import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

let books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 350,
    category: "Fiction"
  },
  {
    id: 2,
    title: "Wings of Fire",
    author: "A. P. J. Abdul Kalam",
    price: 250,
    category: "Biography"
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 550,
    category: "Programming"
  }
];

// GET: Retrieve all books
app.get("/books", (req, res) => {
  res.status(200).json(books);
});

// GET: Retrieve one book using its ID
app.get("/books/:id", (req, res) => {
  const bookId = Number(req.params.id);
  const book = books.find(item => item.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.status(200).json(book);
});

// POST: Add a new book
app.post("/books", (req, res) => {
  const { id, title, author, price, category } = req.body;

  if (id === undefined || !title || !author || price === undefined ||
      price === null || !category) {
    return res.status(400).json({
      message: "Required fields: id, title, author, price and category"
    });
  }

  const bookId = Number(id);
  const bookPrice = Number(price);

  if (!Number.isInteger(bookId) || !Number.isFinite(bookPrice)) {
    return res.status(400).json({ message: "ID and price must be valid numbers" });
  }

  if (books.some(item => item.id === bookId)) {
    return res.status(409).json({ message: "Book ID already exists" });
  }

  const newBook = {
    id: bookId,
    title: String(title),
    author: String(author),
    price: bookPrice,
    category: String(category)
  };

  books.push(newBook);
  res.status(201).json({
    message: "Book added successfully",
    book: newBook
  });
});

// PUT: Update an existing book
app.put("/books/:id", (req, res) => {
  const bookId = Number(req.params.id);
  const book = books.find(item => item.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const { title, author, price, category } = req.body;

  if (title !== undefined) book.title = String(title);
  if (author !== undefined) book.author = String(author);
  if (price !== undefined) {
    const newPrice = Number(price);
    if (!Number.isFinite(newPrice)) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }
    book.price = newPrice;
  }
  if (category !== undefined) book.category = String(category);

  res.status(200).json({
    message: "Book updated successfully",
    book
  });
});

// DELETE: Delete a book
app.delete("/books/:id", (req, res) => {
  const bookId = Number(req.params.id);
  const bookIndex = books.findIndex(item => item.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found" });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  res.status(200).json({
    message: "Book deleted successfully",
    book: deletedBook
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Handle invalid JSON and other errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
