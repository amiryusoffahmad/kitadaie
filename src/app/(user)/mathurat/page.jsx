"use client";

import { useState, useRef } from "react";
import { mathuratData } from "@/data/mathurat";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MathuratPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Pastikan initialized dengan null
  const audioRef = useRef(null); 

  // Logik auto-waktu (Macam kita bincang tadi)
  const currentTime = new Date().getHours();
  const FULL_AUDIO_URL = (currentTime >= 5 && currentTime < 11) 
    ? "/Al-Mathurat Pagi.mp3" 
    : "/Al-Mathurat Petang.mp3";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } 
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hidden Audio Engine */}
      <audio 
        ref={audioRef} 
        src={FULL_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Al-Ma'thurat</h1>
        </div>

      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8 mt-4">
        {/* Hero Section with Full Audio Button */}
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Al-Ma'thurat Sughra</h2>
              <p className="text-emerald-100 text-sm">Zikir Pagi & Petang</p>
            </div>
            <Headphones className="h-8 w-8 text-emerald-300 opacity-50" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={togglePlay}
              className="flex-1 bg-white border-emerald-400 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? "Pause Audio" : "Dengar Full Audio"}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={restartAudio}
              className= "border-emerald-400 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hadis Alert - Tetap Kekal */}
        <Alert className="bg-emerald-50 border-emerald-200">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800 font-bold">Kelebihan Berzikir</AlertTitle>
          <AlertDescription className="text-emerald-700 text-xs leading-relaxed">
            Hadis "...."
          </AlertDescription>
        </Alert>

        {/* List Doa */}
        <div className="space-y-12 pt-4">
          {mathuratData.map((item) => (
            <div key={item.id} className="space-y-6 border-b pb-10 last:border-0">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800">{item.id}. {item.title}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                  Baca {item.repeat}x
                </span>
              </div>

              <p className="text-2xl text-right leading-[2.8] font-arabic text-slate-900" dir="rtl">
                {item.arabic}
              </p>

              <div className="space-y-3 pl-3 border-l-2 border-emerald-500/20">
                <p className="text-sm text-slate-500 italic leading-relaxed">{item.transliteration}</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.translation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}