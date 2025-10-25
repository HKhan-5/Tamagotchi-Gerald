import { useRef } from "react";
import { Upload } from "lucide-react"

export const ImageUploader = ({ onImageSelect, currentImage, size = 'medium' }: {
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