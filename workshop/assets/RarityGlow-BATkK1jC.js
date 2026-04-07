import{o as a}from"./index-C7nj57eV.js";let t=!1;function n(){if(t||typeof document>"u")return;t=!0;const r=document.createElement("style");r.textContent=`
    @keyframes rarity-pulse-epic {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes rarity-shimmer-legendary {
      0% { box-shadow: -2px 0 8px rgba(255, 128, 0, 0.3), 0 0 4px rgba(255, 128, 0, 0.1); }
      50% { box-shadow: -2px 0 12px rgba(255, 128, 0, 0.5), 0 0 8px rgba(255, 128, 0, 0.2); }
      100% { box-shadow: -2px 0 8px rgba(255, 128, 0, 0.3), 0 0 4px rgba(255, 128, 0, 0.1); }
    }
  `,document.head.appendChild(r)}function p(r){const o=r||"common";if(o==="common")return{};n();const e=a(o);switch(o){case"uncommon":return{borderLeftWidth:"3px",borderLeftColor:e.hex,boxShadow:`inset 3px 0 8px ${e.glowColor}`};case"rare":return{borderLeftWidth:"3px",borderLeftColor:e.hex,boxShadow:`-2px 0 10px ${e.glowColor}, 0 0 4px ${e.glowColor}`};case"epic":return{borderLeftWidth:"3px",borderLeftColor:e.hex,boxShadow:`-2px 0 10px ${e.glowColor}, 0 0 6px ${e.glowColor}`,animation:"rarity-pulse-epic 2.5s ease-in-out infinite"};case"legendary":return{borderLeftWidth:"3px",borderLeftColor:e.hex,animation:"rarity-shimmer-legendary 2s ease-in-out infinite"};default:return{}}}export{p as g};
