import Navbar from "@/app/components/homepage/Navbar";
import Umrah from "@/app/components/homepage/navmenu/Umrah";
import TopBar from "@/app/components/homepage/TopBar";

export const metadata = {
  title: "Umrah Packages",
};

export default function UmrahPage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Umrah />
    </>
  );
}