const TG={"Divisions of the nervous system":"Nervous system divisions","Connective tissue and joints":"Joints and connective tissue","Joints":"Joints and connective tissue","Agonist and antagonist (scenarios)":"Agonist and antagonist"};
function group(t){return TG[t]||t}
function isPic(idx){return !!BANK[idx][1]}
function seenSet(){try{return new Set(JSON.parse(localStorage.getItem('sehs-seen')||'[]'))}catch(e){return new Set()}}
function markSeen(ids){try{const s=seenSet();ids.forEach(x=>s.add(x));localStorage.setItem('sehs-seen',JSON.stringify([...s]))}catch(e){}}
function stats(){try{return JSON.parse(localStorage.getItem('sehs-sim')||'[]')}catch(e){return[]}}
function saveStat(s){try{const a=stats();a.push(s);localStorage.setItem('sehs-sim',JSON.stringify(a.slice(-20)))}catch(e){}}
function draw(filter,n,seen){
  const by={};BANK.forEach((q,idx)=>{if(!filter(idx))return;const g=group(q[0]);(by[g]=by[g]||[]).push(idx)});
  const pools=shuf(Object.keys(by)).map(g=>{const p=shuf(by[g]);return p.filter(x=>seen.has(x)).concat(p.filter(x=>!seen.has(x)))});
  const out=[];while(out.length<n&&pools.some(p=>p.length)){for(const p of pools){if(out.length>=n)break;if(p.length)out.push(p.pop())}}
  return out;
}
function build(n,mode){
  const seen=seenSet();let ids;
  if(mode==='pic')ids=draw(isPic,n,seen);
  else if(mode==='text')ids=draw(i=>!isPic(i),n,seen);
  else{const np=Math.round(n*0.4);ids=draw(isPic,np,seen).concat(draw(i=>!isPic(i),n-np,seen));}
  return shuf(ids).map(idx=>{const [t,img,q,o,a,e,fix]=BANK[idx];let order=o.map((_,k)=>k);if(!fix)order=shuf(order);
    return{id:idx,t,img,q,o:order.map(k=>o[k]),a:order.indexOf(a),e}});
}
