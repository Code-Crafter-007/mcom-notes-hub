import Hero from "@/components/Hero"
import WhyUseNotes from "@/components/WhyUseNotes"
import FeaturedNotes from "@/components/FeaturedNotes"
import Testimonials from "@/components/Testimonials"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyUseNotes />
      <FeaturedNotes />
      <Testimonials />
      <Footer />
    </main>
  )
}
