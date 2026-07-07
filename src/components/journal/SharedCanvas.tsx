import React, { useRef, useState, useEffect } from "react";
import { useGetLatestDrawing, useSaveDrawing } from "@/hooks/useCanvas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eraser, Send } from "lucide-react";

export function SharedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const { data: latestDrawing, isLoading } = useGetLatestDrawing();
  const { mutate: saveDrawing, isPending: isSaving } = useSaveDrawing();

  // Load latest drawing onto canvas
  useEffect(() => {
    if (latestDrawing?.drawing_data && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Clear before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = latestDrawing.drawing_data;
    }
  }, [latestDrawing]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    saveDrawing(dataUrl, {
      onSuccess: () => {
        toast.success("Dessin envoyé !");
        setHasDrawn(false);
      },
      onError: (err) => {
        toast.error("Erreur lors de l'envoi du dessin");
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="relative bg-amber-50 w-full rounded-xl shadow-brutal-sm border border-black/10 overflow-hidden touch-none" style={{ aspectRatio: '4/3' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <span className="animate-pulse">Chargement...</span>
          </div>
        )}
        
        {/* The canvas internal resolution is fixed, but it scales via CSS w-full */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={endDrawing}
          onPointerLeave={endDrawing}
          // Prevent scroll on touch devices while drawing
          style={{ touchAction: 'none' }}
        />
        
        <div className="absolute top-2 left-2 text-xs font-bold text-black/30 pointer-events-none">
          post tits
        </div>
      </div>

      <div className="flex gap-4 mt-4 w-full justify-between">
        <Button 
          variant="outline" 
          onClick={handleClear}
          className="rounded-xl"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Effacer
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasDrawn || isSaving}
          className="rounded-xl shadow-brutal-sm bg-black text-white hover:bg-gray-800"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSaving ? "Envoi..." : "Envoyer"}
        </Button>
      </div>
    </div>
  );
}
