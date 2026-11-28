(function(){
 'use strict';
 var D=document,KEY='dm_pass',buttons=Array.from(D.querySelectorAll('.ppB'));
 function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(e){return {}}}
 function state(b){var p=read(),on=Object.prototype.hasOwnProperty.call(p,b.dataset.pp)&&!!p[b.dataset.pp];b.setAttribute('aria-pressed',String(on));var t=b.querySelector('span');if(t)t.textContent=on?'In your passport':"I've been here";return on}
 function message(b,text){var p=b.nextElementSibling;if(!p||!p.classList.contains('dmPassStatus')){p=D.createElement('span');p.className='dmPassStatus';p.setAttribute('role','status');p.setAttribute('aria-live','polite');b.insertAdjacentElement('afterend',p)}p.textContent=text}
 buttons.forEach(function(b){state(b);b.onclick=function(){var id=b.dataset.pp;if(!/^[pt]:[a-z0-9][a-z0-9-]*$/i.test(id||'')){message(b,'This place cannot be saved.');return}var p=Object.assign(Object.create(null),read());if(Object.prototype.hasOwnProperty.call(p,id))delete p[id];else p[id]={n:b.dataset.n,cc:b.dataset.cc,k:b.dataset.k,u:b.dataset.u,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(p));buttons.forEach(state);message(b,state(b)?'Added to your passport.':'Removed from your passport.')}catch(e){message(b,'Your browser could not save this change.');state(b)}}});
 window.addEventListener('storage',function(e){if(e.key===KEY)buttons.forEach(state)});
})();
