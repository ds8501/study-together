"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Flame, Map, Sparkles, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import LandingBuddies from "./LandingBuddies";

const features = [
  { icon: Map, title: "A roadmap that’s yours", text: "Turn big learning goals into a day-by-day path you can actually follow." },
  { icon: Flame, title: "Momentum that sticks", text: "Build a daily streak, track focused sessions, and see your progress add up." },
  { icon: Users, title: "Better together", text: "Invite a study partner, share progress, and keep each other moving." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const characters = charactersRef.current;
    if (!hero || !characters || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const friends = Array.from(characters.querySelectorAll<HTMLElement>("[data-friend]"));
    const moveCharacters = (event: PointerEvent) => {
      friends.forEach((friend) => {
        const bounds = friend.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2))));
        const y = Math.max(-1, Math.min(1, ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2))));
        friend.style.setProperty("--gaze-x", `${x * 1.1}px`);
        friend.style.setProperty("--gaze-y", `${y * 0.65}px`);
      });
    };
    const resetCharacters = () => friends.forEach((friend) => {
      friend.style.setProperty("--gaze-x", "0px");
      friend.style.setProperty("--gaze-y", "0px");
    });
    hero.addEventListener("pointermove", moveCharacters, { passive: true });
    hero.addEventListener("pointerleave", resetCharacters);
    return () => {
      hero.removeEventListener("pointermove", moveCharacters);
      hero.removeEventListener("pointerleave", resetCharacters);
    };
  }, []);

  return (
    <main className="landing-page">
      <section className="landing-hero" id="home" ref={heroRef}>
        <div className="landing-art" aria-hidden="true" />
        <div className="landing-shade" aria-hidden="true" />
        <div className="landing-characters" aria-hidden="true" ref={charactersRef}>
          <div data-friend="boy" className="landing-character landing-character-boy">
            <img src="/landing-boy.png" alt="" />
            <svg className="landing-eyes" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><clipPath id="boy-eye-a" clipPathUnits="userSpaceOnUse"><ellipse cx="41.2" cy="38.9" rx="4.1" ry="2.8"/></clipPath><clipPath id="boy-eye-b" clipPathUnits="userSpaceOnUse"><ellipse cx="56.8" cy="33.3" rx="3.5" ry="3.1"/></clipPath></defs>
              <g clipPath="url(#boy-eye-a)"><g className="landing-eye-pupil"><circle cx="41.2" cy="38.9" r="2.15" fill="#754023"/><circle cx="41.2" cy="38.9" r="1.1" fill="#130c0b"/><circle cx="40.55" cy="38.25" r=".52" fill="#fff"/></g></g>
              <g clipPath="url(#boy-eye-b)"><g className="landing-eye-pupil"><circle cx="56.8" cy="33.3" r="2.15" fill="#754023"/><circle cx="56.8" cy="33.3" r="1.1" fill="#130c0b"/><circle cx="56.15" cy="32.65" r=".52" fill="#fff"/></g></g>
            </svg>
          </div>
          <div data-friend="cream" className="landing-character landing-character-cream">
            <img src="/landing-girl-cream.png" alt="" />
            <svg className="landing-eyes" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><clipPath id="cream-eye-a" clipPathUnits="userSpaceOnUse"><ellipse cx="49.2" cy="37.7" rx="4.3" ry="2.9"/></clipPath><clipPath id="cream-eye-b" clipPathUnits="userSpaceOnUse"><ellipse cx="63" cy="32.1" rx="3.2" ry="2.9"/></clipPath></defs>
              <g clipPath="url(#cream-eye-a)"><g className="landing-eye-pupil"><circle cx="49.2" cy="37.7" r="2.05" fill="#754023"/><circle cx="49.2" cy="37.7" r="1.05" fill="#130c0b"/><circle cx="48.58" cy="37.08" r=".5" fill="#fff"/></g></g>
              <g clipPath="url(#cream-eye-b)"><g className="landing-eye-pupil"><circle cx="63" cy="32.1" r="2.05" fill="#754023"/><circle cx="63" cy="32.1" r="1.05" fill="#130c0b"/><circle cx="62.38" cy="31.48" r=".5" fill="#fff"/></g></g>
            </svg>
          </div>
          <div data-friend="lavender" className="landing-character landing-character-lavender">
            <img src="/landing-girl-lavender.png" alt="" />
            <svg className="landing-eyes" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><clipPath id="lavender-eye-a" clipPathUnits="userSpaceOnUse"><ellipse cx="45.2" cy="34.9" rx="4.4" ry="3.2"/></clipPath><clipPath id="lavender-eye-b" clipPathUnits="userSpaceOnUse"><ellipse cx="61.5" cy="37.6" rx="4.5" ry="3.2"/></clipPath></defs>
              <g clipPath="url(#lavender-eye-a)"><g className="landing-eye-pupil"><circle cx="45.2" cy="34.9" r="2.35" fill="#754023"/><circle cx="45.2" cy="34.9" r="1.2" fill="#130c0b"/><circle cx="44.5" cy="34.2" r=".58" fill="#fff"/></g></g>
              <g clipPath="url(#lavender-eye-b)"><g className="landing-eye-pupil"><circle cx="61.5" cy="37.6" r="2.35" fill="#754023"/><circle cx="61.5" cy="37.6" r="1.2" fill="#130c0b"/><circle cx="60.8" cy="36.9" r=".58" fill="#fff"/></g></g>
            </svg>
          </div>
          <img className="landing-set-dressing" src="/study-table-foreground.png" alt="" />
        </div>
        <header className="landing-nav">
          <Link className="landing-brand" href="/" aria-label="Study Together home">
            <span className="landing-brand-mark"><Sparkles size={19} /></span>
            <span>Study Together</span>
          </Link>
          <nav aria-label="Main navigation">
            <a className="active" href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#engineers">For engineers</a>
          </nav>
          <Link className="landing-enter landing-enter-nav" href="/login">Enter Study Room <ArrowRight size={16} /></Link>
        </header>

        <div className="landing-hero-copy">
          <span className="landing-eyebrow">A SHARED SPACE FOR BIGGER GOALS</span>
          <h1>Study<br /><span>Together.</span></h1>
          <p>Your roadmap. Your pace. Your journey.</p>
          <Link className="landing-enter landing-enter-main" href="/login">Enter Study Room <ArrowRight size={18} /></Link>
          <div className="landing-social-proof"><LandingBuddies/><span>Three journeys · One shared space</span></div>
        </div>

        <a className="landing-scroll" href="#features"><span><ArrowDown size={15} /></span> Scroll to explore</a>
        <div className="landing-footer-note"><LandingBuddies/> Building better engineers together</div>
      </section>

      <section className="landing-section landing-features" id="features">
        <div className="landing-section-heading"><span className="landing-eyebrow">MADE FOR THE LONG GAME</span><h2>Make progress feel possible.</h2><p>Small steps, shared momentum, and a plan that keeps you pointed forward.</p></div>
        <div className="landing-feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="landing-feature-card" key={title}><span><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="landing-section landing-how" id="how-it-works">
        <div className="landing-section-heading"><span className="landing-eyebrow">HOW IT WORKS</span><h2>One good session at a time.</h2></div>
        <div className="landing-steps"><article><b>01</b><div><h3>Choose your direction</h3><p>Build a roadmap around the skills and topics you want to master.</p></div></article><article><b>02</b><div><h3>Show up and focus</h3><p>Pick a topic, start a study session, and keep your momentum going.</p></div></article><article><b>03</b><div><h3>Celebrate the progress</h3><p>Check off topics, grow your streak, and share the journey with a friend.</p></div></article></div>
      </section>

      <section className="landing-section landing-journeys" id="journeys">
        <div className="landing-section-heading"><span className="landing-eyebrow">THREE PATHS · ONE COMMUNITY</span><h2>Different roadmaps. Same destination.</h2><p>Build a path that fits your goals, then grow alongside friends working toward theirs.</p></div>
        <div className="landing-journey-grid">
          <article><span className="journey-person journey-boy">D</span><h3>Divya</h3><p>DSA <i>→</i> LLD <i>→</i> HLD <i>→</i> Backend</p></article>
          <article><span className="journey-person journey-cream">S</span><h3>Study partner</h3><p>Java <i>→</i> Spring <i>→</i> React <i>→</i> ML</p></article>
          <article><span className="journey-person journey-lavender">Y</span><h3>Your next teammate</h3><p>Java <i>→</i> AWS <i>→</i> System Design</p></article>
        </div>
      </section>

      <section className="landing-section landing-mission">
        <div className="landing-section-heading"><span className="landing-eyebrow">A LITTLE EVERY DAY</span><h2>Your daily mission.</h2><p>Turn an ambitious plan into a short list you can finish today.</p></div>
        <div className="landing-mission-grid"><article><small>01 · PRACTICE</small><strong>2 DP questions</strong></article><article><small>02 · REVISIT</small><strong>2 revision questions</strong></article><article><small>03 · DESIGN</small><strong>2 LLD topics</strong></article><article><small>04 · ARCHITECT</small><strong>2 HLD topics</strong></article></div>
      </section>

      <section className="landing-section landing-cycle">
        <div className="landing-section-heading"><span className="landing-eyebrow">MAKE IT STICK</span><h2>Learn. Practice. Revise. Master.</h2></div>
        <div className="landing-cycle-row"><span>Learn</span><i>→</i><span>Practice</span><i>→</i><span>Revise</span><i>→</i><span>Master</span></div>
      </section>

      <section className="landing-engineers" id="engineers">
        <div><span className="landing-eyebrow">BUILT FOR ENGINEERS</span><h2>From first principles<br />to interview ready.</h2><p>DSA, Java, Spring, databases, and system design—organize the skills you need into a steady learning plan.</p><Link className="landing-enter landing-enter-main" href="/login">Start your roadmap <ArrowRight size={17} /></Link></div>
        <div className="landing-stack" aria-hidden="true"><span><BookOpen size={16}/> DSA</span><span><BookOpen size={16}/> Java &amp; Spring</span><span><BookOpen size={16}/> System Design</span><span><BookOpen size={16}/> Interview Prep</span></div>
      </section>
      <section className="landing-final"><span className="landing-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Build better. Together.</h2><Link className="landing-enter landing-enter-main" href="/login">Enter Study Room <ArrowRight size={18}/></Link></section>
      <footer className="landing-bottom"><Link className="landing-brand" href="/"><span className="landing-brand-mark"><Sparkles size={17}/></span><span>Study Together</span></Link><span>Your roadmap. Your pace. Your journey.</span><Link href="/login">Enter Study Room <ArrowRight size={14}/></Link></footer>
    </main>
  );
}
