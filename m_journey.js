 /* ================= v23.6 first-time journey: choose what you want to do right on the start screen ================= */
 (function(){var g=document.querySelector('#gate .gateBox');if(!g||document.getElementById('dmGateActs'))return;
  var sub=g.querySelector('h1+p');if(sub)sub.textContent='Lakes, beaches, pools and baths — plus paddling, diving, sailing, boat trips and one-off water experiences, near you or anywhere you are headed.';
  var wrap=document.createElement('div');wrap.id='dmGateActs';wrap.setAttribute('role','radiogroup');wrap.setAttribute('aria-label','What do you want to do?');
  var L=[['swim','🏊','Swim'],['paddle','🛶','Paddle'],['dive','🤿','Dive'],['sail','⛵','Sail'],['boat','🚤','Boats'],['raft','🌊','Rafting'],['special','✨','Specials']];
  var cur=A.mode||'swim';
  wrap.innerHTML='<p class="dmGateQ">What do you want to do?</p><div class="dmGateRow">'+L.map(function(x){return '<button type="button" role="radio" data-a="'+x[0]+'" aria-checked="'+(x[0]===cur)+'" class="'+(x[0]===cur?'on':'')+'"><span>'+x[1]+'</span>'+x[2]+'</button>'}).join('')+'</div>';
  var anchor=g.querySelector('.gateSearch');if(anchor)g.insertBefore(wrap,anchor);else g.appendChild(wrap);
  wrap.addEventListener('click',function(e){var b=e.target.closest('button[data-a]');if(!b)return;var k=b.dataset.a;
   wrap.querySelectorAll('button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-checked',String(on))});
   try{setMode(k,true)}catch(err){}
   var inp=document.getElementById('gateDest');if(inp&&!inp.value)inp.focus({preventScroll:true})});
  /* keep the picker in step when the mode changes elsewhere */
  setInterval(function(){var m=A.mode||'swim';var on=wrap.querySelector('button.on');if(on&&on.dataset.a===m)return;wrap.querySelectorAll('button').forEach(function(x){var o=x.dataset.a===m;x.classList.toggle('on',o);x.setAttribute('aria-checked',String(o))})},1200)})();
