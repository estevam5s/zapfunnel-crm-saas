import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Stats } from "@/components/landing/stats"
import { Features } from "@/components/landing/features"
import { Showcase } from "@/components/landing/showcase"
import { Steps } from "@/components/landing/steps"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { FeedbackWidget } from "@/components/feedback-widget"
import { ScrollFX } from "@/components/landing/scroll-fx"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollFX />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Showcase />
        <Steps />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <FeedbackWidget />
    </div>
  )
}
