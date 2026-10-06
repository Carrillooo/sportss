function home(){
  document.getElementById('bar').hidden=true;
  const h=stats(), sn=seenSet().size, N=BANK.length;
  app.innerHTML=`<section class="card start">
    <span class="topic">Start a test</span>
    <p class="q">Each test picks questions you haven't seen yet first, so taking tests one after another works through the whole bank.</p>
    <div class="choices"><button class="btn" id="go50">Mixed test · 50</button><button class="btn ghost" id="go20">Quick mixed · 20</button></div>
    <div class="choices"><button class="btn ghost" id="pic50">Pictures only · 50</button><button class="btn ghost" id="txt50">No pictures · 50</button></div>
    <p class="small">Bank: <b>${N}</b> questions (${BANK.filter(q=>q[1]).length} with pictures). You have seen <b>${Math.min(sn,N)}</b> of them on this device.</p>
    ${h.length?`<p class="small">Last scores: ${h.slice(-8).map(s=>`<b>${s.c}/${s.n}</b>`).join(' · ')}</p>`:''}
    ${sn?`<div class="row"><button class="btn quit" id="reset">Reset seen questions</button></div>`:''}
  </section>`;
  const on=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=f};
  on('go50',()=>start(50,'mix'));on('go20',()=>start(20,'mix'));on('pic50',()=>start(50,'pic'));on('txt50',()=>start(50,'text'));
  on('reset',()=>{try{localStorage.removeItem('sehs-seen')}catch(e){};home()});
}
function start(n,mode){test=build(n,mode);lastMode=mode;lastN=n;markSeen(test.map(x=>x.id));i=0;correct=0;missed=[];tally={};document.getElementById('bar').hidden=false;render()}
