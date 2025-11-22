import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import VendorListPage from "./pages/VendorListPage";
import VendorDetailPage from "./pages/VendorDetailPage";
import NewVendorPage from "./pages/NewVendorPage";
import CompareVendorsPage from "./pages/CompareVendorsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="font-semibold">
            Government of Canada – Vendor Performance
          </div>
          <nav className="space-x-4 text-sm">
            <Link to="/" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/vendors/new" className="hover:underline">
              Add Vendor
            </Link>
            <Link to="/compare" className="hover:underline">
              Compare Vendors
            </Link>
          </nav>
        </header>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<VendorListPage />} />
            <Route path="/vendors/new" element={<NewVendorPage />} />
            <Route path="/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/compare" element={<CompareVendorsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

