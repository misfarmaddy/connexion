// CONNEXION - Question Edit Modal
import React, { useState, useEffect } from "react";
import { 
  X, Save, Image, Plus, Trash2, CheckCircle2, 
  AlertCircle, Sparkles, HelpCircle, Tag, Trophy, Film, Upload
} from "lucide-react";
import { useSound } from "../context/SoundContext";

export default function QuestionEditModal({ isOpen, question, onClose, onSave }) {
  const { playCorrect, playWrong, playTick } = useSound();

  const [formData, setFormData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (question && isOpen) {
      setFormData({
        title: question.title || "",
        prompt: question.prompt || "",
        tamilCategory: question.tamilCategory || "",
        round: question.round || 1,
        group: question.group || "A",
        isSuddenDeath: !!question.isSuddenDeath,
        type: question.type || "text",
        correctAnswer: question.correctAnswer || "",
        aliasesText: Array.isArray(question.aliases) ? question.aliases.join(", ") : (question.correctAnswer || ""),
        points: question.points || 10,
        speedBonus: question.speedBonus || 5,
        penalty: question.penalty || (question.round >= 2 ? 5 : 0),
        explanation: question.explanation || "",
        clues: question.clues ? question.clues.map((c, i) => ({
          id: c.id || i + 1,
          label: c.label || `Clue ${i + 1}`,
          url: c.url || ""
        })) : [
          { id: 1, label: "Clue 1", url: "" },
          { id: 2, label: "Clue 2", url: "" }
        ]
      });
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [question, isOpen]);

  if (!isOpen || !formData) return null;

  const handleClueChange = (index, field, value) => {
    const updated = [...formData.clues];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, clues: updated });
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 3.5MB to maintain smooth localStorage syncing)
    if (file.size > 3.5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 3.5MB. Please choose a smaller image.");
      playWrong();
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      handleClueChange(index, "url", dataUrl);
      playTick();
    };
    reader.readAsDataURL(file);
  };

  const handleAddClue = () => {
    if (formData.clues.length >= 4) {
      setErrorMsg("Maximum 4 clues allowed per question.");
      return;
    }
    const nextId = formData.clues.length + 1;
    setFormData({
      ...formData,
      clues: [...formData.clues, { id: nextId, label: `Clue ${nextId}`, url: "" }]
    });
    playTick();
  };

  const handleRemoveClue = (index) => {
    if (formData.clues.length <= 2) {
      setErrorMsg("A connection question must have at least 2 clues.");
      return;
    }
    const updated = formData.clues.filter((_, i) => i !== index);
    setFormData({ ...formData, clues: updated });
    playTick();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.title.trim()) {
      setErrorMsg("Please provide a question title.");
      playWrong();
      return;
    }
    if (!formData.prompt.trim()) {
      setErrorMsg("Please provide a question prompt.");
      playWrong();
      return;
    }
    if (!formData.correctAnswer.trim()) {
      setErrorMsg("Please specify the correct answer.");
      playWrong();
      return;
    }
    if (formData.clues.some(c => !c.url.trim())) {
      setErrorMsg("All clues must have a valid Image URL.");
      playWrong();
      return;
    }

    // Parse aliases
    const aliases = formData.aliasesText
      .split(",")
      .map(a => a.trim().toLowerCase())
      .filter(a => a.length > 0);

    if (!aliases.includes(formData.correctAnswer.trim().toLowerCase())) {
      aliases.push(formData.correctAnswer.trim().toLowerCase());
    }

    const payload = {
      ...question,
      title: formData.title.trim(),
      prompt: formData.prompt.trim(),
      tamilCategory: formData.tamilCategory.trim() || undefined,
      round: Number(formData.round),
      group: Number(formData.round) === 2 ? formData.group : undefined,
      isSuddenDeath: !!formData.isSuddenDeath,
      type: formData.type,
      correctAnswer: formData.correctAnswer.trim(),
      aliases,
      points: Number(formData.points),
      speedBonus: Number(formData.speedBonus),
      penalty: Number(formData.penalty),
      explanation: formData.explanation.trim(),
      clues: formData.clues.map((c, i) => ({
        id: i + 1,
        label: c.label.trim(),
        url: c.url.trim()
      }))
    };

    onSave(question.id, payload);
    setSuccessMsg("Question updated successfully!");
    playCorrect();

    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-800 rounded-[2rem] p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Edit Question</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                  {question.id}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modify title, clues, image URLs, aliases, and scoring attributes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Question Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                placeholder="e.g. The Kashmir Bakery Secret"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Category Tag
              </label>
              <input
                type="text"
                value={formData.tamilCategory}
                onChange={(e) => setFormData({ ...formData, tamilCategory: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                placeholder="e.g. Kollywood 2023"
              />
            </div>
          </div>

          {/* Row 2: Prompt */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Question Prompt (Visible to participants &amp; big screen) *
            </label>
            <textarea
              rows={2}
              required
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              placeholder="e.g. Connect the 4 clues to identify this Thalapathy Vijay & Lokesh Kanagaraj blockbuster."
            />
          </div>

          {/* Row 3: Round & Rules Configuration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60">
            <div>
              <label className="block text-[11px] font-black uppercase text-purple-900 dark:text-purple-300 mb-1">
                Round
              </label>
              <select
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value={1}>Round 1 (Connection)</option>
                <option value={2}>Round 2 (Buzzer)</option>
                <option value={3}>Round 3 (Grand Final)</option>
              </select>
            </div>

            {formData.round === 2 && (
              <div>
                <label className="block text-[11px] font-black uppercase text-purple-900 dark:text-purple-300 mb-1">
                  Buzzer Group
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase text-purple-900 dark:text-purple-300 mb-1">
                Points
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-purple-900 dark:text-purple-300 mb-1">
                {formData.round === 1 ? "Speed Bonus" : "Penalty (-pts)"}
              </label>
              <input
                type="number"
                value={formData.round === 1 ? formData.speedBonus : formData.penalty}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (formData.round === 1) {
                    setFormData({ ...formData, speedBonus: val });
                  } else {
                    setFormData({ ...formData, penalty: val });
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            {formData.round === 1 && (
              <div className="flex items-center gap-2 pt-3 col-span-2 sm:col-span-1">
                <input
                  type="checkbox"
                  id="suddenDeathToggle"
                  checked={formData.isSuddenDeath}
                  onChange={(e) => setFormData({ ...formData, isSuddenDeath: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <label htmlFor="suddenDeathToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sudden Death
                </label>
              </div>
            )}
          </div>

          {/* Row 4: Correct Answer & Aliases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Correct Answer *
              </label>
              <input
                type="text"
                required
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 focus:outline-none focus:border-emerald-600"
                placeholder="e.g. Leo"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Accepted Aliases (comma-separated)
              </label>
              <input
                type="text"
                value={formData.aliasesText}
                onChange={(e) => setFormData({ ...formData, aliasesText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                placeholder="e.g. leo, leo das, parthiban, bloody sweet"
              />
            </div>
          </div>

          {/* Row 5: 4 Connection Clues with Live Image Previews */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" />
                <span>Connection Image Clues ({formData.clues.length}/4)</span>
              </label>
              {formData.clues.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddClue}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Clue</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.clues.map((clue, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-400">
                      Clue #{idx + 1}
                    </span>
                    {formData.clues.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveClue(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove clue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Clue Label / Hint */}
                  <input
                    type="text"
                    value={clue.label}
                    onChange={(e) => handleClueChange(idx, "label", e.target.value)}
                    placeholder={`Clue #${idx + 1} label (e.g. Clue 1: Cocoa beans)`}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
                  />

                  {/* Clue Image URL / Device Upload */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={clue.url.startsWith("data:") ? "[Uploaded Image File]" : clue.url}
                      onChange={(e) => {
                        if (!clue.url.startsWith("data:") || e.target.value !== "[Uploaded Image File]") {
                          handleClueChange(idx, "url", e.target.value);
                        }
                      }}
                      placeholder="Paste Image URL or upload..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-mono text-slate-700 dark:text-slate-300 truncate"
                    />
                    <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shrink-0 border border-purple-200 dark:border-purple-750 transition-colors shadow-sm active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(idx, e)} 
                      />
                    </label>
                  </div>

                  {/* Image Preview Thumbnail */}
                  {clue.url && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800 bg-slate-200 dark:bg-slate-950">
                      <img 
                        src={clue.url} 
                        alt={clue.label} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row 6: Explanation / Reveal Note */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Host Explanation / Trivia Note (Shown upon reveal)
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-medium text-slate-900 dark:text-white"
              placeholder="e.g. Leo (2023) stars Vijay as Parthiban running a chocolate cafe in Kashmir..."
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100 dark:border-purple-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-600/30 hover:opacity-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
