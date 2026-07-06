import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, X, Image as ImageIcon, Trash2, Layers } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { MoodSelector } from "@/components/journal/MoodSelector";
import { HashtagInput } from "@/components/journal/HashtagInput";
import { useEntry, useCreateEntry, useUpdateEntry, useCreateGroupedEntries, useUpdateGroupedEntries, useDeleteEntry, useDeleteGroupedEntries, useEntries } from "@/hooks/useEntries";
import { eachDayOfInterval, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { GooglePhotoPicker } from "@/components/journal/GooglePhotoPicker";

export default function Entry() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: existingEntry, isLoading } = useEntry(id);
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const createGroupedEntries = useCreateGroupedEntries();
  const updateGroupedEntries = useUpdateGroupedEntries();
  const deleteEntry = useDeleteEntry();
  const deleteGroupedEntries = useDeleteGroupedEntries();
  const { data: allEntries = [] } = useEntries();

  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(3);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [showSpecialPopup, setShowSpecialPopup] = useState(false);

  const urlDate = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const [date, setDate] = useState(urlDate || new Date().toISOString().split('T')[0]);
  const [updateMode, setUpdateMode] = useState<"single" | "group">("single");

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content || "");
      setMoodScore(existingEntry.mood_score || 3);
      setHashtags(existingEntry.hashtags || []);
      setPhotoIds(existingEntry.google_photos_ids || []);
      if (existingEntry.date) setDate(existingEntry.date);
    } else {
      setContent("");
      setMoodScore(3);
      setHashtags([]);
      setPhotoIds([]);
      if (urlDate) setDate(urlDate);
    }
  }, [existingEntry, id, urlDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ title: "Champ vide", description: "Le contenu ne peut pas être vide.", variant: "destructive" });
      return;
    }

    const payload = {
      content,
      mood_score: moodScore,
      hashtags,
      date,
      google_photos_ids: photoIds
    };

    try {
      if (startDate && endDate) {
        // Mode création de bloc
        const dates = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
        const groupId = crypto.randomUUID();
        
        // Exclure les dates qui ont déjà une entrée
        const existingDates = new Set(allEntries.map(e => e.date));
        const newDates = dates.map(d => format(d, "yyyy-MM-dd")).filter(d => !existingDates.has(d));
        
        if (newDates.length === 0) {
          toast({ title: "Aucune action", description: "Toutes les dates de cette période ont déjà un pixel." });
          return;
        }

        // Trier les dates chronologiquement pour s'assurer que le premier jour est bien identifié
        const sortedDates = [...newDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const entriesPayload = sortedDates.map((d, index) => ({
          ...payload,
          date: d,
          group_id: groupId,
          // Uniquement pour le premier jour du bloc, on associe les photos pour éviter les doublons
          google_photos_ids: index === 0 ? payload.google_photos_ids : []
        }));

        await createGroupedEntries.mutateAsync(entriesPayload);
      } else if (id && id !== "new") {
        if (existingEntry?.group_id && updateMode === "group") {
          await updateGroupedEntries.mutateAsync({ 
            groupId: existingEntry.group_id, 
            data: payload 
          });
        } else {
          // Si c'était dans un groupe mais qu'on modifie en single, on le détache du groupe
          const finalPayload = existingEntry?.group_id && updateMode === "single" 
            ? { ...payload, group_id: null } 
            : payload;
          await updateEntry.mutateAsync({ id, ...finalPayload });
        }
      } else {
        await createEntry.mutateAsync(payload);
      }

      if (moodScore === 1) {
        setShowSpecialPopup(true);
      } else {
        toast({ title: "Succès", description: startDate && endDate ? "Bloc enregistré !" : "Pixel enregistré !" });
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Erreur de sauvegarde", variant: "destructive" });
    }
  };

  const handleDelete = async (deleteMode: "single" | "group") => {
    if (!id || id === "new") return;
    if (confirm("Voulez-vous vraiment supprimer ce pixel ?")) {
      try {
        if (deleteMode === "group" && existingEntry?.group_id) {
          await deleteGroupedEntries.mutateAsync(existingEntry.group_id);
        } else {
          await deleteEntry.mutateAsync(id);
        }
        navigate("/");
      } catch (error: any) {
        toast({ title: "Erreur", description: error.message || "Erreur lors de la suppression", variant: "destructive" });
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen font-black uppercase animate-pulse">Chargement...</div>;

  return (
    <div className="min-h-screen pb-20">
      <Navigation />

      {showSpecialPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-2 card-brutal max-w-sm w-full relative flex flex-col items-center text-center">
            <button onClick={() => { setShowSpecialPopup(false); navigate("/"); }} className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 border-2 border-black shadow-brutal-sm z-10">
              <X className="w-6 h-6" />
            </button>
            <div className="border-2 border-black w-full mb-4">
              <img src="https://i.pinimg.com/736x/74/72/0b/74720b4dc3956fff41810ab55ee192b6.jpg" alt="Call me maybe" className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-2xl font-black uppercase text-pink-600 mb-2">So call me maybe 💖</h3>
            <p className="text-xl font-mono font-bold bg-yellow-300 px-3 py-1 border-2 border-black transform -rotate-2 mb-6">06 35 47 70 19</p>
            <button onClick={() => { setShowSpecialPopup(false); navigate("/"); }} className="w-full btn-brutal bg-black text-white hover:bg-gray-800 py-3">C'EST NOTÉ !</button>
          </div>
        </div>
      )}

      <PageTransition>
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="btn-brutal p-2 bg-white hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-black text-orange-500 uppercase tracking-tighter">
              {id && id !== "new" ? "Modifier" : "Nouveau Pixel"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              {startDate && endDate ? (
                <span className="inline-block px-4 py-1 border-2 border-black font-black shadow-brutal-sm bg-white uppercase transform -rotate-1">
                  📅 Du {format(new Date(startDate), "dd/MM/yyyy")} au {format(new Date(endDate), "dd/MM/yyyy")}
                </span>
              ) : (
                <span className="inline-block px-4 py-1 border-2 border-black font-black shadow-brutal-sm bg-white uppercase transform -rotate-1">
                  📅 {date}
                </span>
              )}
            </div>

            {existingEntry?.group_id && (
              <div className="card-brutal p-4 bg-orange-100 flex items-start gap-3">
                <Layers className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <p className="font-black text-sm uppercase mb-2">Cette entrée appartient à un bloc.</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                      <input type="radio" checked={updateMode === "single"} onChange={() => setUpdateMode("single")} className="accent-black w-4 h-4" />
                        Modifier uniquement ce jour
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                      <input type="radio" checked={updateMode === "group"} onChange={() => setUpdateMode("group")} className="accent-black w-4 h-4" />
                        Appliquer au bloc entier
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="card-brutal p-6 bg-white">
              <MoodSelector value={moodScore} onChange={setMoodScore} />
            </div>

            <div className="card-brutal p-6 bg-white">
              <label className="block text-sm font-black uppercase mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Raconte-moi ta journée...
              </label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Aujourd'hui, j'ai..." className="w-full bg-white border-2 border-black p-4 focus:outline-none font-bold shadow-brutal-sm text-lg resize-none" required />
            </div>

            <div className="card-brutal p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-black uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" /> PIKS
                </label>
                <button type="button" onClick={() => setIsPhotoPickerOpen(true)} className="px-3 py-1 bg-blue-100 text-blue-600 border-2 border-black shadow-brutal-sm font-bold text-sm hover:bg-blue-200 transition-colors">
                  + Ajouter
                </button>
              </div>
              {photoIds.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photoIds.map((url, i) => (
                    <img key={i} src={url} alt={`Pixel ${i}`} className="w-full h-24 object-cover border-2 border-black rounded-md" />
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-500 italic">Aucune photo sélectionnée.</p>
              )}
            </div>

            <div className="card-brutal p-6 bg-white">
              <HashtagInput value={hashtags} onChange={setHashtags} />
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={createEntry.isPending || updateEntry.isPending || createGroupedEntries.isPending} className="btn-brutal flex-1 py-4 text-lg font-black bg-black text-white hover:bg-gray-900 flex items-center justify-center gap-2 disabled:opacity-70">
                <Save className="w-5 h-5" />
                SAUVEGARDER
              </button>

              {id && id !== "new" && (
                <button type="button" onClick={() => handleDelete(updateMode)} className="btn-brutal p-4 bg-red-500 text-white hover:bg-red-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </main>
      </PageTransition>

      <GooglePhotoPicker isOpen={isPhotoPickerOpen} onClose={() => setIsPhotoPickerOpen(false)} selectedIds={photoIds} onSelect={setPhotoIds} />
    </div>
  );
}