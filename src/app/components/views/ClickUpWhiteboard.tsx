'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Palette,
  Square,
  Circle,
  Type,
  ArrowRight,
  Minus,
  MousePointer,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Share,
  Download,
  Trash2,
  Copy,
  Layers
} from 'lucide-react';

interface WhiteboardElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky';
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  fontSize?: number;
}

interface Point {
  x: number;
  y: number;
}

export default function ClickUpWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedFillColor, setSelectedFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#000080', '#008000', '#800000'
  ];

  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer },
    { id: 'move', name: 'Move', icon: Move },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'line', name: 'Line', icon: Minus },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight },
    { id: 'text', name: 'Text', icon: Type },
  ];

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  }, [zoom, pan]);

  // Draw elements on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw elements
    elements.forEach(element => {
      ctx.save();
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.fillStyle = element.fillColor || 'transparent';

      // Highlight selected element
      if (selectedElement === element.id) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
      }

      switch (element.type) {
        case 'rectangle':
          if (element.width && element.height) {
            if (element.fillColor && element.fillColor !== 'transparent') {
              ctx.fillRect(element.x, element.y, element.width, element.height);
            }
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
          break;

        case 'circle':
          if (element.width && element.height) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const radius = Math.min(Math.abs(element.width), Math.abs(element.height)) / 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            if (element.fillColor && element.fillColor !== 'transparent') {
              ctx.fill();
            }
            ctx.stroke();
          }
          break;

        case 'line':
          if (element.endX !== undefined && element.endY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            ctx.lineTo(element.endX, element.endY);
            ctx.stroke();
          }
          break;

        case 'arrow':
          if (element.endX !== undefined && element.endY !== undefined) {
            // Draw line
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            ctx.lineTo(element.endX, element.endY);
            ctx.stroke();

            // Draw arrowhead
            const angle = Math.atan2(element.endY - element.y, element.endX - element.x);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;

            ctx.beginPath();
            ctx.moveTo(element.endX, element.endY);
            ctx.lineTo(
              element.endX - arrowLength * Math.cos(angle - arrowAngle),
              element.endY - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.moveTo(element.endX, element.endY);
            ctx.lineTo(
              element.endX - arrowLength * Math.cos(angle + arrowAngle),
              element.endY - arrowLength * Math.sin(angle + arrowAngle)
            );
            ctx.stroke();
          }
          break;

        case 'text':
          if (element.text) {
            ctx.fillStyle = element.color;
            ctx.font = `${element.fontSize || 16}px Arial`;
            ctx.fillText(element.text, element.x, element.y);
          }
          break;

        case 'sticky':
          // Draw sticky note
          const stickyWidth = element.width || 150;
          const stickyHeight = element.height || 150;
          
          ctx.fillStyle = element.fillColor || '#fbbf24';
          ctx.fillRect(element.x, element.y, stickyWidth, stickyHeight);
          ctx.strokeRect(element.x, element.y, stickyWidth, stickyHeight);
          
          if (element.text) {
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.fillText(element.text, element.x + 10, element.y + 25);
          }
          break;
      }

      ctx.restore();
    });

    ctx.restore();
  }, [elements, selectedElement, zoom, pan]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    // Calculate visible grid bounds
    const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize;
    const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize;
    const endX = startX + (width / zoom) + gridSize;
    const endY = startY + (height / zoom) + gridSize;

    // Draw vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    setStartPoint(point);
    setIsDrawing(true);
    setDragStart(point);

    if (selectedTool === 'select') {
      // Find element at point
      const element = findElementAt(point);
      setSelectedElement(element?.id || null);
    } else if (selectedTool === 'text') {
      // Create text element
      const text = prompt('Enter text:');
      if (text) {
        const newElement: WhiteboardElement = {
          id: Date.now().toString(),
          type: 'text',
          x: point.x,
          y: point.y,
          text,
          color: selectedColor,
          strokeWidth,
          fontSize: 16
        };
        setElements(prev => [...prev, newElement]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasCoordinates(e);

    if (selectedTool === 'move' || (selectedTool === 'select' && selectedElement)) {
      // Move selected element
      if (selectedElement) {
        const dx = point.x - dragStart.x;
        const dy = point.y - dragStart.y;
        
        setElements(prev => prev.map(el => 
          el.id === selectedElement 
            ? { ...el, x: el.x + dx, y: el.y + dy, endX: el.endX ? el.endX + dx : undefined, endY: el.endY ? el.endY + dy : undefined }
            : el
        ));
        
        setDragStart(point);
      }
    } else if (['rectangle', 'circle'].includes(selectedTool)) {
      // Preview shape
      const width = point.x - startPoint.x;
      const height = point.y - startPoint.y;
      
      setElements(prev => {
        const filtered = prev.filter(el => el.id !== 'preview');
        return [...filtered, {
          id: 'preview',
          type: selectedTool as 'rectangle' | 'circle',
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: Math.abs(width),
          height: Math.abs(height),
          color: selectedColor,
          fillColor: selectedFillColor,
          strokeWidth
        }];
      });
    } else if (['line', 'arrow'].includes(selectedTool)) {
      // Preview line/arrow
      setElements(prev => {
        const filtered = prev.filter(el => el.id !== 'preview');
        return [...filtered, {
          id: 'preview',
          type: selectedTool as 'line' | 'arrow',
          x: startPoint.x,
          y: startPoint.y,
          endX: point.x,
          endY: point.y,
          color: selectedColor,
          strokeWidth
        }];
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && selectedTool !== 'select' && selectedTool !== 'move' && selectedTool !== 'text') {
      // Finalize element
      setElements(prev => prev.map(el => 
        el.id === 'preview' ? { ...el, id: Date.now().toString() } : el
      ));
    }
    
    setIsDrawing(false);
  };

  const findElementAt = (point: Point): WhiteboardElement | null => {
    // Find topmost element at point (reverse order)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      
      if (el.type === 'rectangle' && el.width && el.height) {
        if (point.x >= el.x && point.x <= el.x + el.width &&
            point.y >= el.y && point.y <= el.y + el.height) {
          return el;
        }
      } else if (el.type === 'circle' && el.width && el.height) {
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        const radius = Math.min(Math.abs(el.width), Math.abs(el.height)) / 2;
        const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
        if (distance <= radius) {
          return el;
        }
      } else if ((el.type === 'line' || el.type === 'arrow') && el.endX && el.endY) {
        // Simple line hit detection (within 5 pixels)
        const distance = distanceFromPointToLine(point, { x: el.x, y: el.y }, { x: el.endX, y: el.endY });
        if (distance <= 5) {
          return el;
        }
      }
    }
    return null;
  };

  const distanceFromPointToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq === 0 ? -1 : dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const duplicateSelectedElement = () => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        const newElement = {
          ...element,
          id: Date.now().toString(),
          x: element.x + 20,
          y: element.y + 20,
          endX: element.endX ? element.endX + 20 : undefined,
          endY: element.endY ? element.endY + 20 : undefined
        };
        setElements(prev => [...prev, newElement]);
      }
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Redraw canvas when elements change
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          draw();
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [draw]);

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Palette className="h-5 w-5 mr-2 text-purple-600" />
              Whiteboard
            </h2>

            {/* Tools */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded ${
                    selectedTool === tool.id
                      ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={tool.name}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
              <div className="flex items-center space-x-1">
                {colors.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Width:</span>
              <select
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={4}>4px</option>
                <option value={8}>8px</option>
              </select>
            </div>
          </div>

          {/* Right Tools */}
          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={zoomOut}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <button
              onClick={resetView}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Element Actions */}
            {selectedElement && (
              <div className="flex items-center space-x-1 border-l border-gray-300 dark:border-gray-600 pl-3">
                <button
                  onClick={duplicateSelectedElement}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={deleteSelectedElement}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-3">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Save className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Share className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* Instructions */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Palette className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Start Creating</h3>
              <p className="text-sm">
                Select a tool from the toolbar and start drawing<br />
                Use the select tool to move and edit elements
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}