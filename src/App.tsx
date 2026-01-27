import { Suspense } from "react";
import SlowComponent from "./components/SlowComponent";

function App() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-sky-400">RSC Playground</h1>

      <p className="mt-4 text-slate-400">React 19 + Vite + Tailwind</p>

      <div className="mt-6 rounded-lg bg-slate-800 p-4 text-white">
        Tailwind is working ✅
      </div>

      <Suspense fallback={<p>Loading slow content...</p>}>
        <SlowComponent />
      </Suspense>
    </main>
  );
}

export default App;
