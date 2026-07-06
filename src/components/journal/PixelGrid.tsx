import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isValid,
  getDay,
  subDays,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter
} from "date-fns";

interface Entry {
  id: string;
  date: string;
  mood_score: number;
  group_id?: string | null;
}

interface PixelGridProps {
  entries: Entry[];
  currentDate: Date;
  onDayClick: (date: Date, entry?: Entry) => void;
  selectionStart?: Date | null;
  selectionEnd?: Date | null;
  isMultiSelectMode?: boolean;
}

const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const moodColorClasses: Record<number, string> = {
  1: "bg-mood-1",
  2: "bg-mood-2",
  3: "bg-mood-3",
  4: "bg-mood-4",
  5: "bg-mood-5",
};

export function PixelGrid({ 
  entries, 
  currentDate, 
  onDayClick,
  selectionStart,
  selectionEnd,
  isMultiSelectMode
}: PixelGridProps) {
  const days = useMemo(() => {
    const baseDate = isValid(currentDate) ? currentDate : new Date();
    return eachDayOfInterval({
      start: startOfMonth(baseDate),
      end: endOfMonth(baseDate),
    });
  }, [currentDate]);

  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((entry) => {
      if (!entry.date) return;
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  return (
    <div className="w-full">
      {/* En-tête des jours */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-[12px] font-black text-center uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des pixels */}
      <div className="grid grid-cols-7 gap-2">
        {/* Espaces vides pour décaler le premier jour du mois */}
        {days.length > 0 && Array.from({ length: getDay(days[0]) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const entry = entryMap.get(dateKey);
          const isToday = isSameDay(day, new Date());
          const score = entry?.mood_score ? Number(entry.mood_score) : null;
          const colorClass = score ? moodColorClasses[score] : "bg-white";

          let isSelected = false;
          let isInSelectionRange = false;

          if (isMultiSelectMode) {
            if (selectionStart && isSameDay(day, selectionStart)) isSelected = true;
            if (selectionEnd && isSameDay(day, selectionEnd)) isSelected = true;
            if (selectionStart && selectionEnd) {
              const start = isBefore(selectionStart, selectionEnd) ? selectionStart : selectionEnd;
              const end = isAfter(selectionEnd, selectionStart) ? selectionEnd : selectionStart;
              isInSelectionRange = isWithinInterval(day, { start, end });
            } else if (selectionStart && !selectionEnd) {
              isInSelectionRange = isSameDay(day, selectionStart);
            }
          }

          // Visual continuity logic for grouped entries
          let isSameGroupAsPrev = false;
          let isSameGroupAsNext = false;
          const dayOfWeek = getDay(day);

          if (entry?.group_id) {
            const prevEntry = entryMap.get(format(subDays(day, 1), "yyyy-MM-dd"));
            const nextEntry = entryMap.get(format(addDays(day, 1), "yyyy-MM-dd"));
            isSameGroupAsPrev = prevEntry?.group_id === entry.group_id;
            isSameGroupAsNext = nextEntry?.group_id === entry.group_id;
          }

          // Compute border radius
          const roundLeft = !isSameGroupAsPrev || dayOfWeek === 0;
          const roundRight = !isSameGroupAsNext || dayOfWeek === 6;
          
          const borderRadiusClass = cn(
            roundLeft ? "rounded-l-2xl" : "rounded-l-none border-l-0",
            roundRight ? "rounded-r-2xl" : "rounded-r-none border-r-0",
            (!roundLeft || !roundRight) && "rounded-none"
          );

          return (
            <div key={dateKey} className="relative aspect-square">
              {/* Pont visuel pour combler le gap entre les jours d'un même groupe */}
              {isSameGroupAsNext && dayOfWeek !== 6 && (
                <div className={cn("absolute top-0 -right-2 w-2 h-full z-0 border-y-2 border-black/5", colorClass)} />
              )}
              
              <motion.button
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDayClick(day, entry)}
                className={cn(
                  "w-full h-full flex items-center justify-center relative transition-all border-2 border-black/5 z-10",
                  colorClass,
                  borderRadiusClass,
                  // Bordure orange pour aujourd'hui
                  isToday && "ring-4 ring-orange-500 ring-inset",
                  // Styles pour la sélection multiple
                  isMultiSelectMode && "hover:ring-4 hover:ring-black hover:ring-inset",
                  isInSelectionRange && "ring-4 ring-black ring-inset opacity-100 shadow-brutal-sm scale-[1.02]",
                  isMultiSelectMode && !isInSelectionRange && "opacity-50"
                )}
              >
                <span className="text-[10px] font-black uppercase pointer-events-none mix-blend-difference text-white/80">
                  {format(day, "d")}
                </span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}