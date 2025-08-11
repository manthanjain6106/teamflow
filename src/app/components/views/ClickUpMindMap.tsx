'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, 
  RotateCcw, 
  ZoomIn,
  ZoomOut,
  Save
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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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
        color: '#8b5cf6'
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
          taskId: task.id
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
  }, [nodes, connections, zoom, pan, storageKey]);

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
      color: '#8b5cf6'
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
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    if (draggedNode) {
      const x = (e.clientX - rect.left) / zoom - pan.x - dragOffset.x;
      const y = (e.clientY - rect.top) / zoom - pan.y - dragOffset.y;
      setNodes(prev => prev.map(n => (n.id === draggedNode ? { ...n, x, y } : n)));
      return;
    }

    if (isPanning && panStart.current) {
      const dx = (e.clientX - rect.left) / zoom - panStart.current.x;
      const dy = (e.clientY - rect.top) / zoom - panStart.current.y;
      setPan({ x: dx, y: dy });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
    panStart.current = null;
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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

          <button onClick={saveLayout} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
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
            // start panning only if not clicking on a node; here we start panning by default, and node drag will override
            if (!draggedNode) {
              const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              panStart.current = { x: (e.clientX - rect.left) / zoom - pan.x, y: (e.clientY - rect.top) / zoom - pan.y };
              setIsPanning(true);
            }
          }}
        >
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
            {connections.map((connection, index) => {
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

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.level === 0 ? 50 : 40}
                  fill={node.color}
                  stroke={selectedNode === node.id ? '#8b5cf6' : 'white'}
                  strokeWidth={selectedNode === node.id ? 3 : 2}
                  className="cursor-pointer"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={() => handleNodeClick(node.id)}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
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
                {selectedNode === node.id && (
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
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>

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
      </div>
    </div>
  );
}