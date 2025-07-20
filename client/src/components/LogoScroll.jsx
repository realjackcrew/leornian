import React from 'react';
import { useLocation } from 'react-router-dom';

const logos = [
  { 
    name: "Google", 
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
  },
  { 
    name: "Palantir", 
    src: "https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg",
    whiteSrc: "https://companieslogo.com/img/orig/PLTR_BIG.D-38de5db6.png?t=1720244493"
  },
  { 
    name: "Coinbase", 
    src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg"
  },
  { 
    name: "Cursor", 
    src: "https://upload.wikimedia.org/wikipedia/en/9/9c/Cursor_%28code_editor%29.png",
    whiteSrc: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/cursor.png"
  },
  { 
    name: "SpaceX", 
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/SpaceX_logo_black.svg",
    whiteSrc: "https://cdn.freebiesupply.com/logos/large/2x/spacex-logo-black-and-white.png"
  },
  { 
    name: "Perplexity", 
    src: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg",
    whiteSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRILd_ishBQH4jU2uilXTkVEh6HRzF5NYIlLw&s"
  },
  { 
    name: "Stripe", 
    src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
  },
  { 
    name: "Bloomberg", 
    src: "https://upload.wikimedia.org/wikipedia/commons/5/56/Bloomberg_logo.svg",
    whiteSrc: "https://blackbridgesports.com/wp-content/uploads/2023/02/bloomberg-logo-white.png"
  },
  { 
    name: "Apple", 
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    whiteSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQesa2rF2WhrA7Sl3iIoznL-gFpA0y0GB-tQ&s"
  },
  { 
    name: "Y Combinator", 
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg"
  },
  { 
    name: "Microsoft", 
    src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
  },
  { 
    name: "Formula One", 
    src: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
  },
  { 
    name: "Anduril", 
    src: "https://upload.wikimedia.org/wikipedia/en/a/a6/Anduril_Industries_logo.svg",
    whiteSrc: "https://companieslogo.com/img/orig/anduril.D-7867213f.png?t=1720244494"
  },
  { 
    name: "Scale AI", 
    src: "https://upload.wikimedia.org/wikipedia/commons/7/74/Scale_AI.svg",
    whiteSrc: "https://companieslogo.com/img/orig/scale-ai_BIG.D-b5963dd9.png?t=1720244494"
  },
  { 
    name: "Meta", 
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    whiteSrc: "https://companieslogo.com/img/orig/META_BIG.D-db66a9c7.png?t=1720244492"
  },
  { 
    name: "Blue Origin", 
    src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Blue_Origin_new_logo.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Blue_Origin_new_logo.svg"
  },
  { 
    name: "Dropbox", 
    src: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg"
  },
  { 
    name: "Binance", 
    src: "https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg"
  },
  { 
    name: "Uber", 
    src: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    whiteSrc: "https://companieslogo.com/img/orig/UBER.D-f23d4b1c.png?t=1720244494"
  },
  { 
    name: "Duolingo", 
    src: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Duolingo_logo_%282019%29.svg",
    whiteSrc: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Duolingo_logo_%282019%29.svg"
  },
  { 
    name: "OpenAI", 
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    whiteSrc: "https://ai.ls/assets/openai-logos/PNGs/openai-white-lockup.png"
  },
];

export default function LogoMarquee() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className={`py-16 overflow-hidden ${isHomePage ? 'bg-black' : 'bg-white dark:bg-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-2xl font-semibold text-center mb-12 ${isHomePage ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
          Companies I think are cool
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {logos.map(({ name, src, whiteSrc }) => (
              <img
                key={name}
                src={isHomePage ? whiteSrc : src}
                alt={name}
                className="h-8 inline-block opacity-50 hover:opacity-100 transition-opacity mx-4"
              />
            ))}
            {logos.map(({ name, src, whiteSrc }) => (
              <img
                key={`${name}-dup`}
                src={isHomePage ? whiteSrc : src}
                alt={name}
                className="h-8 inline-block opacity-50 hover:opacity-100 transition-opacity mx-4"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}