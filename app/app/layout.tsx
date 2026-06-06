import { AppSidebar } from "@/components/app-sidebar";

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
