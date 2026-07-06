import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isBefore, isAfter, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Navigation } from "@/components/layout/Navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { PixelGrid } from "@/components/journal/PixelGrid"; 
import { EntryCard } from "@/components/journal/EntryCard";
import { useEntries } from "@/hooks/useEntries";
import { Button } from "@/components/ui/button";
import { ScratchGame } from "@/components/valentine/valentinegame.tsx"; // NOUVEL IMPORT

export default function Index() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: entries = [], isLoading } = useEntries(); 
  const navigate = useNavigate();

  // Mode de sélection multiple
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const isFuture = addMonths(currentDate, 1) > new Date();

  const handleDayClick = (date: Date, entry?: { id: string }) => {
    if (isMultiSelectMode) {
      if (!selectionStart) {
        setSelectionStart(date);
        setSelectionEnd(null);
      } else if (!selectionEnd) {
        if (isBefore(date, selectionStart)) {
          setSelectionEnd(selectionStart);
          setSelectionStart(date);
        } else {
          setSelectionEnd(date);
        }
      } else {
        setSelectionStart(date);
        setSelectionEnd(null);
      }
      return;
    }

    if (entry) {
      navigate(`/entry/${entry.id}`);
    } else {
      navigate(`/entry?date=${format(date, "yyyy-MM-dd")}`);
    }
  };

  const handleCancelSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsMultiSelectMode(false);
  };

  const handleCreateBlock = () => {
    if (selectionStart && selectionEnd) {
      navigate(`/entry?startDate=${format(selectionStart, "yyyy-MM-dd")}&endDate=${format(selectionEnd, "yyyy-MM-dd")}`);
    } else if (selectionStart) {
      navigate(`/entry?date=${format(selectionStart, "yyyy-MM-dd")}`);
    }
  };

  const recentEntries = entries.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* JEU DE GRATTAGE */}
      <ScratchGame />
      
      <PageTransition>
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-orange-500 mb-2">
              Mes Pixels ✨
            </h1>
            <div className="text-muted-foreground font-medium italic mb-8">
               ✨✨✨✨✨ <p className="text-muted-foreground mb-8">22 !!!! j'espere qu'on passera notre vie a 2 💕</p>
            </div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-white/20 shadow-brutal p-6 mb-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white/50 rounded-full">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </Button>
              
              <span className="text-xl font-black uppercase tracking-widest text-gray-800">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </span>
              
              <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isFuture} className="hover:bg-white/50 rounded-full disabled:opacity-30">
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </Button>
            </div>

            {/* Barre de sélection multiple */}
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/40 rounded-xl border-2 border-black/5 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                  className={`px-4 py-2 font-bold uppercase rounded-xl border-2 transition-all ${isMultiSelectMode ? 'bg-orange-500 text-white border-orange-600 shadow-brutal-sm' : 'bg-white text-black border-black/10 hover:border-black/20'}`}
                >
                  {isMultiSelectMode ? "Mode Bloc Activé" : "Créer un Bloc"}
                </button>
                {isMultiSelectMode && selectionStart && selectionEnd && (
                  <span className="font-bold text-sm bg-white px-3 py-1 rounded-lg border border-black/10">
                    Du {format(selectionStart, "dd/MM")} au {format(selectionEnd, "dd/MM")} 
                    <span className="ml-2 text-orange-500">({differenceInDays(selectionEnd, selectionStart) + 1}j)</span>
                  </span>
                )}
              </div>
              
              {isMultiSelectMode && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancelSelection}
                    className="px-4 py-2 font-bold text-sm bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  {selectionStart && selectionEnd && (
                    <button 
                      onClick={handleCreateBlock}
                      className="px-4 py-2 font-bold text-sm bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-brutal-sm"
                    >
                      Valider le bloc
                    </button>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement...</div>
            ) : (
              <PixelGrid 
                entries={entries} 
                currentDate={currentDate} 
                onDayClick={handleDayClick}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                isMultiSelectMode={isMultiSelectMode}
              />
            )}
            
            <div className="flex justify-center gap-3 mt-8 flex-wrap">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full bg-mood-${s}`} />
                </div>
              ))}
            </div>
          </div>

          {recentEntries.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>⏳</span> Récents
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onClick={() => navigate(`/entry/${entry.id}`)} />
                ))}
              </div>
            </div>
          )}
        </main>
      </PageTransition>
    </div>
  );
}