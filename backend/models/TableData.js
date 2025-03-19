const mongoose = require('mongoose');

const TableDataSchema = new mongoose.Schema({
  tableData: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TableData', TableDataSchema);

