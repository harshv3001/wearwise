import AuthCard from "../components/ui/AuthCard/AuthCard";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex px-4">
      <div className="hidden md:flex w-1/2 bg-[var(--ww-gray-medium)] items-center justify-center p-6">
        <img src="closet.svg" alt="Closet illustration" className="w-64" />
      </div>

      <AuthCard>{children}</AuthCard>
    </main>
  );
}
