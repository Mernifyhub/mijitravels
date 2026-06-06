import Navbar from "@/app/components/homepage/Navbar";
import Holidays from "@/app/components/homepage/navmenu/Holidays";
import TopBar from "@/app/components/homepage/TopBar";

export const metadata = {
  title: "Holiday Packages",
};

export default function HolidaysPage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Holidays />
    </>
  );
}