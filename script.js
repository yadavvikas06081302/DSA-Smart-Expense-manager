const $=id=>document.getElementById(id);
let transactions=JSON.parse(localStorage.getItem("dsa_transactions")||"[]");
let budget=Number(localStorage.getItem("dsa_budget")||0);
let sortDesc=true;

$("date").value=new Date().toISOString().slice(0,10);
$("budget").value=budget||"";

function save(){localStorage.setItem("dsa_transactions",JSON.stringify(transactions));localStorage.setItem("dsa_budget",budget)}

function money(n){return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:2})}

function render(){
 const query=$("search").value.trim().toLowerCase(), filter=$("filter").value;
 let shown=transactions.filter(t=>(filter==="all"||t.type===filter)&&
   (t.description.toLowerCase().includes(query)||t.category.toLowerCase().includes(query)));
 shown=[...shown].sort((a,b)=>sortDesc?b.amount-a.amount:a.amount-b.amount);

 $("transactionList").innerHTML=shown.map(t=>`<tr>
 <td>${t.date}</td><td>${escapeHtml(t.description)}</td><td>${t.category}</td>
 <td><span class="badge ${t.type}">${t.type}</span></td>
 <td>${t.type==="income"?"+":"-"}${money(t.amount)}</td>
 <td><button class="small-danger" onclick="removeTransaction('${t.id}')">Delete</button></td>
 </tr>`).join("");
 $("empty").style.display=shown.length?"none":"block";

 const inc=transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
 const exp=transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
 $("income").textContent=money(inc); $("expense").textContent=money(exp);
 $("balance").textContent=money(inc-exp); $("count").textContent=transactions.length;

 const pct=budget?Math.min(100,(exp/budget)*100):0;
 $("progressBar").style.width=pct+"%";
 $("budgetText").textContent=budget?`${money(exp)} spent of ${money(budget)} (${pct.toFixed(0)}%)`:"No budget set.";
 const cats={}; transactions.filter(t=>t.type==="expense").forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
 const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
 $("insights").textContent=top?`Highest spending category: ${top[0]} (${money(top[1])}). ${budget&&exp>budget?"⚠️ Budget exceeded.":"Keep tracking to improve your spending habits."}`:"Add expense transactions to see insights.";
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
window.removeTransaction=id=>{transactions=transactions.filter(t=>t.id!==id);save();render()};

$("transactionForm").addEventListener("submit",e=>{
 e.preventDefault();
 transactions.push({id:Date.now().toString(),type:$("type").value,amount:Number($("amount").value),
 category:$("category").value,description:$("description").value.trim(),date:$("date").value});
 save(); e.target.reset(); $("date").value=new Date().toISOString().slice(0,10); render();
});
$("saveBudget").onclick=()=>{budget=Number($("budget").value)||0;save();render()};
$("search").oninput=render;$("filter").onchange=render;
$("sortBtn").onclick=()=>{sortDesc=!sortDesc;$("sortBtn").textContent=sortDesc?"Sort by Amount ↓":"Sort by Amount ↑";render()};
$("clearBtn").onclick=()=>{if(confirm("Delete all transactions?")){transactions=[];save();render()}};
render();
