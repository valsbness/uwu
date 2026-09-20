const PIN="1234"; // Cambia este PIN antes de publicar la herramienta.
const MAX=100;
const KEY="uwuPagoSemanalV1";
const $=id=>document.getElementById(id);
const money=n=>"$"+Math.round(Number(n)||0).toLocaleString("en-US");
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{workers:[],week:getWeek()};
let unlocked=false,currentId=null,pinAction=null;

function getWeek(){
  const d=new Date(), day=d.getDay(), diff=(day===0?-6:1-day);
  const start=new Date(d);start.setDate(d.getDate()+diff);
  const end=new Date(start);end.setDate(start.getDate()+6);
  const f=x=>x.toLocaleDateString("es-PA",{day:"2-digit",month:"2-digit",year:"numeric"});
  return `${f(start)} — ${f(end)}`;
}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function totals(w){
  const f=w.invoices.reduce((a,x)=>a+(Number(x)||0),0);
  const t=w.tips.reduce((a,x)=>a+(Number(x)||0),0);
  return {f,t,forty:f*.4,pay:f*.4+t};
}
function openPin(action){
  pinAction=action;$("pinInput").value="";$("pinError").textContent="";
  $("pinModal").classList.remove("hidden");setTimeout(()=>$("pinInput").focus(),50);
}
function closePin(){ $("pinModal").classList.add("hidden");pinAction=null }
function requireUnlocked(fn){if(unlocked){fn()}else openPin(fn)}
function unlock(){
  if($("pinInput").value===PIN){unlocked=true;closePin();toast("🔓 Acceso de jefatura activado");if(pinAction)pinAction()}
  else {$("pinError").textContent="PIN incorrecto.";$("pinInput").select()}
}
function render(){
  $("weekLabel").textContent=data.week;
  const root=$("workerList");root.innerHTML="";
  if(!data.workers.length){root.innerHTML='<div class="empty">🐾<br><strong>No hay carpetas todavía.</strong><br>Agrega un trabajador para comenzar el pago semanal.</div>'}
  data.workers.forEach(w=>{
    const z=totals(w),el=document.createElement("article");el.className="worker";
    el.innerHTML=`<div class="worker-top"><h3>📁 ${esc(w.name)}</h3><button class="delete">🗑 Eliminar</button></div>
      <div class="worker-stats"><div><span>FACTURAS</span><b>${money(z.f)}</b></div><div><span>40% A PAGAR</span><b>${money(z.forty)}</b></div><div class="pay"><span>TOTAL A PAGAR</span><b>${money(z.pay)}</b></div></div>`;
    el.onclick=()=>requireUnlocked(()=>openDetail(w.id));
    el.querySelector(".delete").onclick=e=>{e.stopPropagation();requireUnlocked(()=>{if(confirm(`¿Eliminar la carpeta de ${w.name}?`)){data.workers=data.workers.filter(x=>x.id!==w.id);save();render();toast("Carpeta eliminada")}})};
    root.appendChild(el);
  });
  let f=0,t=0;data.workers.forEach(w=>{const z=totals(w);f+=z.f;t+=z.t});
  $("allInvoices").textContent=money(f);$("allForty").textContent=money(f*.4);$("allTips").textContent=money(t);$("allPay").textContent=money(f*.4+t);
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openDetail(id){
  currentId=id;const w=data.workers.find(x=>x.id===id);if(!w)return;
  $("detailName").textContent=w.name;$("detailModal").classList.remove("hidden");renderDetail();
}
function closeDetail(){currentId=null;$("detailModal").classList.add("hidden")}
function renderDetail(){
  const w=data.workers.find(x=>x.id===currentId);if(!w)return;
  const z=totals(w);$("detailInvoices").textContent=money(z.f);$("detailForty").textContent=money(z.forty);$("detailTips").textContent=money(z.t);$("detailPay").textContent=money(z.pay);
  $("invoiceCount").textContent=`${w.invoices.length} / ${MAX}`;$("tipCount").textContent=`${w.tips.length} / ${MAX}`;
  $("invoiceList").innerHTML=w.invoices.map((v,i)=>entryHtml("invoice",i,v)).join("")||'<div class="empty">No hay facturas registradas.</div>';
  $("tipList").innerHTML=w.tips.map((v,i)=>entryHtml("tip",i,v)).join("")||'<div class="empty">No hay propinas registradas.</div>';
  $("invoiceTotal").textContent=money(z.f);$("tipTotal").textContent=money(z.t);
  document.querySelectorAll(".entry input").forEach(inp=>inp.onchange=()=>changeEntry(inp.dataset.type,+inp.dataset.i,inp.value));
  document.querySelectorAll(".entry button").forEach(btn=>btn.onclick=()=>removeEntry(btn.dataset.type,+btn.dataset.i));
}
function entryHtml(type,i,v){return `<div class="entry"><span>#${i+1}</span><input type="number" min="0" step="1" data-type="${type}" data-i="${i}" value="${Number(v)||0}"><button data-type="${type}" data-i="${i}" title="Eliminar">×</button></div>`}
function changeEntry(type,i,v){
  const w=data.workers.find(x=>x.id===currentId),arr=type==="invoice"?w.invoices:w.tips;arr[i]=Math.max(0,Number(v)||0);save();render();renderDetail()
}
function removeEntry(type,i){
  const w=data.workers.find(x=>x.id===currentId),arr=type==="invoice"?w.invoices:w.tips;
  arr.splice(i,1);save();render();renderDetail();toast("Registro eliminado")
}
function addEntry(type){
  const w=data.workers.find(x=>x.id===currentId),arr=type==="invoice"?w.invoices:w.tips;
  if(arr.length>=MAX){toast(`Máximo de ${MAX} registros alcanzado`);return}
  arr.push(0);save();render();renderDetail();toast(type==="invoice"?"Factura agregada":"Propina agregada")
}
$("addWorker").onclick=()=>requireUnlocked(()=>{
  const n=$("workerName").value.trim();if(!n){toast("Escribe el nombre del trabajador");return}
  data.workers.push({id:crypto.randomUUID(),name:n,invoices:[],tips:[]});$("workerName").value="";save();render();toast("📁 Carpeta creada")
});
$("addInvoice").onclick=()=>addEntry("invoice");
$("addTip").onclick=()=>addEntry("tip");
$("detailClose").onclick=closeDetail;
$("lockBtn").onclick=()=>{unlocked=false;closeDetail();toast("🔒 Área bloqueada")};
$("resetWeek").onclick=()=>requireUnlocked(()=>{
  if(confirm("¿Cerrar la semana y borrar todas las facturas y propinas? Las carpetas de trabajadores se conservarán.")){
    data.workers.forEach(w=>{w.invoices=[];w.tips=[]});data.week=getWeek();save();render();toast("Semana limpiada")}
});
$("pinEnter").onclick=unlock;$("pinCancel").onclick=closePin;$("pinClose").onclick=closePin;
$("pinInput").addEventListener("keydown",e=>{if(e.key==="Enter")unlock()});
render();
