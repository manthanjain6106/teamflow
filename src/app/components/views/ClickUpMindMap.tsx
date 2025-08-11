'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Brain,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Save,
  Undo2,
  Redo2,
  Download,
  Upload,
  Link as LinkIcon,
  Unlink,
  Search as SearchIcon,
  Palette,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTasks } from '@/hooks/useData';
import { useStore } from '@/store/useStore';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
  children: string[];
  color: string;
  taskId?: string;
  collapsed?: boolean;
  notes?: string;
  tags?: string[];
}

interface Connection {
  fromId: string;
  toId: string;
}

interface SimpleTask {
  id: string;
  name: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED' | string;
}

export default function ClickUpMindMap() {
  const { selectedSpace, selectedList } = useStore();
  const { tasks: taskData = [] } = useTasks({ listId: selectedList?.id, spaceId: selectedSpace?.id });
  const tasks: SimpleTask[] = useMemo(
    () => taskData.map((t: any) => ({ id: t.id, name: t.name, status: t.status })),
    [taskData]
  );
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Advanced features state
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkingFromNodeId, setLinkingFromNodeId] = useState<string | null>(null);
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const groupDragInitialPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const GRID_SIZE = 10;

  // Undo/redo stacks
  type Snapshot = { nodes: MindMapNode[]; connections: Connection[]; zoom: number; pan: { x: number; y: number } };
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize mind map with root node
  useEffect(() => {
    if (nodes.length === 0 && selectedSpace) {
      const rootNode: MindMapNode = {
        id: 'root',
        text: selectedSpace.name || 'Project',
        x: 400,
        y: 300,
        level: 0,
        children: [],
        color: '#8b5cf6',
        collapsed: false
      };
      setNodes([rootNode]);
    }
  }, [selectedSpace, nodes.length]);

  // Auto-generate nodes from tasks
  useEffect(() => {
    if (tasks.length > 0 && nodes.length === 1) {
      const taskNodes: MindMapNode[] = tasks.slice(0, 8).map((task: SimpleTask, index) => {
        const angle = (index / tasks.length) * 2 * Math.PI;
        const radius = 150;
        const x = 400 + Math.cos(angle) * radius;
        const y = 300 + Math.sin(angle) * radius;
        
        return {
          id: task.id,
          text: task.name,
          x,
          y,
          level: 1,
          parentId: 'root',
          children: [],
          color: getStatusColor(task.status),
          taskId: task.id,
          collapsed: false
        };
      });

      const rootNode = nodes[0];
      const updatedRoot = {
        ...rootNode,
        children: taskNodes.map(n => n.id)
      };

      setNodes([updatedRoot, ...taskNodes]);
      
      const newConnections = taskNodes.map(node => ({
        fromId: 'root',
        toId: node.id
      }));
      setConnections(newConnections);
    }
  }, [tasks, nodes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return '#6b7280';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'IN_REVIEW': return '#f59e0b';
      case 'DONE': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#8b5cf6';
    }
  };

  // Derived: visible nodes and connections (respect collapsed)
  const visibleNodeIds = useMemo(() => {
    const idToNode = new Map(nodes.map(n => [n.id, n] as const));
    const childMap = new Map<string, string[]>();
    nodes.forEach(n => {
      if (n.parentId) {
        const prev = childMap.get(n.parentId) || [];
        prev.push(n.id);
        childMap.set(n.parentId, prev);
      }
    });
    const result = new Set<string>();
    const stack: string[] = ['root'];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (!currentId) continue;
      result.add(currentId);
      const current = idToNode.get(currentId);
      if (current && !current.collapsed) {
        (childMap.get(currentId) || []).forEach(childId => {
          if (!result.has(childId)) stack.push(childId);
        });
      }
    }
    return result;
  }, [nodes]);

  const renderedNodes = useMemo(() => nodes.filter(n => visibleNodeIds.has(n.id)), [nodes, visibleNodeIds]);
  const renderedConnections = useMemo(
    () => connections.filter(c => visibleNodeIds.has(c.fromId) && visibleNodeIds.has(c.toId)),
    [connections, visibleNodeIds]
  );

  // Persistence (localStorage per space/list)
  const storageKey = useMemo(() => {
    const scope = selectedList?.id || selectedSpace?.id || 'global';
    return `mindmap:${scope}`;
  }, [selectedList?.id, selectedSpace?.id]);

  // Load persisted layout
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { nodes: MindMapNode[]; connections: Connection[]; zoom: number; pan: { x: number; y: number } };
        if (parsed?.nodes?.length) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections || []);
          setZoom(parsed.zoom || 1);
          setPan(parsed.pan || { x: 0, y: 0 });
        }
      } catch {}
    }
  }, [storageKey]);

  const saveLayout = useCallback(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({ nodes, connections, zoom, pan });
    localStorage.setItem(storageKey, payload);
    setLastSavedAt(new Date());
  }, [nodes, connections, zoom, pan, storageKey]);

  // Autosave with debounce
  useEffect(() => {
    if (!autosaveEnabled) return;
    const id = setTimeout(() => {
      saveLayout();
    }, 800);
    return () => clearTimeout(id);
  }, [nodes, connections, zoom, pan, autosaveEnabled, saveLayout]);

  // Measure SVG size for mini-map calculations
  useEffect(() => {
    const updateSize = () => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) setSvgSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // History helpers
  const pushHistory = useCallback((snapshot?: Snapshot) => {
    const snap: Snapshot = snapshot || { nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)), zoom, pan };
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(snap);
      return next.slice(-50); // cap history
    });
    setHistoryIndex(idx => Math.min(idx + 1, 49));
  }, [nodes, connections, zoom, pan, historyIndex]);

  const undo = useCallback(() => {
    setHistoryIndex(idx => {
      const nextIdx = Math.max(idx - 1, 0);
      const snap = history[nextIdx];
      if (snap) {
        setNodes(snap.nodes);
        setConnections(snap.connections);
        setZoom(snap.zoom);
        setPan(snap.pan);
      }
      return nextIdx;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex(idx => {
      const nextIdx = Math.min(idx + 1, history.length - 1);
      const snap = history[nextIdx];
      if (snap) {
        setNodes(snap.nodes);
        setConnections(snap.connections);
        setZoom(snap.zoom);
        setPan(snap.pan);
      }
      return nextIdx;
    });
  }, [history]);

  const addChildNode = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNode: MindMapNode = {
      id: `node_${Date.now()}`,
      text: 'New Node',
      x: parent.x + (Math.random() - 0.5) * 100,
      y: parent.y + 80 + (Math.random() - 0.5) * 50,
      level: parent.level + 1,
      parentId,
      children: [],
      color: '#8b5cf6',
      collapsed: false
    };

    setNodes(prev => [
      ...prev.map(n => 
        n.id === parentId 
          ? { ...n, children: [...n.children, newNode.id] }
          : n
      ),
      newNode
    ]);

    setConnections(prev => [...prev, { fromId: parentId, toId: newNode.id }]);
    setEditingNode(newNode.id);
    setEditText(newNode.text);
    pushHistory();
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return;

    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    // Remove from parent's children
    const parentId = nodeToDelete.parentId;
    if (parentId) {
      setNodes(prev => prev.map(n => 
        n.id === parentId 
          ? { ...n, children: n.children.filter(id => id !== nodeId) }
          : n
      ));
    }

    // Remove node and its connections
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromId !== nodeId && c.toId !== nodeId));
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
    pushHistory();
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    if (isLinkMode) {
      if (!linkingFromNodeId) {
        setLinkingFromNodeId(nodeId);
      } else if (linkingFromNodeId && linkingFromNodeId !== nodeId) {
        // Add a connection if it doesn't exist
        setConnections(prev => {
          const exists = prev.some(c => c.fromId === linkingFromNodeId && c.toId === nodeId);
          if (exists) return prev;
          return [...prev, { fromId: linkingFromNodeId, toId: nodeId }];
        });
        pushHistory();
        setLinkingFromNodeId(nodeId); // chain linking
      }
      return;
    }

    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      if (e.shiftKey) {
        if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
        return next;
      }
      return new Set([nodeId]);
    });
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.text);
    }
  };

  const handleTextSave = () => {
    if (editingNode) {
      setNodes(prev => prev.map(n => 
        n.id === editingNode ? { ...n, text: editText } : n
      ));
      setEditingNode(null);
      setEditText('');
      pushHistory();
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggedNode(nodeId);
    
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setDragOffset({
          x: (e.clientX - rect.left) / zoom - pan.x - node.x,
          y: (e.clientY - rect.top) / zoom - pan.y - node.y
        });
      }
    }

    // Prepare group drag initial positions
    const initialPositions = new Map<string, { x: number; y: number }>();
    const isMulti = selectedNodeIds.size > 1 && selectedNodeIds.has(nodeId);
    if (isMulti) {
      nodes.forEach(n => {
        if (selectedNodeIds.has(n.id)) initialPositions.set(n.id, { x: n.x, y: n.y });
      });
    } else {
      initialPositions.set(nodeId, { x: nodes.find(n => n.id === nodeId)!.x, y: nodes.find(n => n.id === nodeId)!.y });
    }
    groupDragInitialPositionsRef.current = initialPositions;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    if (draggedNode) {
      const x = (e.clientX - rect.left) / zoom - pan.x - dragOffset.x;
      const y = (e.clientY - rect.top) / zoom - pan.y - dragOffset.y;
      const isMulti = selectedNodeIds.size > 1 && selectedNodeIds.has(draggedNode);
      if (isMulti) {
        const original = groupDragInitialPositionsRef.current;
        const draggedOriginal = original.get(draggedNode)!;
        const dx = x - draggedOriginal.x;
        const dy = y - draggedOriginal.y;
        setNodes(prev => prev.map(n => {
          if (!selectedNodeIds.has(n.id)) return n;
          const nx = (original.get(n.id)?.x || n.x) + dx;
          const ny = (original.get(n.id)?.y || n.y) + dy;
          return { ...n, x: snapToGrid ? Math.round(nx / GRID_SIZE) * GRID_SIZE : nx, y: snapToGrid ? Math.round(ny / GRID_SIZE) * GRID_SIZE : ny };
        }));
      } else {
        const nx = snapToGrid ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
        const ny = snapToGrid ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;
        setNodes(prev => prev.map(n => (n.id === draggedNode ? { ...n, x: nx, y: ny } : n)));
      }
      setCursorPoint({ x: (e.clientX - rect.left) / zoom - pan.x, y: (e.clientY - rect.top) / zoom - pan.y });
      return;
    }

    if (isSelecting && selectionStart) {
      const cx = (e.clientX - rect.left) / zoom - pan.x;
      const cy = (e.clientY - rect.top) / zoom - pan.y;
      const x = Math.min(selectionStart.x, cx);
      const y = Math.min(selectionStart.y, cy);
      const w = Math.abs(cx - selectionStart.x);
      const h = Math.abs(cy - selectionStart.y);
      setSelectionRect({ x, y, w, h });
      return;
    }

    if (isPanning && panStart.current) {
      const dx = (e.clientX - rect.left) / zoom - panStart.current.x;
      const dy = (e.clientY - rect.top) / zoom - panStart.current.y;
      setPan({ x: dx, y: dy });
    }

    // Update cursor point for link preview
    setCursorPoint({ x: (e.clientX - rect.left) / zoom - pan.x, y: (e.clientY - rect.top) / zoom - pan.y });
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
    panStart.current = null;
    if (isSelecting && selectionRect) {
      // finalize selection
      const { x, y, w, h } = selectionRect;
      const inside = (nx: number, ny: number) => nx >= x && nx <= x + w && ny >= y && ny <= y + h;
      const selected = new Set<string>();
      renderedNodes.forEach(n => {
        if (inside(n.x, n.y)) selected.add(n.id);
      });
      setSelectedNodeIds(selected);
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionRect(null);
    pushHistory();
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    pushHistory();
  };

  const toggleCollapse = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n));
    pushHistory();
  };

  const setSelectedNodeColor = (color: string) => {
    if (selectedNodeIds.size !== 1) return;
    const id = Array.from(selectedNodeIds)[0];
    setNodes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
    pushHistory();
  };

  const handleExportJSON = () => {
    const data = { nodes, connections, zoom, pan };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections);
          if (parsed.zoom) setZoom(parsed.zoom);
          if (parsed.pan) setPan(parsed.pan);
          pushHistory();
        }
      } catch {
        // ignore
      }
    };
    reader.readAsText(file);
  };

  const handleExportPNG = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = getComputedStyle(svg).backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'mindmap.png';
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const autoLayoutRadial = () => {
    const root = nodes.find(n => n.id === 'root');
    if (!root) return;
    const level1 = nodes.filter(n => n.parentId === 'root');
    const radius = 200;
    const centerX = root.x;
    const centerY = root.y;
    const newPositions = new Map<string, { x: number; y: number }>();
    level1.forEach((n, idx) => {
      const angle = (idx / Math.max(1, level1.length)) * 2 * Math.PI;
      newPositions.set(n.id, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
    });
    // Simple second-level fan
    nodes.forEach(n => {
      if (n.parentId && n.parentId !== 'root') {
        const parentPos = newPositions.get(n.parentId) || { x: nodes.find(nn => nn.id === n.parentId)?.x || centerX, y: nodes.find(nn => nn.id === n.parentId)?.y || centerY };
        const siblings = nodes.filter(nn => nn.parentId === n.parentId);
        const idx = siblings.findIndex(s => s.id === n.id);
        const spread = 80;
        newPositions.set(n.id, { x: parentPos.x + (idx - (siblings.length - 1) / 2) * spread, y: parentPos.y + 100 });
      }
    });
    setNodes(prev => prev.map(n => newPositions.has(n.id) ? { ...n, ...newPositions.get(n.id)! } : n));
    pushHistory();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveLayout();
      } else if ((e.ctrlKey && e.key.toLowerCase() === 'z') && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.size > 0) {
          e.preventDefault();
          Array.from(selectedNodeIds).forEach(id => deleteNode(id));
        }
      } else if (e.key === '+') {
        setZoom(prev => Math.min(prev * 1.2, 3));
      } else if (e.key === '-') {
        setZoom(prev => Math.max(prev / 1.2, 0.3));
      } else if (e.key === 'Escape') {
        setIsLinkMode(false);
        setLinkingFromNodeId(null);
        setSelectedNodeIds(new Set());
      } else if (selectedNodeIds.size > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const delta = 10;
        const dx = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
        const dy = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;
        setNodes(prev => prev.map(n => selectedNodeIds.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n));
        pushHistory();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveLayout, undo, redo, selectedNodeIds, pushHistory]);

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col relative">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mind Map
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2">
            <SearchIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search nodes"
              className="bg-transparent px-2 py-1 text-sm outline-none text-gray-700 dark:text-gray-200"
            />
          </div>

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
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          <button onClick={saveLayout} className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          <button onClick={undo} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={redo} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          <button onClick={() => setIsLinkMode(v => !v)} className={`flex items-center space-x-1 px-3 py-1.5 rounded ${isLinkMode ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`} title="Link mode">
            {isLinkMode ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            <span>{isLinkMode ? 'Linking…' : 'Link'}</span>
          </button>

          <button onClick={autoLayoutRadial} className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Auto-layout">
            <ChevronDown className="h-4 w-4" />
          </button>

          <button onClick={handleExportJSON} className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Export JSON">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Import JSON">
            <Upload className="h-4 w-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={e => e.target.files && e.target.files[0] && handleImportJSON(e.target.files[0])} />

          <button onClick={handleExportPNG} className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Export PNG">
            <ImageIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input type="checkbox" checked={autosaveEnabled} onChange={e => setAutosaveEnabled(e.target.checked)} />
              <span>Autosave</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
              <span>Grid</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer select-none">
              <input type="checkbox" checked={snapToGrid} onChange={e => setSnapToGrid(e.target.checked)} />
              <span>Snap</span>
            </label>
            <span className="hidden sm:inline text-gray-400">Alt + drag to select</span>
            {lastSavedAt && <span>Saved {lastSavedAt.toLocaleTimeString()}</span>}
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
           onMouseDown={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const worldX = (e.clientX - rect.left) / zoom - pan.x;
            const worldY = (e.clientY - rect.top) / zoom - pan.y;
            if ((e as unknown as MouseEvent).altKey) {
              setIsSelecting(true);
              setSelectionStart({ x: worldX, y: worldY });
              setSelectionRect({ x: worldX, y: worldY, w: 0, h: 0 });
              setIsPanning(false);
            } else if (!draggedNode) {
              // default: panning
              panStart.current = { x: worldX, y: worldY };
              setIsPanning(true);
            }
          }}
        >
          {/* Optional grid background */}
          {showGrid && (
            <>
              <defs>
                <pattern id="grid-pattern" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid-pattern)" />
            </>
          )}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>

          <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
            {/* Connections */}
            {renderedConnections.map((connection, index) => {
              const fromNode = nodes.find(n => n.id === connection.fromId);
              const toNode = nodes.find(n => n.id === connection.toId);
              
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#6b7280"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Link preview */}
            {isLinkMode && linkingFromNodeId && (
              (() => {
                const from = nodes.find(n => n.id === linkingFromNodeId);
                if (!from) return null;
                return (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={cursorPoint.x}
                    y2={cursorPoint.y}
                    stroke="#3b82f6"
                    strokeDasharray="4 2"
                    strokeWidth="2"
                  />
                );
              })()
            )}

            {/* Nodes */}
            {renderedNodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.level === 0 ? 50 : 40}
                  fill={node.color}
                  stroke={selectedNodeIds.has(node.id) ? '#8b5cf6' : 'white'}
                  strokeWidth={selectedNodeIds.has(node.id) ? 3 : 2}
                  className="cursor-pointer"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
                  opacity={searchQuery.trim() && !node.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.4 : 1}
                />
                
                {editingNode === node.id ? (
                  <foreignObject
                    x={node.x - 40}
                    y={node.y - 10}
                    width="80"
                    height="20"
                  >
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleTextSave}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSave()}
                      className="w-full text-center text-sm bg-white border border-gray-300 rounded px-1"
                      autoFocus
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={node.level === 0 ? "14" : "12"}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {node.text.length > 10 ? `${node.text.substring(0, 10)}...` : node.text}
                  </text>
                )}

                {/* Node Actions */}
                {selectedNodeIds.size === 1 && selectedNodeIds.has(node.id) && (
                  <g>
                    <circle
                      cx={node.x + 30}
                      cy={node.y - 30}
                      r="12"
                      fill="#10b981"
                      className="cursor-pointer"
                      onClick={() => addChildNode(node.id)}
                    >
                      <title>Add child node</title>
                    </circle>
                    <text
                      x={node.x + 30}
                      y={node.y - 26}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      className="pointer-events-none"
                    >
                      +
                    </text>

                    {node.id !== 'root' && (
                      <>
                        <circle
                          cx={node.x - 30}
                          cy={node.y - 30}
                          r="12"
                          fill="#ef4444"
                          className="cursor-pointer"
                          onClick={() => deleteNode(node.id)}
                        >
                          <title>Delete node</title>
                        </circle>
                        <text
                          x={node.x - 30}
                          y={node.y - 26}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          className="pointer-events-none"
                        >
                          ×
                        </text>
                      </>
                    )}

                    {/* Collapse toggle */}
                    <circle
                      cx={node.x}
                      cy={node.y - (node.level === 0 ? 60 : 50)}
                      r="10"
                      fill="#374151"
                      className="cursor-pointer"
                      onClick={() => toggleCollapse(node.id)}
                    >
                      <title>{node.collapsed ? 'Expand' : 'Collapse'}</title>
                    </circle>
                    {node.collapsed ? (
                      <ChevronDown x={node.x - 8} y={node.y - (node.level === 0 ? 68 : 58)} className="h-4 w-4 text-white pointer-events-none" />
                    ) : (
                      <ChevronUp x={node.x - 8} y={node.y - (node.level === 0 ? 68 : 58)} className="h-4 w-4 text-white pointer-events-none" />
                    )}
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Drag-select overlay rectangle */}
        {isSelecting && selectionRect && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-200/20 pointer-events-none"
            style={{
              left: (selectionRect.x + pan.x) * zoom,
              top: (selectionRect.y + pan.y) * zoom,
              width: selectionRect.w * zoom,
              height: selectionRect.h * zoom,
            }}
          />
        )}

        {/* Instructions */}
        {nodes.length <= 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Mind Map View</h3>
              <p className="text-sm">
                Click on the root node to add branches<br />
                Double-click nodes to edit text<br />
                Drag nodes to rearrange
              </p>
            </div>
          </div>
        )}

        {/* Color picker for single selection */}
        {selectedNodeIds.size === 1 && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 shadow z-10 flex items-center space-x-2">
            <Palette className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <input type="color" onChange={e => setSelectedNodeColor(e.target.value)} className="w-6 h-6 p-0 border-none bg-transparent" />
          </div>
        )}

        {/* Mini-map */}
        {renderedNodes.length > 0 && (
          (() => {
            const minX = Math.min(...renderedNodes.map(n => n.x));
            const maxX = Math.max(...renderedNodes.map(n => n.x));
            const minY = Math.min(...renderedNodes.map(n => n.y));
            const maxY = Math.max(...renderedNodes.map(n => n.y));
            const boundsW = Math.max(1, maxX - minX + 200);
            const boundsH = Math.max(1, maxY - minY + 200);
            const miniW = 200;
            const miniH = 140;
            const scale = Math.min(miniW / boundsW, miniH / boundsH);
            const viewportW = svgSize.width / Math.max(zoom, 0.0001) * scale;
            const viewportH = svgSize.height / Math.max(zoom, 0.0001) * scale;
            const viewX = ((-pan.x - minX + 100) * scale);
            const viewY = ((-pan.y - minY + 100) * scale);

            return (
              <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-md p-2 shadow z-10">
                <svg width={miniW} height={miniH} className="cursor-pointer" onClick={(e) => {
                  const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  const worldX = mx / scale + minX - 100;
                  const worldY = my / scale + minY - 100;
                  setPan({ x: -worldX + (svgSize.width / zoom) / 2, y: -worldY + (svgSize.height / zoom) / 2 });
                }}>
                  {renderedConnections.map((c, i) => {
                    const f = nodes.find(n => n.id === c.fromId)!;
                    const t = nodes.find(n => n.id === c.toId)!;
                    return (
                      <line key={i}
                        x1={(f.x - minX + 100) * scale}
                        y1={(f.y - minY + 100) * scale}
                        x2={(t.x - minX + 100) * scale}
                        y2={(t.y - minY + 100) * scale}
                        stroke="#9ca3af" strokeWidth="1" />
                    );
                  })}
                  {renderedNodes.map(n => (
                    <circle key={n.id} cx={(n.x - minX + 100) * scale} cy={(n.y - minY + 100) * scale} r={2} fill="#6b7280" />
                  ))}
                  <rect x={viewX} y={viewY} width={viewportW} height={viewportH} fill="none" stroke="#3b82f6" strokeWidth={2} />
                </svg>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}