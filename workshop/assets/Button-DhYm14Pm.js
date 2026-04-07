import{j as m}from"./vendor-react-DgeyD02N.js";import{c as r}from"./index-BfG-Uzvc.js";const p={primary:{className:"font-medium",style:{backgroundColor:r.primary,color:r.bg}},secondary:{className:"hover:text-white",style:{backgroundColor:r.surface,color:r.textSecondary,border:`1px solid ${r.border}`}},ghost:{className:"hover:text-white",style:{color:r.textMuted,backgroundColor:"transparent"}},danger:{className:"",style:{backgroundColor:"rgba(239, 68, 68, 0.1)",color:r.error,border:"1px solid rgba(239, 68, 68, 0.2)"}}},d={sm:"px-3 py-1.5 min-h-[44px] text-xs rounded-lg gap-1.5",md:"px-4 py-2 min-h-[44px] text-sm rounded-lg gap-2",lg:"px-6 py-3 text-base rounded-xl gap-2"};function u({variant:t="primary",size:s="md",icon:a,children:l,className:n="",disabled:o,style:c,...i}){const e=p[t];return m.jsxs("button",{className:`
        inline-flex items-center justify-center transition-colors
        ${e.className}
        ${d[s]}
        ${o?"opacity-50 cursor-not-allowed":"cursor-pointer"}
        ${n}
      `.trim(),style:{...e.style,...c},disabled:o,...i,children:[a,l]})}export{u as B};
