import React, { useState, useEffect, useRef } from "react";
import { MapContainer, ImageOverlay, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface LatLngData {
  latitude: number;
  longitude: number;
  intensity?: number;
}

interface HeatmapLayerProps {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  opacity?: number;
}

interface PictureHeatmapProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  radius?: number;
  blur?: number;
  opacity?: number;
  imageBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  maxDisplaySize?: number;
  showControls?: boolean;
  data?: LatLngData[];
}

function HeatmapLayer({ points, radius = 40, blur = 20, opacity = 0.8 }: HeatmapLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const drawHeatmap = () => {
      const canvas = canvasRef.current;
      const heatCanvas = heatCanvasRef.current;
      const blurCanvas = blurCanvasRef.current;
      if (!canvas || !heatCanvas || !blurCanvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const heatCtx = heatCanvas.getContext('2d', { willReadFrequently: true });
      const blurCtx = blurCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !heatCtx || !blurCtx) return;
      
      const size = map.getSize();
      
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
        heatCanvas.width = size.x;
        heatCanvas.height = size.y;
        blurCanvas.width = size.x;
        blurCanvas.height = size.y;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      heatCtx.clearRect(0, 0, heatCanvas.width, heatCanvas.height);
      blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);

      if (points.length === 0) return;

      heatCtx.globalCompositeOperation = 'lighter';
      
      points.forEach(point => {
        const pixel = map.latLngToContainerPoint([point.lat, point.lng]);
        
        if (pixel.x < -radius * 2 || pixel.x > size.x + radius * 2 ||
            pixel.y < -radius * 2 || pixel.y > size.y + radius * 2) {
          return;
        }
        
        const gradient = heatCtx.createRadialGradient(pixel.x, pixel.y, 0, pixel.x, pixel.y, radius);
        
        const intensity = (point.intensity || 1) * 255;
        gradient.addColorStop(0, `rgba(${intensity}, ${intensity}, ${intensity}, 1)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        heatCtx.fillStyle = gradient;
        heatCtx.fillRect(pixel.x - radius, pixel.y - radius, radius * 2, radius * 2);
      });

      if (blur > 0) {
        blurCtx.filter = `blur(${blur}px)`;
        blurCtx.drawImage(heatCanvas, 0, 0);
        blurCtx.filter = 'none';
      } else {
        blurCtx.drawImage(heatCanvas, 0, 0);
      }

      const imageData = blurCtx.getImageData(0, 0, blurCanvas.width, blurCanvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const intensity = data[i] / 255;
        
        if (intensity > 0.01) {
          let r, g, b, a;
          
          if (intensity < 0.2) {
            const t = intensity / 0.2;
            r = 0;
            g = Math.round(t * 255);
            b = 255;
            a = Math.round(intensity * 255 * 3 * opacity);
          } else if (intensity < 0.4) {
            const t = (intensity - 0.2) / 0.2;
            r = 0;
            g = 255;
            b = Math.round((1 - t) * 255);
            a = Math.round(intensity * 255 * 2.5 * opacity);
          } else if (intensity < 0.6) {
            const t = (intensity - 0.4) / 0.2;
            r = Math.round(t * 255);
            g = 255;
            b = 0;
            a = Math.round(intensity * 255 * 2 * opacity);
          } else if (intensity < 0.8) {
            const t = (intensity - 0.6) / 0.2;
            r = 255;
            g = Math.round((1 - t * 0.5) * 255);
            b = 0;
            a = Math.round(intensity * 255 * 1.8 * opacity);
          } else {
            const t = (intensity - 0.8) / 0.2;
            r = 255;
            g = Math.round((1 - t) * 127);
            b = 0;
            a = Math.round(Math.min(intensity * 255 * 1.5, 255) * opacity);
          }
          
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const scheduleRedraw = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(drawHeatmap);
    };

    if (!canvasRef.current) {
      const canvas = L.DomUtil.create('canvas') as HTMLCanvasElement;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '400';
      
      const container = map.getContainer();
      container.appendChild(canvas);
      canvasRef.current = canvas;
    }

    if (!heatCanvasRef.current) {
      heatCanvasRef.current = document.createElement('canvas');
    }

    if (!blurCanvasRef.current) {
      blurCanvasRef.current = document.createElement('canvas');
    }

    drawHeatmap();

    map.on('move zoom viewreset', scheduleRedraw);
    map.on('moveend zoomend', drawHeatmap);

    return () => {
      map.off('move zoom viewreset', scheduleRedraw);
      map.off('moveend zoomend', drawHeatmap);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, [map, points, radius, blur, opacity]);

  return null;
}

function PictureHeatmap({
  imageUrl,
  imageWidth,
  imageHeight,
  radius = 40,
  blur = 20,
  opacity = 0.8,
  imageBounds,
  maxDisplaySize = 1200,
  showControls = true,
  data = []
}: PictureHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatPoint[]>([]);
  const [map, setMap] = useState<L.Map | null>(null);
  
  let displayWidth = imageWidth;
  let displayHeight = imageHeight;
  
  if (imageWidth > maxDisplaySize || imageHeight > maxDisplaySize) {
    const scale = Math.min(maxDisplaySize / imageWidth, maxDisplaySize / imageHeight);
    displayWidth = imageWidth * scale;
    displayHeight = imageHeight * scale;
  }

  // Calculate the zoom level that fits the image in the display
  useEffect(() => {
    if (map) {
      map.fitBounds([[0, 0], [imageHeight, imageWidth]], { padding: [0, 0], animate: false });
    }
  }, [map, imageWidth, imageHeight]);

  useEffect(() => {
    if (data && data.length > 0) {
      const converted: HeatPoint[] = data.map(point => {
        const normalizedX = (point.longitude - imageBounds.west) / (imageBounds.east - imageBounds.west);
        const normalizedY = (imageBounds.north - point.latitude) / (imageBounds.north - imageBounds.south);
        
        return {
          lat: normalizedY * imageHeight,
          lng: normalizedX * imageWidth,
          intensity: point.intensity || 1
        };
      });
      setHeatmapData(converted);
    }
  }, [data, imageBounds, imageWidth, imageHeight]);

  const clearHeatmap = () => {
    setHeatmapData([]);
  };

  const loadSampleData = () => {
    const sampleData: LatLngData[] = [
      { latitude: 52.13404099, longitude: 5.143940167, intensity: 1.5 },
      { latitude: 52.13457735, longitude: 5.14432722, intensity: 1.0 },
      { latitude: 52.13420, longitude: 5.14410, intensity: 1.2 },
      { latitude: 52.13445, longitude: 5.14420, intensity: 0.8 },
      { latitude: 52.13430, longitude: 5.14400, intensity: 1.3 },
    ];
    
    const converted: HeatPoint[] = sampleData.map(point => {
      const normalizedX = (point.longitude - imageBounds.west) / (imageBounds.east - imageBounds.west);
      const normalizedY = (imageBounds.north - point.latitude) / (imageBounds.north - imageBounds.south);
      
      return {
        lat: normalizedY * imageHeight,
        lng: normalizedX * imageWidth,
        intensity: point.intensity || 1
      };
    });
    setHeatmapData(converted);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const jsonData = JSON.parse(result) as LatLngData[];
          const converted: HeatPoint[] = jsonData.map(point => {
            const normalizedX = (point.longitude - imageBounds.west) / (imageBounds.east - imageBounds.west);
            const normalizedY = (imageBounds.north - point.latitude) / (imageBounds.north - imageBounds.south);
            
            return {
              lat: normalizedY * imageHeight,
              lng: normalizedX * imageWidth,
              intensity: point.intensity || 1
            };
          });
          setHeatmapData(converted);
        }
      } catch (error) {
        alert('Error parsing JSON file. Expected format: [{ latitude: ..., longitude: ..., intensity: ... }]');
      }
    };
    reader.readAsText(file);
  };

  const bounds: L.LatLngBoundsExpression = [[0, 0], [imageHeight, imageWidth]];

  return (
    <div className="w-full flex flex-col" style={{ height: showControls ? '100vh' : 'auto' }}>
      {showControls && (
        <div className="bg-gray-800 text-white p-3">
          <h1 className="text-lg font-bold mb-2">Gradient Heatmap</h1>
          
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={loadSampleData}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Load Sample
            </button>
            
            <label className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded transition cursor-pointer">
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={clearHeatmap}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded transition"
            >
              Clear ({heatmapData.length})
            </button>
          </div>
        </div>
      )}
      
      <div className={`flex items-center justify-center bg-gray-900 ${showControls ? 'flex-1 p-4' : 'p-2'}`}>
        <div style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}>
          <MapContainer
            center={[imageHeight / 2, imageWidth / 2]}
            zoom={0}
            style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
            crs={L.CRS.Simple}
            minZoom={-3}
            maxZoom={2}
            maxBounds={[[-imageHeight * 0.1, -imageWidth * 0.1], [imageHeight * 1.1, imageWidth * 1.1]]}
            maxBoundsViscosity={0.8}
            zoomControl={true}
            attributionControl={false}
            ref={setMap}
          >
            <ImageOverlay url={imageUrl} bounds={bounds} />
            <HeatmapLayer points={heatmapData} radius={radius} blur={blur} opacity={opacity} />
          </MapContainer>
        </div>
      </div>
      
      {showControls && (
        <div className="bg-gray-800 text-white p-2 text-xs">
          <p>• Upload JSON: <code className="bg-gray-700 px-1">[{`{ latitude: 52.134, longitude: 5.144, intensity: 1 }`}]</code></p>
        </div>
      )}
    </div>
  );
}

export default PictureHeatmap;