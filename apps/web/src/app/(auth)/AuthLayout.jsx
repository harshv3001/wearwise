import AuthCard from "../components/ui/AuthCard/AuthCard";
import HeaderLogo from "../components/Header/HeaderLogo";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex px-4 bg-[var(--ww-gray-medium)]">
      <div className="hidden md:flex w-1/2 bg-[var(--ww-gray-medium)]">
        <HeaderLogo className="font-bold mt-[5px] text-[25px]" />

        <img
          src="closet.svg"
          alt="Closet illustration"
          className="w-64 items-center justify-center p-6"
        />
      </div>

      <AuthCard>{children}</AuthCard>
    </main>
  );
}
