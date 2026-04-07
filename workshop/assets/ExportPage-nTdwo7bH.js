import{r as m,j as e}from"./vendor-react-DgeyD02N.js";import{B as p}from"./Button-BUn8-zfD.js";import{C as x}from"./Card-Bk8lQd6d.js";import{I as f}from"./Input-BxB3ZGiA.js";import{u as O}from"./usePageTitle-s-fm6qh5.js";import{Y as S,F as E,ao as D,u as M,v as F}from"./vendor-icons-CYr8Tc6O.js";import"./index-Bhuv-DPy.js";import"./vendor-supabase-BZ0N5lZN.js";const R={id:"json",name:"JSON",mimeType:"application/json",extension:"json",description:"JavaScript Object Notation - structured data format",serializer:(t,r)=>r?.pretty?JSON.stringify(t,null,2):JSON.stringify(t)},$={id:"csv",name:"CSV",mimeType:"text/csv",extension:"csv",description:"Comma-Separated Values - tabular data format",serializer:(t,r)=>{if(!Array.isArray(t)||t.length===0)return"";const n=Object.keys(t[0]),a=[n.join(",")];return t.forEach(c=>{const h=n.map(d=>{const l=c[d];return typeof l=="string"&&(l.includes(",")||l.includes('"'))?`"${l.replace(/"/g,'""')}"`:l??""});a.push(h.join(","))}),a.join(`
`)}},A={id:"markdown",name:"Markdown",mimeType:"text/markdown",extension:"md",description:"Markdown - human-readable text format",serializer:(t,r)=>typeof t=="string"?t:Array.isArray(t)?t.map((n,a)=>`${a+1}. ${JSON.stringify(n)}`).join(`

`):"```json\n"+JSON.stringify(t,null,2)+"\n```"},P={id:"html",name:"HTML",mimeType:"text/html",extension:"html",description:"HyperText Markup Language - web page format",serializer:(t,r)=>{const n=r?.filename||"Export",a=typeof t=="string"?t:`<pre>${JSON.stringify(t,null,2)}</pre>`;return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${y(n)}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
      line-height: 1.6;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
${a}
</body>
</html>`}},z={id:"pdf-html",name:"PDF-Ready HTML",mimeType:"text/html",extension:"html",description:"HTML optimized for PDF conversion (print styles)",serializer:(t,r)=>{const n=r?.filename||"Export",a=typeof t=="string"?t:`<pre>${JSON.stringify(t,null,2)}</pre>`;return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${y(n)}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      max-width: 100%;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 1em;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      margin-top: 1.5em;
      page-break-after: avoid;
    }
    pre, code {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      background: #f5f5f5;
      padding: 0.5em;
      page-break-inside: avoid;
    }
    @media print {
      body {
        background: white;
      }
    }
  </style>
</head>
<body>
${a}
</body>
</html>`}},g={json:R,csv:$,markdown:A,html:P,"pdf-html":z};function y(t){const r={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};return t.replace(/[&<>"']/g,n=>r[n])}function Y(){O("Export");const[t,r]=m.useState("scope"),[n,a]=m.useState({dimensions:[],includeThreads:!0,includeContributions:!0,includeGraph:!1}),[c,h]=m.useState("json"),[d,l]=m.useState(""),v=["human","language","artifact","methodology","training"];function N(s){a(i=>({...i,dimensions:i.dimensions.includes(s)?i.dimensions.filter(o=>o!==s):[...i.dimensions,s]}))}function w(){const s={convergence:n.convergence||"Techne",dateRange:{start:n.dateStart||"2026-02-13",end:n.dateEnd||"2026-02-16"},dimensions:n.dimensions,includeThreads:n.includeThreads,includeContributions:n.includeContributions,totalItems:42},o=g[c].serializer(s,{pretty:!0});o instanceof Promise?o.then(l):l(o)}function k(){t==="scope"?r("format"):t==="format"?(w(),r("preview")):t==="preview"&&(r("download"),b())}function T(){t==="format"?r("scope"):t==="preview"?r("format"):t==="download"&&r("preview")}function b(){const s=g[c],i=`commons-export-${Date.now()}.${s.extension}`,o=new Blob([d],{type:s.mimeType}),j=URL.createObjectURL(o),u=document.createElement("a");u.href=j,u.download=i,u.click(),URL.revokeObjectURL(j)}function C(){return t==="scope"?n.includeThreads||n.includeContributions||n.includeGraph:!0}return e.jsxs("div",{className:"max-w-4xl mx-auto p-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold mb-2",children:"Export Data"}),e.jsx("p",{className:"text-gray-400",children:"Export your convergence data in multiple formats"})]}),e.jsx("div",{className:"flex items-center justify-between mb-8",children:["scope","format","preview","download"].map((s,i,o)=>e.jsxs("div",{className:"flex items-center flex-1",children:[e.jsx("div",{className:`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${t===s?"border-co-primary bg-co-primary text-black":o.indexOf(t)>i?"border-co-primary text-co-primary":"border-gray-600 text-gray-600"}`,children:i+1}),i<o.length-1&&e.jsx("div",{className:`flex-1 h-0.5 mx-2 transition-colors ${o.indexOf(t)>i?"bg-co-primary":"bg-gray-600"}`})]},s))}),t==="scope"&&e.jsxs(x,{className:"p-6",children:[e.jsxs("h2",{className:"text-xl font-bold mb-4 flex items-center gap-2",children:[e.jsx(S,{className:"w-5 h-5"}),"Select Data Scope"]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Convergence"}),e.jsx(f,{value:n.convergence||"",onChange:s=>a({...n,convergence:s.target.value}),placeholder:"Techne"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Start Date"}),e.jsx(f,{type:"date",value:n.dateStart||"",onChange:s=>a({...n,dateStart:s.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"End Date"}),e.jsx(f,{type:"date",value:n.dateEnd||"",onChange:s=>a({...n,dateEnd:s.target.value})})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Dimensions"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:v.map(s=>e.jsx("button",{onClick:()=>N(s),className:`px-4 py-2 rounded transition-colors ${n.dimensions.includes(s)?"bg-co-primary text-black":"bg-co-surface text-gray-400 hover:bg-co-border"}`,children:s},s))}),e.jsx("p",{className:"text-xs text-gray-500 mt-2",children:n.dimensions.length===0?"All dimensions":`${n.dimensions.length} selected`})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Include"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"checkbox",checked:n.includeContributions,onChange:s=>a({...n,includeContributions:s.target.checked})}),e.jsx("span",{children:"Contributions"})]}),e.jsxs("label",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"checkbox",checked:n.includeThreads,onChange:s=>a({...n,includeThreads:s.target.checked})}),e.jsx("span",{children:"Threads"})]}),e.jsxs("label",{className:"flex items-center gap-2",children:[e.jsx("input",{type:"checkbox",checked:n.includeGraph,onChange:s=>a({...n,includeGraph:s.target.checked})}),e.jsx("span",{children:"Knowledge Graph"})]})]})]})]})]}),t==="format"&&e.jsxs(x,{className:"p-6",children:[e.jsxs("h2",{className:"text-xl font-bold mb-4 flex items-center gap-2",children:[e.jsx(E,{className:"w-5 h-5"}),"Choose Export Format"]}),e.jsx("div",{className:"grid gap-3",children:Object.values(g).map(s=>e.jsxs("label",{className:`flex items-start gap-3 p-4 rounded border transition-colors cursor-pointer ${c===s.id?"border-co-primary bg-co-primary/10":"border-co-border hover:border-co-border"}`,children:[e.jsx("input",{type:"radio",name:"format",value:s.id,checked:c===s.id,onChange:()=>h(s.id),className:"mt-1"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"font-medium",children:s.name}),e.jsx("div",{className:"text-sm text-gray-500 mt-1",children:s.description}),e.jsxs("div",{className:"text-xs text-gray-600 mt-1",children:["Extension: .",s.extension," • MIME: ",s.mimeType]})]})]},s.id))})]}),t==="preview"&&e.jsxs(x,{className:"p-6",children:[e.jsx("h2",{className:"text-xl font-bold mb-4",children:"Preview"}),e.jsxs("div",{className:"bg-co-bg border border-co-border rounded p-4 overflow-x-auto",children:[e.jsx("pre",{className:"text-sm text-gray-300",children:d.slice(0,1e3)}),d.length>1e3&&e.jsxs("p",{className:"text-xs text-gray-500 mt-2",children:["... (",d.length-1e3," more characters)"]})]})]}),t==="download"&&e.jsxs(x,{className:"p-6 text-center",children:[e.jsx(D,{className:"w-16 h-16 mx-auto mb-4 text-co-primary"}),e.jsx("h2",{className:"text-xl font-bold mb-2",children:"Export Complete!"}),e.jsx("p",{className:"text-gray-400 mb-6",children:"Your export has been downloaded"}),e.jsxs("div",{className:"flex justify-center gap-4",children:[e.jsx(p,{onClick:()=>r("scope"),children:"Export Again"}),e.jsx(p,{variant:"secondary",onClick:b,children:"Download Again"})]})]}),t!=="download"&&e.jsxs("div",{className:"flex justify-between mt-6",children:[e.jsxs(p,{variant:"secondary",onClick:T,disabled:t==="scope",children:[e.jsx(M,{className:"w-4 h-4 mr-1"}),"Back"]}),e.jsxs(p,{onClick:k,disabled:!C(),children:[t==="preview"?"Download":"Next",e.jsx(F,{className:"w-4 h-4 ml-1"})]})]})]})}export{Y as default};
