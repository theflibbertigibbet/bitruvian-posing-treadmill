
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WalkingEnginePose, WalkingEngineGait, WalkingEnginePivotOffsets, WalkingEngineProportions } from './types';
import { ANATOMY_RAW_RELATIVE_TO_BASE_HEAD_UNIT, MANNEQUIN_LOCAL_FLOOR_Y, GROUND_STRIP_HEIGHT_RAW_H_UNIT, SCALE_FACTOR } from './constants'; 
import { Scanlines, SystemGuides } from './components/SystemGrid';
import { Mannequin } from './components/Mannequin';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('physics'); 
  const [showPivots, setShowPivots] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [bobblehead, setBobblehead] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const H = 150; // Base unit from the walking engine, adjusted for visual size (was 50, now tripled)

  // GAIT & PHYSICS SYSTEM
  const [gait, setGait] = useState<WalkingEngineGait>({
    intensity: 0.5,
    stride: 0.6,
    lean: 0.1,
    frequency: 1.0,
    gravity: 0.5,
    bounce: 0.4,
    bends: 0.7,        
    head_spin: 0.0,    
    mood: 0.5,         
    ground_drag: 0.2   
  });

  // Core Pose State (Dynamically calculated by physics)
  const [pose, setPose] = useState<WalkingEnginePose>({
    neck: 0, collar: 0, torso: 0,
    l_shoulder: 15, r_shoulder: -15,
    l_elbow: 0, r_elbow: 0,
    l_hand: 0, r_hand: 0,
    l_hip: 0, r_hip: 0,
    l_knee: 0, r_knee: 0,
    l_foot: 0, r_foot: 0,
    stride_phase: 0,
    y_offset: 0 
  });

  // Pivot Offsets (User-controlled manual adjustments)
  const [pivotOffsets, setPivotOffsets] = useState<WalkingEnginePivotOffsets>({
    neck: 0, collar: 0, torso: 0,
    l_shoulder: 0, r_shoulder: 0,
    l_elbow: 0, r_elbow: 0,
    l_hand: 0, r_hand: 0,
    l_hip: 0, r_hip: 0,
    l_knee: 0, r_knee: 0,
    l_foot: 0, r_foot: 0
  });

  const headSpring = useRef({ pos: 0, vel: 0 });

  const [props, setProps] = useState<WalkingEngineProportions>({
    head: { w: 1, h: 1 },
    collar: { w: 1, h: 1 },
    torso: { w: 1, h: 1 },
    pelvis: { w: 1, h: 1 },
    arms: { w: 1, h: 1 },
    hand: { w: 0.5, h: 1 },
    legs: { w: 1, h: 1 },
    foot: { w: 0.5, h: 1 },
  });

  const [showSplash, setShowSplash] = useState(true);

  // PHYSICS ENGINE v5.5 - PERPETUAL LOOP
  useEffect(() => {
    let frame: number;
    const animate = (time: number) => {
      if (isPaused) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const p = (time * 0.005 * gait.frequency) % (Math.PI * 2);
      
      const strideVal = Math.sin(p);
      const counterStride = Math.sin(p + Math.PI);
      
      const moodFactor = gait.mood;
      const hipMult = (20 + (gait.stride * 45)) * (0.8 + gait.intensity * 0.4) * (0.5 + moodFactor);
      const kneeMult = (10 + (gait.stride * 60)) * gait.bends * (0.5 + gait.intensity);
      
      const weightDip = (1 - moodFactor) * 20 + (gait.ground_drag * 30);
      const verticalOscillation = Math.abs(Math.cos(p)) * (15 * gait.bounce);
      const bobbing = verticalOscillation + (gait.gravity * 15) + weightDip;

      const moodTorso = (moodFactor - 0.5) * -40;
      const torsoLean = (gait.lean * 35) + moodTorso + (Math.sin(p) * 8 * gait.intensity);

      let headBobble = 0;
      if (bobblehead) {
        const target = -torsoLean * 0.6;
        const force = (target - headSpring.current.pos) * 0.12;
        headSpring.current.vel += force;
        headSpring.current.vel *= 0.82;
        headSpring.current.pos += headSpring.current.vel;
        headBobble = headSpring.current.pos;
      }

      const calcAnkleIK = (s: number, hip: number, knee: number, torso: number) => {
        const totalRotation = hip + knee + torso;
        const dragEffect = (1 - s) * (gait.ground_drag * 40);
        return s < 0 ? -totalRotation : (20 * s) + dragEffect;
      };

      setPose(prev => {
        const l_hip = strideVal * hipMult;
        const l_knee = (strideVal > 0 ? strideVal * kneeMult : (5 + gait.ground_drag * 25));
        const r_hip = counterStride * hipMult;
        const r_knee = (counterStride > 0 ? counterStride * kneeMult : (5 + gait.ground_drag * 25));

        return {
          ...prev,
          stride_phase: strideVal,
          y_offset: bobbing,
          torso: torsoLean,
          collar: -torsoLean * 0.7 + (moodFactor * 15),
          neck: -torsoLean * 0.2 - (moodFactor * 20) + (gait.head_spin * 180) + headBobble,
          l_hip, l_knee, r_hip, r_knee,
          l_foot: calcAnkleIK(strideVal, l_hip, l_knee, torsoLean),
          r_foot: calcAnkleIK(counterStride, r_hip, r_knee, torsoLean),
          l_shoulder: counterStride * (hipMult * (0.4 + moodFactor)),
          l_elbow: (-25 * gait.bends) + (counterStride * 40 * gait.intensity * (1.2 - moodFactor) * gait.bends),
          r_shoulder: strideVal * (hipMult * (0.4 + moodFactor)),
          r_elbow: (-25 * gait.bends) + (strideVal * 40 * gait.intensity * (1.2 - moodFactor) * gait.bends),
        };
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [gait, bobblehead, isPaused]);

  const updateGait = useCallback((key: keyof WalkingEngineGait, val: string) => setGait(prev => ({ ...prev, [key]: parseFloat(val) })), []);
  const updateProp = useCallback((piece: keyof WalkingEngineProportions, axis: 'w' | 'h', val: string) => setProps(prev => ({ ...prev, [piece]: { ...prev[piece], [axis]: parseFloat(val) } })), []);
  const updatePivotOffset = useCallback((key: keyof WalkingEnginePivotOffsets, val: string) => setPivotOffsets(prev => ({ ...prev, [key]: parseInt(val) })), []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fixed viewBox for consistent SVG coordinate system
  const currentViewBox = "-500 -1500 1000 2000"; // Increased viewBox to accommodate larger doll
  
  // Visual floor Y position in the SVG coordinate system
  const visualFloorY = 500; // An absolute Y coordinate within the viewBox for the floor

  // Calculate the base Y position of the mannequin's root to place its feet on the floor
  // MANNEQUIN_LOCAL_FLOOR_Y * H gives the Y coord of the feet relative to the mannequin's internal (0,0) (hip)
  const mannequinBaseYTranslation = visualFloorY - (MANNEQUIN_LOCAL_FLOOR_Y * H);

  return (
    <div className="flex h-full w-full bg-paper font-mono text-ink overflow-hidden select-none">
      <div className="w-80 border-r border-ridge bg-mono-darker p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <h1 className="text-xl font-archaic tracking-widest border-b border-ridge pb-2 text-mono-light uppercase italic">Bitruvius.Physics</h1>
        
        <div className="flex border border-ridge rounded overflow-hidden shadow-inner">
          {['physics', 'pivots', 'proportions'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-[9px] p-2 transition-colors ${activeTab === tab ? 'bg-selection text-paper' : 'bg-transparent text-mono-mid hover:text-ink'}`}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === 'physics' && (
          <div className="flex flex-col gap-5 p-4 border border-selection/20 bg-selection/5 rounded shadow-lg">
            <div className="flex justify-between items-center mb-2 border-b border-selection/10 pb-1">
              <h2 className="text-[10px] text-selection font-bold tracking-[0.2em] uppercase">Gait Modulation</h2>
              <button 
                onClick={() => setBobblehead(!bobblehead)}
                className={`text-[8px] px-2 py-0.5 border rounded transition-colors font-bold ${bobblehead ? 'bg-selection text-paper border-selection' : 'border-mono-mid text-mono-mid opacity-60'}`}
              >
                BOBBLE: {bobblehead ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="grid gap-3">
              {(Object.keys(gait) as Array<keyof WalkingEngineGait>).map(key => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[8px] uppercase font-bold text-mono-light opacity-80">
                    <span>{key.replace('_', ' ')}</span>
                    <span className="text-selection">{(gait[key] * (key === 'head_spin' ? 360 : 100)).toFixed(0)}{key === 'head_spin' ? '°' : '%'}</span>
                  </div>
                  <input type="range" min={key === 'lean' || key === 'mood' || key === 'head_spin' ? "-1" : "0"} max={key === 'frequency' ? "4" : key === 'bends' ? "10" : "2"} step="0.01" value={gait[key]} onChange={(e) => updateGait(key, e.target.value)} className="w-full accent-selection bg-ridge h-1.5 appearance-none cursor-pointer rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'proportions' && (
          <div className="flex flex-col gap-3 p-4 border border-selection/20 bg-selection/5 rounded shadow-lg">
            <p className="text-[9px] text-mono-mid italic border-b border-selection/10 pb-2">Adjust limb scaling during active walk cycle.</p>
            {(Object.keys(props) as Array<keyof WalkingEngineProportions>).map(piece => (
              <div key={piece} className="flex flex-col gap-2 p-2 border border-ridge/30 rounded">
                <span className="text-[10px] text-selection font-bold uppercase">{piece}</span>
                <div className="flex justify-between text-[8px] uppercase font-bold text-mono-light opacity-80">
                  <span>Width</span>
                  <span className="text-selection">{(props[piece].w).toFixed(2)}x</span>
                </div>
                <input type="range" min="0.1" max="2" step="0.01" value={props[piece].w} onChange={(e) => updateProp(piece, 'w', e.target.value)} className="w-full accent-mono-light bg-ridge h-1 appearance-none cursor-pointer" />
                <div className="flex justify-between text-[8px] uppercase font-bold text-mono-light opacity-80 mt-2">
                  <span>Height</span>
                  <span className="text-selection">{(props[piece].h).toFixed(2)}x</span>
                </div>
                <input type="range" min="0.1" max="2" step="0.01" value={props[piece].h} onChange={(e) => updateProp(piece, 'h', e.target.value)} className="w-full accent-mono-light bg-ridge h-1 appearance-none cursor-pointer" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pivots' && (
           <div className="flex flex-col gap-3 p-4 border border-selection/20 bg-selection/5 rounded shadow-lg">
            <p className="text-[9px] text-mono-mid italic border-b border-selection/10 pb-2">Set additive rotational offsets for joints.</p>
            {(Object.keys(pivotOffsets) as Array<keyof WalkingEnginePivotOffsets>).sort().map(key => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]"><span>{key.toUpperCase()}</span><span>{pivotOffsets[key]}°</span></div>
                <input type="range" min="-180" max="180" value={pivotOffsets[key]} onChange={(e) => updatePivotOffset(key, e.target.value)} className="w-full accent-mono-mid bg-ridge h-1 appearance-none cursor-pointer" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-triangle-grid p-8 overflow-hidden">
        {/* VIEWPORT OVERLAY CONTROLS */}
        <div className="absolute top-8 left-8 flex gap-3 z-10">
          <button onClick={() => setIsPaused(!isPaused)} className={`text-[9px] px-3 py-1 border transition-all ${isPaused ? 'bg-red-900/40 text-red-200 border-red-500' : 'bg-paper/10 text-mono-mid border-ridge hover:bg-paper/20'}`}>
            {isPaused ? 'RESUME LOOP' : 'PAUSE LOOP'}
          </button>
          <button onClick={() => setShowPivots(!showPivots)} className={`text-[9px] px-3 py-1 border transition-all ${showPivots ? 'bg-selection text-paper border-selection' : 'bg-paper/10 text-mono-mid border-ridge hover:bg-paper/20'}`}>
            {showPivots ? 'HIDE ANCHORS' : 'SHOW ANCHORS'}
          </button>
          <button onClick={() => setShowLabels(!showLabels)} className={`text-[9px] px-3 py-1 border transition-all ${showLabels ? 'bg-selection text-paper border-selection' : 'bg-paper/10 text-mono-mid border-ridge hover:bg-paper/20'}`}>
            {showLabels ? 'HIDE LABELS' : 'SHOW LABELS'}
          </button>
        </div>
        
        <Scanlines />
        {showSplash && (
            <div className="absolute top-[8%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
              <h1 className="text-6xl font-archaic text-paper/80 animate-terminal-boot tracking-widest uppercase">BITRUVIUS</h1>
            </div>
          )}

        <svg viewBox={currentViewBox} className="w-full h-full drop-shadow-2xl overflow-visible relative z-10">
          <SystemGuides floorY={visualFloorY} baseUnitH={H} />
          {/* Combine mannequinBaseYTranslation and pose.y_offset */}
          <g transform={`translate(0, ${mannequinBaseYTranslation + pose.y_offset})`}>
            <Mannequin
              pose={pose}
              pivotOffsets={pivotOffsets}
              props={props}
              showPivots={showPivots}
              showLabels={showLabels}
              baseUnitH={H}
            />
          </g>
        </svg>

        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1 opacity-80 pointer-events-none font-mono text-right">
          <div className="text-[10px] text-selection font-bold px-2 border border-selection uppercase tracking-widest">PERPETUAL_LOOP_ACTIVE</div>
          <div className="text-[8px] flex gap-4 text-mono-mid uppercase"><span>Mood:</span> <span className="text-white">{(gait.mood).toFixed(2)}</span></div>
          <div className="text-[8px] flex gap-4 text-mono-mid uppercase"><span>Drag:</span> <span className="text-white">{(gait.ground_drag).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default App;
