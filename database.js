import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'dayflow.db.json');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class Database {
  constructor(filePath = DB_FILE) {
    this.filePath = filePath;
    this.data = this._load();
    this.inTransaction = false;
    this.transactionSnapshot = null;
  }

  _emptyState() {
    return {
      organizations: [],
      users: [],
      employees: [],
      departments: [],
      designations: [],
      shifts: [],
      holidays: [],
      attendance: [],
      attendance_corrections: [],
      leaves: [],
      leave_balances: [],
      payroll_runs: [],
      payslips: [],
      documents: [],
      announcements: [],
      notifications: [],
      audit_logs: []
    };
  }

  _load() {
    if (!fs.existsSync(this.filePath)) {
      const initial = this._emptyState();
      this._saveSync(initial);
      return initial;
    }

    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      if (!raw.trim()) {
        const initial = this._emptyState();
        this._saveSync(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file, creating fresh instance:', err.message);
      const initial = this._emptyState();
      this._saveSync(initial);
      return initial;
    }
  }

  _saveSync(dataToSave = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write error:', err.message);
    }
  }

  save() {
    if (!this.inTransaction) {
      this._saveSync();
    }
  }

  // Atomic Transactions with Rollback
  transaction(callback) {
    if (this.inTransaction) {
      // Nested transaction
      return callback(this);
    }

    this.inTransaction = true;
    this.transactionSnapshot = JSON.parse(JSON.stringify(this.data));

    try {
      const result = callback(this);
      this.inTransaction = false;
      this._saveSync();
      this.transactionSnapshot = null;
      return result;
    } catch (err) {
      // Rollback to prior snapshot
      this.data = this.transactionSnapshot;
      this.inTransaction = false;
      this.transactionSnapshot = null;
      throw err;
    }
  }

  _ensureCollection(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  get(collection, id) {
    const table = this._ensureCollection(collection);
    return table.find(item => item.id === id || (item.employeeId && item.employeeId === id)) || null;
  }

  find(collection, filterFnOrObj) {
    const table = this._ensureCollection(collection);
    if (!filterFnOrObj) return [...table];

    if (typeof filterFnOrObj === 'function') {
      return table.filter(filterFnOrObj);
    }

    // Match exact object keys
    return table.filter(item => {
      return Object.entries(filterFnOrObj).every(([k, v]) => {
        if (v === undefined) return true;
        return item[k] === v;
      });
    });
  }

  findOne(collection, filterFnOrObj) {
    const results = this.find(collection, filterFnOrObj);
    return results.length > 0 ? results[0] : null;
  }

  insert(collection, record) {
    const table = this._ensureCollection(collection);
    const now = new Date().toISOString();
    const item = {
      ...record,
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now
    };

    table.push(item);
    this.save();
    return JSON.parse(JSON.stringify(item));
  }

  insertMany(collection, records) {
    const table = this._ensureCollection(collection);
    const now = new Date().toISOString();
    const items = records.map(r => ({
      ...r,
      createdAt: r.createdAt || now,
      updatedAt: r.updatedAt || now
    }));

    table.push(...items);
    this.save();
    return JSON.parse(JSON.stringify(items));
  }

  update(collection, id, partialUpdates) {
    const table = this._ensureCollection(collection);
    const index = table.findIndex(item => item.id === id || (item.employeeId && item.employeeId === id));
    if (index === -1) return null;

    const existing = table[index];
    const updated = {
      ...existing,
      ...partialUpdates,
      id: existing.id, // Immutable ID
      updatedAt: new Date().toISOString()
    };

    table[index] = updated;
    this.save();
    return JSON.parse(JSON.stringify(updated));
  }

  delete(collection, id) {
    const table = this._ensureCollection(collection);
    const index = table.findIndex(item => item.id === id || (item.employeeId && item.employeeId === id));
    if (index === -1) return false;

    table.splice(index, 1);
    this.save();
    return true;
  }

  count(collection, filterFnOrObj) {
    return this.find(collection, filterFnOrObj).length;
  }

  reset(newData) {
    this.data = newData || this._emptyState();
    this._saveSync();
  }
}

export const db = new Database();
