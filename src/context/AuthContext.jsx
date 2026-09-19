// CONNEXION - Authentication & Session Context with Multi-Admin Management
import React, { createContext, useContext, useState, useEffect } from "react";
import { registerTeam as apiRegisterTeam, subscribeTeam, joinTeamByCode as apiJoinTeamByCode } from "../firebase/firestoreService";
import { mockSync } from "../firebase/mockSyncService";

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = "cnx_admin_authenticated";
const ADMIN_SESSION_KEY = "cnx_active_admin_session";
const ADMIN_LIST_KEY = "cnx_admins_list";
const TEAM_STORAGE_KEY = "cnx_active_team_session";

// Default Master Admin Seed Credentials
const DEFAULT_MASTER_ADMIN = {
  id: "admin_master",
  name: "Head Quiz Master (BCA)",
  username: "admin",
  email: "admin@connexion.srm",
  password: "admin123",
  role: "Super Admin",
  createdAt: "2026-09-18"
};

function getInitialAdmins() {
  try {
    const raw = localStorage.getItem(ADMIN_LIST_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify([DEFAULT_MASTER_ADMIN]));
      return [DEFAULT_MASTER_ADMIN];
    }
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length > 0) {
      if (!list.some(a => a.id === DEFAULT_MASTER_ADMIN.id || (a.username || "").toLowerCase() === "admin")) {
        list.unshift(DEFAULT_MASTER_ADMIN);
      }
      return list;
    }
    return [DEFAULT_MASTER_ADMIN];
  } catch (e) {
    return [DEFAULT_MASTER_ADMIN];
  }
}

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  });

  const [admins, setAdmins] = useState(getInitialAdmins);

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) return JSON.parse(saved);
      if (localStorage.getItem(ADMIN_STORAGE_KEY) === "true") return DEFAULT_MASTER_ADMIN;
      return null;
    } catch (e) {
      return null;
    }
  });

  const [currentTeam, setCurrentTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(TEAM_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Keep current team in sync with live DB (score updates, qualification status)
  useEffect(() => {
    if (!currentTeam?.id) return;
    const unsub = subscribeTeam(currentTeam.id, (freshData) => {
      if (freshData) {
        setCurrentTeam((prev) => {
          const updated = { ...prev, ...freshData };
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });
    return () => unsub();
  }, [currentTeam?.id]);

  // Sync admin accounts across devices via cloud relay
  useEffect(() => {
    const unsub = mockSync.onEvent((event) => {
      if (event && event.type === "ADMINS_UPDATED") {
        const freshAdmins = event.payload?.admins || event.payload;
        if (Array.isArray(freshAdmins) && freshAdmins.length > 0) {
          setAdmins((prev) => {
            const map = new Map();
            prev.forEach(a => { if (a && (a.id || a.username)) map.set(a.id || a.username, a); });
            freshAdmins.forEach(a => { if (a && (a.id || a.username)) map.set(a.id || a.username, { ...(map.get(a.id || a.username) || {}), ...a }); });
            const merged = Array.from(map.values());
            localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      }
    });
    return () => unsub();
  }, []);

  // Save admins to localStorage AND broadcast to Cloud Relay for multi-device sync
  const saveAdmins = (updatedAdmins) => {
    setAdmins(updatedAdmins);
    localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(updatedAdmins));
    mockSync.saveAdmins(updatedAdmins);
  };

  /**
   * Admin Login with Username OR Email + Password (Strict Matching + Multi-Device Cloud Fallback)
   */
  const loginAdmin = async (identifier, password) => {
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: "Please enter both Username/Email and Password." };
    }

    // 1. Check local device admin list first
    let adminList = getInitialAdmins();
    let matched = adminList.find(a => 
      ((a.username || "").trim().toLowerCase() === cleanId || 
       (a.email || "").trim().toLowerCase() === cleanId) && 
      a.password === cleanPass
    );

    // 2. If not found locally, pull latest admin list from Cloud Relay (in case created on another device)
    if (!matched) {
      try {
        await mockSync.pullFromCloud();
        adminList = getInitialAdmins();
        matched = adminList.find(a => 
          ((a.username || "").trim().toLowerCase() === cleanId || 
           (a.email || "").trim().toLowerCase() === cleanId) && 
          a.password === cleanPass
        );
      } catch (e) {}
    }

    if (matched) {
      setIsAdmin(true);
      setCurrentAdmin(matched);
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(matched));
      return { success: true, admin: matched };
    }

    return { 
      success: false, 
      message: "Invalid username/email or password. Please try again." 
    };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setCurrentAdmin(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  /**
   * Update Logged-in Admin Profile (Username, Email, Password, Name)
   */
  const updateAdminProfile = (adminId, updates) => {
    const cleanUsername = (updates.username || "").trim();
    const cleanEmail = (updates.email || "").trim();
    const cleanPassword = (updates.password || "").trim();
    const cleanName = (updates.name || "").trim();

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      return { success: false, message: "Username, Email, and Password cannot be empty." };
    }

    // Check duplicate username or email with other admins
    const duplicate = admins.find(a => 
      a.id !== adminId && 
      (a.username.toLowerCase() === cleanUsername.toLowerCase() || 
       a.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (duplicate) {
      return { success: false, message: "Another admin already uses this username or email." };
    }

    const updated = admins.map(a => {
      if (a.id === adminId) {
        return {
          ...a,
          name: cleanName || a.name,
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword
        };
      }
      return a;
    });

    saveAdmins(updated);

    // If current admin updated self, update current session
    if (currentAdmin?.id === adminId) {
      const freshSelf = updated.find(a => a.id === adminId);
      setCurrentAdmin(freshSelf);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(freshSelf));
    }

    return { success: true, message: "Profile updated successfully!" };
  };

  /**
   * Add a New Admin to the System
   */
  const addAdmin = (newAdminData) => {
    const cleanUsername = (newAdminData.username || "").trim();
    const cleanEmail = (newAdminData.email || "").trim();
    const cleanPassword = (newAdminData.password || "").trim();
    const cleanName = (newAdminData.name || "").trim();
    const cleanRole = (newAdminData.role || "Quiz Referee").trim();

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      return { success: false, message: "Please provide a valid Name, Username, Email, and Password." };
    }

    const exists = admins.some(a => 
      a.username.toLowerCase() === cleanUsername.toLowerCase() || 
      a.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (exists) {
      return { success: false, message: "An admin with this username or email already exists." };
    }

    const newAdmin = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName || cleanUsername,
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      role: cleanRole,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [...admins, newAdmin];
    saveAdmins(updated);
    return { success: true, message: `Admin account '${cleanUsername}' created successfully!`, admin: newAdmin };
  };

  /**
   * Delete an Admin Account (Safeguard: Cannot delete last remaining admin)
   */
  const deleteAdmin = (adminId) => {
    if (admins.length <= 1) {
      return { success: false, message: "Cannot delete the only remaining admin account!" };
    }

    if (currentAdmin?.id === adminId) {
      return { success: false, message: "You cannot delete your own active admin account while logged in." };
    }

    const updated = admins.filter(a => a.id !== adminId);
    saveAdmins(updated);
    return { success: true, message: "Admin account removed successfully." };
  };

  const loginTeam = async (teamData) => {
    const savedTeam = await apiRegisterTeam(teamData);
    setCurrentTeam(savedTeam);
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(savedTeam));
    return savedTeam;
  };

  const joinTeam = async (registeredName, teamCode) => {
    const res = await apiJoinTeamByCode(registeredName, teamCode);
    if (res.success && res.team) {
      setCurrentTeam(res.team);
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(res.team));
    }
    return res;
  };

  const logoutTeam = () => {
    setCurrentTeam(null);
    localStorage.removeItem(TEAM_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        currentAdmin,
        admins,
        loginAdmin,
        logoutAdmin,
        updateAdminProfile,
        addAdmin,
        deleteAdmin,
        currentTeam,
        loginTeam,
        joinTeam,
        logoutTeam
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}