import { useReveal } from '../../hooks/useReveal';
import { MeshBackground } from '../MeshBackground';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Platform } from './Platform';
import { Modules } from './Modules';
import { AIEngine } from './AIEngine';
import { WhyNuva } from './WhyNuva';
import { Pricing } from './Pricing';
import { CTA } from './CTA';
import { Footer } from './Footer';

export function LandingPage({ onLaunchApp }: { onLaunchApp: () => void }) {
  useReveal();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MeshBackground />
      <Navbar onLaunchApp={onLaunchApp} />
      <main>
        <Hero onLaunchApp={onLaunchApp} />
        <Platform />
        <Modules />
        <AIEngine onLaunchApp={onLaunchApp} />
        <WhyNuva />
        <Pricing onLaunchApp={onLaunchApp} />
        <CTA onLaunchApp={onLaunchApp} />
      </main>
      <Footer />
    </div>
  );
}
