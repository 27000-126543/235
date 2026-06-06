import https from 'https';
import fs from 'fs';
import path from 'path';

const MODEL_FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
];

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
const OUTPUT_DIR = './public/models';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('📦 正在下载 face-api.js 模型文件...');
  console.log(`📍 输出目录: ${OUTPUT_DIR}`);
  console.log('');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  for (const file of MODEL_FILES) {
    const url = CDN_BASE + file;
    const dest = path.join(OUTPUT_DIR, file);
    
    if (fs.existsSync(dest)) {
      console.log(`✅ 已存在: ${file}`);
      continue;
    }
    
    try {
      process.stdout.write(`⏳ 下载中: ${file} ...`);
      await downloadFile(url, dest);
      console.log(' 完成!');
    } catch (err) {
      console.log(' 失败!');
      console.error(`   错误: ${err.message}`);
      console.log(`   请手动从 ${url} 下载到 ${dest}`);
    }
  }
  
  console.log('');
  console.log('🎉 模型下载完成!');
  console.log('💡 人脸识别现在可以使用本地加载的模型了');
}

downloadAll().catch(console.error);
