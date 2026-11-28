(function(){var el=document.getElementById('gl');if(!el)return;var la=+el.dataset.la,lo=+el.dataset.lo,tz=el.dataset.tz;
function alt(d){var rad=Math.PI/180,jd=d/864e5+2440587.5,n=jd-2451545,L=(280.46+.9856474*n)%360,g=(357.528+.9856003*n)*rad,lam=(L+1.915*Math.sin(g)+.02*Math.sin(2*g))*rad,eps=(23.439-4e-7*n)*rad,
dec=Math.asin(Math.sin(eps)*Math.sin(lam)),ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),gmst=(280.46061837+360.98564736629*n)%360,ha=(gmst+lo)*rad-ra;
return Math.asin(Math.sin(la*rad)*Math.sin(dec)+Math.cos(la*rad)*Math.cos(dec)*Math.cos(ha))/rad}
var now=new Date(),f=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit'}),df=new Intl.DateTimeFormat('en-GB',{timeZone:tz,weekday:'long',day:'numeric',month:'long'});
var parts=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
var start=new Date(parts+'T00:00:00Z').getTime()-12*3600e3,w=[],cur=null;for(var t=start;t<start+48*3600e3;t+=2*60e3){var a=alt(t),inb=a>=0&&a<=6;if(inb&&!cur)cur=[t,t];else if(inb)cur[1]=t;else if(cur){w.push(cur);cur=null}}
var dayKey=function(t){return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t))};
w=w.filter(function(x){return dayKey(x[0])===parts});
el.innerHTML='<b>'+(w.length?w.map(function(x,i){return(x[0]<start+24*3600e3&&i===0&&w.length>1?'🌅 ':'🌇 ')+f.format(new Date(x[0]))+'–'+f.format(new Date(x[1]))}).join(' · '):'No low-sun window today')+'</b><br><small>Local time, '+df.format(now)+'. Sun between 0° and 6° above the horizon – a light estimate only, not a swimming recommendation.</small>'})();