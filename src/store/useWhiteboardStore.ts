import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type ElementType = 'pen' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'sticky' | 'image'

export interface WBElementBase {
  id: string
  type: ElementType
  x: number
  y: number
  rotation?: number
  zIndex?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  opacity?: number
  locked?: boolean
}

export interface PenElement extends WBElementBase {
  type: 'pen'
  points: number[]
}

export interface RectElement extends WBElementBase { type: 'rect'; width: number; height: number }
export interface EllipseElement extends WBElementBase { type: 'ellipse'; radiusX: number; radiusY: number }
export interface LineElement extends WBElementBase { type: 'line' | 'arrow'; points: number[] }
export interface TextElement extends WBElementBase { type: 'text' | 'sticky'; text: string; fontSize?: number; fontFamily?: string; width?: number; height?: number; align?: 'left'|'center'|'right' }
export interface ImageElement extends WBElementBase { type: 'image'; url: string; width: number; height: number }

export type WBElement = PenElement | RectElement | EllipseElement | LineElement | TextElement | ImageElement

export interface WhiteboardState {
  elements: WBElement[]
  selectedIds: string[]
  zoom: number
  pan: { x: number; y: number }
  stroke: string
  fill: string
  strokeWidth: number
  tool: ElementType | 'select' | 'move' | 'eraser'
  setTool: (t: WhiteboardState['tool']) => void
  setStyle: (p: Partial<Pick<WhiteboardState,'stroke'|'fill'|'strokeWidth'>>) => void
  addElement: (e: Partial<WBElement> & { type: ElementType }) => string
  updateElement: (id: string, e: Partial<WBElement>) => void
  removeElement: (id: string) => void
  setElements: (els: WBElement[]) => void
  setSelected: (ids: string[]) => void
  reorderByZ: (ids: string[], dir: 'front'|'back') => void
  setZoom: (z: number) => void
  setPan: (p: {x:number;y:number}) => void
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  elements: [],
  selectedIds: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  stroke: '#111827',
  fill: 'transparent',
  strokeWidth: 2,
  tool: 'select',
  setTool: (t) => set({ tool: t }),
  setStyle: (p) => set(p),
  addElement: (partial) => {
    const id = nanoid(8)
    const base: WBElementBase = { id, type: partial.type, x: partial.x || 0, y: partial.y || 0, rotation: 0, zIndex: (get().elements.length + 1), stroke: get().stroke, strokeWidth: get().strokeWidth, fill: get().fill, opacity: 1 }
    let el: WBElement
    switch (partial.type) {
      case 'pen': el = { ...(base as any), points: (partial as any).points || [] }; break
      case 'rect': el = { ...(base as any), width: (partial as any).width || 100, height: (partial as any).height || 80 }; break
      case 'ellipse': el = { ...(base as any), radiusX: (partial as any).radiusX || 60, radiusY: (partial as any).radiusY || 40 }; break
      case 'line':
      case 'arrow': el = { ...(base as any), type: partial.type, points: (partial as any).points || [0,0,100,0] } as any; break
      case 'text':
      case 'sticky': el = { ...(base as any), type: partial.type, text: (partial as any).text || (partial.type==='sticky'?'Sticky':'Text'), fontSize: (partial as any).fontSize || 16, width: (partial as any).width, height: (partial as any).height } as any; break
      case 'image': el = { ...(base as any), url: (partial as any).url, width: (partial as any).width || 200, height: (partial as any).height || 150 } as any; break
      default: el = { ...(base as any), width: 100, height: 80 } as any
    }
    set({ elements: [...get().elements, el] })
    return id
  },
  updateElement: (id, e) => set({ elements: get().elements.map(el => el.id === id ? { ...el, ...(e as any) } : el) }),
  removeElement: (id) => set({ elements: get().elements.filter(el => el.id !== id), selectedIds: get().selectedIds.filter(sid => sid !== id) }),
  setElements: (els) => set({ elements: els }),
  setSelected: (ids) => set({ selectedIds: ids }),
  reorderByZ: (ids, dir) => set({ elements: get().elements.map(el => ids.includes(el.id) ? { ...el, zIndex: dir==='front' ? 999999 : 0 } : el) }),
  setZoom: (z) => set({ zoom: Math.max(0.2, Math.min(4, z)) }),
  setPan: (p) => set({ pan: p })
}))

export type WhiteboardSnapshot = { elements: WBElement[] }

