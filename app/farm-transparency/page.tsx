import InteractiveFarmMap from "@/components/InteractiveFarmMap";
import FarmTransparency from "@/components/FarmTransparency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Farm Transparency - 100 Jenis Durian",
  description: "See complete care history and transparency information for our durian trees. Track fertilization, harvests, and daily care from day one.",
};

export default function FarmTransparencyPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <InteractiveFarmMap />
        <FarmTransparency />
      </div>
      <Footer />
    </main>
  );
}
