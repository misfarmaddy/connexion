// CONNEXION - Admin Management & Credentials Modal
import React, { useState, useEffect } from "react";
import { 
  Shield, UserCheck, Key, Plus, Trash2, CheckCircle2, 
  AlertCircle, X, Mail, User, Lock, Crown, Sparkles 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSound } from "../context/SoundContext";

export default function AdminManagementModal({ isOpen, onClose }) {
  const { currentAdmin, admins, updateAdminProfile, addAdmin, deleteAdmin } = useAuth();
  const { playCorrect, playWrong, playTick } = useSound();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "team"

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: currentAdmin?.name || "",
    username: currentAdmin?.username || "",
    email: currentAdmin?.email || "",
    password: currentAdmin?.password || ""
  });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (isOpen && currentAdmin) {
      setProfileData({
        name: currentAdmin.name || "",
        username: currentAdmin.username || "",
        email: currentAdmin.email || "",
        password: currentAdmin.password || ""
      });
      setProfileMsg({ type: "", text: "" });
    }
  }, [isOpen, currentAdmin]);

  // Add Admin Form State
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "Quiz Master"
  });
  const [teamMsg, setTeamMsg] = useState({ type: "", text: "" });

  if (!isOpen) return null;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    if (!currentAdmin?.id) return;

    const res = updateAdminProfile(currentAdmin.id, profileData);
    if (res.success) {
      setProfileMsg({ type: "success", text: res.message });
      playCorrect();
    } else {
      setProfileMsg({ type: "error", text: res.message });
      playWrong();
    }
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    setTeamMsg({ type: "", text: "" });

    const res = addAdmin(newAdmin);
    if (res.success) {
      setTeamMsg({ type: "success", text: res.message });
      setNewAdmin({ name: "", username: "", email: "", password: "", role: "Quiz Master" });
      playCorrect();
    } else {
      setTeamMsg({ type: "error", text: res.message });
      playWrong();
    }
  };

  const handleDeleteAdmin = (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to remove admin '${adminName}'?`)) return;
    setTeamMsg({ type: "", text: "" });
    const res = deleteAdmin(adminId);
    if (res.success) {
      setTeamMsg({ type: "success", text: res.message });
      playTick();
    } else {
      setTeamMsg({ type: "error", text: res.message });
      playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800/60 rounded-[2rem] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Admin Command Settings</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                  {currentAdmin?.role || "Admin"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as: <strong className="text-purple-600 dark:text-purple-400 font-bold">{currentAdmin?.username}</strong> ({currentAdmin?.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900/50">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-300 shadow-md border border-purple-200 dark:border-purple-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>My Profile &amp; Passwords</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "team"
                ? "bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-300 shadow-md border border-purple-200 dark:border-purple-800"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Crown className="w-4 h-4 text-pink-500" />
            <span>Manage Admins ({admins.length})</span>
          </button>
        </div>

        {/* Tab 1: Profile & Credentials Update */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 py-2">
              
              {profileMsg.text && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  profileMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Display Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Password</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.password}
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          )}

          {/* Tab 2: Add New Admin & Team Roster */}
          {activeTab === "team" && (
            <div className="space-y-5 py-2">
              
              {teamMsg.text && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  teamMsg.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {teamMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{teamMsg.text}</span>
                </div>
              )}

              {/* Add New Admin Form */}
              <form onSubmit={handleAddAdmin} className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  <Plus className="w-4 h-4 text-pink-600" />
                  <span>Add New Symposium Official / Admin</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Prof. Ramesh)"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Username (e.g. referee1)"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email (e.g. ramesh@srm.edu)"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Quiz Master">Quiz Master</option>
                    <option value="Score Referee">Score Referee</option>
                    <option value="Technical Host">Technical Host</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20 hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Admin</span>
                  </button>
                </div>
              </form>

              {/* Admin Accounts Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Active Admin Roster ({admins.length})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        admin.id === currentAdmin?.id
                          ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400 font-bold"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-xs">
                          {admin.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white">{admin.name}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-purple-700 dark:text-purple-300 font-bold">
                              {admin.role}
                            </span>
                            {admin.id === currentAdmin?.id && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            @{admin.username} &bull; {admin.email} &bull; pass: <span className="text-slate-400">{admin.password}</span>
                          </span>
                        </div>
                      </div>

                      {admin.id !== currentAdmin?.id && admins.length > 1 && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
