
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaEnvelope, FaPhoneAlt, FaChevronDown, FaShieldAlt, FaAward, FaCertificate, FaUsers,FaBook, FaPenFancy, FaChalkboardTeacher, FaRobot, FaLaptopCode, FaTimes, FaPaperPlane } from "react-icons/fa";
import QoohiLogo from "./assets/qoohiLogo.jpeg";
import akakaLogo from "./assets/qoohiLogo.jpeg";
// Import images
import bg1 from './background/pexels-enginakyurt-1435752.jpg';
import bg2 from './background/pexels-francesco-ungaro-673648.jpg';
import bg3 from './background/pexels-pixabay-268533.jpg';
import bg4 from './background/pexels-pixabay-356056.jpg';
import bg6 from './background/pexels-pixabay-531880.jpg';
import bg7 from './background/pexels-veeterzy-303383.jpg';
import person1 from './person/9a559475-98c6-4ef6-9e43-06846db609bf.png';
import fc26Img from './games/fc26.jpeg';
import codImg from './games/cod.jpeg';
import gtaImg from './games/gta.jpeg';
import websiteImg from './Tech/WEBSITE & SOFTWARE.webp';
import aiTechImg from './Tech/AI TECH.webp';

const backgrounds = [bg1, bg2, bg3, bg4, bg6, bg7];

export default function QooHi() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatPhoneNumber, setChatPhoneNumber] = useState('');
  const [chatPhoneError, setChatPhoneError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const toggleMenu = () => setIsOpen(!isOpen);

  const phoneNumber = "+254 712 451604";
  const whatsappNumberRaw = "+254 712 451604";
  const whatsappDigits = whatsappNumberRaw.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent("QOOHI HELLO");
  const whatsappWebLink = `https://wa.me/${whatsappDigits}?text=${whatsappMessage}`;
  const whatsappAppCall = `whatsapp://call?number=${whatsappDigits}`;
  const emailAddress = "";

  const handleWhatsappCall = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      window.location.href = whatsappAppCall;
      setTimeout(() => window.open(whatsappWebLink, "_blank"), 700);
    } catch (err) {
      window.open(whatsappWebLink, "_blank");
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const cleanedNumber = chatPhoneNumber.replace(/\D/g, '');
    if (!cleanedNumber || cleanedNumber.length < 10) {
      setChatPhoneError('Please enter a valid phone number');
      return;
    }
    setChatPhoneError('');
    setChatMessages([{ sender: 'system', text: `Connected with QOOHI`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setShowChatModal(false);
    setChatPhoneNumber('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: currentMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    
    // Send message to WhatsApp by opening the wa.me link
    const whatsappLink = `https://wa.me/254712451604?text=${encodeURIComponent(currentMessage)}`;
    window.open(whatsappLink, '_blank');
    
    setCurrentMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'qoohi', text: 'Message sent to +254 712 451604. Check your WhatsApp!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  const navItems = [
    { id: "home", label: "HOME" },
    { id: "about", label: "ABOUT" },
    { id: "tech", label: "TECH" },
    { id: "game", label: "GAMES" },
    { id: "contact", label: "CONTACT US" },
    { id: "chat", label: "QOOHI CHATS" },
    { id: "new", label: "NEW ON QOOHI" },
    { id: "learn", label: "LEARN" },
  ];

  const [activeSection, setActiveSection] = useState('home');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isAndroid, setIsAndroid] = useState(false);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
    pickRandomBorderColor();
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const randomBg = useMemo(() => {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  const borderColors = ['#FBBF24', '#60A5FA', '#34D399', '#F472B6', '#A78BFA', '#F59E0B', '#FCD34D'];
  const [borderColor, setBorderColor] = useState(borderColors[Math.floor(Math.random() * borderColors.length)]);

  const pickRandomBorderColor = () => {
    const available = borderColors.filter((c) => c !== borderColor);
    const next = available[Math.floor(Math.random() * available.length)];
    setBorderColor(next);
  };

  const lastBorderChangeRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const now = Date.now();
      if (now - lastBorderChangeRef.current > 800) {
        pickRandomBorderColor();
        lastBorderChangeRef.current = now;
      }
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [borderColor]);

  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const games = [
    { name: "FC 26", image: fc26Img, desc: "Professional Football Simulation" },
    { name: "COD", image: codImg, desc: "Action-Packed Combat" },
    { name: "GTA", image: gtaImg, desc: "Open World Adventure" }
  ];

  // Animated welcome component (cycles through different visual modes)
  const AnimatedWelcome = () => {
    const modes = ['gradient', 'circle', 'marquee', 'stack'];
    const [modeIdx, setModeIdx] = useState(0);
    const [colorIdx, setColorIdx] = useState(0);
    const colors = ['#ff3b3b', '#ff8a00', '#ffd500', '#3bff4a', '#00d4ff', '#7a4bff', '#ff3bd6'];

    useEffect(() => {
      const m = setInterval(() => setModeIdx(i => (i + 1) % modes.length), 3500);
      return () => clearInterval(m);
    }, []);

    useEffect(() => {
      const c = setInterval(() => setColorIdx(i => (i + 1) % colors.length), 1000);
      return () => clearInterval(c);
    }, []);

    const mode = modes[modeIdx];
    const label = 'Welcome to QOOHI';

    if (mode === 'circle') {
      const letters = label.split('');
      const radius = 70;
      return (
        <div className="mx-auto" style={{ width: 160, height: 160, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {letters.map((ch, i) => {
              const angle = (360 / letters.length) * i;
              const transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;
              return (
                <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform, transformOrigin: '0 0', fontWeight: 900, color: colors[(colorIdx + i) % colors.length], fontSize: 14 }}>
                  {ch}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (mode === 'marquee') {
      return (
        <div className="overflow-hidden w-full">
          <motion.div animate={{ x: ['0%', '-40%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="whitespace-nowrap text-4xl md:text-6xl font-black" style={{ color: colors[colorIdx] }}>
            {label} — {label} — {label}
          </motion.div>
        </div>
      );
    }

    if (mode === 'stack') {
      return (
        <div>
          {label.split(' ').map((w, wi) => (
            <div key={wi} className="text-4xl md:text-6xl font-black" style={{ color: colors[(colorIdx + wi) % colors.length] }}>{w}</div>
          ))}
        </div>
      );
    }

    // default: gradient
    const c1 = colors[colorIdx];
    const c2 = colors[(colorIdx + 2) % colors.length];
    return (
      <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-2xl" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
        {label}
      </h1>
    );
  };

  return (
    <div
      className="font-sans text-gray-800 scroll-smooth relative min-h-screen"
      style={{
        backgroundImage: `url(${randomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0 min-h-screen"></div>
      <div className="relative z-10 w-full">
        {/* Header */}
        <header
          className="fixed inset-x-0 top-0 bg-black z-50 shadow-2xl border-b border-gray-800 backdrop-blur-md"
          style={isAndroid ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${fc26Img}), url(${codImg}), url(${gtaImg})`, backgroundSize: '140px 50px, 140px 50px, 140px 50px', backgroundRepeat: 'repeat-x', backgroundPosition: 'left center, center center, right center' } : {}}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => scrollTo("home")}>
              <img src={QoohiLogo} alt="QOOHI logo" className="h-11 w-11 object-cover rounded-full border-2 border-white/20 group-hover:border-blue-400 transition-all duration-300 shadow-lg" />
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">QOOHI</span>
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="relative px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium text-sm tracking-wide group rounded-lg hover:bg-white/10 backdrop-blur-sm">
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-6 transition-all duration-300 rounded-full"></span>
                </button>
              ))}
            </nav>

            <div className="lg:hidden">
              <button className="text-white text-2xl focus:outline-none hover:text-blue-400 transition-colors duration-300" onClick={toggleMenu} aria-label="Toggle Menu">
                {isOpen ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="lg:hidden bg-black/95 border-t border-gray-800 px-6 py-4 space-y-3 shadow-2xl backdrop-blur-md">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="block w-full text-left py-3 text-white/90 hover:text-blue-400 font-medium transition-colors duration-300 border-b border-gray-800 last:border-0">
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Chat Modal */}
        <AnimatePresence>
          {showChatModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-blue-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">QOOHI Chats</h3>
                  <button onClick={() => { setShowChatModal(false); setChatPhoneError(''); setChatPhoneNumber(''); }} className="text-gray-400 hover:text-white transition-colors">
                    <FaTimes size={24} />
                  </button>
                </div>
                <p className="text-gray-300 mb-6">Enter your WhatsApp number to connect:</p>
                <form onSubmit={handleChatSubmit} className="space-y-4">
                  <div>
                    <input
                      type="tel"
                      placeholder="+254 712 451604"
                      value={chatPhoneNumber}
                      onChange={(e) => setChatPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {chatPhoneError && <p className="text-red-400 text-sm mt-2">{chatPhoneError}</p>}
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2">
                    <FaPaperPlane /> Start Chat
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOME - Simplified */}
        <section id="home" className={`relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden ${activeSection !== 'home' ? 'hidden' : ''}`}>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
            <div className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-16">
              <AnimatedWelcome />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col md:flex-row gap-6 justify-center">
              <a href={`mailto:${emailAddress}`} className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1">
                <FaEnvelope className="text-xl group-hover:scale-110 transition-transform" /> Email Us
              </a>
              <button onClick={() => setShowChatModal(true)} className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-center gap-3 hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1">
                <FaWhatsapp className="text-xl group-hover:scale-110 transition-transform" /> Chat on WhatsApp
              </button>
            </motion.div>
          </div>
        </section>

        {/* ABOUT - Full Page Image */}
        <section id="about" className={`relative min-h-screen flex items-center justify-center py-20 pb-32 ${activeSection !== 'about' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-xl" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>QOOHI</h2>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full md:w-3/4 mx-auto rounded-3xl p-6 md:p-12 bg-gradient-to-br from-white/5 to-gray-900/60 border-4 shadow-2xl" style={{ borderColor: borderColor }}>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="order-1 md:order-1">
                  <img src={codImg} alt="COD" className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg" />
                </div>

                <div className="order-2 text-center md:text-left">
                  <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">We create modern digital experiences</h3>
                  <p className="text-white text-lg md:text-xl max-w-2xl mx-auto md:mx-0 mb-6">QOOHI creates modern websites, reliable software and practical AI solutions focused on growth and measurable results.</p>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h4 className="font-bold text-white mb-2">Design</h4>
                      <p className="text-gray-300 text-sm">Pixel perfect interfaces and UX that convert.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h4 className="font-bold text-white mb-2">AI & Software</h4>
                      <p className="text-gray-300 text-sm">ML models, automation and custom systems.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h4 className="font-bold text-white mb-2">Gaming</h4>
                      <p className="text-gray-300 text-sm">Curated experiences and community first features.</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button onClick={() => scrollTo('contact')} className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-bold py-3 px-6 rounded-full">Get in touch</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-gray-900 text-white py-6">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-3 mb-4 md:mb-0 group">
                  <img src={akakaLogo} alt="Logo" className="h-8 w-8 object-cover rounded-full border-2 border-blue-200" />
                  <span className="text-lg font-bold">QOOHI</span>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setShowChatModal(true)} className="text-gray-400 hover:text-green-400 transition-colors"><FaWhatsapp /></button>
                  <a href={`mailto:${emailAddress}`} className="text-gray-400 hover:text-blue-400 transition-colors"><FaEnvelope /></a>
                </div>
              </div>
            </div>
          </footer>
        </section>

        {/* TECH Section */}
        <section id="tech" className={`relative py-20 pb-32 ${activeSection !== 'tech' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-xl">QOOHI TECH</h2>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-2">
              {[
                { title: "WEBSITE & SOFTWARE", image: websiteImg, points: ["Website Creation", "Software Installation", "System Building"] },
                { title: "AI TECH", image: aiTechImg, points: ["ML Models", "AI Integrations", "AI Solutions"] }
              ].map((service, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="group overflow-hidden rounded-3xl border border-white/20 backdrop-blur-sm hover:border-blue-400 transition-all duration-300">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  </div>
                  <div className="p-8 bg-gradient-to-b from-white/5 to-gray-900/50 backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">{service.title}</h3>
                    <ul className="space-y-3">
                      {service.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-200">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <footer className="bg-gradient-to-b from-transparent to-gray-900 text-white py-6 mt-20">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>

        {/* GAME Section - Enhanced with Images */}
        <section id="game" className={`relative py-20 pb-32 ${activeSection !== 'game' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-xl mb-4">QOOHI GAMES</h2>
              <p className="text-gray-300 text-lg">Experience the best gaming collection</p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {games.map((game, idx) => (
                <motion.div 
                  key={game.name} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.4, delay: idx * 0.1 }} 
                  className="group overflow-hidden rounded-2xl border border-white/20 backdrop-blur-sm hover:border-blue-400 transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <div className="p-6 bg-white/10 backdrop-blur-md">
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{game.name}</h3>
                    <p className="text-gray-300 text-sm">{game.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <footer className="bg-gradient-to-b from-transparent to-gray-900 text-white py-6 mt-20">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>

        {/* CONTACT Section - Small Icons Bottom */}
        <section id="contact" className={`relative min-h-screen flex flex-col justify-between pb-32 ${activeSection !== 'contact' ? 'hidden' : ''}`}>
          <div className="flex-1"></div>
          
          <div className="container mx-auto px-4 max-w-5xl w-full">
            <div className="flex justify-center gap-6 mb-20">
              {/* Email Contact */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6, delay: 0.1 }} 
              >
                <a href={`mailto:${emailAddress}`} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full hover:scale-110 transition-transform duration-300 border border-blue-400/50 shadow-lg hover:shadow-blue-500/30">
                  <FaEnvelope className="text-white text-lg" />
                </a>
              </motion.div>

              {/* WhatsApp Call */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6, delay: 0.2 }} 
              >
                <button onClick={handleWhatsappCall} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-full hover:scale-110 transition-transform duration-300 border border-green-400/50 shadow-lg hover:shadow-green-500/30">
                  <FaWhatsapp className="text-white text-lg" />
                </button>
              </motion.div>

              {/* Chat */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6, delay: 0.3 }} 
              >
                <button onClick={() => setShowChatModal(true)} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full hover:scale-110 transition-transform duration-300 border border-purple-400/50 shadow-lg hover:shadow-purple-500/30">
                  <FaPaperPlane className="text-white text-lg" />
                </button>
              </motion.div>
            </div>
          </div>

          <footer className="bg-gradient-to-b from-transparent to-gray-900 text-white py-6">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>

        {/* QOOHI CHATS Section */}
        <section id="chat" className={`relative min-h-screen flex items-center justify-center py-20 pb-32 ${activeSection !== 'chat' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 max-w-2xl">
            {chatMessages.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaWhatsapp className="text-white text-5xl" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">QOOHI Chat</h3>
                  <p className="text-gray-300 mb-8">Enter your number to start messaging</p>
                </div>

                <form onSubmit={handleChatSubmit} className="space-y-6">
                  <div>
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={chatPhoneNumber}
                      onChange={(e) => {
                        setChatPhoneNumber(e.target.value);
                        setChatPhoneError('');
                      }}
                      className="w-full px-6 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-lg"
                    />
                    {chatPhoneError && <p className="text-red-400 text-sm mt-2">{chatPhoneError}</p>}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1"
                  >
                    <FaPaperPlane /> Start Chat
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">QOOHI Support</h3>
                      <p className="text-sm text-green-100">+254 712 451604</p>
                    </div>
                    <button onClick={() => { setChatMessages([]); setCurrentMessage(''); }} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="border-t border-white/20 bg-gray-900/50 p-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-sm"
                  />
                  <button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          <footer className="bg-gradient-to-b from-transparent to-gray-900 text-white py-6 mt-20">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>

        {/* NEW ON QOOHI */}
        <section id="new" className={`relative py-20 pb-32 ${activeSection !== 'new' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-xl">NEW ON QOOHI</h2>
            </motion.div>
            
            <div className="space-y-3">
              {[{ q: "What's new?", a: "Check back soon for updates!" }].map((item, idx) => (
                <div key={idx} className="border border-gray-400/30 rounded-xl bg-white/10 backdrop-blur-sm">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/15 transition-colors" onClick={() => toggleFaq(idx)}>
                    <span className="font-bold text-white">{item.q}</span>
                    <FaChevronDown className={`text-blue-300 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-6 pb-4 text-white">
                      {item.a}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer className="bg-gradient-to-b from-transparent to-gray-900 text-white py-6 mt-20">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>

        {/* LEARN Section */}
        <section id="learn" className={`relative py-20 min-h-screen flex items-center justify-center pb-32 ${activeSection !== 'learn' ? 'hidden' : ''}`}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-xl">Learn with QOOHI</h2>
              <p className="text-gray-200 text-xl">Explore our learning resources and grow with QOOHI.</p>
            </motion.div>
          </div>

          <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-gray-900 text-white py-6">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <p className="text-gray-400 text-sm">© 2026 QOOHI. All rights reserved.</p>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
