// cloudinary-test.mjs
// Run with: node cloudinary-test.mjs

import { v2 as cloudinary } from 'cloudinary';

// ── Credentials (inline) ───────────────────────────────────────────
cloudinary.config({
  cloud_name: 'dlur0j6ah',      // ← your cloud name
  api_key:    '522682333832817', // ← your API key
  api_secret: 'zjooiD1OnCtq8D-h3wMFFY5UHCQ', // ← your API secret
});

// ── 1. Upload a sample image ───────────────────────────────────────
console.log('Uploading image...');
const upload = await cloudinary.uploader.upload(
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  { public_id: 'vmarket_sample_test' }
);

console.log('\n✅ Upload successful!');
console.log('  Secure URL :', upload.secure_url);
console.log('  Public ID  :', upload.public_id);

// ── 2. Fetch image details ─────────────────────────────────────────
console.log('\nFetching image metadata...');
const details = await cloudinary.api.resource(upload.public_id);

console.log('\n📐 Image details:');
console.log('  Width  :', details.width, 'px');
console.log('  Height :', details.height, 'px');
console.log('  Format :', details.format);
console.log('  Size   :', details.bytes, 'bytes');

// ── 3. Generate transformed URL ────────────────────────────────────
const transformedUrl = cloudinary.url(upload.public_id, {
  transformation: [
    { fetch_format: 'auto' }, // f_auto: serves WebP/AVIF based on browser support
    { quality: 'auto' },      // q_auto: reduces file size without visible quality loss
  ],
  secure: true,
});

console.log('\n🔗 Transformed URL (f_auto + q_auto):');
console.log(' ', transformedUrl);
console.log('\nDone! Click link above to see optimized version of the image.');
console.log('Check the size and the format.');
