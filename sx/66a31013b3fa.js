(function(){var ols=[].slice.call(document.querySelectorAll('ol')).filter(function(o){return o.querySelector(':scope>li.card')});if(!ols.length)return;
var NM=new Date().getMonth()+1;ols.forEach(function(o){[].slice.call(o.children).forEach(function(li,i){li.dataset.o=i})});
var w=document.createElement('label');w.className='dmSort';w.innerHTML='<span>Sort</span><select aria-label="Sort the list"><option value="rank">🏆 Ranking</option><option value="near">📍 Nearest to me</option><option value="now">🗓️ In season now first</option><option value="long">⏳ Longest season first</option><option value="name">🔤 Name A–Z</option><option value="country">🌍 Country A–Z</option></select>';
var anchor=document.querySelector('.nearT');if(anchor)anchor.parentNode.insertBefore(w,anchor.nextSibling);else ols[0].parentNode.insertBefore(w,ols[0]);
var sel=w.querySelector('select');function g(b){var x=document.querySelector('.nearT button[data-n="'+b+'"]');if(x&&!x.classList.contains('on'))x.click()}
function key(li,m){var ms=(li.dataset.m||'').split(' ').filter(Boolean).map(Number);if(m==='now')return[ms.indexOf(NM)>=0?0:1,+li.dataset.o];if(m==='long')return[-ms.length,+li.dataset.o];
 var n=(li.querySelector('h2')||{}).textContent||'',k=(li.querySelector('.kick')||{}).textContent||'';if(m==='name')return[n.toLowerCase(),0];if(m==='country')return[(k.split('·').pop()||'').trim().toLowerCase(),n.toLowerCase()];return[+li.dataset.o,0]}
sel.addEventListener('change',function(){var m=sel.value;if(m==='near'){g('n');return}g('g');ols.forEach(function(o){var a=[].slice.call(o.querySelectorAll(':scope>li.card'));a.sort(function(x,y){var p=key(x,m),q=key(y,m);return p[0]<q[0]?-1:p[0]>q[0]?1:p[1]<q[1]?-1:p[1]>q[1]?1:0});a.forEach(function(li){o.appendChild(li)})});
 try{localStorage.setItem('dm_sort',m)}catch(e){}});
document.addEventListener('click',function(e){var b=e.target.closest('.nearT button');if(b&&e.isTrusted)sel.value=b.dataset.n==='n'?'near':'rank'});
})();