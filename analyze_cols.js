const fs = require('fs');
const Papa = require('papaparse');

const csv = fs.readFileSync('C:/Users/fuaad/.gemini/antigravity/brain/b6ad5cac-fa31-4732-b497-8d5ee7917039/.system_generated/steps/204/content.md', 'utf-8').split('---')[1].trim();

const parsed = Papa.parse(csv, { skipEmptyLines: true });
const headers = parsed.data[0];
const rows = parsed.data.slice(1);

const commMap = {};

rows.forEach((row, i) => {
  const comms = [row[11], row[12], row[13]].filter(Boolean);
  
  // Find which columns have data
  const dataCols = [];
  for (let j = 14; j <= 58; j++) {
    if (row[j] && row[j].trim() !== '') {
      dataCols.push(j);
    }
  }
  
  console.log(`Row ${i+2}: Comms=${comms.join(', ')} | DataCols=${dataCols.join(',')}`);
});
