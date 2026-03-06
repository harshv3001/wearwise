import Header from "../components/header/Header";
import RequireAuth from "../components/RequireAuth";

export default function ProtectedLayout({ children }) {
  return (
    <RequireAuth>
      <>
        <Header />
        {children}
      </>
    </RequireAuth>
  );
}
