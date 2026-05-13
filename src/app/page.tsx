'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const nav = document.getElementById('nav') as HTMLElement;
    const cursorEl = document.getElementById('cursor') as HTMLDivElement;
    const cursorDotEl = document.getElementById('cursor-dot') as HTMLDivElement;
    const hamburger = document.getElementById('hamburger') as HTMLButtonElement;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement;
    let menuOpen = false;

    // MOBILE MENU
    function closeMobile() {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      (hamburger.children[0] as HTMLElement).style.transform = '';
      (hamburger.children[1] as HTMLElement).style.opacity = '1';
      (hamburger.children[2] as HTMLElement).style.transform = '';
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      hamburger.setAttribute('aria-expanded', String(menuOpen));
      (hamburger.children[0] as HTMLElement).style.transform = menuOpen ? 'rotate(45deg) translateY(6.5px)' : '';
      (hamburger.children[1] as HTMLElement).style.opacity = menuOpen ? '0' : '1';
      (hamburger.children[2] as HTMLElement).style.transform = menuOpen ? 'rotate(-45deg) translateY(-6.5px)' : '';
      hamburger.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    // SMOOTH SCROLL
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (menuOpen) closeMobile();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // CUSTOM CURSOR
    let cx = -100, cy = -100, dx = -100, dy = -100;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      cx = e.clientX; cy = e.clientY;
      cursorDotEl.style.left = cx + 'px';
      cursorDotEl.style.top = cy + 'px';
    };
    document.addEventListener('mousemove', onMouseMove);

    function animateCursor() {
      dx += (cx - dx) * 0.12;
      dy += (cy - dy) * 0.12;
      cursorEl.style.left = dx + 'px';
      cursorEl.style.top = dy + 'px';
      rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .service-item, .work-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorEl.classList.add('active'));
      el.addEventListener('mouseleave', () => cursorEl.classList.remove('active'));
    });

    // THREE.JS HERO
    function initHero3D() {
      const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
      const heroSection = document.getElementById('hero') as HTMLElement;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x050505, 4, 18);
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 6;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x050505);

      const geo = new THREE.IcosahedronGeometry(2.2, 1);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true, emissive: 0xFF4D00, emissiveIntensity: 0.07 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const innerGeo = new THREE.IcosahedronGeometry(1.4, 2);
      const innerMat = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.9, roughness: 0.4, emissive: 0xFF4D00, emissiveIntensity: 0.025 });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      scene.add(innerMesh);

      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0x333333, size: 0.025, sizeAttenuation: true }));
      scene.add(particles);

      scene.add(new THREE.AmbientLight(0xffffff, 0.15));
      const light1 = new THREE.PointLight(0xFF4D00, 1.5, 15);
      light1.position.set(4, 3, 4);
      scene.add(light1);
      const light2 = new THREE.PointLight(0x4466ff, 0.8, 15);
      light2.position.set(-4, -2, 3);
      scene.add(light2);

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      let heroVisible = true;
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0 }).observe(heroSection);

      function animate() {
        requestAnimationFrame(animate);
        if (!heroVisible) return;
        mesh.rotation.x += 0.003;
        mesh.rotation.y += 0.005;
        innerMesh.rotation.x -= 0.002;
        innerMesh.rotation.y -= 0.003;
        particles.rotation.y += 0.0004;
        mesh.rotation.x += mouseY * 0.008;
        mesh.rotation.y += mouseX * 0.008;
        innerMesh.rotation.x += mouseY * 0.004;
        innerMesh.rotation.y += mouseX * 0.004;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    // THREE.JS ABOUT
    function initAbout3D() {
      const canvas = document.getElementById('about-canvas') as HTMLCanvasElement;
      const parent = canvas.parentElement as HTMLElement;
      const w = parent.clientWidth || 400;
      const h = parent.clientHeight || Math.round(w * (4 / 3));

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a0a0a, 2, 10);
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 50);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x0a0a0a);

      const torus = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1, 0.35, 100, 16),
        new THREE.MeshStandardMaterial({ color: 0x141414, wireframe: true, emissive: 0xFF4D00, emissiveIntensity: 0.05 })
      );
      scene.add(torus);

      const light = new THREE.PointLight(0xFF4D00, 2, 10);
      light.position.set(2, 2, 3);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffffff, 0.08));

      let aboutVisible = false;
      new IntersectionObserver(([entry]) => { aboutVisible = entry.isIntersecting; }, { threshold: 0 }).observe(parent);

      function animate() {
        requestAnimationFrame(animate);
        if (!aboutVisible) return;
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.008;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        const nw = parent.clientWidth;
        const nh = parent.clientHeight;
        if (!nw || !nh) return;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
    }

    // LOADER
    function runEntrance() {
      gsap.timeline()
        .to('.hero-title .line-inner', { y: '0%', duration: 1, stagger: 0.12, ease: 'power3.out' })
        .to('.hero-label', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
        .to('.hero-sub', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.6)
        .to('.hero-cta', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.75)
        .to('#scroll-ind', { opacity: 1, duration: 0.6 }, 1);
    }

    function runLoader() {
      gsap.timeline()
        .to('#loader .loader-text span', { y: '0%', stagger: 0.08, duration: 0.6, ease: 'power3.out' })
        .to('#loader-fill', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0.3)
        .to('#loader', { opacity: 0, duration: 0.4, onComplete: () => {
          const loader = document.getElementById('loader');
          if (loader) loader.classList.add('done');
          runEntrance();
        }}, 1.8);
    }

    // NAV SCROLL
    function initNavScroll() {
      ScrollTrigger.create({
        start: 100,
        onEnter: () => nav.classList.add('scrolled'),
        onLeaveBack: () => nav.classList.remove('scrolled'),
      });
    }

    // SCROLL REVEALS
    function initReveals() {
      (gsap.utils.toArray('.reveal') as HTMLElement[]).forEach(el => {
        gsap.to(el, {
          scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        });
      });
      (gsap.utils.toArray('.reveal-left') as HTMLElement[]).forEach(el => {
        gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 87%' }, opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' });
      });
      (gsap.utils.toArray('.reveal-right') as HTMLElement[]).forEach(el => {
        gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 87%' }, opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' });
      });
    }

    // HORIZONTAL SCROLL
    function initHorizontalScroll() {
      const pin = document.getElementById('work-pin') as HTMLElement;
      if (window.innerWidth <= 900) return;
      const totalScroll = pin.scrollWidth - window.innerWidth;
      gsap.to(pin, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: '.work-section',
          start: 'top top',
          end: () => '+=' + totalScroll,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }

    // COUNT UP
    function initCountUp() {
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count ?? '0', 10);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target, duration: 2, ease: 'power2.out',
              onUpdate: () => { el.textContent = Math.round(counter.val) + '+'; },
            });
          },
          once: true,
        });
      });
    }

    // SERVICES ACCORDION
    function toggleService(el: HTMLElement) {
      const wasOpen = el.classList.contains('open');
      document.querySelectorAll('.service-item').forEach(s => {
        s.classList.remove('open');
        s.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        el.classList.add('open');
        el.setAttribute('aria-expanded', 'true');
      }
    }

    document.querySelectorAll<HTMLElement>('.service-item').forEach(item => {
      item.addEventListener('click', () => toggleService(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleService(item); }
      });
    });

    // INIT
    initHero3D();
    initAbout3D();
    runLoader();
    initNavScroll();
    initReveals();
    initCountUp();
    document.fonts.ready.then(() => {
      initHorizontalScroll();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      {/* LOADER */}
      <div className="loader" id="loader" role="status" aria-label="Loading">
        <div className="loader-text" aria-hidden="true">
          <span>V</span><span>O</span><span>I</span><span>D</span>
        </div>
        <div className="loader-bar"><div className="loader-bar-fill" id="loader-fill" /></div>
      </div>

      {/* CURSOR */}
      <div className="cursor" id="cursor" aria-hidden="true" />
      <div className="cursor-dot" id="cursor-dot" aria-hidden="true" />

      {/* NAV */}
      <nav id="nav" role="navigation" aria-label="Main navigation">
        <a href="#hero" className="nav-logo">VOID<span>.</span></a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact" className="nav-cta">Start a Project</a>
        </div>
        <button className="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className="mobile-menu" id="mobile-menu" role="dialog" aria-label="Navigation menu">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#contact">Contact</a>
        <div className="mobile-menu-footer">VOID Studio — Est. 2022</div>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <canvas id="hero-canvas" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-label">Creative Studio — Est. 2022</div>
          <h1 className="hero-title">
            <span className="line"><span className="line-inner">We create</span></span>
            <span className="line"><span className="line-inner"><span className="highlight">digital</span> experiences</span></span>
            <span className="line"><span className="line-inner">that move people</span></span>
          </h1>
          <p className="hero-sub">A creative studio at the intersection of design, code, and motion. We build brands and digital products that demand attention.</p>
          <a href="#contact" className="hero-cta">
            Start a Project
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>
        <div className="scroll-indicator" id="scroll-ind" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {['Branding', 'Websites', 'Motion', '3D', 'UI/UX', 'Development', 'Strategy',
            'Branding', 'Websites', 'Motion', '3D', 'UI/UX', 'Development', 'Strategy'].map((item, i) => (
            <span className="marquee-item" key={i}>{item}<span className="dot" /></span>
          ))}
        </div>
      </div>

      {/* WORK */}
      <section className="work-section" id="work">
        <div className="work-header">
          <div className="sec-label reveal">Selected Work</div>
          <h2 className="sec-title reveal">Projects that<br />define our craft</h2>
        </div>
        <div className="work-pin" id="work-pin">
          <article className="work-card reveal">
            <div className="work-thumb">
              <div className="work-thumb-bg t1"><div className="wm1"><div className="wm1-inner" /></div></div>
            </div>
            <div className="work-info">
              <div className="work-info-row">
                <h3>Nexus App</h3>
                <span className="work-year">2025</span>
              </div>
              <span className="work-cat">Web Design &amp; Development</span>
              <a href="#" className="work-link">View Project <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
            </div>
          </article>

          <article className="work-card reveal">
            <div className="work-thumb">
              <div className="work-thumb-bg t2"><div className="wm2" /></div>
            </div>
            <div className="work-info">
              <div className="work-info-row">
                <h3>Orbital Brand</h3>
                <span className="work-year">2024</span>
              </div>
              <span className="work-cat">Brand Identity</span>
              <a href="#" className="work-link">View Project <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
            </div>
          </article>

          <article className="work-card reveal">
            <div className="work-thumb">
              <div className="work-thumb-bg t3">
                <div className="wm3">
                  {[72, 48, 88, 35, 61].map((w, i) => (
                    <span key={i} style={{ '--w': `${w}%` } as React.CSSProperties} />
                  ))}
                </div>
              </div>
            </div>
            <div className="work-info">
              <div className="work-info-row">
                <h3>Flux Dashboard</h3>
                <span className="work-year">2025</span>
              </div>
              <span className="work-cat">UI/UX Design</span>
              <a href="#" className="work-link">View Project <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
            </div>
          </article>

          <article className="work-card reveal">
            <div className="work-thumb">
              <div className="work-thumb-bg t4"><div className="wm4" /></div>
            </div>
            <div className="work-info">
              <div className="work-info-row">
                <h3>Echo Campaign</h3>
                <span className="work-year">2026</span>
              </div>
              <span className="work-cat">Digital Campaign</span>
              <a href="#" className="work-link">View Project <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
            </div>
          </article>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="about-grid">
          <div className="about-text">
            <div className="sec-label reveal">About</div>
            <h2 className="sec-title reveal">We don&apos;t just design.<br />We engineer <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>perception</em>.</h2>
            <p className="reveal">VOID is a creative studio built for brands that refuse to blend in. We combine strategic thinking with obsessive craft to build digital experiences that feel inevitable — like they couldn&apos;t have existed any other way.</p>
            <p className="reveal">Our team spans design, engineering, and motion. We don&apos;t hand off — we collaborate across every pixel, every interaction, every frame. The result is work that&apos;s cohesive, intentional, and impossible to ignore.</p>
            <div className="about-stats reveal">
              <div>
                <div className="about-stat-num" data-count="47">0</div>
                <div className="about-stat-label">Projects</div>
              </div>
              <div>
                <div className="about-stat-num" data-count="12">0</div>
                <div className="about-stat-label">Awards</div>
              </div>
              <div>
                <div className="about-stat-num" data-count="8">0</div>
                <div className="about-stat-label">Countries</div>
              </div>
            </div>
          </div>
          <div className="about-visual reveal-right">
            <canvas id="about-canvas" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section" id="services">
        <div className="sec-label reveal">What We Do</div>
        <h2 className="sec-title reveal">Services built for<br />ambitious brands</h2>
        {[
          { num: '01', name: 'Brand Identity', desc: 'Logo design, brand guidelines, visual strategy, tone of voice, and everything your brand needs to be recognized and remembered.' },
          { num: '02', name: 'Web Design & Development', desc: 'Custom websites, landing pages, e-commerce, and web applications. Built with modern frameworks, optimized for speed and experience.' },
          { num: '03', name: 'Motion Design', desc: 'Animation, 3D visualization, video production, and micro-interactions that bring interfaces to life and make brands feel kinetic.' },
          { num: '04', name: 'UI/UX Design', desc: 'App design, dashboards, product design, and user experience strategy. Research-driven, detail-obsessed, always human-centered.' },
          { num: '05', name: 'Digital Strategy', desc: 'Campaign planning, social content strategy, performance marketing, and growth frameworks that actually move the needle.' },
        ].map((s) => (
          <div key={s.num} className="service-item reveal" role="button" tabIndex={0} aria-expanded="false">
            <span className="service-num">{s.num}</span>
            <span className="service-name">{s.name}</span>
            <span className="service-arrow" aria-hidden="true">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
            <div className="service-desc">{s.desc}</div>
          </div>
        ))}
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="manifesto-glow" aria-hidden="true" />
        <h2 className="manifesto-text reveal">Great design isn&apos;t seen.<br />It&apos;s <em>felt</em>.</h2>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contact">
        <h2 className="reveal">Let&apos;s create something<br />extraordinary</h2>
        <p className="reveal">We&apos;re selective about who we work with — and obsessive about the work itself.</p>
        <a href="#" className="cta-btn reveal" onClick={(e) => e.preventDefault()}>
          Start a Conversation
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </a>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">VOID<span>.</span></div>
        <div className="footer-right">
          <a href="#">Instagram</a>
          <a href="#">Behance</a>
          <a href="#">Twitter</a>
          <a href="mailto:hello@voidstudio.co">hello@voidstudio.co</a>
        </div>
      </footer>
      <div className="footer-built">© 2026 VOID Studio — Built with obsession.</div>
    </>
  );
}
