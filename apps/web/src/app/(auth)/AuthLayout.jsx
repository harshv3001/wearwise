export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex px-4 p-6">
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center p-6">
        <img src="closet.svg" alt="Closet illustration" className="w-64" />
      </div>
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        {children}
      </div>
    </main>
  );
}
