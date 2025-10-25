import React, { useState, useEffect, useRef } from 'react';
import { Sun, Droplets, Leaf, Package, X, ScrollText, Upload } from 'lucide-react';
// import { Camera } from 'react-native-camera'
import { styles } from './styles';
import { ImageUploader } from './ImageUploader';
import { DraggableItem } from './DraggableItem';
import { CameraModal } from './CameraModal';

const DECORATION_TYPES = [
  { id: 1, name: 'Pink Flower', defaultEmoji: '🌸', image: '/images/flower-pink.png' },
  { id: 2, name: 'Balloon', defaultEmoji: '🎈', image: '/images/balloon.png' },
  { id: 3, name: 'Mushroom', defaultEmoji: '🍄', image: '/images/mushroom.png' },
  { id: 4, name: 'Butterfly', defaultEmoji: '🦋', image: '/images/butterfly.png' },
  { id: 5, name: 'Star', defaultEmoji: '⭐', image: '/images/star.png' },
  { id: 6, name: 'Moon', defaultEmoji: '🌙', image: '/images/moon.png' },
  { id: 7, name: 'Bee', defaultEmoji: '🐝', image: '/images/bee.png' },
];

const GACHA_COST = 50;

export default function GeraldTamagotchi() {
  const [gerald, setGerald] = useState({
    alive: true,
    position: { x: 200, y: 150 },
    water: 100,
    sun: 100,
    happiness: 100,
    image: '/images/gerald.png', // Gerald's image - will fallback to emoji if image not found
  });
  
  const [gachaImage, setGachaImage] = useState('/images/gacha-button.png');
  const [currency, setCurrency] = useState(10000);
  const [logs, setLogs] = useState(['Gerald has sprouted! 🌱']);
  const [inventory, setInventory] = useState([]);
  const [placedDecorations, setPlacedDecorations] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [gachaAnimating, setGachaAnimating] = useState(false);
  const [showCamera, setShowCamera] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const mainScreenRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false); // Reset sidebar on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGerald(prev => {
        if (!prev.alive) return prev;
        
        const newWater = Math.max(0, prev.water - 1);
        const newSun = Math.max(0, prev.sun - 0.5);
        
        let newHappiness = prev.happiness;
        if (newWater < 20 | newSun < 20) {
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

  const handleCapture = async (type) => {
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
      };
      
      setInventory(prev => [...prev, newDeco]);
      addLog(`🎁 Gacha! Got ${newDeco.name}!`);
      setGachaAnimating(false);
    }, 1000);
  };

  const handleDragStart = (e, item, fromInventory = false) => {
    setDraggedItem({ item, fromInventory });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
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

  // Touch handlers for mobile dragging
  const handleTouchStart = (e, item, fromInventory = false) => {
    e.stopPropagation();
    setDraggedItem({ item, fromInventory, touchStarted: true });
  };

  const handleTouchMove = (e) => {
    if (!draggedItem || !draggedItem.touchStarted || !mainScreenRef.current) return;
    
    // Don't call preventDefault here - we'll handle it in the touch event registration
    const touch = e.touches[0];
    const rect = mainScreenRef.current.getBoundingClientRect();
    
    // Calculate position with boundaries (keep items within play area)
    let x = touch.clientX - rect.left - 30;
    let y = touch.clientY - rect.top - 30;
    
    // Constrain within boundaries (leaving some margin for item size)
    const itemSize = draggedItem.item.uniqueId === 'gerald' ? 48 : 48; // 3rem = 48px
    const maxX = rect.width - itemSize;
    const maxY = rect.height - itemSize;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    // Update position in real-time during drag
    if (draggedItem.item.uniqueId === 'gerald') {
      setGerald(prev => ({ ...prev, position: { x, y } }));
    } else if (!draggedItem.fromInventory) {
      setPlacedDecorations(prev => prev.map(d => 
        d.uniqueId === draggedItem.item.uniqueId 
          ? { ...d, position: { x, y } }
          : d
      ));
    }
  };

  const handleTouchEnd = (e) => {
    if (!draggedItem || !draggedItem.touchStarted || !mainScreenRef.current) return;
    
    const touch = e.changedTouches[0];
    const rect = mainScreenRef.current.getBoundingClientRect();
    
    // Calculate position with boundaries
    let x = touch.clientX - rect.left - 30;
    let y = touch.clientY - rect.top - 30;
    
    // Constrain within boundaries
    const itemSize = draggedItem.item.uniqueId === 'gerald' ? 48 : 48; // 3rem = 48px
    const maxX = rect.width - itemSize;
    const maxY = rect.height - itemSize;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    // Only handle fromInventory case (placing new items)
    if (draggedItem.fromInventory) {
      setPlacedDecorations(prev => [...prev, {
        ...draggedItem.item,
        position: { x, y },
      }]);
      setInventory(prev => prev.filter(i => i.uniqueId !== draggedItem.item.uniqueId));
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
    <div style={{
      ...styles.container,
      flexDirection: isMobile ? 'column' : 'row',
    }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: '0.5rem',
            left: '0.5rem',
            zIndex: 100,
            backgroundColor: '#A1C181',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Package size={24} />
        </button>
      )}

      {/* Left Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: isMobile ? '100%' : '16rem',
        minWidth: isMobile ? 'auto' : '16rem',
        height: isMobile ? (sidebarOpen ? '70vh' : '0') : 'auto',
        maxHeight: isMobile ? '70vh' : 'none',
        position: isMobile ? 'fixed' : 'relative',
        bottom: isMobile ? '0' : 'auto',
        left: '0',
        right: '0',
        zIndex: 50,
        transition: 'height 0.3s ease',
        overflow: sidebarOpen || !isMobile ? 'auto' : 'hidden',
        borderTopLeftRadius: isMobile ? '1rem' : '0',
        borderTopRightRadius: isMobile ? '1rem' : '0',
      }}>
        <h1 style={{
          ...styles.sidebarTitle,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
        }}>Gerald's Garden</h1>
        
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleCapture('sun')}
            style={{ ...styles.button, ...styles.buttonSun }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FCCA46'}
          >
            <Sun size={20} />
            Capture Sun
          </button>
          
          <button
            onClick={() => handleCapture('water')}
            style={{ ...styles.button, ...styles.buttonWater }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#233D4D'}
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
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#233D4D', textAlign: 'center' }}>
                Inventory ({inventory.length})
              </h3>
              <div style={styles.inventoryGrid}>
                {inventory.map((item) => (
                  <div
                    key={item.uniqueId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, true)}
                    onTouchStart={(e) => handleTouchStart(e, item, true)}
                    style={{
                      ...styles.inventoryItem,
                      touchAction: 'none',
                    }}
                    title={item.name}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ fontSize: '3rem', display: 'none' }}>
                      {item.defaultEmoji}
                    </div>
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
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#A1C181', textAlign: 'center' }}>
                Activity Log
              </h3>
              <div>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.logEntry,
                      borderBottom: i === logs.length - 1 ? 'none' : '1px solid #',
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
        <div style={{
          ...styles.currency,
          top: isMobile ? '0.5rem' : '1rem',
          left: isMobile ? '3.5rem' : '1rem',
          fontSize: isMobile ? '0.875rem' : '1.125rem',
          padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
        }}><img 
        src='/images/currency.png' 
        style={{ width: '1.5rem', height: '4%', marginBottom: '-5px'}}
        /> {currency}</div>

        <div
          style={{
            ...styles.gachaButton,
            backgroundColor: gachaAnimating ? '#FCCA46' : currency >= GACHA_COST ? '#fbbf24' : '#d1d5db',
            cursor: currency >= GACHA_COST && !gachaAnimating ? 'pointer' : 'not-allowed',
            animation: gachaAnimating ? 'spin 1s linear infinite' : 'none',
            width: isMobile ? '4rem' : '6rem',
            height: isMobile ? '4rem' : '6rem',
            top: isMobile ? '0.5rem' : '1rem',
            right: isMobile ? '0.5rem' : '1rem',
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
          <img
            src={gachaImage}
            alt="Gacha Machine"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' }}
            onError={(e) => {
              // Fallback to emoji if gacha image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ fontSize: '4rem', display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            🎰
          </div>
        </div>

        <div
          ref={mainScreenRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            ...styles.playArea,
            touchAction: 'none',
          }}
        >
          <DraggableItem
            item={{ uniqueId: 'gerald', image: gerald.image, name: 'Gerald' }}
            position={gerald.position}
            onDragStart={(e) => handleDragStart(e, { uniqueId: 'gerald' })}
            onTouchStart={(e) => handleTouchStart(e, { uniqueId: 'gerald' })}
            isGerald
          />

          {placedDecorations.map((deco) => (
            <DraggableItem
              key={deco.uniqueId}
              item={deco}
              position={deco.position}
              onDragStart={(e) => handleDragStart(e, deco)}
              onTouchStart={(e) => handleTouchStart(e, deco)}
              onRemove={() => removeDecoration(deco.uniqueId)}
            />
          ))}
        </div>

        <div style={{
          ...styles.statsBar,
          padding: isMobile ? '0.5rem' : '1rem',
        }}>
          <div style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '0.5rem' : '1.5rem',
          }}>
            <div style={styles.statItem}>
              <div style={{
                ...styles.statLabel,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.25rem' : '0.5rem',
              }}>
                <Droplets color="#A1C181" size={isMobile ? 20 : 24} />
                <span style={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '1.125rem' }}>Water</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#233D4D',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.water}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: isMobile ? '0.625rem' : '0.875rem', marginTop: '0.25rem', fontWeight: '600' }}>
                {Math.round(gerald.water)}%
              </div>
            </div>

            <div style={styles.statItem}>
              <div style={{
                ...styles.statLabel,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.25rem' : '0.5rem',
              }}>
                <Sun color="#FCCA46" size={isMobile ? 20 : 24} />
                <span style={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '1.125rem' }}>Sun</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#FCCA46',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.sun}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: isMobile ? '0.625rem' : '0.875rem', marginTop: '0.25rem', fontWeight: '600' }}>
                {Math.round(gerald.sun)}%
              </div>
            </div>

            <div style={styles.statItem}>
              <div style={{
                ...styles.statLabel,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.25rem' : '0.5rem',
              }}>
                <span style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}><img src='/images/gerald.png' style={{ width: '2rem', height: '100%'}}/></span>
                <span style={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '1.125rem' }}>Happy</span>
              </div>
              <div style={styles.statBar}>
                <div
                  style={{
                    backgroundColor: '#FE7F2D',
                    height: '100%',
                    transition: 'width 0.3s',
                    width: `${gerald.happiness}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: isMobile ? '0.625rem' : '0.875rem', marginTop: '0.25rem', fontWeight: '600' }}>
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