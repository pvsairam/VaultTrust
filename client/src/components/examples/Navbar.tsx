import { Navbar } from "../Navbar";
import { ThemeProvider } from "../ThemeProvider";

export default function NavbarExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <p className="text-white">Navbar is fixed at the top</p>
        </div>
      </div>
    </ThemeProvider>
  );
}
