import React from 'react';

const logos = [
  { name: "Google", src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Palantir", src: "https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg" },
  { name: "Coinbase", src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg" },
  { name: "Cursor", src: "https://upload.wikimedia.org/wikipedia/en/9/9c/Cursor_%28code_editor%29.png" },
  { name: "SpaceX", src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/SpaceX_logo_black.svg" },
  { name: "Perplexity", src: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg" },
  { name: "Stripe", src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
  { name: "Bloomberg", src: "https://upload.wikimedia.org/wikipedia/commons/5/56/Bloomberg_logo.svg" },
  { name: "Apple", src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Lotus Infra", src: "https://www.lotusinfrastructure.com/content/uploads/2024/05/Lotus_Infrastructure_logo1.png" },
  { name: "Y Combinator", src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg" },
  { name: "Microsoft", src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Nvidia", src: "https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg" },
  { name: "Formula One", src: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" },
  { name: "Anduril", src: "https://upload.wikimedia.org/wikipedia/en/a/a6/Anduril_Industries_logo.svg" },
  { name: "Scale AI", src: "https://upload.wikimedia.org/wikipedia/commons/7/74/Scale_AI.svg" },
  { name: "Meta", src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Blue Origin", src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Blue_Origin_new_logo.svg" },
  { name: "Pershing Square Capital Management", src: "https://upload.wikimedia.org/wikipedia/en/4/40/Pershing_Square_Holdings_Logo.svg" },
  { name: "Dropbox", src: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" },
  { name: "Binance", src: "https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg" },
  { name: "Jane Street", src: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Jane_Street_Capital_Logo.svg" },
  { name: "Uber", src: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
  { name: "Duolingo", src: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Duolingo_logo_%282019%29.svg" },
  { name: "OpenAI", src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
];

export default function LogoMarquee() {
  return (
    <div className="bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-12">
          Companies I think are cool
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {logos.map(({ name, src }) => (
              <img
                key={name}
                src={src}
                alt={name}
                className="h-8 inline-block opacity-50 hover:opacity-100 transition-opacity mx-4"
              />
            ))}
            {logos.map(({ name, src }) => (
              <img
                key={`${name}-dup`}
                src={src}
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