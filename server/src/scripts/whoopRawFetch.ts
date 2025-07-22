import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Usage: node whoopRawFetch.js [output.json]
// Requires env vars: API_BASE_URL, WHOOP_JWT_TOKEN

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';
const TOKEN = process.env.WHOOP_JWT_TOKEN;

if (!TOKEN) {
  console.error('Please set WHOOP_JWT_TOKEN in your environment.');
  process.exit(1);
}

function getDateString(date: Date) {
  return date.toISOString().split('T')[0];
}

async function main() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6); // last 7 days including today

  const startStr = getDateString(start);
  const endStr = getDateString(today);

  const url = `${API_BASE_URL}/api/whoop/raw?start=${startStr}&end=${endStr}`;
  console.log('Fetching:', url);

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch:', res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const outputFile = process.argv[2];
  if (outputFile) {
    const outPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log('Saved to', outPath);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 