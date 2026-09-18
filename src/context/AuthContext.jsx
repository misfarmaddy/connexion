// CONNEXION - Authentication & Session Context with Multi-Admin Management
import React, { createContext, useContext, useState, useEffect } from "react";
import { registerTeam as apiRegisterTeam, subscribeTeam, joinTeamByCode as apiJoinTeamByCode } from "../firebase/firestoreService";

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
    return Array.isArray(list) && list.length > 0 ? list : [DEFAULT_MASTER_ADMIN];
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

  // Save admins to localStorage whenever updated
  const saveAdmins = (updatedAdmins) => {
    setAdmins(updatedAdmins);
    localStorage.setItem(ADMIN_LIST_KEY, JSON.stringify(updatedAdmins));
  };

  /**
   * Admin Login with Username OR Email + Password (Strict Matching)
   */
  const loginAdmin = (identifier, password) => {
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: "Please enter both Username/Email and Password." };
    }

    // Always fetch latest persisted admins list
    const adminList = getInitialAdmins();

    // Match strictly by username or email AND exact password
    const matched = adminList.find(a => 
      ((a.username || "").trim().toLowerCase() === cleanId || 
       (a.email || "").trim().toLowerCase() === cleanId) && 
      a.password === cleanPass
    );

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