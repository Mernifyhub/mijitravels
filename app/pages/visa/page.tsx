import Navbar from "@/app/components/homepage/Navbar";
import Visa from "@/app/components/homepage/navmenu/Visa";
import TopBar from "@/app/components/homepage/TopBar";

export const metadata = {
  title: "Visa Services",
};

export default function VisaPage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Visa />
    </>
  );
}