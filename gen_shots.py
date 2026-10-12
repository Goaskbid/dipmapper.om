import os
H=os.path.dirname(os.path.abspath(__file__))
T=os.path.join(H,'..','..','tests')
t=open(os.path.join(T,'activities.js')).read()
o="out.swimStart=await snap();"
add="""out.swimStart=await snap();const SH=process.env.SHOTDIR||'/tmp/claude-0';const top=sel=>p.evaluate(s=>{const l=document.querySelector(s);scrollTo(0,l.getBoundingClientRect().top+scrollY-70)},sel);
 const pk=async k=>{await p.evaluate(k=>document.querySelector('#dmActBar button[data-a="'+k+'"]').click(),k);await S(2600)};
 await top('#mapPanel');await S(500);await p.screenshot({path:SH+'/swim_map_'+w+'.png'});
 for(const k of (process.env.MODES||'paddle').split(',')){await pk(k);await top('#mapPanel');await S(700);await p.screenshot({path:SH+'/'+k+'_map_'+w+'.png'});await top('#dmActPanel');await S(500);await p.screenshot({path:SH+'/'+k+'_list_'+w+'.png'});
  await p.evaluate(()=>{const l=[...document.querySelectorAll('#dmActList .dmAcard')];if(l[3])l[3].scrollIntoView({block:'start'})});await S(500);await p.screenshot({path:SH+'/'+k+'_list2_'+w+'.png'});
  const pat=process.env['OPEN_'+k]||'';await p.evaluate(pat=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>!pat||new RegExp(pat).test(x.textContent));if(c)c.querySelector('.dmAopen').click()},pat);await S(2200);
  for(let i=0;i<5;i++){await p.evaluate(i=>{const b=document.getElementById('dmActBody');const sh=document.getElementById('dmActSheet');const y=i*(innerHeight-120);b.scrollTop=y;sh.scrollTop=y},i);await S(400);await p.screenshot({path:SH+'/'+k+'_sheet'+i+'_'+w+'.png'})}
  await p.evaluate(()=>document.getElementById('dmActClose').click());await S(400)}
 process.exit(0);"""
assert t.count(o)==1
open(os.path.join(T,'_shots.js'),'w').write(t.replace(o,add))
