import json,glob,os,base64
old=json.load(open('old.json')); new=json.load(open('gen.json'))
seen=set(); bank=[]
for q in old+new:
    k=q[2].strip().lower()
    if k in seen: continue
    seen.add(k); bank.append(q)
used=set(q[1] for q in bank if q[1])
imgs={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in glob.glob('quiz/*.jpg') if os.path.basename(f)[:-4] in used}
assert not (used-set(imgs)), used-set(imgs)
print(len(bank), sum(1 for q in bank if q[1]), 'img bytes', sum(len(v) for v in imgs.values()))
t=open('sim_v1.html').read()
s0=t.index('const IMG = '); s1=t.index('const L="ABCD";')
t=t[:s0]+'const IMG = '+json.dumps(imgs)+';\nconst BANK = '+json.dumps(bank,ensure_ascii=False)+';\n'+t[s1:]
old_build=t[t.index('function group(t)'):t.index('function home(){')]
new_build=open('newbuild.js').read()
t=t.replace(old_build,new_build)
old_home=t[t.index('function home(){'):t.index('function render(){')]
t=t.replace(old_home,open('newhome.js').read())
t=t.replace("let test=[], i=0, correct=0, missed=[], tally={};","let test=[], i=0, correct=0, missed=[], tally={}, lastMode='mix', lastN=50;")
t=t.replace("""<div class="choices"><button class="btn" id="again">New 50-question test</button><button class="btn ghost" id="again20">Quick 20</button></div>""",
 """<div class="choices"><button class="btn" id="again">Next test (same type)</button><button class="btn ghost" id="menu">Back to menu</button></div>""")
t=t.replace("document.getElementById('again').onclick=()=>start(50);document.getElementById('again20').onclick=()=>start(20);",
 "document.getElementById('again').onclick=()=>start(lastN,lastMode);document.getElementById('menu').onclick=home;")
t=t.replace("Every test draws a fresh random set from a bank of 146 questions, spread across all topics, with some picture questions. Answer order is shuffled each time.",
 "Every test draws a fresh set from a bank of %d questions across all topics. A mixed test is about 40%% picture questions and 60%% text. Answer order is shuffled each time."%len(bank))
open('sehs-exam-simulator.html','w').write(t)
print(len(t))
