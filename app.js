/* EVision dashboard
   Upload an Excel (.xlsx/.xls) or CSV file. The app uses the first worksheet.
   All data is processed in your browser; the workbook is not sent to a server.
*/
const state = { rows: [], headers: [], charts: {}, fileName: "", filtered: [] };
const $ = (id) => document.getElementById(id);
const palette = ["#167a58","#48a982","#8ac9a8","#b7dfc8","#2c5f4b","#7ba68e","#b2c8ba","#d1a65b","#5b8db8","#c17b64"];
const aliases = {
  sales: ["annual sales units","sales units","total ev sales","ev sales","sales","units sold","annual sales"],
  price: ["average vehicle price","avg vehicle price","vehicle price","price","average price"],
  range: ["average vehicle range","avg vehicle range","driving range","range km","range","vehicle range"],
  co2: ["co2 saved","co2 saved in tonnes per year","co2 savings","co2 saved tonnes","carbon saved","emissions saved"],
  category: ["category","vehicle category","ev category","vehicle type"],
  country: ["country","market region","region","manufacturing country","manufacturer country"],
  manufacturer: ["manufacturer","brand","company","maker"],
  retained: ["retained value","avg retained value","average retained value","3 year retained value","retained value 3yr","resale value"],
  year: ["model year","year","sales year","calendar year"],
  battery: ["battery type","battery chemistry","battery technology"],
  capacity: ["avg battery capacity kwh","average battery capacity","battery capacity","capacity kwh"],
  cycle: ["avg battery cycle life","average battery cycle life","battery cycle life","cycle life"],
  efficiency: ["avg efficiency wh per km","efficiency wh per km","efficiency","energy efficiency"]
};
function norm(s){return String(s??"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
function findKey(keys, field){
  const normalized = keys.map(k=>[k,norm(k)]);
  for(const a of aliases[field]){const exact=normalized.find(x=>x[1]===norm(a));if(exact)return exact[0];}
  for(const a of aliases[field]){const hit=normalized.find(x=>x[1].includes(norm(a)));if(hit)return hit[0];}
  return null;
}
function num(v){if(typeof v==="number")return Number.isFinite(v)?v:null;if(v==null||v==="")return null;const n=Number(String(v).replace(/[,$₹€%\s]/g,""));return Number.isFinite(n)?n:null;}
function sum(arr){return arr.reduce((a,b)=>a+(num(b)||0),0);}
function avg(arr){const v=arr.map(num).filter(x=>x!==null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;}
function fmt(n, digits=0){if(n==null||!Number.isFinite(n))return "—";return Intl.NumberFormat("en-IN",{notation:Math.abs(n)>=1e7?"compact":"standard",maximumFractionDigits:digits}).format(n);}
function money(n){return n==null?"—":"$"+fmt(n);}
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800);}
function detect(){const keys=state.headers;state.fields={};for(const f in aliases)state.fields[f]=findKey(keys,f);}
function filteredRows(){const cat=$("categoryFilter").value,country=$("countryFilter").value;return state.rows.filter(r=>(cat==="all"||String(r[state.fields.category]??"")===cat)&&(country==="all"||String(r[state.fields.country]??"")===country));}
function group(rows, field, metric, mode="sum"){
  const f=state.fields[field],m=state.fields[metric];if(!f)return [];
  const buckets=new Map();
  rows.forEach(r=>{const label=String(r[f]??"Unknown");const value=m?num(r[m]):null;if(!buckets.has(label))buckets.set(label,[]);if(value!==null)buckets.get(label).push(value);});
  return [...buckets.entries()].map(([label,vals])=>({label,value:mode==="avg"?avg(vals):sum(vals)})).filter(x=>x.value!==null).sort((a,b)=>b.value-a.value);
}
function destroyCharts(){Object.values(state.charts).forEach(c=>c?.destroy());state.charts={};}
function makeChart(id,type,labels,data,label,opts={}){
  const canvas=$(id);if(!canvas)return;
  const wrap=canvas.parentElement;const has=labels.length>0;wrap.classList.toggle("empty",!has);
  if(!has)return;
  const config={type,data:{labels,datasets:[{label,data,backgroundColor:type==="line"?"rgba(22,122,88,.12)":data.map((_,i)=>palette[i%palette.length]),borderColor:type==="line"?"#167a58":data.map((_,i)=>palette[i%palette.length]),borderWidth:type==="line"?2:1,borderRadius:type==="bar"?5:0,fill:type==="line",tension:.35,pointRadius:type==="line"?3:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type!=="bar"&&type!=="line",position:"bottom",labels:{boxWidth:8,usePointStyle:true,font:{size:10},color:"#74847a"}},tooltip:{backgroundColor:"#153b2d",padding:10,titleFont:{size:11},bodyFont:{size:11}}},scales:type==="doughnut"?{}:{x:{grid:{display:false},ticks:{color:"#89978f",font:{size:10},maxRotation:35}},y:{beginAtZero:true,grid:{color:"#edf2ee"},ticks:{color:"#89978f",font:{size:10}}}}}};
  if(opts.horizontal){config.options.indexAxis="y";}
  if(type==="doughnut"){config.options.cutout="66%";}
  state.charts[id]=new Chart(canvas,config);
}
function updateKpis(rows){
  const f=state.fields, values=(field)=>f[field]?rows.map(r=>num(r[f[field]])).filter(v=>v!==null):[];
  const sales=sum(values("sales")),price=avg(values("price")),range=avg(values("range")),co2=sum(values("co2"));
  $("kpiSales").textContent=values("sales").length?fmt(sales):"—";
  $("kpiPrice").textContent=price==null?"—":money(price);
  $("kpiRange").textContent=range==null?"—":fmt(range,1)+" km";
  $("kpiCO2").textContent=values("co2").length?fmt(co2,1)+" t":"—";
  $("envCO2").textContent=values("co2").length?fmt(co2,1)+" t":"—";
  $("kpiBatteryTypes").textContent=f.battery?new Set(rows.map(r=>r[f.battery]).filter(Boolean)).size:"—";
  $("kpiCapacity").textContent=avg(values("capacity"))==null?"—":fmt(avg(values("capacity")),1)+" kWh";
  $("kpiCycle").textContent=avg(values("cycle"))==null?"—":fmt(avg(values("cycle")));
  $("kpiRegions").textContent=f.country?new Set(rows.map(r=>r[f.country]).filter(Boolean)).size:"—";
}
function updateCharts(rows){
  destroyCharts();const f=state.fields;
  const countries=group(rows,"country","sales").slice(0,12);makeChart("countryChart","bar",countries.map(x=>x.label),countries.map(x=>x.value),"Sales units",{horizontal:true});
  const cats=group(rows,"category","sales");makeChart("categoryChart","doughnut",cats.map(x=>x.label),cats.map(x=>x.value),"Sales units");
  const ranges=group(rows,"category","range","avg").slice(0,12);makeChart("rangeChart","bar",ranges.map(x=>x.label),ranges.map(x=>x.value),"Average range",{horizontal:true});
  const retained=group(rows,"category","retained","avg").slice(0,12);makeChart("retainedChart","bar",retained.map(x=>x.label),retained.map(x=>x.value),"Retained value",{horizontal:true});
  const years=group(rows,"year","sales").sort((a,b)=>String(a.label).localeCompare(String(b.label),undefined,{numeric:true}));makeChart("trendChart","line",years.map(x=>x.label),years.map(x=>x.value),"Sales units");
  const batteries=group(rows,"battery","sales");makeChart("batteryChart","bar",batteries.map(x=>x.label),batteries.map(x=>x.value),"Sales units");
  const co2=group(rows,"country","co2").slice(0,12);makeChart("co2Chart","bar",co2.map(x=>x.label),co2.map(x=>x.value),"CO₂ saved",{horizontal:true});
}
function updateTable(rows){
  const head=$("tableHead"),body=$("tableBody");head.innerHTML="";body.innerHTML="";
  const tr=document.createElement("tr");state.headers.forEach(h=>{const th=document.createElement("th");th.textContent=h;tr.appendChild(th);});head.appendChild(tr);
  const q=$("tableSearch").value.toLowerCase();const shown=rows.filter(r=>!q||state.headers.some(h=>String(r[h]??"").toLowerCase().includes(q))).slice(0,150);
  shown.forEach(r=>{const row=document.createElement("tr");state.headers.forEach(h=>{const td=document.createElement("td");td.textContent=r[h]??"";row.appendChild(td);});body.appendChild(row);});
  if(!shown.length){const row=document.createElement("tr");const td=document.createElement("td");td.colSpan=state.headers.length||1;td.className="table-empty";td.textContent="No matching rows.";row.appendChild(td);body.appendChild(row);}
  $("rowCount").textContent=`${rows.length.toLocaleString("en-IN")} rows loaded`; 
}
function fillFilters(){
  const f=state.fields;
  [["categoryFilter",f.category],["countryFilter",f.country]].forEach(([id,key])=>{
    const el=$(id);el.innerHTML='<option value="all">All '+(id==="categoryFilter"?"categories":"countries / regions")+'</option>';
    if(key){[...new Set(state.rows.map(r=>String(r[key]??"")).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;el.appendChild(o);});}
    el.disabled=!key;
  });
}
function refresh(){
  if(!state.rows.length)return;
  const rows=filteredRows();state.filtered=rows;updateKpis(rows);updateCharts(rows);updateTable(rows);
}
async function loadFile(file){
  if(!file)return;
  try{
    const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:"array",cellDates:true});const sheet=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(sheet,{defval:"",raw:false});
    if(!rows.length)throw new Error("The first worksheet is empty.");
    state.rows=rows;state.headers=Object.keys(rows[0]);state.fileName=file.name;detect();fillFilters();
    $("uploadNotice").style.display="none";$("dataStatus").textContent=file.name;$("sheetName").textContent=`${file.name} · Worksheet: ${wb.SheetNames[0]}`;
    $("dataStatus").title=`${rows.length} rows loaded`;
    refresh();
    showToast(`Loaded ${rows.length.toLocaleString("en-IN")} rows successfully.`);
    const missing=["sales","category","country","range","co2","battery"].filter(k=>!state.fields[k]);
    if(missing.length)showToast("Loaded file. Some charts need matching column names.");
  }catch(err){showToast(err.message||"Could not read this file.");}
}
$("excelFile").addEventListener("change",e=>loadFile(e.target.files[0]));
$("categoryFilter").addEventListener("change",refresh);$("countryFilter").addEventListener("change",refresh);
$("resetFilters").addEventListener("click",()=>{$("categoryFilter").value="all";$("countryFilter").value="all";refresh();});
$("tableSearch").addEventListener("input",()=>updateTable(state.filtered));
document.querySelectorAll(".nav-link").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x===btn));
  document.querySelectorAll(".view-panel").forEach(x=>x.classList.toggle("active",x.id===btn.dataset.view));
  const names={overview:"Market overview",technology:"Battery & efficiency",environment:"Environment",data:"Dataset"};
  $("crumb").textContent=names[btn.dataset.view];$("pageTitle").innerHTML=btn.dataset.view==="overview"?'EV Market Performance <span>& Insights</span>':names[btn.dataset.view];
  $("pageSubtitle").textContent=btn.dataset.view==="overview"?"A clear view of sales, vehicle performance and the changing electric mobility landscape.":"Explore the electric vehicle dataset through interactive charts and indicators.";
  if(state.rows.length)Object.values(state.charts).forEach(c=>c.resize());
}));
