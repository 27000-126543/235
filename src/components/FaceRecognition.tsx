import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MODEL_PATHS = [
  '/models',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model',
  'https://unpkg.com/@vladmandic/face-api@1.7.12/model',
];

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [modelLoadError, setModelLoadError] = useState('');
  const [error, setError] = useState('');
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBox, setFaceBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [scanComplete, setScanComplete] = useState(false);
  const modelsLoaded = useRef(false);

  const loadModels = useCallback(async () => {
    for (const modelPath of MODEL_PATHS) {
      try {
        console.log(`[FaceAPI] 尝试从 ${modelPath} 加载模型...`);
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        ]);
        
        modelsLoaded.current = true;
        setIsLoadingModel(false);
        setModelLoadError('');
        console.log(`[FaceAPI] ✅ 模型加载成功 (来源: ${modelPath})`);
        return;
      } catch (err) {
        console.warn(`[FaceAPI] ⚠️ 从 ${modelPath} 加载失败:`, err);
      }
    }
    
    console.error('[FaceAPI] ❌ 所有模型加载路径均失败');
    modelsLoaded.current = false;
    setIsLoadingModel(false);
    setModelLoadError('AI模型加载失败，将使用基础肤色检测');
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsLoading(false);
        startFaceDetection();
      }
    } catch (err) {
      setError('无法访问摄像头，请确保已授予摄像头权限');
      setIsLoading(false);
    }
  }, []);

  const detectFace = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (modelsLoaded.current) {
      try {
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        });
        
        const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
        
        if (detections.length > 0) {
          const detection = detections[0];
          const box = detection.detection.box;
          
          setFaceBox({
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          });
          return true;
        }
      } catch (err) {
        console.error('[FaceAPI] 检测错误:', err);
      }
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let skinPixels = 0;
    let sumX = 0, sumY = 0;
    let minX = canvas.width, minY = canvas.height;
    let maxX = 0, maxY = 0;
    
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15 &&
            !(r > 220 && g > 220 && b > 220)) {
          skinPixels++;
          sumX += x;
          sumY += y;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    const skinRatio = skinPixels / (canvas.width * canvas.height / 16);
    const detected = skinRatio > 0.02 && skinRatio < 0.6;
    
    if (detected) {
      const centerX = sumX / (skinPixels || 1);
      const centerY = sumY / (skinPixels || 1);
      const boxWidth = Math.max(80, maxX - minX);
      const boxHeight = Math.max(100, maxY - minY);
      
      setFaceBox({
        x: centerX - boxWidth / 2,
        y: centerY - boxHeight / 2,
        width: boxWidth,
        height: boxHeight
      });
    }
    
    return detected;
  }, []);

  const startFaceDetection = useCallback(() => {
    let frameCount = 0;
    let successFrames = 0;
    
    const detect = async () => {
      const detected = await detectFace();
      setFaceDetected(detected);
      frameCount++;
      
      if (detected) {
        successFrames++;
        setDetectionProgress(Math.min(100, (successFrames / 45) * 100));
        
        if (successFrames >= 45) {
          setScanComplete(true);
          setTimeout(() => {
            onSuccess();
          }, 800);
          return;
        }
      }
      
      if (frameCount < 600) {
        animationRef.current = requestAnimationFrame(detect);
      }
    };
    
    animationRef.current = requestAnimationFrame(detect);
  }, [detectFace, onSuccess]);

  useEffect(() => {
    loadModels();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loadModels]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-panel border border-info/30 rounded-2xl p-8 max-w-lg w-full mx-4">
        <h3 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-3">
          <span className="text-3xl">👤</span>
          人脸识别登录
        </h3>

        {error ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-danger mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回登录
            </button>
          </div>
        ) : (
          <>
            <div className="relative rounded-xl overflow-hidden bg-black mx-auto" style={{ width: 320, height: 240 }}>
              {(isLoading || isLoadingModel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
                  <div className="text-info animate-pulse mb-3">
                    {isLoadingModel ? '正在加载AI检测模型...' : '正在启动摄像头...'}
                  </div>
                  {modelLoadError && (
                    <div className="text-warning text-xs mt-2">{modelLoadError}</div>
                  )}
                </div>
              )}
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
                onLoadedMetadata={() => {
                  if (videoRef.current && !isLoadingModel) {
                    startCamera();
                  }
                }}
              />
              
              <canvas ref={canvasRef} className="hidden" />
              
              {faceDetected && !scanComplete && (
                <div
                  className="absolute border-2 border-success rounded-lg transition-all duration-100"
                  style={{
                    left: `${(faceBox.x / 640) * 100}%`,
                    top: `${(faceBox.y / 480) * 100}%`,
                    width: `${(faceBox.width / 640) * 100}%`,
                    height: `${(faceBox.height / 480) * 100}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 text-success text-xs font-medium flex items-center gap-1">
                    {modelsLoaded.current ? (
                      <>
                        <span>🤖</span> AI检测
                      </>
                    ) : (
                      <>
                        <span>👁️</span> 基础检测
                      </>
                    )}
                  </div>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-success -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-success -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-success -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-success -mb-1 -mr-1" />
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-dashed border-info/50 rounded-xl" />
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-info" />
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-info" />
                <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-info" />
                <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-info" />
              </div>

              {scanComplete && (
                <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2">✅</div>
                    <div className="text-success font-bold text-xl">认证成功</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">识别进度</span>
                <span className={`text-sm font-medium ${faceDetected ? 'text-success' : 'text-warning'}`}>
                  {scanComplete ? '认证完成' : faceDetected ? '正在识别面部特征...' : '请将面部对准框内'}
                </span>
              </div>
              <div className="w-full bg-dark/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    scanComplete ? 'bg-success' : faceDetected ? 'bg-info' : 'bg-warning'
                  }`}
                  style={{ width: `${detectionProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <span className={`inline-block w-2 h-2 rounded-full ${modelsLoaded.current ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-gray-400">
                {modelsLoaded.current ? 'AI模型已就绪 (TinyFaceDetector)' : modelLoadError || 'AI模型加载中...'}
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
            </div>

            <div className="mt-6 p-4 bg-dark/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">识别说明</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 请确保光线充足，面部清晰可见</li>
                <li>• 请将面部置于扫描框内</li>
                <li>• 优先加载本地模型，失败则使用CDN</li>
                <li>• 如需本地加载请运行: <code className="text-info">node download-models.js</code></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;
