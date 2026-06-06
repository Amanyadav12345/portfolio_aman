import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Nav.css';

const links = ['Home', 'About', 'Skills', 'Projects', 'Contact'];

const THEME_META = {
  'dark':          { icon: '◐', label: 'Dark'     },
  'light':         { icon: '○', label: 'Light'    },
  'high-contrast': { icon: '●', label: 'Contrast' },
};

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState('Home');
  const { theme, cycleTheme }   = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase());
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
  };

  const meta = THEME_META[theme];

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__logo" onClick={() => scrollTo('Home')}>
        <span className="nav__bracket">&lt;</span>
        AY
        <span className="nav__bracket">/&gt;</span>
      </div>

      <ul className="nav__links">
        {links.map((l) => (
          <li key={l}>
            <button
              className={`nav__link ${active === l ? 'nav__link--active' : ''}`}
              onClick={() => scrollTo(l)}
            >
              {l}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="nav__theme-btn"
        onClick={cycleTheme}
        title={`Switch theme (current: ${theme})`}
      >
        <span className="nav__theme-icon">{meta.icon}</span>
        <span className="nav__theme-label">{meta.label}</span>
      </button>
    </nav>
  );
}
