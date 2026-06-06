import Navbar from "@/app/components/homepage/Navbar";
import Hotels from "@/app/components/homepage/navmenu/Hotels";
import TopBar from "@/app/components/homepage/TopBar";

export const metadata = {
  title: "Hotels",
};

export default function HotelsPage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Hotels />
    </>
  );
}