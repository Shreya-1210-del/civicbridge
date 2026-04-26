import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-100 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-civicDark">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-civicGreen to-teal-600 text-white shadow-lg">
              <Icon name="bridge" className="h-5 w-5" />
            </span>
            <span className="text-lg font-black">CivicBridge</span>
          </div>
          <p className="mt-2 text-sm font-medium text-emerald-800">CivicBridge - Connecting Needs. Empowering Communities.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-emerald-800">
          <Link className="hover:text-civicGreen" to="/feed">Feed</Link>
          <Link className="hover:text-civicGreen" to="/heatmap">Heatmap</Link>
          <Link className="hover:text-civicGreen" to="/donate">Donate</Link>
          <Link className="hover:text-civicGreen" to="/report">Report</Link>
        </div>
        <div className="flex gap-3 text-civicGreen">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 font-bold">in</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 font-bold">x</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 font-bold">f</span>
        </div>
      </div>
    </footer>
  );
}
