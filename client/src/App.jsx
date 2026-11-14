import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PointsModal from "./components/PointsModal";
import PublicOrder from "./pages/PublicOrder";
import AdminLogin from "./pages/AdminLogin";
import MemberLogin from "./pages/MemberLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("member-login");
  const [memberSession, setMemberSession] = useState(null);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  useEffect(() => {
    const savedMember = localStorage.getItem("memberku_session");
    if (savedMember) {
      try {
        const parsed = JSON.parse(savedMember);
        setMemberSession(parsed);
        setCurrentPage("public");
      } catch (e) {
        console.error("Gagal membaca sesi member", e);
        localStorage.removeItem("memberku_session");
        setCurrentPage("member-login");
      }
    } else {
      setCurrentPage("member-login");
    }
  }, []);

  const handleLogoutMember = () => {
    localStorage.removeItem("memberku_session");
    setMemberSession(null);
    setCurrentPage("member-login");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-zinc-100 flex flex-col justify-between">
      {currentPage === "member-login" && (
        <MemberLogin
          onLoginSuccess={(memberData) => {
            setMemberSession(memberData);
            setCurrentPage("public");
          }}
          onNavigateToAdminLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "public" && memberSession && (
        <>
          <div className="max-w-6xl mx-auto w-full p-4 sm:p-6">
            <Navbar
              onNavigateToLogin={() => setCurrentPage("login")}
              memberSession={memberSession}
              onLogoutMember={handleLogoutMember}
              onOpenPointsModal={() => setIsPointsModalOpen(true)}
            />
            <PublicOrder
              memberSession={memberSession}
              onLogoutMember={handleLogoutMember}
              onNavigateToLoginMember={() => setCurrentPage("member-login")}
              onUpdateMemberSession={(updated) => setMemberSession(updated)}
              onOpenPointsModal={() => setIsPointsModalOpen(true)}
            />
            <PointsModal
              isOpen={isPointsModalOpen}
              onClose={() => setIsPointsModalOpen(false)}
              member={memberSession}
              onNavigateToOrder={() => {
                const el = document.getElementById("pesan");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
          <Footer />
        </>
      )}

      {currentPage === "login" && (
        <AdminLogin
          onLoginSuccess={() => {
            setCurrentPage("dashboard");
          }}
          onBack={() => {
            if (memberSession) {
              setCurrentPage("public");
            } else {
              setCurrentPage("member-login");
            }
          }}
        />
      )}

      {currentPage === "dashboard" && (
        <AdminDashboard
          onLogout={() => {
            setCurrentPage("member-login");
          }}
        />
      )}
    </div>
  );
}

export default App;
