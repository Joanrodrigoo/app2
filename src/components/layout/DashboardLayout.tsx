import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const storedUser = localStorage.getItem("user");
  const userName = storedUser ? JSON.parse(storedUser).name : "Usuario";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar fixa */}
      <Sidebar className="w-64 h-screen fixed top-0 left-0 z-50 border-r" />

      {/* Contingut amb padding esquerre per no tapar el sidebar */}
      <div className="flex flex-col flex-1 w-full pl-64">
        <DashboardHeader userName={userName} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};


export default DashboardLayout;
