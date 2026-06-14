import { useEffect,useRef } from 'react'

export function WritingCanvas({onReady}:{onReady:(actions:{clear:()=>void;toDataURL:()=>string})=>void}){
  const ref=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!;let drawing=false;const resize=()=>{const rect=canvas.getBoundingClientRect(),ratio=devicePixelRatio||1;canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;ctx.scale(ratio,ratio);ctx.lineWidth=14;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#33452c'};resize()
    const point=(event:PointerEvent)=>{const rect=canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top}}
    const down=(event:PointerEvent)=>{drawing=true;canvas.setPointerCapture(event.pointerId);const p=point(event);ctx.beginPath();ctx.moveTo(p.x,p.y)}
    const move=(event:PointerEvent)=>{if(!drawing)return;const p=point(event);ctx.lineTo(p.x,p.y);ctx.stroke()}
    const up=()=>{drawing=false}
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up)
    onReady({clear:()=>ctx.clearRect(0,0,canvas.width,canvas.height),toDataURL:()=>canvas.toDataURL('image/png')})
    return()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up)}
  },[onReady])
  return <div className="writing-board"><canvas ref={ref}/><i/><b/><em/><strong/></div>
}
