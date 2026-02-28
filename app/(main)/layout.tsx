import { BottomNav } from "@/components/fumuly/bottom-nav";
import { AuthGuard } from "@/components/fumuly/auth-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#F7F8FA]">
      <AuthGuard />
      <main className="pb-20 max-w-md mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
