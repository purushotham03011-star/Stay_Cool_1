import React, { useState } from 'react';
import { Search, Sparkles, Mail, Phone, Share2, X, ArrowRight, Layers, MapPin, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import campfireImg from '../assets/campfire.jpg';
import hotelStayImg from '../assets/hotel_stay.jpg';
import pgLivingImg from '../assets/pg_living.jpg';
import { getLocalStorageData, setLocalStorageData } from '../mockData';
import { QueryMessage } from '../types';

import videoA1 from '../../video/A1.mp4';
import videoA2 from '../../video/A2.mp4';
import videoA3 from '../../video/A3.mp4';
import videoA4 from '../../video/A4.mp4';

interface MemoryVideoProps {
  src: string;
  isActive: boolean;
  onEnded: () => void;
}

function MemoryVideo({ src, isActive, onEnded }: MemoryVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked or video error:", err);
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      onEnded={onEnded}
      muted
      playsInline
      className="w-full h-full object-cover"
      style={{ display: 'block' }}
    />
  );
}

const MEMORIES = [
  {
    id: 'mem-1',
    videoSrc: videoA1,
    quote: "The high-speed WiFi and cozy community dinners made my remote work month in Lisbon absolutely unforgettable. Met amazing friends!",
    author: "Sarah M."
  },
  {
    id: 'mem-2',
    videoSrc: videoA2,
    quote: "Living here felt like home from day one. Seamless check-ins, clean rooms, and the social vibe is exactly what I needed when relocating.",
    author: "David K."
  },
  {
    id: 'mem-3',
    videoSrc: videoA3,
    quote: "Hostel stays are usually basic, but this place is designer level. Super clean, premium amenities, and a wonderful co-living community.",
    author: "Elena & Alex"
  },
  {
    id: 'mem-4',
    videoSrc: videoA4,
    quote: "A perfect blend of work and travel. Met inspiring professionals, enjoyed quiet focus zones, and relaxed at community firepits.",
    author: "Liam H."
  }
];

interface LandingPromoProps {
  onSelectPortal: (portal: 'customer' | 'admin' | 'superadmin', initialView?: 'login' | 'register' | null) => void;
  onSearchSubmit?: (query: string) => void;
  onResetStorage: () => void;
  customerPortalImg: string;
  adminPortalImg: string;
  superAdminImg: string;
}

export default function LandingPromo({
  onSelectPortal,
  onSearchSubmit,
  onResetStorage,
  customerPortalImg,
  adminPortalImg,
  superAdminImg
}: LandingPromoProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<{ title: string; message: string } | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.landing-promo-canvas-scoped .scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`);
    }).catch(() => {
      showToast(`Failed to copy ${label}.`);
    });
  };

  const openProjectAlert = (projectName: string) => {
    setActiveAlert({
      title: projectName,
      message: `Redirecting you to the premium project showcases and creative assets for ${projectName}...`
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameEl = form.querySelector('input[placeholder="Enter your name"]') as HTMLInputElement;
    const emailEl = form.querySelector('input[placeholder="Enter your email"]') as HTMLInputElement;
    const msgEl = form.querySelector('textarea') as HTMLTextAreaElement;

    const name = nameEl?.value || '';
    const email = emailEl?.value || '';
    const message = msgEl?.value || '';

    const newQuery: QueryMessage = {
      id: `query-${Date.now()}`,
      type: 'customer',
      senderName: name,
      senderEmail: email,
      message: message,
      timestamp: new Date().toISOString(),
      status: 'unread',
      replies: []
    };

    const currentQueries = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);
    setLocalStorageData('stayhub_queries', [...currentQueries, newQuery]);

    showToast('Thanks for reaching out! Super Admin will review your query shortly.');
    form.reset();
  };

  return (
    <div className="landing-promo-canvas-scoped w-full text-left font-sans animate-fade-in relative">
      
      {/* SECTION 1: HEADER & FLOATING BANNER (Pink Background) */}
      <header className="header-section" id="headerSection">
        <div className="background-blob-1"></div>
        <div className="background-blob-2"></div>
        
        <div className="header-inner">
          {/* FLOATING GRADIENT BANNER CARD */}
          <div className="now-open-banner scroll-reveal" id="nowOpenBanner">
            <div className="banner-overlay-halftone"></div>
            
            {/* Bubbly 3D Sticker Badge on the Left */}
            <div 
              className="brand-logo-badge-sticker cursor-pointer scroll-reveal" 
              style={{ '--reveal-delay': '150ms' } as React.CSSProperties}
              id="logoBadge"
              onClick={() => showToast('Welcome to Here to Stay — custom handcrafted Ionic experience!')}
            >
              <div className="sticker-halftone"></div>
              <div className="sticker-text-wrapper">
                <span className="sticker-line-1">Here</span>
                <span className="sticker-line-2">to</span>
                <span className="sticker-line-3">Stay</span>
              </div>
            </div>

            <div className="banner-content">
              {/* Glowing Calligraphy Script Title */}
              <h1 className="font-cursive now-open-title scroll-reveal" style={{ '--reveal-delay': '250ms' } as React.CSSProperties}>Now Open!</h1>
            </div>

            {/* Search Bar Container overlapping bottom border */}
            <form 
              className="search-container scroll-reveal"
              style={{ '--reveal-delay': '350ms' } as React.CSSProperties}
              onSubmit={(e) => {
                e.preventDefault();
                if (searchVal.trim()) {
                  onSearchSubmit?.(searchVal);
                }
              }}
            >
              <Search className="search-icon-left w-5 h-5 text-[#2b1814]/70" />
              <input 
                id="destinationSearch" 
                placeholder="Search your dream relocation stay or next adventure..." 
                className="custom-search-input"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (e.target.value.trim().length > 1) {
                    console.log(`Live Filter Stay matching: ${e.target.value}`);
                  }
                }}
              />
            </form>
          </div>

          {/* BOTTOM ROW: Heart Arrow on Left, Three Hanging Cards on Right */}
          <div className="header-bottom-row">
            {/* Wrapper to stack arrow and parrot button vertically */}
            <div className="hero-arrow-btn-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', zIndex: 30 }}>
              {/* Playful black arrow with a heart-shaped loop on the Left */}
              <div className="heart-arrow-container scroll-reveal" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
                <svg viewBox="0 0 100 100" className="heart-arrow-svg">
                  <path d="M 65,15 C 35,10 15,30 15,55 C 15,80 40,90 50,75 C 60,60 40,45 35,55 C 30,65 45,75 60,85 L 75,95" fill="none" stroke="#2b1814" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M 63,95 L 75,95 L 73,83" fill="none" stroke="#2b1814" strokeWidth="5.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Custom Hover Book Button */}
              <div className="btn-wrapper scroll-reveal" style={{ '--reveal-delay': '300ms' } as React.CSSProperties}>
                <button 
                  className="btn"
                  onClick={() => {
                    onSelectPortal('customer');
                  }}
                >
                  <span className="frame">
                    <span className="point top left"></span>
                    <span className="point top right"></span>
                    <span className="point bottom left"></span>
                    <span className="point bottom right"></span>
                  </span>
                  <span className="txt-box">
                    <span className="txt">Book Now</span>
                    <span className="txt">Click to Book</span>
                  </span>
                </button>
                <div className="txt-secondary" id="hint1">Hover to reveal</div>
                <div className="txt-secondary" id="hint2">Click to book</div>
              </div>
            </div>

            <div className="hanging-cards-grid">
              {/* Card 1: 3D Blue Map Pin */}
              <div className="hanging-card scroll-reveal" id="card1" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
                <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&h=800&q=80" alt="3D Neon Blue Map with Red Pins" referrerPolicy="no-referrer" />
                <div className="card-caption">3D Smart Location maps</div>
              </div>

              {/* Card 2: Phone Route Pin */}
              <div className="hanging-card scroll-reveal" id="card2" style={{ '--reveal-delay': '150ms' } as React.CSSProperties}>
                <img src="https://images.unsplash.com/photo-1619597455322-4fbbd820250a?auto=format&fit=crop&w=600&h=800&q=80" alt="Smartphone Route with Location Pin" referrerPolicy="no-referrer" />
                <div className="card-caption">Relocation Navigation</div>
              </div>

              {/* Card 3: Friends Outdoor Dining */}
              <div className="hanging-card scroll-reveal" id="card3" style={{ '--reveal-delay': '300ms' } as React.CSSProperties}>
                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&h=800&q=80" alt="Friends gathering around an outdoor dining table" referrerPolicy="no-referrer" />
                <div className="card-caption">Premium Social Spaces</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: CHOOSE A BETTER STAY (Lime Green Background) */}
      <section className="hero-green-section" id="heroGreenSection">
        <div className="section-container grid-two-cols">
          
          {/* Left Column: Large Outlined Titles & Campfire Image Card */}
          <div className="hero-left-column">
            <div className="outlined-hero-titles scroll-reveal">
              <h2 className="font-display text-outline-white">Choose a</h2>
              <h2 className="font-display text-outline-white">Better Stay.</h2>
            </div>

            {/* Campfire Image Card with integrated outlined visual text overlay */}
            <div className="campfire-card scroll-reveal" id="campfireCard" style={{ '--reveal-delay': '150ms' } as React.CSSProperties}>
              <img src={campfireImg} alt="Cosy outdoor bonfire night" referrerPolicy="no-referrer" />
              <div className="campfire-card-overlay"></div>
              <div className="campfire-overlaid-text">
                <h3 className="font-display text-outline-white">Enjoy</h3>
                <h3 className="font-display text-outline-pink">Affordable</h3>
                <h3 className="font-display text-outline-white">Trips</h3>
              </div>
            </div>
          </div>

          {/* Right Column: Subtitle Description & Call-to-Action badge */}
          <div className="hero-right-column">
            <div className="hero-text-wrapper scroll-reveal" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
              <p className="hero-subtitle">Planning your next adventure or relocating to a new city?</p>
              <p className="hero-body-text">We handpick and custom-craft each location to bring you designer spaces, local character, and high-speed workspaces combined with flexible booking structures. Your absolute comfort is our passion.</p>
              
              {/* Exploratory Button Badge */}
              <button 
                className="explore-badge-btn w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold cursor-pointer" 
                id="exploreBadgeBtn"
                onClick={() => showToast('Preparing stay lists... 50+ beautiful locations loading!')}
              >
                <span>Explore 50+ Live stays</span>
                <Sparkles className="w-4 h-4 text-[#bcd83f]" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: WINS I'M PROUD OF (Soft Pink Background) */}
      <section className="wins-section" id="winsSection">
        <div className="section-container">
          <h2 className="font-display wins-section-title scroll-reveal">Choose Your Perfect Stay</h2>

          <div className="grid-three-cols">
            {/* Win Card 1: Daily Stays */}
            <div className="win-card scroll-reveal" id="winCard1">
              <div className="win-card-image-box">
                <img src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&h=450&q=80" alt="Modern hotel room for nightly stays" referrerPolicy="no-referrer" />
              </div>
              <div className="win-card-content">
                <h3>Daily Stays</h3>
                <p>Spontaneous plans? Choose a better way to travel with our affordable nightly hotel rates for all your short weekend trips.</p>
                <button className="view-project-btn cursor-pointer font-bold" onClick={() => onSelectPortal('customer')}>Go to Customer Sign In</button>
              </div>
            </div>

            {/* Win Card 2: Weekly Stays */}
            <div className="win-card scroll-reveal" id="winCard2" style={{ '--reveal-delay': '150ms' } as React.CSSProperties}>
              <div className="win-card-image-box">
                <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&h=450&q=80" alt="Executive suite for weekly stays" referrerPolicy="no-referrer" />
              </div>
              <div className="win-card-content">
                <h3>Weekly Stays</h3>
                <p>On an extended business trip? Get better discounts and comfortable amenities when you choose our weekly accommodation plans.</p>
                <button className="view-project-btn cursor-pointer font-bold" onClick={() => onSelectPortal('customer')}>Go to Customer Sign In</button>
              </div>
            </div>

            {/* Win Card 3: Monthly Stays */}
            <div className="win-card scroll-reveal" id="winCard3" style={{ '--reveal-delay': '300ms' } as React.CSSProperties}>
              <div className="win-card-image-box">
                <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=450&q=80" alt="Cozy co-living room for monthly stays" referrerPolicy="no-referrer" />
              </div>
              <div className="win-card-content">
                <h3>Monthly Stays</h3>
                <p>Settling down for a while? Lock in an affordable PG stay with transparent monthly billing and seamless digital rent management.</p>
                <button className="view-project-btn cursor-pointer font-bold" onClick={() => onSelectPortal('customer')}>Go to Customer Sign In</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS (Dark Ribbon & Split Side-by-Side Panels) */}
      <section className="testimonials-section" id="testimonialsSection">
        
        {/* Heading Ribbon banner */}
        <div className="testimonials-ribbon scroll-reveal">
          <h2 className="font-display ribbon-text">Stay Options</h2>
        </div>

        {/* Split Two-Column stay packages */}
        <div className="testimonials-split-grid">
          
          {/* Left panel (White background) — Hotel Accommodations */}
          <div className="testimonial-panel panel-white scroll-reveal" id="panelHotels">
            <div className="testimonial-image-box">
              <img src={hotelStayImg} alt="Happy travelers couple in hotel room" />
            </div>
            <div className="testimonial-quote">
              <h3 className="font-display text-2xl font-black text-[#2b1814] uppercase tracking-tight mb-1">Hotel Accommodations</h3>
              <p className="text-xs font-bold text-[#ff4081] uppercase tracking-wider mb-3">Perfect for your short trips.</p>
              <p className="text-sm leading-relaxed text-slate-600 font-medium">Whenever your spontaneous plans call for a quick getaway, choose our modern hotel rooms for a better, hassle-free stay. Enjoy seamless digital check-ins, unmatched comfort, and affordable daily rates designed entirely around your schedule.</p>
            </div>
          </div>

          {/* Right panel (Green background) — PG Living Spaces */}
          <div className="testimonial-panel panel-green scroll-reveal" id="panelPGs" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
            <div className="testimonial-image-box">
              <img src={pgLivingImg} alt="Happy roommates sharing a PG space" />
            </div>
            <div className="testimonial-quote">
              <h3 className="font-display text-2xl font-black text-[#2b1814] uppercase tracking-tight mb-1">PG Living Spaces</h3>
              <p className="text-xs font-bold text-[#2b1814]/75 uppercase tracking-wider mb-3">Ideal for your long-term plans.</p>
              <p className="text-sm leading-relaxed text-[#2b1814]/90 font-medium">Relocating for work or studies? Choose our fully managed PG properties for an affordable, comfortable living experience. Enjoy smart rent tracking, high-speed WiFi, and better, stress-free stays month after month.</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4.5: CUSTOMERS SHARED MEMORIES (Sunset Coral Background with Inclined Dividers) */}
      <section className="memories-section scroll-reveal" id="memoriesSection">
        <div className="section-container">
          <h2 className="font-display memories-section-title scroll-reveal">Customers Shared Memories</h2>

          <div className="memories-carousel-wrapper">
            <div className="memories-carousel">
              {MEMORIES.map((item, i) => {
                const posIndex = (i - activeIdx + 4) % 4;
                let posClass = 'pos-hidden';
                if (posIndex === 0) posClass = 'pos-middle';
                else if (posIndex === 1) posClass = 'pos-right';
                else if (posIndex === 3) posClass = 'pos-left';

                const isActive = posIndex === 0;

                return (
                  <div 
                    key={item.id}
                    className={`memory-card memory-card-carousel-item ${posClass}`}
                  >
                    <div className="memory-card-image-box">
                      <MemoryVideo 
                        src={item.videoSrc}
                        isActive={isActive}
                        onEnded={() => {
                          setActiveIdx((prev) => (prev + 1) % 4);
                        }}
                      />
                    </div>
                    <div className="memory-card-content">
                      <p className="memory-quote">"{item.quote}"</p>
                      <h4 className="memory-author">- {item.author}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="wins-section portals-switcher-section">
        <div className="section-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }} className="scroll-reveal">
            <span style={{ display: 'inline-flex', alignSelf: 'center', gap: '6px', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold', color: '#ff4081', backgroundColor: 'rgba(255, 64, 129, 0.1)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              StayHub Multi-Tenant Operating System
            </span>
            <h2 className="font-display wins-section-title" style={{ margin: '8px 0 0 0', color: 'var(--dark-brown)' }}>System Portals</h2>
            <p style={{ fontSize: '12px', color: 'var(--dark-brown)', opacity: 0.8, maxWidth: '550px', margin: '0 auto', lineHeight: '1.6' }}>
              A high-fidelity co-living ecosystem demonstrating premium reservation loops, physical bed mapping, invoice collections, and multi-rental cross-corporate tenant controls.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid-three-cols" style={{ width: '100%', gap: '24px' }}>
            {/* Card 1: Customer Portal */}
            <div 
              onClick={() => onSelectPortal('customer')}
              className="win-card cursor-pointer transform hover:-translate-y-1 transition duration-300 scroll-reveal"
              style={{ border: '3px solid var(--dark-brown)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '32px' }}
            >
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={customerPortalImg} alt="Customer Portal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '16px', color: 'var(--dark-brown)', margin: 0, textTransform: 'none' }}>Stay cool Customer portal</h3>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '2px solid rgba(43, 24, 20, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--dark-brown)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Client Experience</span>
                <span style={{ color: '#ff4081', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Admin Portal */}
            <div 
              onClick={() => onSelectPortal('admin')}
              className="win-card cursor-pointer transform hover:-translate-y-1 transition duration-300 scroll-reveal"
              style={{ border: '3px solid var(--dark-brown)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '32px', '--reveal-delay': '150ms' } as React.CSSProperties}
            >
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={adminPortalImg} alt="Admin Portal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '16px', color: 'var(--dark-brown)', margin: 0, textTransform: 'none' }}>Stay cool Admin Portal</h3>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '2px solid rgba(43, 24, 20, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--dark-brown)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Operator Console</span>
                <span style={{ color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Enter Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Super Admin Portal */}
            <div 
              onClick={() => onSelectPortal('superadmin')}
              className="win-card cursor-pointer transform hover:-translate-y-1 transition duration-300 scroll-reveal"
              style={{ border: '3px solid var(--dark-brown)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '32px', '--reveal-delay': '300ms' } as React.CSSProperties}
            >
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={superAdminImg} alt="Super Admin Portal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '16px', color: 'var(--dark-brown)', margin: 0, textTransform: 'none' }}>Stay cool Super Admin</h3>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '2px solid rgba(43, 24, 20, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--dark-brown)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Corporate Suite</span>
                <span style={{ color: '#ff4081', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Enter Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Seed storage row */}
          <div style={{ borderTop: '2px solid rgba(43, 24, 20, 0.1)', paddingTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }} className="scroll-reveal">
            <button 
              onClick={onResetStorage}
              className="explore-badge-btn"
              style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '3px solid var(--dark-brown)', color: 'var(--dark-brown)', background: 'white', padding: '10px 24px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
            >
              <Sparkles className="w-4 h-4 text-[#ff4081]" />
              <span>Seed original database presets</span>
            </button>
            <p style={{ fontSize: '11px', color: 'var(--dark-brown)', opacity: 0.6, fontWeight: 'bold', margin: 0 }}>
              Secure frontend storage active. StayHub uses Local Storage variables to mimic database records instantly.
            </p>
          </div>
        </div>
      </section>

      <footer className="connect-section" id="connectSection">
        <div className="connect-stars-container"></div>
        <div className="section-container grid-two-cols">
          
          {/* Left side: Connections & green details box */}
          <div className="connect-left-column">
            <div className="connect-headings scroll-reveal">
              <h2 className="font-display connect-title">Let's</h2>
              <h2 className="font-display connect-title">Connect</h2>
            </div>
            <p className="connect-subtitle scroll-reveal" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>Tell me what you're planing up—I'd love to reach to you answering them.</p>

            {/* Green Contact card */}
            <div className="contact-details-box scroll-reveal" id="contactDetailsBox" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
              {/* Row 1: Email */}
              <div className="contact-row cursor-pointer" onClick={() => handleCopy('hello@reallygreatsite.com', 'Email')}>
                <div className="contact-row-info flex items-center gap-2">
                  <Mail className="contact-icon w-4 h-4" />
                  <span><strong>Email:</strong> hello@reallygreatsite.com</span>
                </div>
                <span className="copy-pill-button">Copy</span>
              </div>

              {/* Row 2: Phone */}
              <div className="contact-row cursor-pointer" onClick={() => handleCopy('123-456-7890', 'Phone Number')}>
                <div className="contact-row-info flex items-center gap-2">
                  <Phone className="contact-icon w-4 h-4" />
                  <span><strong>Phone:</strong> 123-456-7890</span>
                </div>
                <span className="copy-pill-button">Copy</span>
              </div>

              {/* Row 3: Socials */}
              <div className="contact-row cursor-pointer" onClick={() => handleCopy('@reallygreatsite', 'Social Handle')}>
                <div className="contact-row-info flex items-center gap-2">
                  <Share2 className="contact-icon w-4 h-4" />
                  <span><strong>Socials:</strong> @reallygreatsite</span>
                </div>
                <span className="copy-pill-button">Copy</span>
              </div>
            </div>
          </div>

          {/* Right side: Drop me a line Mock form */}
          <div className="connect-right-column scroll-reveal" style={{ '--reveal-delay': '200ms' } as React.CSSProperties}>
            <div className="form-wrapper">
              <h3 className="font-display form-header">Drop me a line</h3>
              
              <form id="contactForm" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input required type="text" placeholder="Enter your name" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input required type="email" placeholder="Enter your email" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea required rows={4} placeholder="Describe your Stay or Relocation ideas..." className="form-textarea"></textarea>
                </div>
                <button type="submit" className="submit-button cursor-pointer" id="formSubmitBtn">Send Message</button>
              </form>
            </div>
          </div>

        </div>
      </footer>

      {/* Footer replaced completely with the Quote card */}
      <div className="landing-promo-card-footer-wrapper">
        <div className="new-stayhub-footer-card">
          {/* SVG Quote Icon in corner */}
          <div className="footer-quote-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 330 307" height="90" width="90">
              <path fill="currentColor" d="M302.258 176.221C320.678 176.221 329.889 185.432 329.889 203.853V278.764C329.889 297.185 320.678 306.395 302.258 306.395H231.031C212.61 306.395 203.399 297.185 203.399 278.764V203.853C203.399 160.871 207.902 123.415 216.908 91.4858C226.323 59.1472 244.539 30.902 271.556 6.75027C280.562 -1.02739 288.135 -2.05076 294.275 3.68014L321.906 29.4692C328.047 35.2001 326.614 42.1591 317.608 50.3461C303.69 62.6266 292.228 80.4334 283.223 103.766C274.626 126.69 270.328 150.842 270.328 176.221H302.258ZM99.629 176.221C118.05 176.221 127.26 185.432 127.26 203.853V278.764C127.26 297.185 118.05 306.395 99.629 306.395H28.402C9.98126 306.395 0.770874 297.185 0.770874 278.764V203.853C0.770874 160.871 5.27373 123.415 14.2794 91.4858C23.6945 59.1472 41.9106 30.902 68.9277 6.75027C77.9335 -1.02739 85.5064 -2.05076 91.6467 3.68014L119.278 29.4692C125.418 35.2001 123.985 42.1591 114.98 50.3461C101.062 62.6266 89.6 80.4334 80.5942 103.766C71.9979 126.69 67.6997 150.842 67.6997 176.221H99.629Z"></path>
            </svg>
          </div>

          <p className="footer-brand-title">STAYHUB CO.</p>

          <div className="footer-content-grid">
            {/* Col 1: Overview */}
            <div className="footer-col">
              <h4 className="footer-col-header">Overview</h4>
              <p className="footer-col-description">
                StayHub is a next-generation PG and Hotel management platform engineered to deliver unified billing, smart room reservations, seamless visitor registration, and automated housekeeping systems for corporate franchise co-lives and hotels.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-header">Quick Links</h4>
              <div className="footer-links-list">
                <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Services</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Rooms</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
              </div>
            </div>

            {/* Col 3: Contact Info */}
            <div className="footer-col">
              <h4 className="footer-col-header">Contact Info</h4>
              <div className="footer-info-list">
                <div className="footer-info-item">
                  <MapPin className="w-3.5 h-3.5 mr-2 inline text-slate-800" />
                  <span>Plot 42, HSR Layout, Bengaluru, India</span>
                </div>
                <div className="footer-info-item">
                  <Phone className="w-3.5 h-3.5 mr-2 inline text-slate-800" />
                  <span>+91 80 4321 0000</span>
                </div>
                <div className="footer-info-item">
                  <Mail className="w-3.5 h-3.5 mr-2 inline text-slate-800" />
                  <span>corp@stayhub.co</span>
                </div>
              </div>
              
              {/* White circle social icons */}
              <div className="footer-social-circles">
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Twitter clicked"); }} className="social-circle">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Instagram clicked"); }} className="social-circle">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Facebook clicked"); }} className="social-circle">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("LinkedIn clicked"); }} className="social-circle">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-divider-line"></div>

          <p className="footer-copyright-text">
            © {new Date().getFullYear()} StayHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* REACT TOAST NOTIFICATION PORTAL */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#2b1814] text-[#fffbf0] text-xs font-bold py-3 px-6 rounded-full shadow-2xl z-50 animate-bounce select-none border border-[#fffbf0]/20">
          {toastMsg}
        </div>
      )}

      {/* REACT ALERT DIALOG PORTAL */}
      {activeAlert && (
        <div className="fixed inset-0 bg-[#2b1814]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fffbf0] text-[#2b1814] max-w-sm w-full rounded-3xl p-6 shadow-2xl border-4 border-[#2b1814] space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-lg uppercase tracking-wide">{activeAlert.title}</h3>
              <button onClick={() => setActiveAlert(null)} className="p-1 rounded-lg hover:bg-[#2b1814]/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs leading-relaxed font-sans">{activeAlert.message}</p>
            <div className="text-right">
              <button 
                onClick={() => setActiveAlert(null)}
                className="bg-[#2b1814] hover:bg-[#2b1814]/80 text-[#fffbf0] font-bold text-xs py-2 px-6 rounded-full transition cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
