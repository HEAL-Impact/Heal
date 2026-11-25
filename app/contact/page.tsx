import { Contact } from "@/components/ContactForm";
import { GetInTouch } from "@/components/GetInTouch";
import MapSection from "@/components/MapSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactUs() {
  return (
    <>
      <Navbar></Navbar>
      <GetInTouch></GetInTouch>
      <Contact></Contact>
      <MapSection></MapSection>
      <Footer></Footer>
    </>
  );
}
