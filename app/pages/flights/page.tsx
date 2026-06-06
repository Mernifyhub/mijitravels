import Navbar from "@/app/components/homepage/Navbar";
import Flights from "@/app/components/homepage/navmenu/Flights";
import TopBar from "@/app/components/homepage/TopBar";

export const metadata = {
  title: "Flights",
};

export default function FlightsPage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Flights />
    </>
  );
}