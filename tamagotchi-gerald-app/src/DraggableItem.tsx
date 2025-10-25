import { styles } from "./styles";
import { X } from "lucide-react"

export const DraggableItem = ({ item, position, onDragStart, onRemove, isGerald }: {
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