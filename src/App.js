import './App.css';
import Nav from './components/Nav';
import HeroScene from './components/HeroScene';
import AboutScene from './components/AboutScene';
import SkillsOrb from './components/SkillsOrb';
import ProjectsScene from './components/ProjectsScene';
import ContactScene from './components/ContactScene';

const projects = [
  {
    title: 'Clinical Trial Management System',
    desc: 'GenAI-powered platform for biotech & pharma researchers. RAG pipeline (Mistral-7B + BERT) processes trial protocols, FDA guidelines & safety reports. Includes wearable dashboard, AI recommendations, smart contracts for audit trails, sustainability module & CBT-based AI therapist.',
    tags: ['Mistral-7B', 'BERT', 'Gemini', 'RAG', 'Smart Contracts', 'Chart.js', 'Blockchain'],
    color: '#00d4ff',
    status: 'shipped',
    number: '01',
  },
  {
    title: 'RR4 — Flutter App',
    desc: 'Cross-platform mobile application built from the ground up in Flutter. New chapter, new stack — pushing fast through architecture and performance optimisation.',
    tags: ['Flutter', 'Dart', 'Mobile', 'Cross-Platform'],
    color: '#00ff88',
    status: 'in progress',
    number: '02',
  },
  {
    title: 'UI/UX Overhaul — Client',
    desc: 'Full product redesign for a client — handling all design and frontend implementation. Pixel-perfect execution across responsive breakpoints. Cleaner, faster, more accessible.',
    tags: ['React', 'Tailwind', 'Figma', 'Accessibility'],
    color: '#7c3aed',
    status: 'in progress',
    number: '03',
  },
  {
    title: 'Graph Visualisation Engine',
    desc: 'Complex graph visualisation using Cytoscape.js and D3.js — rendering large node networks without making users cry. Interactive, filterable, and performant at scale.',
    tags: ['Cytoscape.js', 'D3.js', 'React', 'WebGL'],
    color: '#ff6b6b',
    status: 'building',
    number: '04',
  },
];

const stats = [
  { value: '5+',  label: 'Years Experience' },
  { value: '20+', label: 'Projects Shipped' },
  { value: '40+', label: 'Technologies' },
  { value: '∞',   label: 'Bugs Fixed at 2am' },
];

export default function App() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="app">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section id="home" className="hero">
        <HeroScene />
        <div className="hero__content">
          <p className="hero__greeting">Hello, I'm</p>
          <h1 className="hero__name">
            Aman<br />
            <span className="hero__name--accent">Yadav</span>
          </h1>
          <p className="hero__role">
            Full Stack Developer <span className="muted">/</span> GenAI Engineer
          </p>
          <p className="hero__tagline">
            I break things, fix things, and occasionally ship things.<br />
            <span className="muted">Java · Python · React · Spring Boot · LLMs · and whatever else the sprint demands.</span>
          </p>
          <div className="hero__cta">
            <button className="btn btn--primary" onClick={() => scrollTo('projects')}>View Work</button>
            <button className="btn btn--ghost"   onClick={() => scrollTo('contact')}>Say Hi</button>
          </div>
        </div>
        <div className="hero__scroll-hint">
          <div className="hero__scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────── */}
      <section id="about" className="section about">
        <div className="about__inner">
          <div className="about__text">
            <p className="section__eyebrow">{'// about_me.md'}</p>
            <h2 className="section__title">The Person <span className="accent">Behind the Code</span></h2>
            <p>
              Full Stack Developer with 5+ years of experience and an unhealthy obsession with solving
              bugs at 2am. I've touched enough tech stacks to confuse my own resume — Java, Python,
              Node.js, Spring Boot, Angular, React, SQL — you name it, I've probably broken it and
              fixed it again.
            </p>
            <p>
              If there's a complex problem, a weird edge case, or a framework nobody on the team has
              used before — that's where I show up. Currently deep in GenAI — RAG pipelines,
              fine-tuned LLMs, and making machines smarter than me (it's working).
            </p>
            <p className="about__learning">
              <span className="accent">Currently learning: </span>
              GSAP &nbsp;·&nbsp; Advanced GenAI &nbsp;·&nbsp; Cytoscape.js
            </p>
            <div className="about__stats">
              {stats.map(({ value, label }) => (
                <div key={label} className="stat-card">
                  <span className="stat-card__value">{value}</span>
                  <span className="stat-card__label">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about__scene-wrap">
            <div className="about__scene-label">{'// drag to rotate'}</div>
            <AboutScene />
          </div>
        </div>
      </section>

      {/* ── Skills ────────────────────────────────────────────── */}
      <section id="skills" className="section skills">
        <div className="skills__header">
          <p className="section__eyebrow">{'// tech_stack.json'}</p>
          <h2 className="section__title">Things I Use to <span className="accent">Cause & Prevent Problems</span></h2>
          <p className="section__subtitle">Drag the orb &mdash; 45+ technologies across 7 categories</p>
        </div>
        <div className="skills__orb">
          <SkillsOrb />
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────── */}
      <section id="projects" className="section projects">
        <ProjectsScene />
        <div className="projects__content">
          <p className="section__eyebrow">{'// shipped & in_progress'}</p>
          <h2 className="section__title">Selected <span className="accent">Work</span></h2>
          <div className="projects__grid">
            {projects.map((p) => (
              <div key={p.title} className="project-card" style={{ '--accent': p.color }}>
                <div className="project-card__glow" />
                <div className="project-card__top">
                  <span className="project-card__number">{p.number}</span>
                  <span className={`project-card__badge badge--${p.status.replace(' ', '-')}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="project-card__title">{p.title}</h3>
                <p className="project-card__desc">{p.desc}</p>
                <div className="project-card__tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag" style={{ borderColor: `${p.color}40`, color: p.color }}>
                      {t}
                    </span>
                  ))}
                </div>
                <button className="btn btn--ghost btn--sm project-card__cta">View Project →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="section contact">
        <ContactScene />
        <div className="contact__content">
          <p className="section__eyebrow">{'// let_s_talk'}</p>
          <h2 className="section__title">Got a Bug That's Been <span className="accent">Haunting You?</span></h2>
          <p className="contact__sub">
            A project idea that sounds insane? Just want to argue about tabs vs spaces?
            My inbox is always open.
          </p>
          <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="form__row">
              <div className="form__group">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>
              <div className="form__group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" />
              </div>
            </div>
            <div className="form__group">
              <label>Subject</label>
              <input type="text" placeholder="What's this about?" />
            </div>
            <div className="form__group">
              <label>Message</label>
              <textarea rows={5} placeholder="Tell me everything. The weirder the better." />
            </div>
            <button type="submit" className="btn btn--primary btn--full">Send Message ↗</button>
          </form>
          <div className="contact__info">
            <a href="mailto:yadavaman2282000@gmail.com" className="contact__email">
              yadavaman2282000@gmail.com
            </a>
            <div className="contact__socials">
              {['GitHub', 'LinkedIn', 'Twitter'].map((s) => (
                <a key={s} href="#!" className="social-link">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="footer">
        <span className="footer__left">
          <span className="accent">&lt;</span> Aman Yadav <span className="accent">/&gt;</span>
          &nbsp;— Built with React + Three.js
        </span>
        <span className="footer__right">© 2026 · All rights reserved</span>
      </footer>
    </div>
  );
}
