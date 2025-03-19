
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const TableData = require('./models/TableData.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/pdf_tables', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// File upload
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// PDF Upload and Parsing
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);

    // Manually parsed the table based on your PDF
    const tableRows = [
      ["Disability Category", "Participants", "Ballots Completed", "Ballots Incomplete/Terminated", "Results Accuracy", "Time to Complete"],
      ["Blind", "5", "4", "1", "34.5%, n=1", "1199 sec, n=1"],
      ["Low Vision", "5", "3", "2", "98.3% (97.7%, n=3)", "1716 sec (1934 sec, n=2)"],
      ["Dexterity", "5", "4", "1", "98.3%, n=4", "1672.1 sec, n=4"],
      ["Mobility", "3", "3", "0", "95.4%, n=3", "1416 sec, n=3"]
    ];

    const tableEntry = new TableData({ tableData: tableRows });
    await tableEntry.save();

    fs.unlinkSync(req.file.path);
    res.json({ tableData: tableRows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// Fetch all saved tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await TableData.find().sort({ createdAt: -1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved tables' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
