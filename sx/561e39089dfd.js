(function(){var T=document.querySelectorAll('.nearT');if(!T.length)return;var M=document.querySelector('.nearMsg');
function km(a,b,c,d){var r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a*r)*Math.cos(c*r)*y*y))}
var lists=[].slice.call(document.querySelectorAll('ol')).filter(function(o){return o.querySelector(':scope>li[data-la]')});
lists.forEach(function(o){[].slice.call(o.children).forEach(function(li,i){li.setAttribute('data-i',i)})});
function mark(m){T.forEach(function(t){t.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-n')===m)})})}
function glob(){lists.forEach(function(o){var l=[].slice.call(o.children);l.sort(function(a,b){return a.getAttribute('data-i')-b.getAttribute('data-i')});l.forEach(function(li){li.classList.remove('nofar');var k=li.querySelector('.km');if(k)k.remove();o.appendChild(li)})});mark('g');if(M)M.textContent='';try{localStorage.setItem('dm_order','g')}catch(e){}}
function near(){if(!navigator.geolocation){if(M)M.textContent='Location is not available in this browser.';return}if(M)M.textContent='Finding your location…';
 navigator.geolocation.getCurrentPosition(function(g){var a=g.coords.latitude,b=g.coords.longitude;try{localStorage.setItem('dm_loc',JSON.stringify({la:a,lo:b,t:Date.now()}))}catch(e){}lists.forEach(function(o){var l=[].slice.call(o.children);
  l.forEach(function(li){var la=li.getAttribute('data-la');li._d=la==null?1e9:km(a,b,+la,+li.getAttribute('data-lo'));var k=li.querySelector('.km');if(k)k.remove();
   if(li._d<1e9){var s=document.createElement('span');s.className='km';s.textContent=(li._d<1?'here':Math.round(li._d).toLocaleString('en')+' km');var h=li.querySelector('h2,b');if(h)h.appendChild(s)}else li.classList.add('nofar')});
  l.sort(function(x,y){return x._d-y._d});l.forEach(function(li){o.appendChild(li)})});mark('n');if(M)M.textContent='Sorted by distance from you. Places without a map position are listed last.';try{localStorage.setItem('dm_order','n')}catch(e){}},
 function(){if(M)M.textContent='Location was not shared – showing the global ranking.';glob()},{timeout:10000,maximumAge:600000})}
T.forEach(function(t){t.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;b.getAttribute('data-n')==='n'?near():glob()})});
try{if(location.hash==='#near'||localStorage.getItem('dm_order')==='n')near()}catch(e){}})();