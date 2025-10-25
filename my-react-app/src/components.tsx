import React, { useState, useEffect, useRef, type ReactEventHandler } from 'react';
import { Camera, Sun, Droplets, Leaf, Package, X, ScrollText, Upload } from 'lucide-react';
import { styles } from './styles';

const ImageUploader = ({ onImageSelect, currentImage, size = 'medium' }: {
  onImageSelect: (image: string) => void;
  currentImage?: string;
  size?: 'small' | 'medium' | 'large';
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileChange = (e: FileChangeEvent): void => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = (): void => {
        onImageSelect(typeof reader.result == "string"? reader.result: "");
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeMap = {
    small: { width: '100%', height: '100%', fontSize: '2rem' },
    medium: { width: '4rem', height: '4rem', fontSize: '2rem' },
    large: { width: '6rem', height: '6rem', fontSize: '3rem' },
  };

  const dimensions = sizeMap[size];

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: size === 'large' ? '9999px' : '0.5rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: currentImage ? 'transparent' : '#f3f4f6',
        border: currentImage ? 'none' : '2px dashed #d1d5db',
      }}
    >
      {currentImage ? (
        <img
          src={currentImage}
          alt="Uploaded"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Upload size={size === 'small' ? 20 : size === 'medium' ? 24 : 32} color="#9ca3af" />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

const DraggableItem = ({ item, position, onDragStart, onRemove, isGerald }: {
  item: { image?: string; name: string };
  position: { x: number; y: number };
  onDragStart: (e: React.DragEvent) => void;
  onRemove?: () => void;
  isGerald: boolean;
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        ...styles.draggable,
        left: position.x,
        top: position.y,
      } as React.CSSProperties}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '-0.5rem',
            right: '-0.5rem',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '9999px',
            width: '1.25rem',
            height: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        >
          <X size={12} />
        </button>
      )}
      <div
        style={{
          filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))',
        }}
        onMouseEnter={(e) => {
          const removeBtn = e.currentTarget.parentElement?.querySelector('button');
          if (removeBtn) removeBtn.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          const removeBtn = e.currentTarget.parentElement?.querySelector('button');
          if (removeBtn) removeBtn.style.opacity = '0';
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: isGerald ? '4rem' : '3rem',
              height: isGerald ? '4rem' : '3rem',
              objectFit: 'cover',
              borderRadius: '0.5rem',
            }}
          />
        ) : (
          <div style={{ fontSize: isGerald ? '4rem' : '3rem' }}>
            {isGerald ? '🌱' : '❓'}
          </div>
        )}
      </div>
      {isGerald && (
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '0.25rem',
            color: '#166534',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          Gerald
        </div>
      )}
    </div>
  );
};

const CameraModal = ({ type, onCapture, onClose }: {
  type: string;
  onCapture: () => void;
  onClose: () => void;
}) => {
  return (
    <div style={styles.modal as React.CSSProperties}>
      <div style={styles.modalContent}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          {type === 'sun' && '☀️ Capture Sunlight'}
          {type === 'water' && '💧 Capture Water'}
          {type === 'grass' && '🌿 Capture Grass'}
        </h2>
        
        <div
          style={{
            backgroundColor: '#e5e7eb',
            aspectRatio: '16/9',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Camera size={64} color="#9ca3af" />
          <p style={{ marginLeft: '1rem', color: '#6b7280' }}>Camera view</p>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
          In a real app, this would use your camera and AI to detect {type}!
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onCapture}
            style={{
              ...styles.button,
              ...styles.buttonGrass,
              flex: 1,
            }}
          >
            Capture ✓
          </button>
          <button
            onClick={onClose}
            style={{
              ...styles.button,
              backgroundColor: '#d1d5db',
              color: '#374151',
              flex: 1,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};