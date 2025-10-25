import React, { useRef, useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';

export function CameraModal({ type, onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Request camera access when modal opens
    startCamera();
    
    return () => {
      // Clean up camera stream when modal closes
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setAnalyzing(true);
    
    // Draw video frame to canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Analyze the image
    const detectionResult = await analyzeImage(imageData, type);
    
    setResult(detectionResult);
    setAnalyzing(false);

    if (detectionResult.detected) {
      setTimeout(() => {
        onCapture();
      }, 1500);
    }
  };

  const analyzeImage = async (imageDataUrl, targetType) => {
    // Simple color-based detection (for demo purposes)
    // In production, you'd use TensorFlow.js, Google Vision API, etc.
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let detectionScore = 0;
    
    if (targetType === 'sun') {
      // Detect bright yellow/orange colors (sun)
      detectionScore = detectBrightYellow(pixels);
    } else if (targetType === 'water') {
      // Detect blue colors (water/sky)
      detectionScore = detectBlue(pixels);
    } else if (targetType === 'grass') {
      // Detect green colors (grass/plants)
      detectionScore = detectGreen(pixels);
    }
    
    const detected = detectionScore > 0.10; // 10% threshold - needs 10% of the image to match
    
    return {
      detected,
      score: Math.round(detectionScore * 100),
      message: detected 
        ? `${getTargetName(targetType)} detected! ✓` 
        : `No ${getTargetName(targetType)} found. Need ${Math.round(10 - detectionScore * 100)}% more!`
    };
  };

  const detectBrightYellow = (pixels) => {
    let matchingPixels = 0;
    const totalPixels = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Bright yellow/orange detection
      // High red, high green, low blue, and overall brightness
      const brightness = (r + g + b) / 3;
      if (r > 180 && g > 150 && b < 150 && brightness > 150) {
        matchingPixels++;
      }
    }
    
    return matchingPixels / totalPixels;
  };

  const detectBlue = (pixels) => {
    let matchingPixels = 0;
    const totalPixels = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Blue detection (water/sky)
      if (b > 120 && b > r && b > g) {
        matchingPixels++;
      }
    }
    
    return matchingPixels / totalPixels;
  };

  const detectGreen = (pixels) => {
    let matchingPixels = 0;
    const totalPixels = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Green detection (grass/plants)
      if (g > 100 && g > r && g > b) {
        matchingPixels++;
      }
    }
    
    return matchingPixels / totalPixels;
  };

  const getTargetName = (type) => {
    const names = {
      sun: 'sunlight',
      water: 'water/sky',
      grass: 'grass/plants'
    };
    return names[type] || type;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '1rem',
          color: '#1f2937',
        }}>
          Capture {getTargetName(type)}
        </h2>

        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '0.5rem',
              display: result ? 'none' : 'block',
            }}
          />

          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {result && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}>
                {result.detected ? '✅' : '❌'}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: result.detected ? '#16a34a' : '#dc2626',
              }}>
                {result.message}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#6b7280',
              }}>
                Detection score: {result.score}%
              </div>
            </div>
          )}
        </div>

        {!result && (
          <button
            onClick={captureImage}
            disabled={analyzing}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: analyzing ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Camera size={24} />
            {analyzing ? 'Analyzing...' : 'Capture Photo'}
          </button>
        )}

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef3c7',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#92400e',
        }}>
          <strong>Tip:</strong> Point your camera at {
            type === 'sun' ? 'bright sunlight or yellow/orange objects' :
            type === 'water' ? 'water, sky, or blue objects' :
            'grass, plants, or green objects'
          }
        </div>
      </div>
    </div>
  );
}