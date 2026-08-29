import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translations } from '../frontend/src/data/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enKeys = Object.keys(translations.en);
const mrKeys = Object.keys(translations.mr);

console.log(`🌐 Verifying i18n Dictionary: ${enKeys.length} EN keys, ${mrKeys.length} MR keys.`);

let missingMr = enKeys.filter(k => !translations.mr[k]);
if (missingMr.length > 0) {
  console.error(`❌ ERROR: Missing Marathi translations for keys:`, missingMr);
  process.exit(1);
} else {
  console.log(`✅ All ${enKeys.length} translation keys have complete Marathi translations!`);
}
