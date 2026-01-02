// backup-db.ts
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

// Configuration
const DB_USER = 'postgres';
const DB_NAME = 'your_db_name';
const DB_HOST = 'localhost';
const BACKUP_DIR = path.join(__dirname, 'backups');
const RETENTION_DAYS = 30; // Delete backups older than this

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate timestamped filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `${DB_NAME}_${timestamp}.dump`);
const compressedFile = `${backupFile}.gz`;

async function backupDatabase() {
  try {
    // Dump PostgreSQL database
    console.log('Starting backup...');
    await execAsync(`pg_dump -U ${DB_USER} -h ${DB_HOST} -F c ${DB_NAME} -f "${backupFile}"`);

    // Compress backup
    console.log('Compressing backup...');
    await execAsync(`gzip "${backupFile}"`);

    console.log(`Backup successful: ${compressedFile}`);

    // Cleanup old backups
    cleanupOldBackups();

  } catch (err) {
    console.error('Backup failed:', err);
  }
}

function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();

  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const ageDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    if (ageDays > RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old backup: ${file}`);
    }
  });
}

// Run backup
backupDatabase();
