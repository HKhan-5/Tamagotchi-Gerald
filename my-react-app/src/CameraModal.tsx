import { styles } from "./styles";
import { Camera } from "lucide-react"

export const CameraModal = ({ type, onCapture, onClose }: {
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