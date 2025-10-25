import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ImageUploader } from './ImageUploader.tsx'
import { DraggableItem } from './DraggableItem.tsx'
import { CameraModal } from './CameraModal.tsx'

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sun, Droplets, Leaf, Package, X, ScrollText, Upload } from 'lucide-react';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

const DECORATION_TYPES = [
  { id: 1, name: 'Pink Flower', defaultEmoji: '🌸' },
  { id: 2, name: 'Sunflower', defaultEmoji: '🌻' },
  { id: 3, name: 'Mushroom', defaultEmoji: '🍄' },
  { id: 4, name: 'Butterfly', defaultEmoji: '🦋' },
  { id: 5, name: 'Rainbow', defaultEmoji: '🌈' },
  { id: 6, name: 'Star', defaultEmoji: '⭐' },
  { id: 7, name: 'Moon', defaultEmoji: '🌙' },
  { id: 8, name: 'Bee', defaultEmoji: '🐝' },
];

const GACHA_COST = 50;

export default function GeraldTamagotchi() {
  const [gerald, setGerald] = useState({
    alive: true,
    position: { x: 200, y: 150 },
    water: 100,
    sun: 100,
    happiness: 100,
    image: null,
  });
  
  const [gachaImage, setGachaImage] = useState(null);
  const [currency, setCurrency] = useState(100);
  const [logs, setLogs] = useState(['Gerald has sprouted! 🌱']);
  const [inventory, setInventory] = useState([]);
  const [placedDecorations, setPlacedDecorations] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [gachaAnimating, setGachaAnimating] = useState(false);
  const [showCamera, setShowCamera] = useState(null);
  
  const mainScreenRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGerald(prev => {
        if (!prev.alive) return prev;
        
        const newWater = Math.max(0, prev.water - 1);
        const newSun = Math.max(0, prev.sun - 0.5);
        
        let newHappiness = prev.happiness;
        if (newWater < 20 && newSun < 20) {
          newHappiness = Math.max(0, prev.happiness - 1);
        }
        
        const newAlive = newWater > 0 && newSun > 0;
        
        if (!newAlive && prev.alive) {
          addLog('💀 Gerald has wilted...');
        }
        
        return {
          ...prev,
          water: newWater,
          sun: newSun,
          happiness: newHappiness,
          alive: newAlive,
        };
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const addLog = (message) => {
    setLogs(prev => [message, ...prev].slice(0, 50));
  };

  const handleCapture = (type) => {
    setShowCamera(type);
  };

  const simulateCapture = (type) => {
    setCurrency(prev => prev + 10);
    
    if (type === 'sun') {
      setGerald(prev => ({
        ...prev,
        sun: Math.min(100, prev.sun + 20),
      }));
      addLog('☀️ Captured sunlight! +20 sun');
    } else if (type === 'water') {
      setGerald(prev => ({
        ...prev,
        water: Math.min(100, prev.water + 25),
      }));
      addLog('💧 Collected water! +25 water');
    } else if (type === 'grass') {
      if (!gerald.alive) {
        setGerald(prev => ({
          ...prev,
          alive: true,
          water: 50,
          sun: 50,
          happiness: 50,
        }));
        addLog('🌿 Gerald has been revived!');
      }
    }
    
    setShowCamera(null);
  };

  const handleGacha = () => {
    if (currency < GACHA_COST || gachaAnimating) return;
    
    setCurrency(prev => prev - GACHA_COST);
    setGachaAnimating(true);
    
    setTimeout(() => {
      const randomDeco = DECORATION_TYPES[Math.floor(Math.random() * DECORATION_TYPES.length)];
      const newDeco = {
        ...randomDeco,
        uniqueId: Date.now(),
        image: null,
      };
      
      setInventory(prev => [...prev, newDeco]);
      addLog(`🎁 Gacha! Got ${newDeco.name}!`);
      setGachaAnimating(false);
    }, 1000);
  };

  const handleDragStart = (e, item, fromInventory = false) => {
    setDraggedItem({ item, fromInventory });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem || !mainScreenRef.current) return;
    
    const rect = mainScreenRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 30;
    const y = e.clientY - rect.top - 30;
    
    if (draggedItem.fromInventory) {
      setPlacedDecorations(prev => [...prev, {
        ...draggedItem.item,
        position: { x, y },
      }]);
      setInventory(prev => prev.filter(i => i.uniqueId !== draggedItem.item.uniqueId));
    } else if (draggedItem.item.uniqueId === 'gerald') {
      setGerald(prev => ({ ...prev, position: { x, y } }));
    } else {
      setPlacedDecorations(prev => prev.map(d => 
        d.uniqueId === draggedItem.item.uniqueId 
          ? { ...d, position: { x, y } }
          : d
      ));
    }
    
    setDraggedItem(null);
  };

  const removeDecoration = (uniqueId) => {
    const deco = placedDecorations.find(d => d.uniqueId === uniqueId);
    if (deco) {
      setInventory(prev => [...prev, deco]);
      setPlacedDecorations(prev => prev.filter(d => d.uniqueId !== uniqueId));
    }
  };

  const updateInventoryImage = (uniqueId, image) => {
    setInventory(prev => prev.map(item => 
      item.uniqueId === uniqueId ? { ...item, image } : item
    ));
  };

  return (
    <div style={styles.container}>
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Gerald's Garden</h1>
        
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleCapture('sun')}
            style={{ ...styles.button, ...styles.buttonSun }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fbbf24'}
          >
            <Sun size={20} />
            Capture Sun
          </button>
          
          <button
            onClick={() => handleCapture('water')}
            style={{ ...styles.button, ...styles.buttonWater }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#60a5fa'}
          >
            <Droplets size={20} />
            Capture Water
          </button>
          
          <button
            onClick={() => handleCapture('grass')}
            disabled={gerald.alive}
            style={{
              ...styles.button,
              ...(gerald.alive ? styles.buttonDisabled : styles.buttonGrass)
            }}
            onMouseEnter={(e) => !gerald.alive && (e.currentTarget.style.backgroundColor = '#16a34a')}
            onMouseLeave={(e) => !gerald.alive && (e.currentTarget.style.backgroundColor = '#22c55e')}
          >
            <Leaf size={20} />
            Revive (Grass)
          </button>
        </div>

        <div style={styles.toggleButtons}>
          <button
            onClick={() => setActivePanel(activePanel === 'inventory' ? null : 'inventory')}
            style={{
              ...styles.toggleButton,
              backgroundColor: activePanel === 'inventory' ? '#9333ea' : '#f3e8ff',
              color: activePanel === 'inventory' ? 'white' : '#7c3aed',
            }}
            onMouseEnter={(e) => {
              if (activePanel !== 'inventory') e.currentTarget.style.backgroundColor = '#e9d5ff';
            }}
            onMouseLeave={(e) => {
              if (activePanel !== 'inventory') e.currentTarget.style.backgroundColor = '#f3e8ff';
            }}
          >
            <Package size={18} />
            <span>Inventory</span>
          </button>
          
          <button
            onClick={() => setActivePanel(activePanel === 'logs' ? null : 'logs')}
            style={{
              ...styles.toggleButton,
              backgroundColor: activePanel === 'logs' ? '#16a34a' : '#dcfce7',
              color: activePanel === 'logs' ? 'white' : '#15803d',
            }}
            onMouseEnter={(e) => {
              if (activePanel !== 'logs') e.currentTarget.style.backgroundColor = '#bbf7d0';
            }}
            onMouseLeave={(e) => {
              if (activePanel !== 'logs') e.currentTarget.style.backgroundColor = '#dcfce7';
            }}
          >
            <ScrollText size={18} />
            <span>Logs</span>
          </button>
        </div>

        <div style={styles.panelContent}>
          {activePanel === 'inventory' && (
            <div style={styles.inventoryPanel}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#6b21a8', textAlign: 'center' }}>
                Inventory ({inventory.length})
              </h3>
              <div style={styles.inventoryGrid}>
                {inventory.map((item) => (
                  <div
                    key={item.uniqueId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, true)}
                    style={styles.inventoryItem}
                    title={item.name}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                      />
                    ) : (
                      <ImageUploader
                        onImageSelect={(image) => updateInventoryImage(item.uniqueId, image)}
                        currentImage={item.image}
                        size="small"
                      />
                    )}
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p style={{ gridColumn: '1 / -1', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>
                    No items yet. Try the gacha!
                  </p>
                )}
              </div>
            </div>
          )}

          {activePanel === 'logs' && (
            <div style={styles.logsPanel}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#166534', textAlign: 'center' }}>
                Activity Log
              </h3>
              <div>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.logEntry,
                      borderBottom: i === logs.length - 1 ? 'none' : '1px solid #bbf7d0',
                    }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Screen */}
      <div style={styles.mainContainer}>
        <div style={styles.currency}>💰 {currency}</div>

        <div
          style={{
            ...styles.gachaButton,
            backgroundColor: gachaAnimating ? '#fde047' : currency >= GACHA_COST ? '#fbbf24' : '#d1d5db',
            cursor: currency >= GACHA_COST && !gachaAnimating ? 'pointer' : 'not-allowed',
            animation: gachaAnimating ? 'spin 1s linear infinite' : 'none',
          }}
          onClick={handleGacha}
          title={`Gacha (${GACHA_COST} coins)`}
          onMouseEnter={(e) => {
            if (currency >= GACHA_COST && !gachaAnimating) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ImageUploader
            onImageSelect={setGachaImage}
            currentImage={gachaImage}
            size="large"
          />
        </div>

        <div
          ref={mainScreenRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={styles.playArea}
        >
          <DraggableItem
            item={{ uniqueId: 'gerald', image: gerald.image, name: 'Gerald' }}
            position={gerald.position}
            onDragStart={(e) => handleDragStart(e, { uniqueId: 'gerald' })}
            isGerald
          />

          {placedDecorations.map((deco) => (
            <DraggableItem
              key={deco.uniqueId}
              item={deco}
              position={deco.position}
              onDragStart={(e) => handleDragStart(e, deco)}
              onRemove={() => removeDecoration(deco.uniqueId)}
            />
          ))}
        </div>

        <div style={styles.statsBar}>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <Droplets color="#3b82f6" size={24} />
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Water</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.water}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>
                {Math.round(gerald.water)}%
              </div>
            </div>

            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <Sun color="#eab308" size={24} />
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Sun</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#eab308',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.sun}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>
                {Math.round(gerald.sun)}%
              </div>
            </div>

            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <span style={{ fontSize: '1.5rem' }}>😊</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Happiness</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#22c55e',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.happiness}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>
                {Math.round(gerald.happiness)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraModal
          type={showCamera}
          onCapture={() => simulateCapture(showCamera)}
          onClose={() => setShowCamera(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}