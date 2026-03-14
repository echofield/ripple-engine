"use client";
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RipplePoint } from './RippleNode';
import type { RippleNode } from '@/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapEngineProps {
  ripples: RippleNode[];
}

export const MapEngine = ({ ripples }: MapEngineProps) => {
  return (
    <div className="w-full h-screen absolute top-0 left-0 z-0 bg-paper">

      <div className="absolute inset-0 pointer-events-none z-30 opacity-10">
         <div className="w-full h-1 bg-emerald animate-scan shadow-[0_0_15px_rgba(16,185,129,1)]" />
      </div>

      <div className="absolute inset-0 bg-paper/60 pointer-events-none z-10 mix-blend-multiply" />
      <div className="absolute inset-0 dot-grid opacity-present pointer-events-none z-20" />

      {MAPBOX_TOKEN ? (
        <Map
          initialViewState={{
            longitude: 2.3256,
            latitude: 48.8755,
            zoom: 14.5
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {ripples.map((rip) => (
            <Marker key={rip.id} longitude={rip.lng} latitude={rip.lat} anchor="center">
              <div className="z-50 relative pointer-events-auto">
                <RipplePoint intensity={rip.intensity} label={rip.label} why={rip.why} profession={rip.profession || ""} />
              </div>
            </Marker>
          ))}
        </Map>
      ) : (
         <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="text-ink/20 uppercase tracking-[0.5em] text-[10px] font-bold">
               [ Mapbox Token Required ]
            </div>
            <div className="text-ink/10 text-[8px] uppercase tracking-widest max-w-xs text-center">
               Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables
            </div>
         </div>
      )}
    </div>
  );
};
