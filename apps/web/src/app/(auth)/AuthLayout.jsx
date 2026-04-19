import { AuthCard, BrandLogo } from "../components/ui/display";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex flex-col overflow-y-auto bg-[var(--ww-gray-medium)] md:flex-row md:overflow-hidden">
      <section className="flex flex-col px-6 pt-6 md:w-1/2 md:px-10 md:pt-8">
        <div className="flex items-center justify-start">
          <BrandLogo size="large" />
        </div>

        <div className="flex flex-1 items-center py-8 md:py-0 justify-center md:justify-start">
          <img
            src="closet.svg"
            alt="Closet illustration"
            className="w-full max-w-[340px] md:max-w-[450px]"
          />
        </div>
      </section>

      <AuthCard>{children}</AuthCard>
    </main>
  );
}
