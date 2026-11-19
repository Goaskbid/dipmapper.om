
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],OWNER='Torsten Sauter, Alte Landstr. 77, 8706 Meilen, Schweiz, torsten.sauter@icloud.com';
const FILE=n=>`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(n)}?width=900`;
const BAD=/(kinderpool|plansch|paddel|paddling|wading|splash ?pad|spray ?park|\bfountain\b|\bbrunnen\b|decorative|hotel pool|private pool|whirlpool|jacuzzi|footbath|fussbad)/i;
const FILTERS_FULL=[['all','🌊 All'],['beach','🏖 Beaches'],['pool','🏊 Pools'],['bath','≈ Bathing places'],['thermal','♨ Thermal'],['wild','〰 Wild swim'],['indoor','⌂ Indoor'],['outdoor','☀ Outdoor'],['free','0 Free'],['hours','◷ Hours'],['quiet','◌ Quietness estimate'],['parking','P Parking nearby'],['family','♡ Good with kids'],['supervised','◎ Supervised'],['women','♀ Women-friendly'],['food','🍴 Food'],['wc','WC Toilets'],['accessible','♿ Accessible'],['sauna','♨ Sauna'],['waterok','💧 Water 18C+ estimate'],['opennow','🟢 Open now']];
const FILTERS=FILTERS_FULL;
const LEGAL={privacy:`<p><b>Controller:</b> ${OWNER}.</p><p>DipMapper processes location only when you grant browser location access or enter a destination. Coordinates are used in your browser to request map, weather, photo, routing and nearby-place data. DipMapper does not create accounts and does not store your precise location on a DipMapper server.</p><p>External providers (OpenStreetMap/Overpass, Open-Meteo, Wikimedia/Wikidata, OSRM/FOSSGIS) receive coordinates or destination text only where needed to answer a request.</p><p><b>Advertising.</b> DipMapper.com uses Google AdSense. Google and its partners use cookies to serve ads based on your visits to this and other websites. Consent is collected through Google\'s certified consent message; you can change it any time via “Privacy settings”. Opt out of personalised ads at google.com/settings/ads.</p><p>Full policy: <a href="/privacy.html" target="_blank" rel="noopener">dipmapper.com/privacy.html</a></p>`,cookies:`<p>Essential local storage remembers your interface settings and recent searches on your own device. It is not used for tracking.</p><p>Advertising cookies are set by Google AdSense only according to the choice you make in Google\'s consent message. Without consent, only non-personalised ads are served where required by law. Change your choice any time via “Privacy settings” at the bottom of the page.</p>`,terms:`<p>DipMapper is an information and planning tool. It does not operate beaches, pools, baths, springs, spas, parking or transport. Opening times, prices, water quality, weather, access and safety can change without notice.</p>`,disclaimer:`<p>DipMapper combines open map data, operator caches, weather models, media sources and routing links. Some facts can be incomplete or delayed. The service does not certify that swimming is allowed or safe at a specific moment. Official signs, operators, lifeguards and local authorities override the app.</p>`,safety:`<p>Check local signs, flags, barriers, currents, depth, boat traffic, algae warnings, thunderstorms, cold shock risk and supervision before entering water. Natural beaches, rivers, springs and waterfalls require extra caution.</p>`,advertising:`<p>The header slot and local swim-place placements are reserved for clearly labelled advertising. To enquire, contact ${OWNER}. Ads must be distinguishable from ranked results and must not override safety or editorial labels.</p>`,imprint:`<p><b>DipMapper.com operator</b><br>Torsten Sauter<br>Alte Landstr. 77<br>8706 Meilen<br>Schweiz<br><a href="mailto:torsten.sauter@icloud.com">torsten.sauter@icloud.com</a></p>`,sources:`<p><b>External sources used by this build</b></p><ul><li>OpenStreetMap and Overpass for place coordinates, map data, facilities and parking candidates.</li><li>Wikimedia Commons and Wikidata for open-media candidates and civic identity assets.</li><li>Open-Meteo for coordinate-based weather forecasts.</li><li>Operator and municipality caches for hours, prices, season notes and contact details where imported.</li></ul><p>Commercial launch should use approved production providers or self-hosted services where public endpoints are not appropriate.</p>`};
const COMMON={generic:[FILE('A swimming pool in hot summer day.jpg'),FILE('Public swimming pool.jpg'),FILE('Beach chairs and sea.jpg')],meilen:['https://www.immoman.ch/custom/immoman/upload/pic/xx2h4eknre0yn1dyrenr_ojqzm_DSC_3815.jpg','https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg','https://www.immoman.ch/custom/immoman/upload/pic/ede225b863z9b1whvezq_fqbzo_20170510_86-ME.jpg','https://www.immoman.ch/custom/immoman/upload/pic/crih27s3587d3f3kko8d_6v564_20170128_2.jpg'],rostock:[FILE('Warnemünde Strand.jpg'),FILE('Warnemünde beach.jpg'),FILE('Strand Warnemünde.JPG'),FILE('Warnemünde Westmole und Strand.jpg')],zurich:[FILE('Zürich - Utoquai Seebad - Zürichsee IMG 0842.JPG'),FILE('Zürich - Strandbad Mythenquai IMG 1866.JPG'),FILE('Albis-Uetliberg - Zürichhorn - Strandbad Tiefenbrunnen 2011-10-26 14-30-52.jpg'),FILE('Badi Oberer Letten von Kornhausbrücke.JPG')],rhodes:[FILE('Aerial view of Elli Beach and Akti Miaouli Beach, Rhodes, Greece (51698848208).jpg'),FILE('Anthony Quinn Beach Anthony Quinn Bay Rhodes 31 August 2024.jpg'),FILE('Tsambika Beach Rhodes.jpg'),FILE('Faliraki beach 2023.jpg')],palma:[FILE('Beach of Palma de Mallorca.jpg'),FILE('Platja de Palma 1.jpg'),FILE('Cala Major (76720833).jpeg'),FILE('Can Pere Antoni beach Palma.jpg')],miami:[FILE('South Beach, Miami.jpg'),FILE('Southbeachboardwalk07.JPG'),FILE('LummusParkMiamiBeach-Promenade.JPG'),FILE('Virginiakeybeach.jpg'),FILE('Crandon Park beach, FL.jpg')]};
const PHOTO_BANK={
'zh-hallenbad-city':[FILE('City - Hallenbad City (renoviert) - Schanzengraben 2012-10-22 14-51-27.JPG'),FILE('Hallenbad City Front.jpg'),FILE('Zurich Swimming Pool City (226286969).jpeg')],
'zh-utoquai':[FILE("'Seebad' Utoquai in Zürich, Ansicht vom Dampfschiff Stadt Rapperswil der Zürichsee-Schifffahrtsgesellschaft (ZSG) 2013-09-13 15-34-11.JPG"),FILE('Zürich - Utoquai Seebad - Zürichsee IMG 0842.JPG'),FILE('Utoquai - Seebad - ZSG Pfannenstiel 2015-07-03 20-28-58.JPG')],
'zh-tiefenbrunnen':[FILE('Albis-Uetliberg - Zürichhorn - Strandbad Tiefenbrunnen 2011-10-26 14-30-52.jpg'),FILE("'Lake Side Casino Zürichhorn' und Strandbad 'Tiefenbrunnen' am Zürichhorn, Ansicht von der Schifflände der Zürichsee-Schifffahrtsgesellschaft (ZSG) 2013-09-19 17-49-16.JPG"),FILE('Albis-Uetliberg - Zürichsee - Strandbad Tiefenbrunnen 2011-10-26 14-25-56.JPG')],
'zh-enge':[FILE('Enge - Seebad - Arboretum 2012-03-28 18-06-30 (P7000).JPG'),FILE('Enge - Seebad - Arboretum Zürich 2015-02-26 11-56-02.JPG'),FILE('Enge - Seebad - Zimmerberg - Arboretum Zürich 2014-01-28 16-05-34 (P7700).JPG')],
'zh-mythenquai':[FILE('Zürich - Strandbad Mythenquai IMG 1866.JPG'),FILE('Annemie Fontana - Strandbad Mythenquai 2015-02-26 11-31-59.JPG'),FILE('Mythenquai - Strandbad 2011-03-23 13-56-48.JPG')],
'zh-letzigraben':[FILE('Freibad Letzigraben 2011-08-16 15-32-54.jpg'),FILE('Freibad Letzigraben 2011-08-16 15-34-30.jpg'),FILE('Freibad Letzigraben 2011-08-16 15-35-04.jpg')],
'zh-heuried':[FILE('Freibad Heuried.jpg'),FILE('Freibad Heuried 02.jpg'),FILE('Freibad Heuried 03.jpg')],
'zh-allenmoos':[FILE('Allenmoos Freibad.JPG'),FILE('Bad Allenmoos 2011-08-17 14-05-22.jpg'),FILE('Freibad Allenmoos 2011-08-17 14-05-32.jpg')],
'zh-letten':[FILE('Badi Oberer Letten von Kornhausbrücke.JPG'),FILE('Badi-Oberer-Letten Zuerich Sommer.jpg'),FILE('Zürich Flussbad Oberer Letten.jpg')],
'zh-wollishofen':[FILE('Strandbad Wollishofen.JPG'),FILE('Zürich - Wollishofen - Badi-Waschanstalt - Rote Fabrik IMG 4063.JPG'),FILE('Wollishofen - Zürichsee 2011-07-17 18-23-50.JPG')],
'miami-south':[FILE('South Beach, Miami.jpg'),FILE('Southbeachboardwalk07.JPG'),FILE('LummusParkMiamiBeach-Promenade.JPG')],
'miami-lummus':[FILE('LummusParkMiamiBeach-Promenade.JPG'),FILE('Southbeachboardwalk07.JPG'),FILE('South Beach, Miami.jpg')],
'miami-virginia':[FILE('Virginiakeybeach.jpg'),FILE('South Beach, Miami.jpg'),FILE('Crandon Park beach, FL.jpg')],
'miami-crandon':[FILE('Crandon Park beach, FL.jpg'),FILE('Virginiakeybeach.jpg'),FILE('South Beach, Miami.jpg')],
'miami-haulover':[FILE('South Beach, Miami.jpg'),FILE('LummusParkMiamiBeach-Promenade.JPG'),FILE('Crandon Park beach, FL.jpg')]
,'meilen-hallenbad':['https://www.msa-architekten.ch/files/styles/bild_klein/public/bilder/projekte/msa_hallenbad_meilen_innen_1.jpg','https://www.msa-architekten.ch/files/styles/bild_klein/public/bilder/projekte/msa_hallenbad_meilen_innen_2.jpg','https://www.msa-architekten.ch/files/styles/bild_klein/public/bilder/projekte/msa_hallenbad_meilen_innen_3.jpg'],
'meilen-dorf':['https://www.immoman.ch/custom/immoman/upload/pic/xx2h4eknre0yn1dyrenr_ojqzm_DSC_3815.jpg','https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg','https://www.immoman.ch/custom/immoman/upload/pic/crih27s3587d3f3kko8d_6v564_20170128_2.jpg'],
'meilen-feld':['https://lh5.googleusercontent.com/p/AF1QipMIadCfE37yiNK4uI8dcrF_E7ZCKohchR7-3kQ3=s1600','https://www.immoman.ch/custom/immoman/upload/pic/ede225b863z9b1whvezq_fqbzo_20170510_86-ME.jpg','https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg'],
'meilen-laendeli':['https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg','https://www.immoman.ch/custom/immoman/upload/pic/xx2h4eknre0yn1dyrenr_ojqzm_DSC_3815.jpg','https://www.immoman.ch/custom/immoman/upload/pic/ede225b863z9b1whvezq_fqbzo_20170510_86-ME.jpg'],
'herrliberg-steinrad':['https://www.herrliberg.ch/public/upload/assets/4155/rendition/24_img_lg.jpg?fp=1736151148220','https://www.herrliberg.ch/public/upload/assets/4160/rendition/24_img_lg.jpg?fp=1736151383174','https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg']

};
const COMMONS_CATS={
'zh-utoquai':'Seebad Utoquai','zh-enge':'Seebad Enge','zh-mythenquai':'Strandbad Mythenquai','zh-tiefenbrunnen':'Strandbad Tiefenbrunnen','zh-wollishofen':'Strandbad Wollishofen','zh-letten':'Flussbad Oberer Letten','zh-unterer-letten':'Unterer Letten','zh-frauenbad':'Frauenbad Stadthausquai','zh-city':'Hallenbad City','zh-hallenbad-city':'Hallenbad City','zh-letzigraben':'Freibad Letzigraben','zh-heuried':'Freibad Heuried','zh-allenmoos':'Freibad Allenmoos','zh-katzensee':'Strandbad Katzensee','zh-auhoengg':'Flussbad Au-Höngg','zh-schanzengraben':'Männerbad Schanzengraben',
'rostock-warnemuende':'Warnemünde beach','rostock-markgrafenheide':'Markgrafenheide beach','rostock-hohe-duene':'Hohe Düne','rhodes-elli':'Elli Beach','rhodes-faliraki':'Faliraki Beach','rhodes-anthony':'Anthony Quinn Bay','rhodes-tsambika':'Tsambika Beach','rhodes-kallithea':'Kallithea Springs','palma-platja':'Platja de Palma','palma-cala-major':'Cala Major','palma-can-pere':'Can Pere Antoni','miami-south':'South Beach, Miami','miami-lummus':'Lummus Park, Miami Beach','miami-virginia':'Virginia Key','miami-crandon':'Crandon Park Beach'
};
const ASSETS={rostock:['Rostock','Mecklenburg-Vorpommern','Germany','🇩🇪',[FILE('Rostock Wappen.svg'),FILE('Flag of Mecklenburg-Western Pomerania.svg'),FILE('Flag of Germany.svg')]],zurich:['Zürich','Canton Zürich','Switzerland','🇨🇭',[FILE('Wappen Zürich matt.svg'),FILE('Flag of Canton of Zürich.svg'),FILE('Flag of Switzerland.svg')]],meilen:['Meilen','Canton Zürich','Switzerland','🇨🇭',[FILE('CHE Meilen COA.svg'),FILE('Flag of Canton of Zürich.svg'),FILE('Flag of Switzerland.svg')]],rhodes:['Rhodes','South Aegean','Greece','🇬🇷',[FILE('Flag of Rhodes Island.svg'),FILE('Rhodes (Greece).svg'),FILE('Flag of Greece.svg')]],palma:['Palma','Balearic Islands','Spain','🇪🇸',[FILE('Coat of Arms of Palma de Mallorca.svg'),FILE('Coat of Arms of Balearic Islands.svg'),FILE('Flag of Spain.svg')]],miami:['Miami Beach','Florida','United States','🇺🇸',[FILE('Seal of Miami Beach, Florida.svg'),FILE('Flag of Florida.svg'),FILE('Flag of the United States.svg')]],herrliberg:['Herrliberg','Canton Zürich','Switzerland','🇨🇭',['',FILE('Flag of Canton of Zürich.svg'),FILE('Flag of Switzerland.svg')]],generic:['Local area','Region','Country','🌐',['','','']]};
const PACKS=[{key:'zurich',aliases:['zurich','zürich','zurich lake','lake zurich','zuerich','zürichsee','badi zurich','badis zürich'],label:'Zürich',center:[47.369,8.541],radius:24,venues:[
{id:'zh-enge',rankBoost:20,name:'Seebad Enge',cat:'bath',setting:'Outdoor',lat:47.3582,lon:8.5361,address:'Mythenquai 9, 8002 Zürich',website:'http://www.seebadenge.ch/',phone:'+41442013889',operator:'Seebad Enge / Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer lake-bath operation; winter sauna programme outside swimming season.',season:'Main Zürich lake-bath season with winter sauna use.',facilities:['lake access','floating decks','swim lanes','showers','toilets','changing rooms','food / kiosk','sauna','supervised'],highlights:['supervised','food'],water:{temp:16},photos:[FILE('Enge - Seebad - Arboretum 2012-03-28 18-06-30 (P7000).JPG'),FILE('Enge - Seebad - Arboretum Zürich 2015-02-26 11-56-02.JPG'),FILE('Enge - Seebad - Zimmerberg - Arboretum Zürich 2014-01-28 16-05-34 (P7700).JPG')],story:'A signature left-bank Zürich badi: floating decks, lake lanes, after-work energy and a sunset angle over the water. It is the right pick when you want a proper urban swim with a social edge, not just a quick dip.',parking:[{name:'Parkhaus Hyatt / Beethovenstrasse',lat:47.3650,lon:8.5358,fee:'paid',congestion:'medium'},{name:'Mythenquai parking areas',lat:47.3548,lon:8.5352,fee:'paid',congestion:'high'}],transit:['Bahnhof Enge','Tram Museum Rietberg / Rentenanstalt']},
{id:'zh-utoquai',rankBoost:19,name:'Seebad Utoquai',cat:'bath',setting:'Outdoor',lat:47.36185,lon:8.5473,address:'Utoquai 50, 8008 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/utoquai.html',phone:'+41444135820',operator:'Stadt Zürich',free:false,price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer bath season; daily opening is operator-controlled and last admission is usually before closing.',season:'Classic Zürich lake-bath season.',facilities:['lake access','showers','toilets','changing rooms','food / kiosk','supervised','decks','diving boards'],highlights:['women-friendly','supervised','food'],water:{temp:16},photos:[FILE("'Seebad' Utoquai in Zürich, Ansicht vom Dampfschiff Stadt Rapperswil der Zürichsee-Schifffahrtsgesellschaft (ZSG) 2013-09-13 15-34-11.JPG"),FILE('Albis - Utoquai Seebad - Bürkliplatz 2010-06-18 19-34-56.JPG'),FILE('Utoquai - Seebad - ZSG Pfannenstiel 2015-07-03 20-28-58.JPG')],story:'A historic wooden lake bath on the right bank, close to Bellevue and Stadelhofen. It feels polished, central and unmistakably Zürich: wooden cabins, lake views, diving boards and a refined city-bath atmosphere.',parking:[{name:'Parkhaus Utoquai',lat:47.3614,lon:8.5504,fee:'paid',congestion:'high'},{name:'Parkhaus Hohe Promenade',lat:47.3653,lon:8.5480,fee:'paid',congestion:'medium'}],transit:['Tram / bus Bellevue','Bahnhof Stadelhofen']},
{id:'zh-mythenquai',rankBoost:18,name:'Strandbad Mythenquai',cat:'beach',setting:'Outdoor',lat:47.3479,lon:8.5352,address:'Mythenquai 95, 8002 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/mythenquai.html',phone:'+41444135830',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer beach-bath operation; exact daily hours from operator status.',season:'Main summer season; strongest for full hot days.',facilities:['sandy beach','lake access','lawn','showers','toilets','changing rooms','food / kiosk','diving tower','family','supervised'],highlights:['family','supervised','food'],water:{temp:16},photos:[FILE('Zürich - Strandbad Mythenquai 2010-08-15 18-02-16.JPG'),FILE('Strandbad Mythenquai Zürich.jpg'),FILE('Zürichsee - Strandbad Mythenquai.jpg')],story:'The big social lake beach on the left bank. It is the choice for a full summer day: sand, lawns, groups, families, a diving tower and a more open holiday feeling than the compact wooden badis.',parking:[{name:'Mythenquai parking areas',lat:47.3498,lon:8.5348,fee:'paid',congestion:'high'},{name:'Parkhaus Sihlcity',lat:47.3585,lon:8.5223,fee:'paid',congestion:'medium'}],transit:['Bus / tram Brunau or Waffenplatzstrasse','Zürich Wollishofen rail nearby']},
{id:'zh-tiefenbrunnen',rankBoost:16,name:'Strandbad Tiefenbrunnen',cat:'beach',setting:'Outdoor',lat:47.3527,lon:8.5562,address:'Bellerivestrasse 200, 8008 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/tiefenbrunnen.html',phone:'+41444135800',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer bath season; operator controls exact daily hours.',season:'Summer beach-bath season; Zürichhorn promenade remains useful outside swimming season.',facilities:['lake access','lawn','showers','toilets','changing rooms','food / kiosk','supervised','family'],highlights:['family','supervised','food'],water:{temp:16},photos:[FILE('Albis-Uetliberg - Zürichhorn - Strandbad Tiefenbrunnen 2011-10-26 14-30-52.jpg'),FILE("'Lake Side Casino Zürichhorn' und Strandbad 'Tiefenbrunnen' am Zürichhorn, Ansicht von der Schifflände der Zürichsee-Schifffahrtsgesellschaft (ZSG) 2013-09-19 17-49-16.JPG"),FILE('Albis-Uetliberg - Zürichsee - Strandbad Tiefenbrunnen 2011-10-26 14-25-56.JPG')],story:'The east-side classic by Zürichhorn: spacious, calmer than the city-centre baths and strong on local summer rhythm. It is very good when you want lake access plus lawns, food and a promenade walk.',parking:[{name:'Parkplatz Zürichhorn / Bellerivestrasse',lat:47.3542,lon:8.5524,fee:'paid',congestion:'high'},{name:'Parkhaus Zürichhorn Casino area',lat:47.3522,lon:8.5526,fee:'paid',congestion:'medium'}],transit:['Bahnhof Tiefenbrunnen','Tram/bus Zürichhorn']},
{id:'zh-wollishofen',rankBoost:10,name:'Strandbad Wollishofen',cat:'bath',setting:'Outdoor',lat:47.3336,lon:8.5410,address:'Seestrasse 451, 8038 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/wollishofen.html',phone:'+41444135810',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer municipal lake-bath operation.',season:'Summer lake-bath season.',facilities:['lake access','lawn','showers','toilets','changing rooms','food / kiosk','family','supervised'],highlights:['family','supervised','food'],water:{temp:16},photos:[FILE('Strandbad Wollishofen.JPG'),FILE('Wollishofen - Zürichsee 2011-07-17 18-23-50.JPG'),FILE('Zürich Wollishofen Seeufer.jpg')],story:'A less touristy left-bank bath with a neighbourhood feel. It suits families and swimmers who want clean lake access and a calmer atmosphere than the headline badis near the city centre.',parking:[{name:'Wollishofen lakefront parking',lat:47.3348,lon:8.5412,fee:'paid',congestion:'medium'}],transit:['Bahnhof Wollishofen','Tram / bus Wollishofen']},
{id:'zh-oberer-letten',rankBoost:20,name:'Flussbad Oberer Letten',cat:'wild',setting:'Outdoor',lat:47.3871,lon:8.5338,address:'Lettensteg 10, 8037 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/oberer-letten.html',phone:'+41444135880',operator:'Stadt Zürich',free:true,hours:'Seasonal supervised river bath; exact hours from operator status.',season:'Warm-season river-bath operation.',facilities:['river access','sun decks','showers','toilets','food / kiosk','supervised'],highlights:['free','supervised','food'],water:{temp:16},photos:[FILE('Badi Oberer Letten von Kornhausbrücke.JPG'),FILE('Badi-Oberer-Letten Zuerich Sommer.jpg'),FILE('Zürich Flussbad Oberer Letten.jpg')],story:'The peak Zürich river-bath experience: urban, social and fast to reach from the centre. Come for Limmat water, decks, city energy and an after-work crowd; treat the current as part of the place.',parking:[{name:'Parkhaus Hauptbahnhof / Sihlquai',lat:47.3817,lon:8.5368,fee:'paid',congestion:'medium'}],transit:['Bahnhof Zürich HB','Tram Limmatplatz']},
{id:'zh-unterer-letten',rankBoost:15,name:'Unterer Letten Swimming Pool',westernName:'Flussbad Unterer Letten',cat:'wild',setting:'Outdoor',lat:47.3897,lon:8.5306,address:'Wasserwerkstrasse 141, 8037 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/unterer-letten.html',phone:'+41444135890',operator:'Stadt Zürich',free:true,hours:'Seasonal river-bath operation; public swim windows depend on operator status.',season:'Summer river swimming season.',facilities:['river access','lap swimming','showers','toilets','changing rooms','supervised'],highlights:['free','supervised'],water:{temp:16},photos:[FILE('Unterer Letten Zürich.JPG'),FILE('Zürich Unterer Letten.jpg'),FILE('Flussbad Unterer Letten.jpg')],story:'More swimmer-oriented than Oberer Letten: still urban, but with a cleaner athletic feel and channel swimming. Good when you want the Limmat experience with a little more focus on actual swimming.',parking:[{name:'Parkhaus Hauptbahnhof / Sihlquai',lat:47.3817,lon:8.5368,fee:'paid',congestion:'medium'}],transit:['Tram Limmatplatz','Bahnhof Zürich HB']},
{id:'zh-au-hoengg',rankBoost:8,name:'Flussbad Au-Höngg',cat:'wild',setting:'Outdoor',lat:47.4016,lon:8.4928,address:'Werdinsel 2, 8049 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/au-hoengg.html',phone:'+41444135860',operator:'Stadt Zürich',free:true,hours:'Seasonal river-bath operation.',season:'Summer river and island season.',facilities:['river access','island setting','showers','toilets','food / kiosk','supervised'],highlights:['free','family','supervised'],water:{temp:16},photos:[FILE('Werdinsel Zürich.JPG'),FILE('Zürich Werdinsel Limmat.jpg'),FILE('Limmat bei Werdinsel Zürich.jpg')],story:'The relaxed Werdinsel river option: greener, less central and more nature-feeling than the Letten baths. Pick it when the visit is about island atmosphere and a slower river day.',parking:[{name:'Parkplatz Werdinsel',lat:47.4012,lon:8.4936,fee:'paid',congestion:'high'}],transit:['Tram / bus Frankental or Tüffenwies']},
{id:'zh-frauenbad',rankBoost:14,name:'Frauenbad Stadthausquai',cat:'bath',setting:'Outdoor',lat:47.3680,lon:8.5415,address:'Stadthausquai 12, 8001 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/stadthausquai.html',phone:'+41444135870',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Women-only daytime bathing in season; evening use can differ by operator/event.',season:'Summer river-bath season.',facilities:['river access','wooden pavilion','showers','toilets','changing rooms','food / kiosk','supervised'],highlights:['women-friendly','supervised','food'],water:{temp:16},photos:[FILE('Frauenbad Stadthausquai Zürich.JPG'),FILE('Zürich Frauenbad Stadthausquai.jpg'),FILE('Stadthausquai Zürich.jpg')],story:'A Zürich institution in a wooden pavilion on the Limmat. Daytime bathing is culturally distinctive, central and atmospheric; in the evening the site can shift into a different bar-like rhythm.',parking:[{name:'Parkhaus Hohe Promenade',lat:47.3653,lon:8.5480,fee:'paid',congestion:'medium'},{name:'Parkhaus Urania',lat:47.3745,lon:8.5392,fee:'paid',congestion:'high'}],transit:['Tram Bürkliplatz','Bahnhof Stadelhofen']},
{id:'zh-maennerbad',rankBoost:9,name:'Männerbad Schanzengraben',cat:'bath',setting:'Outdoor',lat:47.3710,lon:8.5350,address:'Badweg 10, 8001 Zürich',operator:'Stadt Zürich',hours:'Seasonal historic bath; access rules and events can vary.',season:'Summer season.',facilities:['canal bath','wooden structure','showers','toilets','changing rooms'],highlights:['quiet'],water:{temp:16},photos:[FILE('Männerbad Schanzengraben Zürich.JPG'),FILE('Schanzengraben Zürich Männerbad.jpg'),FILE('Schanzengraben Zürich.jpg')],story:'A hidden historic bath in the old Schanzengraben moat. It is much more niche and local than the big lake baths: compact, atmospheric and better for people who value character over space.',parking:[{name:'Parkhaus Bleicherweg',lat:47.3699,lon:8.5364,fee:'paid',congestion:'medium'}],transit:['Tram Selnau / Paradeplatz','Bahnhof Selnau']},
{id:'zh-letzigraben',rankBoost:13,name:'Freibad Letzigraben',cat:'pool',setting:'Outdoor',lat:47.3800,lon:8.5000,address:'Edelweissstrasse 5, 8048 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/letzigraben.html',phone:'+41444135700',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer outdoor-pool operation.',season:'Summer season.',facilities:['50m pool','Olympic pool','diving','showers','toilets','changing rooms','food / kiosk','family','supervised'],highlights:['family','supervised','food'],water:{temp:24},photos:PHOTO_BANK['zh-letzigraben'],story:'The architecture-minded pool choice: modernist, clean-lined and serious about swimming. It is a classic Zürich option when lanes and pool structure matter more than lake atmosphere.',parking:[{name:'Letzigraben parking areas',lat:47.3793,lon:8.5027,fee:'paid',congestion:'medium'}],transit:['Tram Letzigrund','Bus Albisriederplatz']},
{id:'zh-heuried',rankBoost:8,name:'Freibad Heuried',cat:'pool',setting:'Outdoor',lat:47.3694,lon:8.5024,address:'Wasserschöpfi 71, 8055 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/heuried.html',phone:'+41444139530',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer outdoor-pool operation.',season:'Summer season.',facilities:['large pool complex','diving','showers','toilets','changing rooms','food / kiosk','supervised'],highlights:['family','supervised','food'],water:{temp:24},photos:[FILE('Freibad Heuried Zürich.JPG'),FILE('Heuried Zürich Freibad.jpg'),FILE('Heuried Sportzentrum Zürich.jpg')],story:'A functional sports-and-family pool complex in south-west Zürich. Less iconic than the river or lake badis, but strong when you want predictable lanes, diving and facilities.',parking:[{name:'Heuried parking',lat:47.3690,lon:8.5015,fee:'paid',congestion:'medium'}],transit:['Tram Heuried']},
{id:'zh-seebach',rankBoost:6,name:'Outdoor Swimming Pool Seebach',westernName:'Freibad Seebach',cat:'pool',setting:'Outdoor',lat:47.4248,lon:8.5474,address:'Glatttalstrasse 43, 8052 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/seebach.html',phone:'+41444135750',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer outdoor-pool operation.',season:'Summer season.',facilities:['pool','showers','toilets','changing rooms','food / kiosk','family','supervised'],highlights:['family','supervised'],water:{temp:24},photos:[FILE('Freibad Seebach Zürich.JPG'),FILE('Seebach Zürich Freibad.jpg'),FILE('Glatttalstrasse Zürich Seebach.jpg')],story:'A neighbourhood outdoor pool for the north of Zürich: calmer, practical and family-friendly. Use it when lap swimming and easy local facilities beat a trip across town to the lake.',parking:[{name:'Seebach pool parking',lat:47.4240,lon:8.5471,fee:'paid',congestion:'medium'}],transit:['Tram / bus Seebach']},
{id:'zh-auhof',rankBoost:6,name:'Freibad Auhof',cat:'pool',setting:'Outdoor',lat:47.4077,lon:8.5965,address:'Luegislandstrasse 160, 8051 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/sommerbaeder/auhof.html',phone:'+41444135740',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Summer outdoor-pool operation.',season:'Summer season.',facilities:['pool','showers','toilets','changing rooms','food / kiosk','family','supervised'],highlights:['family','supervised'],water:{temp:24},photos:[FILE('Freibad Auhof Zürich.JPG'),FILE('Auhof Zürich swimming pool.jpg'),FILE('Schwamendingen Zürich Auhof.jpg')],story:'An east-Zürich local pool with a calmer neighbourhood profile. It is not the tourist icon; it is the practical family and summer-lap choice for this side of the city.',parking:[{name:'Auhof pool parking',lat:47.4071,lon:8.5962,fee:'paid',congestion:'medium'}],transit:['Tram / bus Schwamendingen']},
{id:'zh-hallenbad-city',rankBoost:12,name:'Hallenbad City',westernName:'City Indoor Pool',cat:'pool',setting:'Indoor',lat:47.3738,lon:8.5368,address:'Sihlstrasse 71, 8001 Zürich',website:'https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/sport-und-badeanlagen/hallenbaeder/city.html',phone:'+41444135600',operator:'Stadt Zürich',price:{currency:'CHF',adult:8,child:4,youth:6,senior:8},hours:'Year-round indoor-pool operation; lane availability depends on daily schedule.',season:'Year-round indoor swimming.',facilities:['indoor pool','lanes','showers','toilets','changing rooms','accessible','supervised'],highlights:['hours','supervised'],water:{temp:27},photos:PHOTO_BANK['zh-hallenbad-city'],story:'The central no-nonsense indoor swim: close to the old town and Bahnhofstrasse, useful for laps, bad weather and efficient training. It is about access and structure, not lakeside romance.',parking:[{name:'Parkhaus Jelmoli',lat:47.3742,lon:8.5375,fee:'paid',congestion:'high'},{name:'Parkhaus Urania',lat:47.3745,lon:8.5392,fee:'paid',congestion:'high'}],transit:['Bahnhof Zürich HB','Tram Sihlstrasse / Rennweg']},
{id:'zh-hallenbad-altstetten',rankBoost:7,name:'Hallenbad Altstetten',westernName:'Altstetten Indoor Pool',cat:'pool',setting:'Indoor',lat:47.3885,lon:8.4836,address:'Dachslernstrasse 35, 8048 Zürich',website:'http://www.bad-altstetten.ch/',phone:'+41444317744',operator:'Bad Altstetten',price:{currency:'CHF',adult:null},hours:'Indoor sports-pool operation; public lanes depend on programme.',season:'Year-round indoor swimming.',facilities:['indoor pool','lanes','showers','toilets','changing rooms','supervised'],highlights:['hours','supervised'],water:{temp:27},photos:[FILE('Hallenbad Altstetten Zürich.JPG'),FILE('Bad Altstetten Zürich.jpg'),FILE('Altstetten Zürich Hallenbad.jpg')],story:'A large west-Zürich indoor sports pool used by swimmers, clubs and training groups. Best when you need reliable lanes rather than lake weather or a social badi atmosphere.',parking:[{name:'Bad Altstetten parking',lat:47.3882,lon:8.4822,fee:'paid',congestion:'medium'}],transit:['Bus Dachslernstrasse','Bahnhof Altstetten']},
{id:'zh-huerlimann',rankBoost:17,name:'Hürlimannbad & Spa Zürich',westernName:'Zurich Thermal Bath and Spa',cat:'thermal',setting:'Indoor + outdoor',lat:47.3627,lon:8.5253,address:'Brandschenkestrasse 150, 8002 Zürich',website:'https://www.aqua-spa-resorts.ch/de/huerlimannbad-spa-zuerich',phone:'+41442059650',operator:'Aqua-Spa-Resorts',price:{currency:'CHF',adult:null},hours:'Managed spa operation; exact admission windows and prices should be imported from operator cache.',season:'Year-round spa and thermal-bath operation.',facilities:['thermal water','rooftop pool','spa','showers','toilets','changing rooms','food / kiosk','accessible'],highlights:['hours','food'],water:{temp:35},photos:[FILE('Hürlimannbad Zürich.JPG'),FILE('Huerlimannbad Zurich rooftop pool.jpg'),FILE('Hürlimann Areal Zürich.jpg')],story:'The wellness counterpoint to the lake and river badis: a former brewery setting, warm thermal water and rooftop views. Choose it when comfort, architecture and weather-proof bathing matter more than outdoor swim culture.',parking:[{name:'Parkhaus Hürlimann-Areal',lat:47.3627,lon:8.5247,fee:'paid',congestion:'medium'}],transit:['Bahnhof Enge','Tram Sihlcity / Waffenplatzstrasse']} ]},
{key:'meilen',aliases:['meilen','meilen switzerland','dorfmeilen','obermeilen','feldmeilen','laendeli','ländeli','dollikon','hallenbad meilen','hallenbad allmend meilen','toggwilerstrasse','herrliberg','steinrad','uetikon am see','uetikom','männedorf','maennedorf','stäfa','stafa','küsnacht','kusnacht','zürichsee right bank'],label:'Meilen, Zürichsee right bank',center:[47.2697,8.6460],radius:13,venues:[
{id:'meilen-hallenbad',rankBoost:32,name:'Hallenbad Allmend Meilen',westernName:'Meilen Indoor Pool and Sauna',cat:'pool',setting:'Indoor',lat:47.2733,lon:8.6486,address:'Toggwilerstrasse 38, 8706 Meilen',website:'https://www.meilen.ch/hallenbadallmend/9697',phone:'+41449233370',operator:'Gemeinde Meilen',price:{currency:'CHF',adult:8,child:4,senior:8},hours:'Mon-Fri 06:00-21:00; Sat-Sun 08:00-19:00. Holiday and event exceptions are published by Gemeinde Meilen.',season:'Year-round indoor pool, closed 11 July-16 August 2026 for revision/summer break according to the operator schedule.',facilities:['25 m indoor pool','5 lanes','teaching pool','children pool area','sauna','massage','showers','toilets','changing rooms','accessible / pool lift','bistro','badeshop','1 m springboard'],highlights:['hours','supervised','food','family'],water:{temp:26.5},photos:PHOTO_BANK['meilen-hallenbad'],story:'Meilen’s reliable all-weather swim option belongs at the top of a local search: a 25 m indoor pool, teaching water, sauna, bistro and accessible pool lift above the lake village. It solves the rainy-day or winter swim instead of pretending every good swim needs an outdoor badi.',parking:[{name:'Hallenbad Allmend parking',lat:47.2735,lon:8.6481,fee:'paid',congestion:'medium'},{name:'Sportzentrum Allmend parking',lat:47.2739,lon:8.6502,fee:'paid',congestion:'medium'}],transit:['Bus Meilen Allmend','Bahnhof Meilen plus local bus']},
{id:'meilen-dorf',rankBoost:27,name:'Strandbad Dorfmeilen',westernName:'Dorfmeilen Lake Bath',cat:'bath',setting:'Outdoor',lat:47.2692,lon:8.6429,address:'Seestrasse 720, 8706 Meilen',website:'https://www.meilen.ch/strandbaeder/9953',phone:'+41795552331',operator:'Gemeinde Meilen',price:{currency:'CHF',adult:null},hours:'Pre/post-season 2026: Mon 11:00-19:00, Tue-Sun 10:00-19:00. Main season 2026: Mon 11:00-20:00, Tue-Sun 09:00-20:00, weather permitting.',season:'1 May-14 September 2026, with main season 6 June-16 August 2026.',facilities:['lake access','large lawn','playground','children paddling pool','two rafts','table tennis','toilets','changing rooms','food / kiosk','warm food','supervised in season'],highlights:['family','food','hours','supervised'],water:{temp:16},photos:PHOTO_BANK['meilen-dorf'],story:'Dorfmeilen is the proper village lake bath: lawn, rafts, warm food, playground and a direct right-bank Zürichsee feeling. It is the obvious local choice for a real summer badi day in Meilen rather than an anonymous shoreline stop.',parking:[{name:'Strandbad Dorfmeilen entrance parking',lat:47.2690,lon:8.6433,fee:'paid',congestion:'high'},{name:'Bahnhof Meilen parking',lat:47.2699,lon:8.6438,fee:'paid',congestion:'medium'}],transit:['Bahnhof Meilen','ZSG Meilen pier']},
{id:'meilen-feld',rankBoost:25,name:'Strandbad Feldmeilen',westernName:'Feldmeilen Lake Bath',cat:'bath',setting:'Outdoor',lat:47.2791,lon:8.6209,address:'Seestrasse 236, 8706 Meilen',website:'https://www.meilen.ch/strandbaeder/9953',phone:'+41795505424',operator:'Gemeinde Meilen',price:{currency:'CHF',adult:null},hours:'Pre/post-season 2026: Mon 11:00-19:00, Tue-Sun 10:00-19:00. Main season 2026: Mon 11:00-20:00, Tue-Sun 09:00-20:00, weather permitting.',season:'1 May-14 September 2026, with main season 6 June-16 August 2026.',facilities:['lake access','diving tower','log in water','separate non-swimmer lake area','toilets','changing rooms','food / kiosk','warm food','supervised in season'],highlights:['family','food','hours','supervised'],water:{temp:16},photos:PHOTO_BANK['meilen-feld'],story:'Feldmeilen is the sportier Meilen lakeside option: a diving tower, a marked non-swimmer area and the same municipal season logic. It is a very different place from Ländeli and should not be merged with it.',parking:[{name:'Feldmeilen lakeside parking',lat:47.2790,lon:8.6214,fee:'paid',congestion:'medium'},{name:'Bahnhof Feldmeilen parking',lat:47.2799,lon:8.6192,fee:'paid',congestion:'medium'}],transit:['Bahnhof Feldmeilen','Bus Meilen Schulhaus Feld']},
{id:'meilen-laendeli',rankBoost:24,name:'Badeanlage Ländeli',westernName:'Dolliker Ländeli Bathing Area',cat:'bath',setting:'Outdoor',lat:47.2620,lon:8.6660,address:'Seestrasse 950, 8706 Meilen',website:'https://www.meilen.ch/strandbaeder/9953',phone:'+41449235723',operator:'Gemeinde Meilen',free:true,price:{currency:'CHF',adult:0,child:0},hours:'Freely accessible; changing rooms and WC open during the municipal bathing season in good weather.',season:'1 May-14 September 2026 season signal from Gemeinde Meilen; no lifeguard at Ländeli.',facilities:['lake access','lawn','toilets','changing rooms','kiosk area','playground nearby','no lifeguard'],highlights:['free','family','hours'],water:{temp:16},photos:PHOTO_BANK['meilen-laendeli'],story:'Ländeli is a simple Obermeilen/Dollikon lakeside bathing area, not Steinrad and not a city badi. It is best for a short local dip, with free access and a clear operator warning that swimming and use are at your own risk.',parking:[{name:'Ländeli parking by Seestrasse',lat:47.2622,lon:8.6656,fee:'free / limited',congestion:'medium'},{name:'Obermeilen local parking',lat:47.2640,lon:8.6608,fee:'paid',congestion:'medium'}],transit:['Bus Obermeilen / Dollikon','Bahnhof Meilen plus bus']},
{id:'herrliberg-steinrad',rankBoost:18,name:'Badeanlage Steinrad',westernName:'Steinrad Lake Bath Herrliberg',cat:'bath',setting:'Outdoor',lat:47.29141,lon:8.60101,address:'Seestrasse / Steinradstrasse, 8704 Herrliberg',website:'https://www.herrliberg.ch/leben/freizeit/freizeitanlagen/badeanlage-steinrad.html/240',phone:'+41449159141',operator:'Gemeinde Herrliberg',price:{currency:'CHF',adult:null},hours:'Herrliberg summer facility; municipal page and operator notices apply.',season:'Summer lake-bath season; resident/access rules must be checked before travel.',facilities:['lake access','terraced lawn','changing rooms','toilets','springboard signal','local residential bath'],highlights:['hours'],water:{temp:16},photos:PHOTO_BANK['herrliberg-steinrad'],story:'Steinrad is Herrliberg’s lake bathing area north-west of Meilen. It must stay separate from Ländeli: different municipality, different coordinates, different access expectations and a much more local Herrliberg character.',parking:[{name:'Steinrad local parking',lat:47.2918,lon:8.6014,fee:'limited / check local signs',congestion:'high'},{name:'Herrliberg-Feldmeilen station parking',lat:47.2928,lon:8.6065,fee:'paid',congestion:'medium'}],transit:['Bahnhof Herrliberg-Feldmeilen','Bus Herrliberg lakeside']},
{id:'meilen-uetikon',rankBoost:12,name:'Strandbad Uetikon am See',westernName:'Uetikon Lake Bath',cat:'bath',setting:'Outdoor',lat:47.2630,lon:8.6825,address:'Uetikon am See lakefront',operator:'Gemeinde Uetikon am See',price:{currency:'CHF',adult:null},hours:'Seasonal lake-bath operation; check operator page.',season:'Summer lake-bath season.',facilities:['lake access','toilets','changing rooms','food / kiosk','family'],highlights:['family','food'],water:{temp:16},photos:['https://www.immoman.ch/custom/immoman/upload/pic/t5t9j4bkc1k3s3hjzl9t_8x0y2_DSC_3807.jpg','https://www.immoman.ch/custom/immoman/upload/pic/ede225b863z9b1whvezq_fqbzo_20170510_86-ME.jpg','https://www.immoman.ch/custom/immoman/upload/pic/crih27s3587d3f3kko8d_6v564_20170128_2.jpg'],story:'Uetikon extends the right-bank search east of Meilen and is useful when Meilen’s closest lake baths are busy or you are already moving toward Männedorf and Stäfa.',parking:[{name:'Uetikon lakeside parking',lat:47.2632,lon:8.6822,fee:'paid',congestion:'medium'}],transit:['Bahnhof Uetikon am See']},
{id:'meilen-maennedorf',rankBoost:11,name:'Strandbad Männedorf',westernName:'Männedorf Lake Bath',cat:'bath',setting:'Outdoor',lat:47.2568,lon:8.6990,address:'Männedorf lakefront',operator:'Gemeinde Männedorf',price:{currency:'CHF',adult:null},hours:'Seasonal lake-bath operation; check operator hours.',season:'Summer lake-bath season.',facilities:['lake access','toilets','changing rooms','food / kiosk','family'],highlights:['family','food'],water:{temp:16},photos:[FILE('Männedorf - Zürichsee 2011-09-10 18-10-16.JPG'),FILE('Männedorf Zürichsee.jpg'),FILE('Zürichsee Männedorf.jpg')],story:'Männedorf stretches the search south along the same shore. It is a sensible alternative when Meilen options are full or when you want a quieter village-lake atmosphere with rail access.',parking:[{name:'Männedorf lakeside parking',lat:47.2572,lon:8.6974,fee:'paid',congestion:'medium'}],transit:['Bahnhof Männedorf']},
{id:'meilen-kuesnacht',rankBoost:10,name:'Strandbad Küsnacht',westernName:'Küsnacht Lake Bath',cat:'bath',setting:'Outdoor',lat:47.3193,lon:8.5848,address:'Küsnacht lakefront',operator:'Gemeinde Küsnacht',price:{currency:'CHF',adult:null},hours:'Seasonal lake-bath operation; check operator hours.',season:'Summer lake-bath season.',facilities:['lake access','toilets','changing rooms','food / kiosk','family'],highlights:['family','food'],water:{temp:16},photos:[FILE('Küsnacht ZH Zürichsee.jpg'),FILE('Küsnacht - Zürichsee.jpg'),FILE('Zürichsee bei Küsnacht.jpg')],story:'Küsnacht brings the search closer to Zürich while staying on the right bank. It is relevant when you want a suburban lake bath rather than crossing the city.',parking:[{name:'Küsnacht lakeside parking',lat:47.3196,lon:8.5841,fee:'paid',congestion:'medium'}],transit:['Bahnhof Küsnacht ZH']},
{id:'meilen-staefa',rankBoost:10,name:'Seebad Stäfa',westernName:'Stäfa Lake Bath',cat:'bath',setting:'Outdoor',lat:47.2407,lon:8.7200,address:'Stäfa lakefront',operator:'Gemeinde Stäfa',price:{currency:'CHF',adult:null},hours:'Seasonal lake-bath operation; check operator hours.',season:'Summer lake-bath season.',facilities:['lake access','toilets','changing rooms','food / kiosk','family'],highlights:['family','food'],water:{temp:16},photos:[FILE('Stäfa Zürichsee.jpg'),FILE('Zürichsee Stäfa.jpg'),FILE('Stäfa Strandbad.jpg')],story:'Stäfa is a wider right-bank alternative when you are already beyond Meilen or want a village-lake stop farther down the shore.',parking:[{name:'Stäfa lakeside parking',lat:47.2412,lon:8.7188,fee:'paid',congestion:'medium'}],transit:['Bahnhof Stäfa']}
]},{key:'rhodes',aliases:['rhodes','rodos','rhodes greece','ρόδος'],label:'Rhodes Town and nearby beaches, Greece',center:[36.4442,28.2276],radius:24,venues:[
{id:'rh-elli',name:'Elli Beach',cat:'beach',setting:'Outdoor',lat:36.4521,lon:28.2251,address:'Rhodes Town waterfront',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; organised services vary by season.',season:'Main beach season May to October; busiest July and August.',facilities:['toilets','food','showers','family','supervised'],highlights:['free','food','family','supervised'],water:{temp:24},photos:[FILE('Aerial view of Elli Beach and Akti Miaouli Beach, Rhodes, Greece (51698848208).jpg'),FILE('Symi passing Elli Beach in Rhodes 27 August 2017.jpg'),FILE('Viking Sky passing Elli Beach Rhodes 5 September 2023.jpg')],story:'A central Rhodes Town beach with fast access, clear water and a lively promenade. It works when you want a swim close to hotels, cafés and the old town rather than a remote cove.',parking:[{name:'Rhodes town seafront parking',lat:36.4537,lon:28.2216,fee:'paid',congestion:'high'},{name:'Mandraki harbour parking area',lat:36.4510,lon:28.2260,fee:'paid',congestion:'high'}],transit:['Rhodes town bus stops','Walkable from Mandraki']},
{id:'rh-anthony',name:'Anthony Quinn Bay',cat:'beach',setting:'Outdoor',lat:36.3208,lon:28.2084,address:'near Faliraki, Rhodes',free:true,price:{currency:'EUR',adult:0},hours:'Natural bay; seasonal beach services.',season:'Best late spring to early autumn.',facilities:['food','parking','snorkeling'],highlights:['free','scenic'],water:{temp:24},photos:[FILE('Anthony Quinn Beach Anthony Quinn Bay Rhodes 31 August 2024.jpg'),FILE('Anthony Quinn Beach East Side Anthony Quinn Bay Rhodes 31 August 2024.jpg'),FILE('AnthonyQuinnBay.jpg')],story:'A compact rocky bay with a postcard look and clear water. Come for scenery and snorkelling rather than lots of sand or space; the bay can feel busy because it is small.',parking:[{name:'Anthony Quinn Bay parking',lat:36.3228,lon:28.2077,fee:'paid',congestion:'high'},{name:'Ladiko bay parking',lat:36.3204,lon:28.2049,fee:'paid',congestion:'medium'}],transit:['Faliraki bus/taxi connection']},
{id:'rh-faliraki',name:'Faliraki Beach',cat:'beach',setting:'Outdoor',lat:36.3390,lon:28.2065,address:'Faliraki, Rhodes',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; managed sections and watersports are seasonal.',season:'Long summer season with peak pressure in July and August.',facilities:['toilets','food','showers','watersports','family'],highlights:['free','food','family'],water:{temp:24},photos:[FILE('Rhodos, Faliraki, beach - panoramio.jpg'),FILE('Greece Rhodes Faliraki - panoramio (17).jpg'),FILE('Greece Rhodes Faliraki - panoramio (18).jpg')],story:'A long resort beach with simple logistics: food, watersports, sunbeds and room to choose a section. Reliable for families and groups, less special for quiet-cove seekers.',parking:[{name:'Faliraki beach parking',lat:36.3387,lon:28.2036,fee:'paid',congestion:'medium'},{name:'Faliraki centre parking',lat:36.3398,lon:28.2012,fee:'paid',congestion:'medium'}],transit:['Rhodes-Faliraki bus corridor']},
{id:'rh-kallithea',name:'Kallithea Springs',cat:'thermal',setting:'Outdoor',lat:36.3781,lon:28.2380,address:'Kallithea, Rhodes',price:{currency:'EUR',adult:5},hours:'Managed historic spring/beach complex; daily hours depend on operator season.',season:'Seasonal visitor complex; summer is the main operating period.',facilities:['toilets','food','showers','historic','family'],highlights:['food','scenic','hours'],water:{temp:24},photos:[FILE('Kallithea Springs, Rhodes-8086479971.jpg'),FILE('Kallithea Springs-8086595789.jpg'),FILE('Rhodos, Kallithea Springs 01.jpg')],story:'A polished coastal complex around restored spring architecture and small bathing coves. Choose it for atmosphere, photos and facilities rather than a wild-beach feeling.',parking:[{name:'Kallithea Springs parking',lat:36.3793,lon:28.2349,fee:'paid',congestion:'medium'}],transit:['Rhodes-Kallithea-Faliraki road/bus corridor']} 
]},{key:'miami',aliases:['miami','miami beach','south beach','south beach miami','miami florida','key biscayne'],label:'Miami Beach and Key Biscayne, United States',center:[25.7907,-80.1300],radius:18,venues:[
{id:'miami-south',rankBoost:22,name:'South Beach',westernName:'South Beach Miami',cat:'beach',setting:'Outdoor',lat:25.7826,lon:-80.1302,address:'Ocean Drive, Miami Beach, FL',free:true,price:{currency:'USD',adult:0},hours:'Open beach; lifeguard and service hours vary by section and season.',season:'Year-round beach use; strongest from winter through spring, hot and storm-prone in summer.',facilities:['sandy beach','toilets','showers','food / kiosk','lifeguard sections','promenade','family'],highlights:['free','food','supervised','family'],water:{temp:26},photos:PHOTO_BANK['miami-south'],story:'The signature Miami swim: a wide Atlantic beach backed by Ocean Drive, palms, cafés and Art Deco streets. Use it for the full visitor impression, but check wind, flags, heat and parking before committing.',parking:[{name:'7th Street Garage',lat:25.7786,lon:-80.1324,fee:'paid',congestion:'high'},{name:'13th Street Garage',lat:25.7852,lon:-80.1326,fee:'paid',congestion:'high'}],transit:['Miami Beach trolley','Washington Avenue bus corridor']},
{id:'miami-lummus',rankBoost:20,name:'Lummus Park Beach',westernName:'Lummus Park, Miami Beach',cat:'beach',setting:'Outdoor',lat:25.7807,lon:-80.1304,address:'5th to 14th Street, Miami Beach, FL',free:true,price:{currency:'USD',adult:0},hours:'Open beachfront park and beach; services and lifeguards vary by block.',season:'Year-round beach and promenade use.',facilities:['sandy beach','toilets','food / kiosk','promenade','playground nearby','fitness area','family'],highlights:['free','food','family'],water:{temp:26},photos:PHOTO_BANK['miami-lummus'],story:'The easiest Miami Beach card for visitors: sand, promenade, volleyball/fitness energy and Ocean Drive one block away. It is not secluded, but it is simple, photogenic and practical.',parking:[{name:'7th Street Garage',lat:25.7786,lon:-80.1324,fee:'paid',congestion:'high'},{name:'12th Street municipal garage',lat:25.7844,lon:-80.1331,fee:'paid',congestion:'high'}],transit:['Miami Beach trolley','South Beach local buses']},
{id:'miami-virginia',rankBoost:16,name:'Historic Virginia Key Beach Park',westernName:'Virginia Key Beach',cat:'beach',setting:'Outdoor',lat:25.7384,lon:-80.1577,address:'Virginia Key, Miami, FL',free:false,price:{currency:'USD',adult:null},hours:'Park beach operation; entry, gates and facilities depend on park schedule.',season:'Year-round coastal park; storms, events and heat affect comfort.',facilities:['sandy beach','toilets','food / kiosk seasonal','parking','family','historic park'],highlights:['family','food'],water:{temp:26},photos:PHOTO_BANK['miami-virginia'],story:'A more local-feeling barrier-island beach between Miami and Key Biscayne. Choose it when you want palms, park context and a slower trip than South Beach, with parking and gate hours checked before departure.',parking:[{name:'Virginia Key Beach Park parking',lat:25.7386,lon:-80.1570,fee:'paid',congestion:'medium'}],transit:['Rickenbacker Causeway bus/taxi/rideshare']},
{id:'miami-crandon',rankBoost:15,name:'Crandon Park Beach',westernName:'Crandon Beach, Key Biscayne',cat:'beach',setting:'Outdoor',lat:25.7140,lon:-80.1544,address:'Key Biscayne, FL',free:false,price:{currency:'USD',adult:null},hours:'County park beach operation; parking and services depend on park hours.',season:'Year-round; best outside the hottest stormiest summer hours.',facilities:['sandy beach','toilets','showers','food / kiosk seasonal','family','parking','shade'],highlights:['family','food'],water:{temp:26},photos:PHOTO_BANK['miami-crandon'],story:'A broader Key Biscayne beach with park space, palms and a more relaxed family rhythm than South Beach. It works best for a longer stay when you want shade, space and planned parking.',parking:[{name:'Crandon Park Beach parking',lat:25.7148,lon:-80.1553,fee:'paid',congestion:'medium'}],transit:['Key Biscayne bus corridor']},
{id:'miami-haulover',rankBoost:12,name:'Haulover Beach Park',westernName:'Haulover Beach',cat:'beach',setting:'Outdoor',lat:25.9044,lon:-80.1226,address:'Collins Avenue, Miami Beach, FL',free:false,price:{currency:'USD',adult:null},hours:'Beach park operation; services and parking depend on county schedule.',season:'Year-round Atlantic beach; wind, surf and weekend pressure matter.',facilities:['sandy beach','toilets','showers','food / kiosk seasonal','parking','family sections'],highlights:['food','family'],water:{temp:26},photos:PHOTO_BANK['miami-haulover'],story:'A long Atlantic beach north of Miami Beach with a different feel from South Beach: more open, more drive-oriented and useful when you want space, surf and park facilities.',parking:[{name:'Haulover Beach parking',lat:25.9049,lon:-80.1238,fee:'paid',congestion:'high'}],transit:['Collins Avenue bus corridor']}

]},
{key:'rostock',aliases:['rostock','rostock germany','warnemünde','warnemunde','ostseebad warnemünde','markgrafenheide','hohe düne','hohe duene'],label:'Rostock and Baltic beaches',center:[54.0924,12.0991],radius:38,venues:[
{id:'ro-warnemuende',rankBoost:22,name:'Strand Warnemünde',westernName:'Warnemünde Beach',cat:'beach',setting:'Outdoor',lat:54.1813,lon:12.0794,address:'Seepromenade, Warnemünde, Rostock',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; beach-chair, lifeguard and service windows are seasonal.',season:'Baltic beach season, strongest from late spring through summer.',facilities:['sandy beach','toilets','food / kiosk','showers','family','supervised','accessible'],highlights:['free','family','food','supervised'],water:{temp:18},photos:[FILE('Warnemünde Strand.jpg'),FILE('Strand Warnemünde.JPG'),FILE('Warnemünde beach.jpg')],story:'The classic Rostock seaside choice: a broad Baltic beach beside the old fishing village, lighthouse, promenade and S-Bahn connection. Pick it when you want a proper holiday beach without leaving the city region.',parking:[{name:'Parkhaus Mittelmole Warnemünde',lat:54.1764,lon:12.0895,fee:'paid',congestion:'high'},{name:'Parkplatz Strand Warnemünde',lat:54.1797,lon:12.0753,fee:'paid',congestion:'high'}],transit:['S-Bahn Warnemünde','Warnemünde Werft']},
{id:'ro-hoheduene',rankBoost:15,name:'Strand Hohe Düne',westernName:'Hohe Düne Beach',cat:'beach',setting:'Outdoor',lat:54.1834,lon:12.1057,address:'Hohe Düne, Rostock',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; services depend on season and weather.',season:'Baltic summer beach season.',facilities:['sandy beach','food / kiosk','family','ferry nearby'],highlights:['free','family'],water:{temp:18},photos:[FILE('Hohe Düne Strand.jpg'),FILE('Rostock Hohe Düne Strand.jpg'),FILE('Hohe Düne beach.jpg')],story:'A calmer beach alternative across the Warnow from Warnemünde. It suits visitors who want Baltic sand, marina context and a slightly less central feel, with ferry logistics as part of the trip.',parking:[{name:'Hohe Düne marina parking',lat:54.1808,lon:12.1022,fee:'paid',congestion:'medium'}],transit:['Warnemünde-Hohe Düne ferry','Bus Hohe Düne']},
{id:'ro-markgrafenheide',rankBoost:14,name:'Strand Markgrafenheide',westernName:'Markgrafenheide Beach',cat:'beach',setting:'Outdoor',lat:54.1937,lon:12.1470,address:'Markgrafenheide, Rostock',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; seasonal services and lifeguard cover vary by section.',season:'Baltic summer season; busiest on hot weekends.',facilities:['sandy beach','toilets','food / kiosk','family','accessible sections'],highlights:['free','family','food'],water:{temp:18},photos:[FILE('Strand Markgrafenheide.jpg'),FILE('Markgrafenheide Strand.jpg'),FILE('Ostseebad Markgrafenheide.jpg')],story:'A wider, more nature-facing Rostock beach east of the river mouth. It is better for a full beach day and space than a quick city dip, but parking and summer traffic need planning.',parking:[{name:'Parkplatz Markgrafenheide Strand',lat:54.1936,lon:12.1455,fee:'paid',congestion:'high'},{name:'Parkplatz Markgrafenheide Ost',lat:54.1945,lon:12.1512,fee:'paid',congestion:'medium'}],transit:['Bus Markgrafenheide']},
{id:'ro-neptun',rankBoost:10,name:'Hallenschwimmbad Neptun',westernName:'Neptun Indoor Pool',cat:'pool',setting:'Indoor',lat:54.0877,lon:12.1113,address:'Kopernikusstraße 17, 18057 Rostock',website:'https://rathaus.rostock.de/de/kultur_freizeit_sport/sport/hallenschwimmbad/249778',phone:'+493813816850',operator:'Hanse- und Universitätsstadt Rostock',price:{currency:'EUR',adult:null},hours:'Municipal indoor-pool operation; public swimming times should be checked in the operator cache.',season:'Year-round indoor swimming facility.',facilities:['indoor pool','lanes','teaching pool','showers','toilets','changing rooms','supervised'],highlights:['supervised','hours'],water:{temp:27},photos:[FILE('Neptun Schwimmhalle Rostock.jpg'),FILE('Hallenschwimmbad Neptun Rostock.jpg'),FILE('Schwimmhalle Neptun Rostock.jpg')],story:'The reliable Rostock indoor option for training, laps and bad-weather swimming. It is not a holiday beach; it is the practical city pool when Baltic wind or cold water make the beach unattractive.',parking:[{name:'Neptun Schwimmhalle parking',lat:54.0879,lon:12.1105,fee:'paid',congestion:'medium'}],transit:['Rostock Parkstraße / Kopernikusstraße']}
]},
{key:'palma',aliases:['palma','palma de mallorca','mallorca','balearic'],label:'Palma de Mallorca, Balearic Islands',center:[39.57,2.65],radius:45,venues:[
{id:'pm-platja-palma',name:'Platja de Palma',westernName:'Palma Beach',cat:'beach',setting:'Outdoor',lat:39.522,lon:2.735,address:'Palma bay',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; services are seasonal.',season:'Main beach season May to October.',facilities:['toilets','food','showers','family'],highlights:['free','food','family'],water:{temp:22},photos:[FILE('Platja de Palma 1.jpg'),FILE('Mallorca Platja de Palma Strand (30178917243).jpg'),FILE('Beach of Palma de Mallorca.jpg')],story:'A long, practical beach strip east of Palma with food, hotels and transport close by. It is not hidden or wild; it is the reliable option when logistics matter.',parking:[{name:'Platja de Palma seafront parking',lat:39.5227,lon:2.7358,fee:'paid',congestion:'high'},{name:'Arenal area parking',lat:39.5056,lon:2.7500,fee:'paid',congestion:'high'}],transit:['EMT/Arenal bus corridor']},
{id:'pm-cala-major',name:'Cala Major',cat:'beach',setting:'Outdoor',lat:39.552,lon:2.604,address:'Palma west coast',free:true,price:{currency:'EUR',adult:0},hours:'Open beach; services seasonal.',season:'Main beach season spring to autumn.',facilities:['toilets','food','showers'],highlights:['free','food'],water:{temp:22},photos:[FILE('Cala Major (76720833).jpeg'),FILE('Cala Major (76720835).jpeg'),FILE('Cala Major de Sant Agustí.jpg')],story:'A compact urban cove west of Palma, useful when you want a real sea edge without leaving the city orbit. It can be busy, but the water impression is stronger than many hotel-pool alternatives.',parking:[{name:'Cala Major street parking',lat:39.5525,lon:2.6048,fee:'paid',congestion:'high'},{name:'Sant Agustí parking areas',lat:39.5480,lon:2.5980,fee:'paid',congestion:'medium'}],transit:['Palma west-coast bus stops']},
{id:'pm-son-hugo',name:'Piscinas Municipales de Son Hugo',westernName:'Son Hugo Municipal Pools',cat:'pool',setting:'Indoor + outdoor',lat:39.594,lon:2.653,address:'Camí de la Vileta, Palma',price:{currency:'EUR',adult:null},hours:'Municipal pool operation; exact lanes and public swim windows need operator cache.',season:'Year-round municipal complex with indoor and outdoor provision.',facilities:['lanes','showers','toilets','changing rooms','accessible','supervised'],highlights:['supervised','hours'],water:{temp:27},photos:[FILE('Piscina cubierta municipal de Son Hugo.jpg'),FILE('Piscinas Municipales de Son Hugo, Palma.jpg'),FILE('Palma Arena.JPG')],story:'The controlled Palma option: better when you need lanes, showers and predictable facilities rather than beach wind, jellyfish or parking uncertainty.',parking:[{name:'Son Hugo parking area',lat:39.5944,lon:2.6520,fee:'paid',congestion:'medium'},{name:'Palma Arena parking',lat:39.5932,lon:2.6549,fee:'paid',congestion:'medium'}],transit:['Palma municipal bus stops nearby']} ]}];
const state={center:null,mapCenter:[39,12],zoom:3,label:'',results:[],filter:'all',selected:null,move:false,parking:[],parkingCache:new Map(),parkingPrefetch:new Set(),parkingBusy:false,parkingTick:0,photoLocks:new Map(),weather:new Map(),mediaBusy:new Set(),mediaTimer:null,failedPhotos:new Set(),resultCache:new Map(),rankPhotoCache:new Map(),continuousTimer:null,continuousTick:0,rescueBusy:false,scanId:0,locationRequestId:0,lastSearchStarted:0,currentWeather:null,weatherBusy:false,lastOpenAt:0,renderIndex:new Map(),clickLockUntil:0};
const els={statusTitle:$('#statusTitle'),statusPct:$('#statusPct'),statusBar:$('#statusBar'),statusText:$('#statusText'),resultTitle:$('#resultTitle'),resultSub:$('#resultSub'),mapSub:$('#mapSub'),listNote:$('#listNote'),results:$('#results'),filters:$('#filters'),map:$('#map'),drawer:$('#drawer'),back:$('#back'),cardTitle:$('#cardTitle'),cardMeta:$('#cardMeta'),cardBody:$('#cardBody'),gate:$('#gate'),cookie:$('#cookie'),light:$('#light'),modal:$('#modal')};
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}function dist(a,b,c,d){const R=6371,to=x=>x*Math.PI/180;const A=to(c-a),B=to(d-b),x=Math.sin(A/2)**2+Math.cos(to(a))*Math.cos(to(c))*Math.sin(B/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}function fmt(d){return d<1?Math.round(d*1000)+' m':d.toFixed(d<10?1:0)+' km'}function usd(v,c){if(v==null)return 'pending';if(+v===0)return 'Free';const r={CHF:1.12,EUR:1.08,GBP:1.27,USD:1}[c]||1;return `${c} ${v} (~US$${Math.round(v*r)})`}
function progress(t,p,txt){els.statusTitle.textContent=t;els.statusPct.textContent=Math.round(p)+'%';els.statusBar.style.width=Math.max(4,Math.min(100,p))+'%';els.statusText.textContent=txt||''}
function cat(v){return v.cat||'bath'}function catClass(v){return cat(v)}function catIcon(v){return {beach:'🏝',pool:'▦',thermal:'♨',wild:'≈',bath:'≈'}[cat(v)]||'≈'}
function hasNonLatin(s){return /[^\u0000-\u024f]/.test(String(s||''))}
const GREEK={α:'a',β:'v',γ:'g',δ:'d',ε:'e',ζ:'z',η:'i',θ:'th',ι:'i',κ:'k',λ:'l',μ:'m',ν:'n',ξ:'x',ο:'o',π:'p',ρ:'r',σ:'s',ς:'s',τ:'t',υ:'y',φ:'f',χ:'ch',ψ:'ps',ω:'o',ά:'a',έ:'e',ή:'i',ί:'i',ό:'o',ύ:'y',ώ:'o',ϊ:'i',ΐ:'i',ϋ:'y',ΰ:'y'};
function translitGreek(s){let out='';s=String(s||'').toLowerCase().replace(/ο[υύ]/g,'ou').replace(/α[ιί]/g,'ai').replace(/ε[ιί]/g,'ei').replace(/ο[ιί]/g,'oi').replace(/α[υύ]/g,'av').replace(/ε[υύ]/g,'ev').replace(/(^|\s)μπ/g,'$1b').replace(/μπ/g,'mb').replace(/(^|\s)ντ/g,'$1d').replace(/ντ/g,'nd').replace(/γκ/g,'g').replace(/γγ/g,'ng');for(const ch of s){const low=ch.toLowerCase();out+=GREEK[low]!==undefined?GREEK[low]:ch}return out.replace(/\s+/g,' ').trim().replace(/\bParalia\b/i,'Beach').replace(/\bAkti\b/i,'Coast')}
function titleCaseLite(s){return String(s||'').replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase())}
function westernizeName(name,t={},c=''){
 if(t['name:en']&&norm(t['name:en'])!==norm(name))return t['name:en'];
 if(t.int_name&&norm(t.int_name)!==norm(name))return t.int_name;
 if(t['name:latin']&&norm(t['name:latin'])!==norm(name))return t['name:latin'];
 if(hasNonLatin(name)){let g=titleCaseLite(translitGreek(name));const m=g.match(/^(Beach|Coast)\s+(.+)$/);if(m)g=m[2]+' '+m[1];return dmGloss(g)||g}
 return dmGloss(name)
}
function setting(v){return v.setting||((v.cat==='beach'||v.cat==='wild')?'Outdoor':'')}function isIndoor(v){return /indoor|hallenbad|cubierta|coberta/i.test(setting(v)+' '+(v.name||''))}function isOutdoor(v){return /outdoor|beach|strand|cala|lido|open/i.test(setting(v)+' '+(v.name||''))||v.cat==='beach'||v.cat==='wild'}
function quietScore(v){
 const now=new Date(),h=now.getHours(),day=now.getDay();let q=42;
 const w=state.currentWeather||{};const rainProb=Number(w.rainProb||0),rainMm=Number(w.rainMm||0),wind=Number(w.wind||0),code=Number(w.code||0);
 const rainy=rainProb>=45||rainMm>0.1||[51,53,55,61,63,65,80,81,82,95,96,99].includes(code);
 if(rainy&&isOutdoor(v))q+=34; if(rainy&&isIndoor(v))q-=8;
 if(wind>=22&&isOutdoor(v))q+=10;
 if(h<10||h>=19)q+=18; else if(h>=12&&h<=16)q-=18;
 /* v23.7: outside the bathing season outdoor spots are quiet (northern and southern summers; not in the tropics) */ try{var _la=Number(v.lat||(state.center&&state.center[0])||0),_mo=now.getMonth();if(_la<0)_mo=(_mo+6)%12;if(Math.abs(_la)>=23&&isOutdoor(v)&&(_mo<4||_mo>8))q+=34}catch(e){}
 if(day===0||day===6)q-=10;
 if(v.free||v.price?.adult===0)q-=6;
 if(v.highlights?.includes('quiet'))q+=22;
 if(v.highlights?.includes('family'))q-=4;
 if(v.highlights?.includes('supervised'))q-=3;
 if((v.parking||[]).some(p=>/high/i.test(p.congestion||'')))q-=8;
 if((v.distance||0)>8)q+=4;
 return Math.max(0,Math.min(100,Math.round(q)))
}
function isQuietNow(v){return quietScore(v)>=58}
function quietText(){const w=state.currentWeather||{};const rainy=Number(w.rainProb||0)>=45||Number(w.rainMm||0)>0.1||[51,53,55,61,63,65,80,81,82,95,96,99].includes(Number(w.code||0));return rainy?'rainy weather model':'time and crowd model'}
const MEILEN_SEEDS=[
 {id:'seed-strandbad-dorfmeilen',name:'Strandbad Dorfmeilen',lat:47.2698,lon:8.6452,cat:'bath',address:'Seestrasse 720, 8706 Meilen',free:false,price:{adult:8},water:{temp:null},facilities:['Lawn','Kiosk','Restaurant','Toilets','Beach volleyball','Table tennis','Children\u2019s paddling pool','Water slide','Playground','Kneipp pool','Parking','Showers'],highlights:['family','supervised'],hours:'May\u2013Sep',source:'meilen.ch'},
 {id:'seed-strandbad-feldmeilen',name:'Strandbad Feldmeilen',lat:47.2775,lon:8.6320,cat:'bath',address:'Seestrasse 236, 8706 Meilen',free:false,price:{adult:8},water:{temp:null},facilities:['3 m diving board','Non-swimmer area','Restaurant','Toilets','Lawn','Showers'],highlights:['family'],hours:'May\u2013Sep',source:'meilen.ch'}
];
function seedMeilen(){try{if(!state.center)return;if(dist(state.center[0],state.center[1],47.2706,8.6437)>10)return;if(state.results.some(v=>v.id==='seed-strandbad-dorfmeilen'))return;merge(MEILEN_SEEDS);}catch(e){}}
function renderWeatherWarn(warn){try{var mp=document.getElementById('map');if(!mp)return;var el=mp.querySelector('.dmWeatherWarn');if(!warn){if(el)el.remove();return;}if(!el){el=document.createElement('div');el.className='dmWeatherWarn';mp.appendChild(el);}el.innerHTML='<span class="dmwIcon">'+warn.icon+'</span><span class="dmwTxt"><b>'+warn.label+'</b>from '+warn.time+'</span>';}catch(e){}}
async function loadCurrentWeather(scanId=state.scanId){
 if(!state.center||state.weatherBusy)return;state.weatherBusy=true;const [lat,lon]=state.center;
 try{const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(5)}&longitude=${lon.toFixed(5)}&current=temperature_2m,rain,precipitation,weather_code,wind_speed_10m&hourly=precipitation,weather_code,wind_speed_10m&daily=precipitation_probability_max,sunrise,sunset&forecast_days=1&timezone=auto`;const j=await fetchJsonTimeout(url,{},3600);if(scanId!==state.scanId)return;state.currentWeather={temp:j.current?.temperature_2m,rainMm:(j.current?.rain??j.current?.precipitation??0),rainProb:j.daily?.precipitation_probability_max?.[0]??0,wind:j.current?.wind_speed_10m??0,code:j.current?.weather_code??0};try{var H=j.hourly;if(H&&H.time){var now=Date.now(),warn=null;for(var k=0;k<H.time.length;k++){var tt=new Date(H.time[k]).getTime();if(tt<now-3600000)continue;if(tt>now+12*3600000)break;var cd=(H.weather_code&&H.weather_code[k])||0,pr=(H.precipitation&&H.precipitation[k])||0,wd=(H.wind_speed_10m&&H.wind_speed_10m[k])||0,ic=null,lb=null;if(cd>=95){ic='⛈️';lb='Thunderstorm';}else if(pr>=2.5||(cd>=80&&cd<=82)){ic='🌧️';lb='Heavy rain';}else if(wd>=35){ic='💨';lb='Strong wind';}if(ic){var dd=new Date(H.time[k]);warn={icon:ic,label:lb,time:('0'+dd.getHours()).slice(-2)+':00'};break;}}state.weatherWarn=warn;renderWeatherWarn(warn);}}catch(e){}try{state.sun={rise:j.daily&&j.daily.sunrise&&j.daily.sunrise[0],set:j.daily&&j.daily.sunset&&j.daily.sunset[0]};renderGoldenHour();}catch(e){}sortResults();render();drawMap()}catch(e){}finally{state.weatherBusy=false}
}
function dmWestern(v){var w=String(v.westernName||'').replace(/\s*\(\s*\)/g,'').replace(/\s{2,}/g,' ').trim();return w&&norm(w)!==norm(v.name)&&norm(w)!==norm(String(v.name).replace(/\s*\([^)]*\)/g,''))?w:''}function displayName(v){var w=dmWestern(v);return esc(v.name)+(w?` <span class="western">· ${esc(w)}</span>`:'')}function plainName(v){var w=dmWestern(v);return v.name+(w?` · ${w}`:'')}
function effKm(v){return (v.driveKm!=null?v.driveKm:(v.distance||0)*1.25)}
async function fetchTravelTimes(){try{
 if(!state.center)return;const list=filtered().slice(0,40);if(!list.length)return;
 const key=state.center.join(',')+'|'+list.map(v=>v.id).join(',');
 if(state._travelKey===key)return;state._travelKey=key;
 const coords=[state.center[1]+','+state.center[0]].concat(list.map(v=>v.lon+','+v.lat)).join(';');
 const eps=['https://router.project-osrm.org/table/v1/driving/','https://routing.openstreetmap.de/routed-car/table/v1/driving/'];
 let j=null;
 for(const ep of eps){try{const r=await fetchJsonTimeout(ep+coords+'?sources=0&annotations=duration,distance',{},9000);if(r&&r.code==='Ok'){j=r;break}}catch(e){}}
 if(!j)return;
 const dur=(j.durations||[])[0]||[],dst=(j.distances||[])[0]||[];
 list.forEach((v,i)=>{const d=dur[i+1],m=dst[i+1];
  if(d!=null&&isFinite(d))v.driveMin=Math.max(1,Math.round(d/60));
  if(m!=null&&isFinite(m)){v.driveKm=m/1000;if((v.distance||0)>0.3)v.detour=v.driveKm/v.distance}});
 sortResults();render();drawMap();
}catch(e){}}
function score(v){let s=100-Math.min(55,effKm(v)*6);if(v.free||v.price?.adult===0)s+=12;if(v.photos?.length>=3)s+=7;if(v.hours)s+=5;if(v.highlights?.includes('supervised'))s+=7;if(v.highlights?.includes('family'))s+=5;if(v.facilities?.some(f=>/toilet|wc/i.test(f)))s+=3;if(v.facilities?.some(f=>/food|kiosk/i.test(f)))s+=3;if(v.water?.temp)s+=2;if(v.detour>=1.8)s-=12;if(v.detour>=3)s-=10;if(v.driveMin>=35)s-=8;return s+(v.rankBoost||0)}
function enrich(v){return {...v,distance:state.center?dist(state.center[0],state.center[1],v.lat,v.lon):0,score:0}}
function reject(v){return BAD.test(norm(v.name+' '+(v.address||'')+' '+(v.facilities||[]).join(' ')))}
function sortResults(){state.results.forEach(v=>{v.distance=state.center?dist(state.center[0],state.center[1],v.lat,v.lon):v.distance;v.quiet=isQuietNow(v);v.quietScore=quietScore(v);v.score=score(v)+(v.quiet?3:0)});const m=$('#sort').value;state.results.sort((a,b)=>m==='fast'?(((a.driveMin==null?1e6:a.driveMin)-(b.driveMin==null?1e6:b.driveMin))||effKm(a)-effKm(b)):m==='distance'?effKm(a)-effKm(b):m==='free'?(Number(!!b.free)-Number(!!a.free)||a.distance-b.distance):m==='quiet'?((b.quietScore||0)-(a.quietScore||0)||a.distance-b.distance):b.score-a.score)}
function nameOverlap(a,b){const A=new Set(String(a).split(/\s+/).filter(w=>w.length>2)),B=new Set(String(b).split(/\s+/).filter(w=>w.length>2));if(!A.size||!B.size)return 0;let hit=0;A.forEach(w=>{if(B.has(w))hit++});return hit/Math.min(A.size,B.size)}
function venueRichness(v){return (v.website?3:0)+(v.wikidata?2:0)+((v.photos&&v.photos.length)||0)+(((v.facilities&&v.facilities.length)||0)*0.5)+(v.hours?1:0)+(v.address?1:0)+(v.rankBoost?2:0)}
function sameSpot(v,w){const m=dist(v.lat,v.lon,w.lat,w.lon)*1000;if(m>150)return false;const a=norm(plainName(v)),b=norm(plainName(w));
 if(a===b)return true; if(a.includes(b)||b.includes(a))return true; if(nameOverlap(a,b)>=0.5)return true;
 return m<=30&&cat(v)===cat(w)}
function dedupeNearby(list){const out=[];
 for(const v of list){let hit=null;
  for(const w of out){if(sameSpot(v,w)){hit=w;break}}
  if(hit){if(venueRichness(v)>venueRichness(hit)){const keepId=hit.id;Object.assign(hit,v);hit.id=keepId}continue}
  out.push(v)}
 return out}
function merge(items){const by=new Map(state.results.map(v=>[v.id,v]));for(const x of items||[]){if(reject(x))continue;const v=enrich(x);const key=v.id||norm(v.name)+'-'+v.lat.toFixed(3);by.set(key,{...by.get(key),...v,id:key})}state.results=dedupeNearby([...by.values()]);sortResults();cacheCurrentResults();render();prefetchParkingSoon('merge');prefetchMediaSoon('merge');seedMeilen()}
function filtered(){
 if(state.filter==='quiet')return state.results.slice().sort((a,b)=>(quietScore(b)-quietScore(a))||a.distance-b.distance).slice(0,45);
 return state.results.filter(v=>{
  const f=state.filter;
  if(f==='all')return true;
  if(f==='opennow')return !!v.hours;
  if(f==='free')return !!(v.free||v.price?.adult===0);
  if(f==='hours')return !!v.hours;
  if(f==='parking')return parkingFor(v).length>0;
  if(f==='family')return !!(v.highlights||[]).includes('family');
  if(f==='supervised')return !!(v.highlights||[]).includes('supervised');
  if(f==='women')return !!(v.highlights||[]).includes('women-friendly');
  if(f==='food')return !!(v.facilities||[]).some(x=>/food|kiosk|bistro|café|cafe|restaurant/i.test(x));
  if(f==='wc')return !!(v.facilities||[]).some(x=>/toilet|wc/i.test(x));
  if(f==='accessible')return !!(v.facilities||[]).some(x=>/access|wheelchair|lift|barrier/i.test(x));
  if(f==='sauna')return !!(v.facilities||[]).some(x=>/sauna|steam|thermal/i.test(x));
  if(f==='waterok'){var _wt=dmDisplayWaterTemp(v);return !!(_wt&&_wt.c>=18);}
  if(f==='indoor')return isIndoor(v);
  if(f==='outdoor')return isOutdoor(v);
  return f===cat(v);
 }).slice(0,45)
}
function photoTitle(u){try{var raw=String((u&&u.url)||u||'').split('?')[0];raw=raw.indexOf('/Special:FilePath/')>=0?raw.split('/Special:FilePath/').pop():raw.split('/').pop();raw=raw.replace(/^\d+px-/,'');return decodeURIComponent(raw).replace(/_/g,' ')}catch(e){return String((u&&u.url)||u||'')}}
function photoKey(u){let t=norm(photoTitle(u));return t.replace(/\.(jpe?g|png|webp|tiff?|svg)$/,'').replace(/\b(20\d\d|19\d\d|img|jpg|jpeg|png|shiftn|p7000|p7700|dsc|zuerich|zurich|zürich|see|lake|bad|badi|seebad|strandbad|hallenbad|freibad)\b/g,'').replace(/\d+/g,'').replace(/\s+/g,' ').trim()||norm(photoTitle(u))}
function photoFingerprint(u){return norm(photoTitle(u)).replace(/\.(jpe?g|png|webp|tiff?|svg)$/,'').replace(/\b(\d{4}[-_ ]?\d{2}[-_ ]?\d{2}|\d{2}[-_ ]?\d{2}[-_ ]?\d{2}|img|dsc|p\d+|shiftn|renoviert|cropped|copy|view|ansicht|von|der|die|das|zuerich|zurich|zürich|switzerland|schweiz)\b/g,'').replace(/\b\d+\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().slice(0,54)}
function areaKey(v){const t=norm([state.label,v.name,v.address].join(' '));if(t.includes('meilen')||t.includes('dorfmeilen')||t.includes('feldmeilen')||t.includes('herrliberg'))return 'meilen';if(t.includes('rostock')||t.includes('warnem')||t.includes('markgrafenheide')||t.includes('hohe düne')||t.includes('hohe duene'))return 'rostock';if(t.includes('rhodes')||t.includes('faliraki'))return 'rhodes';if(t.includes('miami')||t.includes('south beach')||t.includes('key biscayne'))return 'miami';if(t.includes('palma')||t.includes('mallorca'))return 'palma';if(t.includes('zurich')||t.includes('zürich')||t.includes('zürichsee'))return 'zurich';return 'generic'}
const PHOTO_HIST=/\b1[6-9]\d\d\b|\b(historisch|historic|historical|postcard|ansichtskarte|postkarte|lithograf|lithograph|stich|engraving|gemaelde|painting|zeichnung|drawing|grundriss|schwarzweiss|black.and.white|archiv|archive|eth.bib|baugeschichtliches|stadtarchiv|landesarchiv|bundesarchiv|fotostiftung|glasplatte|negativ|anno|vintage)\b/i;
const PHOTO_CAT_BLOCK=/(black.and.white|black-and-white|historical|history of|postcards|engravings|lithographs|maps of|old photographs|paintings|drawings|18\d0s|19[0-8]0s)/i;
const PHOTO_BLOCK=/\b(svg|logo|flag|wappen|coat|arms|map|karte|plan|diagram|sketch|drawing|scan|document|poster|sign|schild|geobasis|mural|wandbild|painting|kunst|memorial|statue|church|station|airport|hotel|restaurant|ship|boat|ferry|cruise|aerial|panorama|skyline|coast\s*guard|uscg|customs|migrant|refugee|police|arrest|rescue|body|corpse|storm\s*damage|garbage|trash|plastic|oil|port|cargo|container|military|border|mosque|minaret|temple|synagogue|cathedral)\b/i;
const WATER_CONTEXT=/\b(seebad|strandbad|flussbad|badi|bad|bath|beach|strand|ufer|quai|lake|see|zuerichsee|zürichsee|limmat|river|cala|bay|plage|playa|praia|spiaggia|platja|waterfront|promenade)\b/i;
const POOL_CONTEXT=/\b(hallenbad|freibad|swimming pool|pool|piscina|bad city|schwimmanlage|sportzentrum|letzigraben|heuried|seebach|auhof|altstetten|oerlikon|allenmoos)\b/i;
function strongPhotoTokens(v){return norm([v.name,v.westernName,v.address].join(' ')).split(/[^a-z0-9]+/).filter(t=>t.length>3&&!/^(zurich|zuerich|zürich|switzerland|schweiz|stadt|city|pool|swimming|indoor|outdoor|bath|bad|badi|seebad|strandbad|flussbad|freibad|hallenbad|street|strasse|platz|quai|lake|river|beach)$/.test(t))}
function photoConfidence(v,u,source){const t=photoTitle(u),n=norm(t),tokens=strongPhotoTokens(v);const bank=PHOTO_BANK[v.id]||[];const exact=bank.some(x=>photoKey(x)===photoKey(u))||tokens.some(tok=>n.includes(tok));if(/\.(svg|tiff?|pdf|webm|ogv)$/i.test(t))return 0;if(PHOTO_BLOCK.test(t)&&!exact)return 0;if(cat(v)==='pool'&&isIndoor(v)&&!exact&&!POOL_CONTEXT.test(t))return 0;if(cat(v)==='pool'&&!exact&&!POOL_CONTEXT.test(t))return 0;if(cat(v)==='thermal'&&!exact&&!/\b(thermal|spa|bad|bath|therme|huerlimann|hürlimann|sauna|pool)\b/i.test(t))return 0;if(exact)return 100;if((cat(v)==='beach'||cat(v)==='bath'||cat(v)==='wild')&&WATER_CONTEXT.test(t))return 58;if(cat(v)==='pool'&&POOL_CONTEXT.test(t))return 54;return source==='area'?24:0}
function makePhoto(v,u,confidence,i){const exact=confidence>=85;return {url:u,label:exact?'venue photo':'nearby area photo',credit:/commons|wikimedia/i.test(u)?'Wikimedia Commons':'operator / open source',caption:`${plainName(v)} · ${exact?'audited venue image':'audited nearby area context'}`,confidence}}
function cleanPhotoUrl(u){return String(u?.url||u||'').split('?')[0]}
function existingPhotoKeys(v){const keys=new Set();for(const u of [...(v.photos||[]),...(PHOTO_BANK[v.id]||[])]){keys.add(photoKey(u));keys.add(photoFingerprint(u))}return keys}
function photoDeck(v){
 const k=v.id,locked=state.photoLocks.get(k);if(locked&&locked.length>=3)return locked;
 const seeded=[...(PHOTO_BANK[v.id]||[]),...(v.photos||[])];
 const allowArea=(cat(v)==='beach'||cat(v)==='bath'||cat(v)==='wild')&&(v.packKey||COMMONS_CATS[v.id]);
 const area=allowArea?(COMMON[v.packKey||areaKey(v)]||[]):[];
 const raw=[...seeded.map(u=>[u,'seed']),...area.map(u=>[u,'area'])];
 const seenUrl=new Set(),seenFp=new Set();let scored=[];
 for(const [u,source] of raw){if(!u||state.failedPhotos.has(cleanPhotoUrl(u)))continue;const key=photoKey(u),fp=photoFingerprint(u);if(seenUrl.has(key)||seenFp.has(fp))continue;const conf=photoConfidence(v,u,source);if(conf<50)continue;seenUrl.add(key);seenFp.add(fp);scored.push([conf,u])}
 scored.sort((a,b)=>b[0]-a[0]);
 const out=scored.slice(0,3).map(([conf,u],i)=>makePhoto(v,u,conf,i));
 if(out.length>=3)state.photoLocks.set(k,out);else state.photoLocks.delete(k);
 if(out.length<3)prefetchMediaSoon('photo-gap');
 return out
}
function rankPhotoId(p){if(!p)return'';const u=p.url||p;return photoFingerprint(u)+'|'+photoKey(u)}
function photoForRank(v,used){
 const cached=state.rankPhotoCache.get(v.id);if(cached&&!used.has(cached.id)){used.add(cached.id);return cached.photo}
 for(const p of photoDeck(v)){const id=rankPhotoId(p);if(id&&!used.has(id)){used.add(id);state.rankPhotoCache.set(v.id,{id,photo:p});return p}}
 if(!document.documentElement.classList.contains('dmActOn'))hydrateMedia(v,false);return (window.dmAerialPhoto&&window.dmAerialPhoto(v))||null
}
function stopContinuousLoading(){if(state.continuousTimer){clearInterval(state.continuousTimer);state.continuousTimer=null}}
function startContinuousLoading(scanId){
 stopContinuousLoading();state.continuousTick=0;
 state.continuousTimer=setInterval(()=>{
  if(scanId!==state.scanId||!state.center||state.continuousTick++>18){stopContinuousLoading();return}
  seedNearbyPacks();sortResults();prefetchParkingSoon('continuous');prefetchMediaSoon('continuous');
  if(state.results.length<10&&state.continuousTick%2===1&&!state.rescueBusy)textRescue(scanId,state.label,0);
  if(state.results.length){progress(state.results.length>=10?'Spots ready':'Still improving results',state.results.length>=10?96:Math.min(92,64+state.results.length*3),`${Math.min(10,state.results.length)} visible. More places, photos, parking and details are still loading.`)}
  render();drawMap();
 },3500)
}
function img(url,alt,vid=''){return `<img src="${esc(url)}" alt="${esc(alt)}" loading="eager" decoding="async" referrerpolicy="no-referrer" data-url="${esc(cleanPhotoUrl(url))}" data-vid="${esc(vid)}">`}
function bindImages(){ $$('img[data-url]').forEach(el=>{if(el.dataset.bound)return;el.dataset.bound='1';el.addEventListener('error',()=>handlePhotoFail(el),{once:true})}) }
function handlePhotoFail(el){const u=el.dataset.url||el.src;const _cu=cleanPhotoUrl(u),_seen=state.failedPhotos.has(_cu);state.failedPhotos.add(_cu);state._pfN=(state._pfN||0)+1;if(_seen||state._pfN>60){el.closest('.photo,.thumb')?.classList.add('imgFailed');el.remove();return}const vid=el.dataset.vid;el.closest('.photo,.thumb')?.classList.add('imgFailed');el.remove();if(vid){const v=state.results.find(x=>x.id===vid);if(v){v.photos=(v.photos||[]).filter(x=>cleanPhotoUrl(x)!==cleanPhotoUrl(u));state.photoLocks.delete(v.id);hydrateMedia(v,true)}}}
function commonsCategoryFor(v){return v.commons||COMMONS_CATS[v.id]||''}
function mediaQueries(v){const name=plainName(v).replace(/·.*/,'').trim();const loc=(v.address||state.label||'').replace(/your current location[^,]*/i,'').split(',').slice(0,2).join(' ');const q=[];if(commonsCategoryFor(v))q.push({type:'cat',q:commonsCategoryFor(v)});q.push({type:'search',q:`${name} ${loc}`.trim()});q.push({type:'search',q:name});q.push({type:'geo',q:'nearby open photos',lat:v.lat,lon:v.lon,r:cat(v)==='pool'?350:900});if(cat(v)==='beach')q.push({type:'search',q:`${name} beach`});if(cat(v)==='pool')q.push({type:'search',q:`${name} swimming pool`});if(cat(v)==='bath')q.push({type:'search',q:`${name} bathing place`});const _vr=(cat(v)==='beach'||cat(v)==='wild')?2.5:1.5;q.forEach(o=>{o.vlat=v.lat;o.vlon=v.lon;o.vr=_vr});return q.filter((x,i,a)=>x.q&&a.findIndex(y=>y.type===x.type&&norm(y.q)===norm(x.q)&&Math.round((y.lat||0)*1000)===Math.round((x.lat||0)*1000)&&Math.round((y.lon||0)*1000)===Math.round((x.lon||0)*1000))===i)}
async function commonsImages(qobj,ms=3600){
 const base='https://commons.wikimedia.org/w/api.php?origin=*&format=json&prop=imageinfo|coordinates&iiprop=url|mime|size|extmetadata&iiurlwidth=640';
 let url='';
 if(qobj.type==='cat')url=`${base}&action=query&generator=categorymembers&gcmtitle=Category:${encodeURIComponent(qobj.q)}&gcmtype=file&gcmlimit=12`;
 else if(qobj.type==='geo')url=`${base}&action=query&generator=geosearch&ggsnamespace=6&ggslimit=18&ggsradius=${Math.max(150,Math.min(1500,qobj.r||700))}&ggscoord=${qobj.lat}|${qobj.lon}`;
 else url=`${base}&action=query&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=${encodeURIComponent(qobj.q+' filetype:bitmap')}`;
 const j=await fetchJsonTimeout(url,{},ms);const pages=Object.values(j.query?.pages||{});const out=[];
 for(const p of pages){
  const ii=p.imageinfo&&p.imageinfo[0];if(!ii)continue;
  const u=ii.thumburl||ii.url;if(!u)continue;
  if(!/^image\/(jpeg|png|webp)$/i.test(ii.mime||''))continue;
  if(ii.width&&ii.width<500)continue;
  const em=ii.extmetadata||{};
  const dt=String((em.DateTimeOriginal&&em.DateTimeOriginal.value)||(em.DateTime&&em.DateTime.value)||'');
  const ym=dt.match(/(1[6-9]\d\d|20\d\d)/);
  if(ym&&Number(ym[1])<2004)continue;
  const cats=String((em.Categories&&em.Categories.value)||'');
  if(cats&&PHOTO_CAT_BLOCK.test(cats))continue;
  if(PHOTO_HIST.test(photoTitle(u)))continue;
  const co=p.coordinates&&p.coordinates[0];
  const vlat=(qobj.vlat!=null?qobj.vlat:qobj.lat),vlon=(qobj.vlon!=null?qobj.vlon:qobj.lon);
  if(co&&vlat!=null&&vlon!=null&&dist(vlat,vlon,co.lat,co.lon)>(qobj.vr||1.5))continue;
  out.push(u);
 }
 return out
}
function updateCardPhoto(v){if(!v||!els.results)return;const idsel=(window.CSS&&CSS.escape)?CSS.escape(String(v.id)):String(v.id).replace(/"/g,'\\"');const card=els.results.querySelector('[data-card-id="'+idsel+'"]');if(!card)return;const thumb=card.querySelector('.thumb');if(!thumb)return;var used=new Set();try{els.results.querySelectorAll('.result .thumb img[data-url]').forEach(function(im){var c2=im.closest('.result');if(c2&&c2.getAttribute('data-card-id')===String(v.id))return;var u=im.getAttribute('data-url');if(u)used.add(rankPhotoId({url:u}));});}catch(e){}const p=photoForRank(v,used);const nu=p?cleanPhotoUrl(p.url||p):'';const cur=thumb.querySelector('img[data-url]');if(cur&&nu&&cur.getAttribute('data-url')===nu)return;if(!p&&cur)return;thumb.innerHTML=p?img(p.url,plainName(v),v.id):(v._mediaDone?('<div class="waterThumb dmNoPhoto"><b>'+catIcon(v)+'</b><span>no verified photo</span></div>'):'<div class="waterThumb dmTh"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-swim"/></svg></div>');bindImages();}
async function hydrateMedia(v,force=false){
 if(!v||state.mediaBusy.has(v.id))return;if(!force){v._mTry=(v._mTry||0)+1;if(v._mTry>4)return}const mediaScan=state.scanId;const current=photoDeck(v);if(!force&&current.length>=3)return;state.mediaBusy.add(v.id);
 try{const keys=existingPhotoKeys(v);let added=0;for(const q of mediaQueries(v)){if(photoDeck(v).length>=3)break;let imgs=[];try{imgs=await commonsImages(q)}catch(e){}if(mediaScan!==state.scanId&&!state.results.some(x=>x.id===v.id))break;for(const u of imgs){const cu=cleanPhotoUrl(u);if(state.failedPhotos.has(cu))continue;const pk=photoKey(u),fp=photoFingerprint(u);if(keys.has(pk)||keys.has(fp))continue;const conf=photoConfidence(v,u,q.type==='cat'?'seed':'search');if(conf<50)continue;if(q.type==='search'){const _n=norm(photoTitle(u));const _tk=strongPhotoTokens(v)||[];if(_tk.length&&!_tk.some(t=>t&&_n.includes(t)))continue}if(!state.photoOwner)state.photoOwner=new Map();const _fid=rankPhotoId(u);const _ow=state.photoOwner.get(_fid);if(_ow&&_ow!==v.id)continue;state.photoOwner.set(_fid,v.id);(v.photos||(v.photos=[])).push(u);keys.add(pk);keys.add(fp);added++;state.photoLocks.delete(v.id);if(photoDeck(v).length>=3)break}if(added&&state.selected===v.id)openCard(v.id,true)}}finally{state.mediaBusy.delete(v.id);v._mediaDone=true;try{updateCardPhoto(v)}catch(e){render()}if(state.selected===v.id){const sv=state.results.find(x=>x.id===state.selected);if(sv)openCard(sv.id,true)}}
}
function prefetchMediaSoon(reason=''){clearTimeout(state.mediaTimer);state.mediaTimer=setTimeout(()=>prefetchMedia(),240)}
function prefetchMedia(){if(document.documentElement.classList.contains('dmActOn'))return;filtered().slice(0,24).forEach(v=>hydrateMedia(v,false))}
function dmRating(v){return Math.max(3,Math.min(5,(v.score||80)/20));}
function dmWaterTemp(v){if(typeof isIndoor==='function'&&isIndoor(v))return null;try{const m=window.dmModelWaterTemp&&window.dmModelWaterTemp(v);if(m&&Number.isFinite(m.c))return{c:m.c,est:true,kind:'model_or_seasonal_estimate'}}catch(e){}return null;}function dmDisplayWaterTemp(v){var w=v.water||{},t=Date.parse(w.observed_at||''),n=Date.now();if(Number.isFinite(w.temp)&&t<=n+600000&&t>=n-48*3600000&&/^https:\/\//.test(w.source_url||''))return{c:Math.round(w.temp),est:false,kind:'dated_observation'};if((cat(v)==='pool'||cat(v)==='thermal')&&Number.isFinite(w.temp))return{c:Math.round(w.temp),est:true,kind:'undated_published_reference'};return dmWaterTemp(v);}function dmWaterLabel(v){var w=dmDisplayWaterTemp(v);return w?((w.est?'~':'')+w.c+'°C'):'water data pending';}
function dmOpenStatus(v){return v.hours?{open:null,text:'Hours listed; verify locally'}:null;}
function dmCrowd(v){var q=quietScore(v);return{q:q,level:q>=58?'Quietness estimate: higher':q>=44?'Quietness estimate: medium':'Quietness estimate: lower',kind:'heuristic_not_occupancy'};}
function dmTravel(v){var sk=(v.distance||0);var km=(v.driveKm!=null?v.driveKm:sk);var dm=(v.driveMin!=null?v.driveMin:Math.max(1,Math.round(km/38*60)+2));return{km:sk,walk:Math.max(1,Math.round(sk/4.8*60)),bike:Math.max(1,Math.round(sk/15*60)),drive:dm,real:v.driveMin!=null};}
function dmParkRisk(v){return null;}
function renderGoldenHour(){var e=document.querySelector('.dmGolden');if(e)e.remove(); /* The coastal ribbon owns timestamped, timezone-labelled light context. */}
function chips(v){
  var out=[];function push(t,c){out.push({t:t,c:c||''});}
  push('Fit '+dmRating(v).toFixed(1)+'/5','star');
  var os=dmOpenStatus(v);if(os)push(os.text,os.open===true?'open':(os.open===false?'closed':'seas'));
  var wt=dmDisplayWaterTemp(v);if(wt)push('🌡\uFE0F '+(wt.est?'~':'')+wt.c+'\u00b0C',(wt.est?'temp est':'temp'));
  var cr=dmCrowd(v);push('👥 '+cr.level,cr.q>=58?'calm':(cr.q>=44?'':'busy'));
  var tv=dmTravel(v);if(tv.km>0.05){var _lab=(tv.walk<=18&&!tv.real)?('🚶 '+tv.walk+' min'):('🚗 '+tv.drive+' min'+(tv.real?'':' est'));push(_lab,'trav');}if(v.detour&&v.detour>=1.8)push('🔄 long way round','busy');if(v.website)push('🔗 Official site','');var _ac=String(v.access||'').toLowerCase();if(_ac==='customers')push('🔒 Customers only','closed');else if(_ac==='members')push('🔒 Members only','closed');else if(_ac==='yes'||_ac==='public')push('🔓 Public','open');if(dmIdRequired(v))push('🪪 ID required','idreq');else if(dmGermanPool(v))push('🪪 ID may be required','idnote');
  var pk=dmParkRisk(v);if(pk){if(pk==='full')push('🅿️ ⚠ Likely full','parkfull');else if(pk==='filling')push('🅿️ Filling up','busy');else push('🅿️ Parking ok','');}
  if(v.free||(v.price&&v.price.adult===0))push('Free','free');else if(v.price&&v.price.adult>0)push('CHF '+v.price.adult,'');
  if(v.highlights&&v.highlights.includes('supervised')&&!dmNoLifeguard(v))push('👁\uFE0F Lifeguard','');
  if(v.highlights&&v.highlights.includes('family'))push('👶 Family','');
  if(v.highlights&&v.highlights.includes('women-friendly'))push('Women-friendly','');
  var F=(v.facilities||[]).join(' ');
  var AM=[[/sauna|steam|dampf/,'🧖 Sauna'],[/grill|bbq|barbecue|feuerstelle|fireplace/,'🔥 BBQ'],[/playground|spielplatz|slide|rutsch/,'🧒 Playground'],[/kiosk|imbiss|snack|kiosque/,'🏪 Kiosk'],[/\bsup\b|kayak|paddle|boat rent|bootsverleih|pedalo|pedal boat/,'🏄 SUP/boat'],[/dog|hund|canine/,'🐕 Dogs'],[/nudist|naturist|fkk|textilfrei|clothing.?optional/,'🌿 FKK'],[/wheelchair|accessible|barrier|rollstuhl|step-free|handicap/,'\u267F Step-free'],[/volley/,'🏐 Volleyball'],[/diving|sprung|3m|10m|board/,'🤿 Diving'],[/restaurant|bistro|caf/,'🍴 Restaurant'],[/shower|dusche/,'🚿 Showers'],[/toilet|wc/,'🚻 WC'],[/lawn|liegewiese|meadow|grass/,'🌱 Lawn'],[/chang|umkleide|cabin|kabine|locker|garderobe/,'🚪 Changing']];
  for(var a=0;a<AM.length;a++){if(AM[a][0].test(F))push(AM[a][1],'');}
  return out.slice(0,16).map(function(o){return '<span class="chip '+o.c+'">'+esc(o.t)+'</span>';}).join('');
}
function renderFilters(){els.filters.innerHTML=FILTERS.map(([k,l])=>`<button class="filter ${state.filter===k?'active':''}" data-filter="${k}">${l}</button>`).join('');$$('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;renderFilters();render();drawMap()})}
function render(){
 const list=filtered();state.renderIndex=new Map(list.map(v=>[String(v.id),v]));const filterLabel=FILTERS.find(f=>f[0]===state.filter)?.[1]||'selected filter';
 els.resultTitle.textContent=state.results.length?'Nearby swim spots':state.center?'Looking nearby':'Choose a start point';
 els.resultSub.textContent=state.center?`${$('#radius').value} km around ${state.label}`:'Use location or search a destination.';
 els.mapSub.textContent=state.center?`${state.label} · ${list.length} ${state.filter==='all'?'mapped':'filtered'} places`:'Map is ready.';
 els.listNote.textContent=state.results.length?(state.filter==='quiet'?'Quietness estimate brings calm choices forward. Rain, wind, time of day, indoor/outdoor type and likely visitor pressure are considered.':'Top choices are locked after 10 seconds. Use Open for details.'):'No result yet. Search a destination or allow location.';
 const __rs=state.filter+'|'+($('#radius')?.value||'')+'|'+(state.center?1:0)+'|'+list.length+'|'+list.map(v=>v.id).join(',');if(__rs===state._renderSig&&els.results.childElementCount>0){drawMap();return}state._renderSig=__rs;
 if(!list.length){
  if(state.results.length){els.results.innerHTML=`<div class="empty"><b>No ${esc(filterLabel)} match in the current top results.</b><br><span class="muted">${state.results.length} nearby options are available. Tap All or change the radius.</span></div>`}
  else els.results.innerHTML='<div class="empty"><b>Finding the first five...</b><br><span class="muted">Search starts close and finishes the visible ranking in 10 seconds.</span></div>';
  drawMap();return
 }
 const usedRankPhotos=new Set();els.results.innerHTML=list.map((v,i)=>{const p=photoForRank(v,usedRankPhotos);return `<article class="result ${catClass(v)}" data-card-id="${esc(v.id)}" data-open="${esc(v.id)}" tabindex="-1"><div class="thumb">${p?img(p.url,plainName(v),v.id):'<div class="waterThumb dmTh"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-swim"/></svg></div>'}</div><div class="resultMain"><div class="resultMeta"><span>${i+1} · ${catIcon(v)} ${esc(cat(v)==='bath'?'Bathing place':cat(v))}</span><span>${fmt(v.distance||0)}</span></div><div class="resultName">${displayName(v)}</div><div class="chips">${chips(v)}</div><button type="button" class="openPlace" data-open="${esc(v.id)}" onclick="return window.__dipOpenButton(this,event)" aria-label="Open ${esc(plainName(v))}">Open</button></div></article>`}).join('');
 bindImages();prefetchMediaSoon('render');drawMap()
}
function lon2x(l,z){return(l+180)/360*256*2**z}function lat2y(lat,z){const s=Math.sin(lat*Math.PI/180);return(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*256*2**z}function x2lon(x,z){return x/(256*2**z)*360-180}function y2lat(y,z){const n=Math.PI-2*Math.PI*y/(256*2**z);return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))}function project(a,b,z){return[lon2x(b,z),lat2y(a,z)]}function unproject(x,y,z){return[y2lat(y,z),x2lon(x,z)]}

function zoomForRadius(km,lat=(state.center?.[0]||state.mapCenter?.[0]||0)){
 const mapW=Math.max(360,els.map?.clientWidth||900);const targetKm=Math.max(1,Number(km||5))*2.35;const cos=Math.max(.28,Math.cos(lat*Math.PI/180));
 for(let z=17;z>=3;z--){const mpp=156543.03392*cos/(2**z);if((mpp*mapW/1000)>=targetKm)return z}
 return 3
}
function radiusPixels(km,lat,z){const cos=Math.max(.28,Math.cos(lat*Math.PI/180));const mpp=156543.03392*cos/(2**z);return Math.max(10,(Number(km||5)*1000)/mpp)}
function setMapToSearchRadius(){if(state.center){state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0])}}

/* v23.8.3 map tiles: OSM tile policy compliance + automatic fallback */
var DM_TILE_SRC={
 osm:{u:function(z,x,y){return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'},
      a:'\u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'},
 esri:{u:function(z,x,y){return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'},
      a:'Tiles \u00a9 <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> \u2014 Esri, HERE, Garmin, USGS, \u00a9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}
};
var DM_TILE=(location.protocol==='file:')?'esri':'osm';
function dmTileUrl(z,x,y){return DM_TILE_SRC[DM_TILE].u(z,x,y)}
function dmAttrPaint(){try{var m=els&&els.map;if(!m)return;var a=m.querySelector('.dmAttr');
 if(!a){a=document.createElement('div');a.className='dmAttr';m.appendChild(a)}a.innerHTML=DM_TILE_SRC[DM_TILE].a}catch(e){}}
function dmTileSwitch(p){if(DM_TILE===p||!DM_TILE_SRC[p])return;DM_TILE=p;try{state._tileSig=null;drawMap()}catch(e){}dmAttrPaint()}
function dmTileProbe(){if(dmTileProbe.done||DM_TILE!=='osm')return;dmTileProbe.done=1;
 }
try{dmTileProbe()}catch(e){}
function drawMap(){const r=els.map.getBoundingClientRect();if(!r.width||!r.height)return;const c=state.mapCenter||state.center||[39,12],z=state.zoom,cp=project(c[0],c[1],z),left=cp[0]-r.width/2,top=cp[1]-r.height/2,max=2**z;
if(!els.map.querySelector('.dmTiles')){els.map.innerHTML='<div class="dmTiles"></div><div class="dmOverlay"></div>';state._tileSig=null;state._ovSig=null;}
const _tiles=els.map.querySelector('.dmTiles'),_ov=els.map.querySelector('.dmOverlay');
const _tsig=c[0]+','+c[1]+'|'+z+'|'+Math.round(r.width)+'x'+Math.round(r.height);
if(_tsig!==state._tileSig){state._tileSig=_tsig;let th='';for(let x=Math.floor(left/256)-1;x<=Math.floor((left+r.width)/256)+1;x++)for(let y=Math.floor(top/256)-1;y<=Math.floor((top+r.height)/256)+1;y++){if(y<0||y>=max)continue;const tx=((x%max)+max)%max;th+=`<img class="tile" src="${dmTileUrl(z,tx,y)}" referrerpolicy="strict-origin-when-cross-origin" style="left:${x*256-left}px;top:${y*256-top}px" alt="" loading="lazy">`}_tiles.innerHTML=th;}dmAttrPaint();
const mapList=filtered();mapList.forEach(v=>state.renderIndex.set(String(v.id),v));
const _osig=(state.center?state.center.join(','):'')+'|'+z+'|'+left.toFixed(1)+','+top.toFixed(1)+'|'+($('#radius')?.value||'')+'|'+(state.selected||'')+'|'+mapList.map(v=>v.id).join(',')+'|'+(state.selected&&state.parking?state.parking.map(p=>p.lat+','+p.lon).join(';'):'');
if(_osig!==state._ovSig){state._ovSig=_osig;let oh='';if(state.center){const p=project(state.center[0],state.center[1],z),x=p[0]-left,y=p[1]-top,rad=radiusPixels(Number($('#radius').value||5),state.center[0],z);oh+=`<div class="radiusRing" style="left:${x}px;top:${y}px;width:${rad*2}px;height:${rad*2}px"></div><div class="radiusLabel" style="left:${x}px;top:${Math.max(12,y-rad)}px">${$('#radius').value||5} km search</div><div class="origin" style="left:${x}px;top:${y}px"></div>`}mapList.forEach((v,i)=>{const p=project(v.lat,v.lon,z),x=p[0]-left,y=p[1]-top;if(x>-40&&x<r.width+40&&y>-40&&y<r.height+40)oh+=`<button type="button" class="marker ${catClass(v)}" data-rank="${i+1}" data-mid="${esc(v.id)}" onclick="return window.__dipOpenFromElement(this,event)" onpointerdown="return window.__dipPressFromElement(this,event)" style="left:${x}px;top:${y}px" title="${esc(plainName(v))}" aria-label="Open ${esc(plainName(v))}">${i+1}</button>`});if(state.selected)state.parking.slice(0,6).forEach(p0=>{const p=project(p0.lat,p0.lon,z),x=p[0]-left,y=p[1]-top;oh+=`<a class="marker parking" href="${route(p0.lat,p0.lon)}" target="_blank" rel="noopener" style="left:${x}px;top:${y}px">P</a>`});_ov.innerHTML=oh;}}
function fitToSpots(){try{var list=filtered();if(!list||!list.length){centerOnResults(true);return;}var mnLat=90,mxLat=-90,mnLon=180,mxLon=-180;list.forEach(function(v){mnLat=Math.min(mnLat,v.lat);mxLat=Math.max(mxLat,v.lat);mnLon=Math.min(mnLon,v.lon);mxLon=Math.max(mxLon,v.lon);});if(state.center){mnLat=Math.min(mnLat,state.center[0]);mxLat=Math.max(mxLat,state.center[0]);mnLon=Math.min(mnLon,state.center[1]);mxLon=Math.max(mxLon,state.center[1]);}state.mapCenter=[(mnLat+mxLat)/2,(mnLon+mxLon)/2];state.dmFitCenter=state.mapCenter.slice();var r=els.map.getBoundingClientRect();var latSpan=Math.max(0.004,mxLat-mnLat),lonSpan=Math.max(0.004,mxLon-mnLon);var zW=Math.log2((Math.max(320,r.width)*0.82)*360/(lonSpan*256));var latRad=state.mapCenter[0]*Math.PI/180;var zH=Math.log2((Math.max(320,r.height)*0.82)*360/(latSpan*256*1.3));state.zoom=Math.max(3,Math.min(16,Math.floor(Math.min(zW,zH))));drawMap();}catch(e){centerOnResults(true);}}
function centerOnResults(force=true){if(state.center){state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0])}else{const list=filtered();if(list.length){state.mapCenter=[list.reduce((a,v)=>a+v.lat,0)/list.length,list.reduce((a,v)=>a+v.lon,0)/list.length];state.zoom=zoomForRadius(Number($('#radius').value||5),state.mapCenter[0])}}if(force)drawMap()}
function route(lat,lon,mode='drive'){const start=state.center?`${state.center[0]},${state.center[1]};`:'';return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_${mode==='walk'?'foot':'car'}&route=${start}${lat},${lon}`}

function matchingPack(q){
 const n=norm(q).replace(/\s+/g,' ').trim();
 const hit=PACKS.find(p=>p.aliases.some(a=>n.includes(norm(a))||norm(a).includes(n)));
 if(hit)return hit;
 if(/\b(rostock|warnemunde|warnemuende|warnemünde|markgrafenheide|hohe duene|hohe düne)\b/.test(n))return PACKS.find(p=>p.key==='rostock');
 if(/\b(zurich|zuerich|zürich|limmat|zuerichsee|zürichsee)\b/.test(n))return PACKS.find(p=>p.key==='zurich');
 if(/\b(rhodes|rodos|faliraki|lindos)\b/.test(n))return PACKS.find(p=>p.key==='rhodes');
 if(/\b(miami|south beach|key biscayne|lummus|haulover)\b/.test(n))return PACKS.find(p=>p.key==='miami');
 if(/\b(palma|mallorca|balearic)\b/.test(n))return PACKS.find(p=>p.key==='palma');
 return null
}

function startPack(p){
 window.__dmExample=false;
 stopContinuousLoading();resetFilterToAll();state.center=p.center.slice();state.mapCenter=p.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0]);state.label=p.label;state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();state.photoLocks.clear();state.rankPhotoCache.clear();state.mediaBusy.clear();state.failedPhotos.clear();
 const r=Number($('#radius').value||5);const all=p.venues.map(v=>({...v,packKey:p.key})).sort((a,b)=>dist(p.center[0],p.center[1],a.lat,a.lon)-dist(p.center[0],p.center[1],b.lat,b.lon));const local=all.filter(v=>dist(p.center[0],p.center[1],v.lat,v.lon)<=Math.max(r,6));const first=local.length>=5?local.slice(0,10):all.slice(0,Math.min(10,all.length));
 progress('Top options ready',70,`${p.label}: nearby options are ready; wider choices and live data keep loading.`);merge(first);gateOff();prefetchMediaSoon('pack-first');setTimeout(()=>{if(state.center&&state.label===p.label)merge(all)},1200);backgroundScan(true)}

function resetFilterToAll(){state.filter='all';renderFilters()}
function currentSearchKey(){if(!state.center)return '';const r=String($('#radius').value||5);return state.center.map(x=>Number(x).toFixed(3)).join(',')+'|'+r}
function cloneVenue(v){return {...v,photos:[...(v.photos||[])],parking:[...(v.parking||[])],facilities:[...(v.facilities||[])],highlights:[...(v.highlights||[])],transit:[...(v.transit||[])]}}
function cacheCurrentResults(){const k=currentSearchKey();if(k&&state.results.length){state.resultCache.set(k,state.results.slice(0,45).map(cloneVenue))}}
function restoreCachedResults(){const k=currentSearchKey();const cached=k&&state.resultCache.get(k);if(!cached||!cached.length)return 0;merge(cached.map(cloneVenue));progress('Top options restored',60,`${Math.min(10,cached.length)} local options were restored instantly while live search refreshes.`);return cached.length}
function resetForSearch(q){
 stopContinuousLoading();
 state.scanId++;state.locationRequestId++;resetFilterToAll();
 state.label=q;
 state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();if(state.photoOwner)state.photoOwner.clear();state.photoLocks.clear();state.rankPhotoCache.clear();state.mediaBusy.clear();state.failedPhotos.clear();state.currentWeather=null;state.weatherBusy=false;state.selected=null;
 els.mapSub.textContent='Resolving destination...';
 closeCard();
 render();drawMap();
}
function geocodePick(list,q){  const n=norm(q);const good=(list||[]).filter(x=>x&&x.lat&&x.lon).map(x=>({...x,score:0}));const ucc=(typeof window.dmUserCC==='function')?window.dmUserCC():'';
  for(const x of good){const names=[x.name,String(x.display_name||'').split(',')[0]].concat(Object.values(x.namedetails||{})).map(norm).filter(Boolean);const blob=norm([x.display_name,x.name,x.type,x.class,x.osm_type,x.addresstype].join(' '));
   if(names.some(s=>s===n))x.score+=12;else if(names.some(s=>s.indexOf(n)===0))x.score+=6;else if(blob.includes(n.split(' ')[0]))x.score+=3;
   if(/city|town|village|municipality|administrative|island|beach|bay|lake|resort|state|region/.test(blob))x.score+=5;if(/parking|shop|hotel|street|building|station/.test(blob))x.score-=10;
   if(x.importance)x.score+=Number(x.importance)*20;if(x._aux)x.score-=8;const cc=String((x.address&&x.address.country_code)||'').toLowerCase();if(cc&&ucc&&cc===ucc)x.score+=4}
  return good.sort((a,b)=>b.score-a.score)[0]||null }
async function resolveDestination(q){
 const clean=q.trim();  if(window.dmResolve){const _d=window.dmResolve(clean);if(_d)return _d;}
 const nom=u=>fetchJsonTimeout(u,{},4200).then(a=>Array.isArray(a)?a:[]);
 const jobs=[
  nom(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=en&limit=8&q=${encodeURIComponent(clean)}`),
  nom(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=en&limit=5&q=${encodeURIComponent(clean+' beach swimming')}`).then(a=>a.map(x=>({...x,_aux:1}))),
  fetchJsonTimeout(`https://photon.komoot.io/api/?limit=6&lang=en&q=${encodeURIComponent(clean)}`,{},4200).then(j=>(j.features||[]).map(f=>({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],name:f.properties.name,display_name:[f.properties.name,f.properties.state,f.properties.country].filter(Boolean).join(', '),class:f.properties.osm_key,type:f.properties.osm_value,address:{country_code:String(f.properties.countrycode||'').toLowerCase()},importance:.4})))
 ];
 const settled=await Promise.allSettled(jobs);
 const all=settled.flatMap(r=>r.status==='fulfilled'?r.value:[]);
 return geocodePick(all,clean)
}
async function search(){
 const q=($('#dest').value||$('#gateDest').value||'').trim();if(!q)return;window.__dmExample=false;
 $('#dest').value=q;$('#gateDest').value=q;gateOff();resetForSearch(q);progress('Finding destination',12,`Resolving ${q}; old results were cleared.`);
 const p=matchingPack(q);if(p){startPack(p);return}
 const searchId=state.scanId;
 const fallback=setTimeout(()=>{if(searchId===state.scanId&&!state.center)progress('Destination search still working',18,'Trying city, beach and swim-place geocoders in parallel.')},1800);
 try{const g=await resolveDestination(q);clearTimeout(fallback);if(searchId!==state.scanId)return;if(g){state.center=[+g.lat,+g.lon];state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0]);state.label=String(g.display_name||q).split(',').slice(0,3).join(', ');gateOff();progress('Destination ready',30,state.label);seedNearbyPacks();render();drawMap();backgroundScan(true);setTimeout(()=>textRescue(state.scanId,q,0),450)}else{progress('Destination not found',12,'Try city + country, beach name, island, lake or neighbourhood.')}}catch(e){clearTimeout(fallback);if(searchId===state.scanId)progress('Destination search slow',12,'Network geocoding is slow. Try city + country or a nearby beach name.')}} 
function clearForNewOrigin(label=''){
 window.__dmExample=false;
 stopContinuousLoading();
 state.scanId++;resetFilterToAll();
 state.locationRequestId++;
 state.label=label;
 state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();state.photoLocks.clear();state.rankPhotoCache.clear();state.mediaBusy.clear();state.failedPhotos.clear();state.currentWeather=null;state.weatherBusy=false;state.selected=null;
 els.mapSub.textContent=label?'Resolving '+label+'...':'Waiting for exact location...';
 closeCard();
 render();drawMap();
}
function gateBusy(on){const b=$('#gateLoc');if(!b)return;b.disabled=!!on;if(on)b.classList.add('dmBusy');else b.classList.remove('dmBusy');b.textContent=on?'Locating\u2026':'Use my location';}
function gateHint(t){const h=$('#gateHint');if(h)h.textContent=t;}
function requestLocation(){
 const _t0=Date.now();gateBusy(true);gateHint('Waiting for your browser to share your location\u2026');
 const _closeGate=()=>{const _w=Math.max(0,1500-(Date.now()-_t0));setTimeout(()=>{gateBusy(false);gateOff()},_w)};
 clearForNewOrigin('your current location');
 progress('Asking for precise location',12,'The browser will ask for permission. Old results are cleared first, so the list cannot keep another place.');
 if(!navigator.geolocation){progress('Location unavailable',8,'Search a destination instead.');return}
 const req=state.locationRequestId;
 const done=pos=>{
  if(req!==state.locationRequestId)return;
  const acc=Math.round(pos.coords.accuracy||0);try{localStorage.setItem('dm_loc',JSON.stringify({la:pos.coords.latitude,lo:pos.coords.longitude,t:Date.now()}))}catch(e){}
  state.center=[pos.coords.latitude,pos.coords.longitude];state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0]);state.label='your current location +/- '+acc+' m';
  state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();state.photoLocks.clear();state.mediaBusy.clear();state.failedPhotos.clear();state.currentWeather=null;state.weatherBusy=false;resetFilterToAll();
  _closeGate();
  progress('Location ready',28,'Searching the closest 5 km first. Top results stay local; wider options load only after that.');
  seedNearbyPacks();render();drawMap();backgroundScan();
 };
 const fail=()=>{gateBusy(false);gateHint('Could not get your location. Type a destination above instead.');if(req===state.locationRequestId)progress('Location blocked or slow',8,'Search a city, beach, island, lake or neighbourhood instead.');};
 navigator.geolocation.getCurrentPosition(done,fail,{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}


function queryLayer(radius,lat,lon,kind){
 const close=Math.max(800,Math.round(radius));
 const to=Math.max(12,Math.min(28,Math.round(close/1400)));
 const common='[out:json][timeout:'+to+'];(';
 if(kind==='all')return `${common}nwr["natural"~"beach|hot_spring"](around:${close},${lat},${lon});nwr["leisure"~"swimming_area|swimming_pool|beach_resort|water_park|bathing_place"](around:${close},${lat},${lon});nwr["amenity"="public_bath"](around:${close},${lat},${lon});nwr["sport"="swimming"](around:${close},${lat},${lon});nwr["swimming"~"yes|designated"](around:${close},${lat},${lon});nwr["bathing"~"yes|designated"](around:${close},${lat},${lon}););out center 300;`;
 if(kind==='core')return `${common}nwr["leisure"~"bathing_place|swimming_area|swimming_pool|beach_resort|water_park"](around:${close},${lat},${lon});nwr["amenity"="public_bath"](around:${close},${lat},${lon});nwr["sport"="swimming"](around:${close},${lat},${lon});nwr["tourism"~"spa_resort|theme_park"](around:${close},${lat},${lon}););out body center qt 140;`;
 if(kind==='nature')return `${common}nwr["natural"="beach"](around:${close},${lat},${lon});nwr["natural"="hot_spring"](around:${close},${lat},${lon});nwr["waterway"="waterfall"](around:${close},${lat},${lon});nwr["beach"~"yes|sand|gravel"](around:${close},${lat},${lon}););out body center qt 140;`;
 if(kind==='names')return `${common}nwr["name"~"(Badi|Badestelle|Badestrand|Bad|Seebad|Strandbad|Freibad|Hallenbad|Flussbad|Schwimmhalle|Schwimmbad|Lido|Piscina|Piscine|Plage|Playa|Praia|Spiaggia|Cala|Beach|Bay|Paralia|Platja|Therme|Terme|Spa|Springs|Aquapark|Aqualand|Naturbad|Badeplatz|Baggersee|Weiher|Bagno|Stausee|Tobel|Gumpe|Ostseebad|Nordseebad|Meerbad|Seebrücke|Badebucht)",i](around:${close},${lat},${lon});nwr["name:en"~"(beach|swimming|pool|bath|lido|spa|thermal|water park)",i](around:${close},${lat},${lon}););out body center qt 180;`;
 return `${common}nwr["swimming"~"yes|designated|official"](around:${close},${lat},${lon});nwr["bathing"~"yes|designated|official"](around:${close},${lat},${lon}););out body center qt 120;`;
}
function seedNearbyPacks(){
 if(!state.center)return 0;
 let added=0;
 const userRadius=Number($('#radius').value||5);
 const explicit=norm(state.label||'');
 for(const p of PACKS){
  const packCenterDistance=dist(state.center[0],state.center[1],p.center[0],p.center[1]);
  const nameHit=p.aliases.some(a=>explicit.includes(norm(a))||norm(a).includes(explicit));
  const venueRadius=nameHit?Math.min(Math.max(p.radius,12),50):Math.max(userRadius+1,6);
  const nearVenues=p.venues.filter(v=>dist(state.center[0],state.center[1],v.lat,v.lon)<=venueRadius).map(v=>({...v,packKey:p.key}));
  const centerAllowed=nameHit||packCenterDistance<=Math.max(userRadius+2,8)||nearVenues.length;
  if(centerAllowed&&nearVenues.length){merge(nearVenues);added+=nearVenues.length}
 }
 return added
}
function bboxAround(lat,lon,km){const dLat=km/111, dLon=km/(111*Math.max(.2,Math.cos(lat*Math.PI/180)));return [lon-dLon,lat+dLat,lon+dLon,lat-dLat].map(x=>x.toFixed(5)).join(',')}

async function textRescue(scanId,query='',delay=0){
 if(delay)await new Promise(r=>setTimeout(r,delay));
 if(!state.center||scanId!==state.scanId||state.rescueBusy)return;
 state.rescueBusy=true;
 const [lat,lon]=state.center,km=Math.max(8,Number($('#radius').value||5));
 const view=bboxAround(lat,lon,Math.min(45,Math.max(km,18)));
 let base=String(query||state.label||'').trim();if(/^(the map (area|point)|selected map point|map point|your (current )?location.*|current location|my location)$/i.test(base)||(state._pickLabel&&base===state._pickLabel))base='';
 const terms=['beach','swimming pool','public bath','lido','thermal bath','water park','lake swimming','river swimming','bathing place','outdoor pool','indoor pool','Strandbad','Badestrand','Badestelle','Freibad','Hallenbad','Schwimmbad','Schwimmhalle','Therme','Seebad','Flussbad','Lido','Piscina','Piscine','Plage','Playa','Praia','Spiaggia','Cala','Paralia'];
 const batches=[terms.slice(0,10),terms.slice(10,20),terms.slice(20)];let added=0;
 try{for(const batch of batches){
  if(scanId!==state.scanId||state.results.length>=12)break;
  const jobs=batch.map(term=>fetchJsonTimeout(`https://nominatim.openstreetmap.org/search?format=json&limit=8&bounded=1&viewbox=${view}&q=${encodeURIComponent((term+' '+base).trim())}`,{},2600).catch(()=>[]));
  const arrs=await Promise.all(jobs);
  const vals=arrs.flat().map(nominatimToVenue).filter(Boolean).filter(v=>dist(lat,lon,v.lat,v.lon)<Math.min(50,Math.max(15,km*2.8)));
  if(vals.length){merge(vals);added+=vals.length;progress(state.results.length>=10?'Top options ready':state.results.length>=5?'Top five ready':'Finding swim places',Math.min(90,42+state.results.length*4),`${Math.min(10,state.results.length)} ranked; fast destination rescue added ${added}.`)}
 }
 }finally{state.rescueBusy=false}
}
async function nominatimRescue(scanId){return textRescue(scanId,state.label,0)}
function nominatimToVenue(x){const lat=+x.lat,lon=+x.lon;if(!lat||!lon)return null;const name=(x.name||String(x.display_name||'').split(',')[0]||'').trim();if(!name||BAD.test(norm(name)))return null;let c='bath';const all=norm([name,x.type,x.class,x.display_name].join(' '));if(/beach|strand|plage|playa|praia|spiaggia|cala|bay|paralia/.test(all))c='beach';else if(/pool|piscina|hallenbad|freibad|swimming/.test(all))c='pool';else if(/thermal|therme|terme|spa|spring/.test(all))c='thermal';else if(/river|fluss|waterfall|wild/.test(all))c='wild';return {id:`nom-${x.osm_type||'n'}-${x.osm_id||name}`,name,westernName:westernizeName(name,{class:x.class,type:x.type},c),cat:c,setting:c==='beach'||c==='wild'?'Outdoor':'',lat,lon,address:String(x.display_name||'').split(',').slice(0,3).join(','),free:c==='beach',price:c==='beach'?{currency:'EUR',adult:0}:undefined,facilities:[],highlights:c==='beach'?['free']:[],photos:[],story:makeStory(name,c),parking:[],transit:[]}}

async function scanCacheKey(lat,lon,r){return lat.toFixed(2)+','+lon.toFixed(2)+','+r}
function loadScanCache(k){try{const j=JSON.parse(localStorage.getItem('dm_scan_cache')||'null');if(j&&j.k===k&&(Date.now()-j.t)<1800000&&Array.isArray(j.v)&&j.v.length)return j.v}catch(e){}return null}
function saveScanCache(k,v){try{localStorage.setItem('dm_scan_cache',JSON.stringify({k:k,t:Date.now(),v:v.slice(0,60)}))}catch(e){}}
function backgroundScan(quiet=false){
 if(!state.center)return;
 const scanId=++state.scanId;
 state.lastSearchStarted=Date.now();
 const radiusKm=Number($('#radius').value||5);
 const [lat,lon]=state.center;
 if(!quiet)state._expandCount=0;
 try{state._ck=scanCacheKey(lat,lon,radiusKm);const _c=loadScanCache(state._ck);if(_c&&_c.length&&!state.results.length)merge(_c);}catch(e){}
 loadCurrentWeather(scanId);
 progress('Searching closest water first',state.results.length?58:26,Math.min(10,state.results.length)+' visible so far. The first pass is local; background search widens only if needed.');
 restoreCachedResults();const seeded=seedNearbyPacks();sortResults();render();drawMap();prefetchParkingSoon('search-start');prefetchMediaSoon('search-start');if(state.results.length){progress(state.results.length>=10?'Spots ready':'Top 5 ready',state.results.length>=10?92:72,`${Math.min(10,state.results.length)} local options ranked immediately. Live search adds only better nearby matches.`)}
 const nearR=Math.min(radiusKm*1000,8000);
 const midR=Math.min(radiusKm*1000,20000);
 const fullR=Math.min(radiusKm*1000,55000);
 const nameR=Math.min(radiusKm*1000,25000);
 const wave1=[['all',nearR,14000]];
 const wave2=[['all',midR,22000]];
 const wave3=[['all',fullR,32000]];
 const wave4=[['names',nameR,24000]];
 let completed=0;
 const run=layer=>{const [kind,rr,ms]=layer;(async()=>{try{state._dSent=(state._dSent||0)+1;const _q=queryLayer(rr,lat,lon,kind);let data=await overpassFast(_q,ms);if(scanId!==state.scanId)return;if((!data.elements||!data.elements.length)&&(data._tried||0)>0&&(data._fails||0)>=(data._tried||0)){await new Promise(r=>setTimeout(r,1200));if(scanId!==state.scanId)return;data=await overpassFast(_q,ms);if(scanId!==state.scanId)return;}state._dTried=(state._dTried||0)+(data._tried||0);state._dFail=(state._dFail||0)+(data._fails||0);state._dRaw=(state._dRaw||0)+((data.elements||[]).length);try{console.log('[DipMapper]',kind,(rr/1000|0)+'km','raw='+((data.elements||[]).length),'fails='+(data._fails||0)+'/'+(data._tried||0))}catch(e){}const venues=(data.elements||[]).map(osmToVenue).filter(Boolean).filter(v=>dist(lat,lon,v.lat,v.lon)<=radiusKm+0.5);state._dKept=(state._dKept||0)+venues.length;if(venues.length)merge(venues)}catch(e){}finally{if(scanId!==state.scanId)return;completed++;const n=Math.min(10,state.results.length);const elapsed=Math.round((Date.now()-state.lastSearchStarted)/1000);progress(n>=10?'Spots ready':n>=5?'Top 5 ready':'Searching local water',n>=10?92:Math.min(86,32+completed*7+n*5),n?n+' local options ranked in '+elapsed+'s. More details and parking keep loading.':'Still checking close map data and local names.');if(n)prefetchParkingSoon('results-added');render();drawMap();try{if(!state.results.length&&els.statusText){var _f=(state._dFail||0),_t=(state._dTried||0);els.statusText.textContent=(_t&&_f>=_t)?'Map servers are busy \u2014 retrying\u2026':'Still checking map data nearby.';console.log('[DipMapper]',{sent:state._dSent,replied:_t,failed:_f,raw:state._dRaw,kept:state._dKept});}}catch(e){}}})()};
state._dTried=0;state._dFail=0;state._dRaw=0;state._dKept=0;state._dSent=0;
 wave1.forEach(run);
 setTimeout(()=>{if(scanId===state.scanId&&state.results.length<10)textRescue(scanId,state.label,0)},250);
 setTimeout(()=>{if(scanId===state.scanId)wave2.forEach(run)},500);setTimeout(()=>{if(scanId===state.scanId)wave3.forEach(run)},1400);
 setTimeout(()=>{if(scanId===state.scanId&&state.results.length<10)textRescue(scanId,state.label,0)},3000);
 setTimeout(()=>{if(scanId===state.scanId&&state.results.length<20)wave4.forEach(run)},3000);setTimeout(()=>{if(scanId===state.scanId)fetchTravelTimes()},2600);setTimeout(()=>{if(scanId===state.scanId)fetchTravelTimes()},7000);
 setTimeout(()=>{if(scanId===state.scanId&&state.results.length<5)textRescue(scanId,state.label,0)},6200);
 setTimeout(()=>{if(scanId===state.scanId){const n=Math.min(10,state.results.length);progress(n>=10?'Spots ready':n>=5?'Top 5 ready':'Search still running',n>=10?96:Math.max(70,30+n*8),n?n+' local options ranked. More choices, photos and parking keep loading while you browse.':'No strong venue yet. Try a larger radius or a more specific beach/town name.')}} ,15000);
 startContinuousLoading(scanId);
}
function osmPhotoUrl(t){try{function fp(n){return 'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(String(n).replace(/^File:/i,'').replace(/ /g,'_'))+'?width=640'}var c=t.wikimedia_commons||'';if(/^File:/i.test(c))return fp(c);var im=t.image||t['image:0']||'';if(/^File:/i.test(im))return fp(im);if(/^https:\/\//i.test(im)&&/\.(jpe?g|png|webp)(\?|$)/i.test(im))return im;return ''}catch(e){return ''}}
/* v22.16 language hygiene + non-swimming filter */
const DM_NOT_SWIM=/billard|billiard|snooker|\bpool\s*-?\s*(bar|hall|halle|club|caf[eé]|lounge|party|table|tisch|salon|room|stube)\b|\bpoolbar|\bpoolhalle|\b8[\s-]?ball\b|car\s?pool|\bdarts?\b|\bbowling|kegel/i;
const DM_SWIM_LEISURE=/^(swimming_pool|swimming_area|water_park|bathing_place|beach_resort)$/;
function dmIsSwimTagged(t){return DM_SWIM_LEISURE.test(t.leisure||'')||t.amenity==='public_bath'||/swimming/.test(t.sport||'')||/^(yes|designated|official)$/.test(t.swimming||'')||/^(yes|designated|official)$/.test(t.bathing||'')||/^(beach|hot_spring)$/.test(t.natural||'')}
function dmNotSwimming(name,t){if(/(^|;)(billiards|snooker|darts|bowling|9pin|10pin)(;|$)/.test(t.sport||'')&&!/swimming/.test(t.sport||''))return true;
 if(DM_NOT_SWIM.test(name)&&!(t.leisure==='swimming_pool'||/swimming/.test(t.sport||'')))return true;return false}
function dmNonSwimVenue(t){return /^(bar|pub|cafe|restaurant|nightclub|casino|fast_food|biergarten|ice_cream)$/.test(t.amenity||'')||!!t.shop||!!t.craft||/^(sports_centre|fitness_centre|adult_gaming_centre|amusement_arcade|bowling_alley)$/.test(t.leisure||'')}
/* English gloss for local place names; the local name itself is never changed */
const DM_TERMS=[[/\b(parkplatz|parkhaus|aparcamiento|parcheggio|parking)\b/i,'Car Park'],[/\b(strandbad)\b/i,'Lido'],[/\b(seebad|lake bath)\b/i,'Lake Bath'],[/\b(flussbad)\b/i,'River Bath'],[/\b(freibad|freischwimmbad)\b/i,'Outdoor Pool'],[/\b(hallenbad|schwimmhalle)\b/i,'Indoor Pool'],
 [/\b(schwimmbad|kolymvitirio|piscina municipal|piscine municipale|piscina comunale|piscina|piscine|freizeitbad|erlebnisbad)\b/i,'Swimming Pool'],[/\b(naturbad|naturfreibad)\b/i,'Natural Pool'],[/\b(thermalbad|therme|terme|thermes|termas|loutra)\b/i,'Thermal Baths'],
 [/\b(badestelle|badeplatz|badestrand|badebucht)\b/i,'Bathing Spot'],[/\b(strand|plage|playa|praia|spiaggia|platja|paralia|plaz|plazh)\b/i,'Beach'],[/\b(bucht|ormos|cala|caló|calo|baie|baia|bahía|bahia)\b/i,'Bay'],
 [/\b(akti)\b/i,'Coast'],[/\b(see|limni|lago|lac)\b/i,'Lake'],[/\b(weiher|teich)\b/i,'Pond']];
const DM_WORDS=[[/\bhafen\b/gi,'Harbour'],[/\binsel\b/gi,'Island'],[/\bfluss\b/gi,'River'],[/\bufer\b/gi,'Shore'],[/\bmole\b/gi,'Pier'],[/\bsteg\b/gi,'Jetty'],[/\bfelsen\b/gi,'Rocks'],[/\bleuchtturm\b/gi,'Lighthouse'],[/\baltstadt\b/gi,'Old Town'],[/\bdorf\b/gi,'Village'],[/\bkirche\b/gi,'Church'],[/\bwald\b/gi,'Forest'],[/\bbr(ü|ue)cke\b/gi,'Bridge'],[/\bnisi\b/gi,'Island'],[/\blimani\b/gi,'Harbour'],[/\bpuerto\b/gi,'Harbour'],[/\bporto\b/gi,'Harbour'],[/\bport\b/gi,'Harbour']];
const DM_FILL=/\b(von|vom|bei|am|an|der|die|das|des|de|del|della|di|du|la|le|les|el|los|las|tis|tou|ton|ta|o|i|to|dei|delle)\b/gi;
function dmGloss(name){const n=String(name||'').trim();if(!n)return '';for(const [re,en] of DM_TERMS){if(re.test(n)){let rest=n.replace(re,' ');
  DM_WORDS.forEach(function(w){rest=rest.replace(w[0],w[1])});rest=rest.replace(DM_FILL,' ').replace(/[\s,·\-–]+/g,' ').trim();if(rest&&DM_TERMS.some(function(x){return x[0].test(rest)}))rest=dmGloss(rest)||rest;
  rest=rest.replace(DM_FILL,' ').replace(/[\s,·\-–]+/g,' ').trim();if(!rest)return en==='Car Park'?'Car park':en;return rest+' '+en}}return ''}
/* opening hours: map notation and German words to plain English */
function dmHours(h){let s=String(h||'').trim();if(!s)return '';const D={Mo:'Mon',Tu:'Tue',We:'Wed',Th:'Thu',Fr:'Fri',Sa:'Sat',Su:'Sun',Di:'Tue',Mi:'Wed',Do:'Thu',So:'Sun'};
 if(s==='24/7')return 'Open 24 hours';
 s=s.replace(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*Uhr\b/gi,'$1:00–$2:00').replace(/\b(\d{1,2})\s*Uhr\b/gi,'$1:00').replace(/\bFeiertage?n?\s+geschlossen\b/gi,'closed on public holidays').replace(/\bMai\b/g,'May').replace(/\bJuni\b/g,'June').replace(/\bJuli\b/g,'July').replace(/\bOkt\b\.?/g,'Oct').replace(/\bDez\b\.?/g,'Dec').replace(/\bM(ä|ae)r\b\.?/g,'Mar')
  .replace(/\bt(ä|ae)glich\b/gi,'daily').replace(/\bgeschlossen\b/gi,'closed').replace(/\bge(ö|oe)ffnet\b/gi,'open').replace(/\bbis\b/gi,'–').replace(/\s*Uhr\b/gi,'').replace(/\bund\b/gi,'and').replace(/\bFeiertag(e|en)?\b/gi,'public holidays').replace(/\bnach Vereinbarung\b/gi,'by appointment')
  .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|Di|Mi|Do|So)\b(?=\s*[-–,: 0-9]|\s*$|;)/g,m=>D[m]||m).replace(/\bPH\s+off\b/g,'closed on public holidays').replace(/\bSH\s+off\b/g,'closed in school holidays').replace(/\bPH\b/g,'public holidays').replace(/\boff\b/g,'closed')
  .replace(/\bsunrise\s*-\s*sunset\b/gi,'sunrise to sunset').replace(/(\d)\s*-\s*(\d)/g,'$1–$2').replace(/([A-Za-z])-([A-Za-z])/g,'$1–$2').replace(/\s*;\s*/g,'; ').replace(/\s{2,}/g,' ');return s}
/* rough language check for free-text descriptions */
function dmLang(t){t=' '+String(t||'').toLowerCase()+' ';if(/[\u0370-\u03ff]/.test(t))return 'Greek';const c=re=>(t.match(re)||[]).length;
 const sc={English:c(/\s(the|and|with|is|for|of|to|this|on|are|from|beach|open|free)\s/g),German:c(/\s(und|der|die|das|mit|ist|nicht|für|im|am|zum|zur|ein|eine|auf|bei|sehr|nur|auch|hier|liegen|strand|parkplatz|eintritt|kostenlos)\s/g)+c(/[äöüß]/g),
  Italian:c(/\s(il|della|con|per|una|sono|spiaggia|anche|molto)\s/g),Spanish:c(/\s(el|los|las|con|para|una|playa|muy|también)\s/g),French:c(/\s(le|les|avec|pour|une|est|plage|très|aussi)\s/g)};
 let best='English';for(const k in sc)if(sc[k]>sc[best])best=k;return sc[best]===0?'English':best}

function osmToVenue(e){const t=e.tags||{},lat=+(e.lat??e.center?.lat),lon=+(e.lon??e.center?.lon);if(!lat||!lon)return null;if(t.access==='private'||t.access==='no'||t.access==='permit')return null;if(dmJunk(t))return null;let name=(t.name||t['name:en']||t.int_name||t.alt_name||t.official_name||t.loc_name||'').trim();let c='bath';const text=norm([name,t.leisure,t.amenity,t.natural,t.waterway,t.sport,t.swimming,t.bathing].join(' '));if(t.natural==='beach'||/beach|strand|plage|playa|praia|spiaggia|cala|bay|paralia|platja/.test(text))c='beach';else if(t.natural==='hot_spring'||/thermal|therme|terme|spring|spa|sauna/.test(text))c='thermal';else if(t.waterway==='waterfall'||/waterfall|river|fluss|wild/.test(text))c='wild';else if(t.leisure==='swimming_area'||t.amenity==='public_bath'||/seebad|\bbadi\b|naturbad|badeplatz|bathing_place|bathing/.test(text))c='bath';else if(t.leisure==='swimming_pool'||/\bpool\b|piscina|hallenbad|freibad|swimming_pool/.test(text))c='pool';if(!name)return null;if(BAD.test(norm(name+' '+(t.description||''))))return null;if(dmNotSwimming(name,t))return null;if(c==='pool'&&!dmIsSwimTagged(t)&&(dmNonSwimVenue(t)||!/piscina|piscine|hallenbad|freibad|schwimmbad|swimming|lido|bad\b/i.test(name)))return null;const s=c==='beach'||c==='wild'?'Outdoor':(/indoor|hallenbad|cubierta|coberta/.test(text)||t.indoor==='yes'?'Indoor':(/outdoor|freibad|lido|strand/.test(text)||t.indoor==='no'?'Outdoor':''));const free=t.fee==='no'||c==='beach';const photo=osmPhotoUrl(t);return {id:`osm-${e.type}-${e.id}`,name,westernName:westernizeName(name,t,c),cat:c,setting:s,lat,lon,address:[t['addr:street'],t['addr:housenumber'],t['addr:city']].filter(Boolean).join(' '),website:t.website||t['contact:website']||t.url||t['contact:url']||'',phone:t.phone||t['contact:phone']||'',email:t.email||t['contact:email']||'',operator:t.operator||'',access:t.access||'',feeTag:t.fee||'',country:(t['addr:country']||'').toUpperCase(),idRequired:(t['id_required']==='yes'||t['identification']==='required'||/(^|;)(id|passport|photo_id|identification)(;|$)/i.test(t['access:conditional']||'')||/ausweis|lichtbildausweis|photo id|identification required|registration required/i.test((t.description||'')+' '+(t['description:en']||''))),descr:(t['description:en']||(dmLang(t.description)==='English'?(t.description||''):'')),descrLocal:(!t['description:en']&&t.description&&dmLang(t.description)!=='English')?{lang:dmLang(t.description),text:t.description}:null,wikipedia:t.wikipedia||'',wikidata:t.wikidata||'',osmType:e.type,osmId:e.id,free,price:free?{currency:'EUR',adult:0}:undefined,hours:dmHours(t.opening_hours||''),season:t.seasonal==='yes'?'Seasonal (according to map data)':'',facilities:[t.toilets&&'toilets',t.shower&&'showers',t.wheelchair==='yes'&&'accessible',t.supervised==='yes'&&'supervised',t.food&&'food / kiosk'].filter(Boolean),highlights:[free&&'free',t.supervised==='yes'&&'supervised'].filter(Boolean),photos:photo?[photo]:[],story:makeStory(name,c,{setting:s,free}),parking:[],transit:[]}}
function makeStory(name,c,o={}){const n=String(name||'This place');if(c==='beach')return `${n} is a shoreline option: judge it by water access, shade, wind, toilets, food and the return route. A good beach card should make the visit feel predictable before you leave.`;if(c==='pool')return `${n} is the controlled swim choice: useful for lanes, changing rooms, supervision and predictable conditions when beach weather or crowds are uncertain.`;if(c==='thermal')return `${n} is the slower water stop, chosen for comfort, architecture, warm water or spa facilities rather than a pure open-water swim.`;return `${n} is an open-water candidate. It can be excellent, but access points, currents and local rules matter more here than at a managed pool.`}
var DM_BLANK='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function dmImgWatchdog(){try{
 var now=Date.now(),imgs=document.getElementsByTagName('img');
 for(var i=0;i<imgs.length;i++){var im=imgs[i];
  if(im.dataset.dmDead)continue;
  if(im.complete){if(im.dataset.dmT)delete im.dataset.dmT;continue}
  if(!im.dataset.dmT){im.dataset.dmT=String(now);continue}
  if(now-Number(im.dataset.dmT)>12000){
   var u=im.currentSrc||im.src;
   im.dataset.dmDead='1';
   try{if(u&&state&&state.failedPhotos)state.failedPhotos.add(typeof cleanPhotoUrl==='function'?cleanPhotoUrl(u):u)}catch(e){}
   im.removeAttribute('srcset');im.src=DM_BLANK;
  }}
}catch(e){}}
setInterval(dmImgWatchdog,4000);
function dmIdRequired(v){return !!(v&&v.idRequired)}
function dmGermanPool(v){try{
 if(!v)return false;
 var isPool=(v.cat==='pool'||v.cat==='bath');
 if(!isPool)return false;
 if(v.country==='DE')return true;
 // fall back to address / label text only (never guesses beyond stated data)
 var hay=((v.address||'')+' '+(state&&state.label||'')).toLowerCase();
 return /(germany|deutschland)\b/.test(hay);
}catch(e){return false}}
function dmEntryNotice(v){
 if(dmIdRequired(v))return 'Photo ID required for entry \u2014 bring a valid ID or passport.';
 if(dmGermanPool(v))return 'Some German public pools now require photo ID or online registration to enter. Check the venue\u2019s official site before you go.';
 return '';
}
function dmAdsReady(){if(location.protocol==='file:')return false;var A=window.DM_ADS;return !!(A&&A.client)}
function dmGateVisible(){if(document.getElementById('dmSplash')||document.getElementById('dmBoot'))return true;var g=document.querySelector('.gate');return !!(g&&!g.classList.contains('hidden')&&g.style.display!=='none')}
function dmAdBox(id,slot,fmt){var box=document.createElement('div');box.className='dmAd';box.id=id;
 var lab=document.createElement('span');lab.className='dmAdLabel';lab.textContent='Advertisement';box.appendChild(lab);
 var ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';
 ins.setAttribute('data-ad-client',window.DM_ADS.client);ins.setAttribute('data-ad-slot',slot);
 ins.setAttribute('data-ad-format',fmt||'auto');ins.setAttribute('data-full-width-responsive','true');
 box.appendChild(ins);return box}
function dmPush(box){if(window.dmAllowAds!==true)return;try{var ins=box.querySelector('ins.adsbygoogle');if(ins&&!ins.dataset.dmPushed){ins.dataset.dmPushed='1';(window.adsbygoogle=window.adsbygoogle||[]).push({})}}catch(e){}}
function dmAdCheck(){try{
 if(new URLSearchParams(location.search).get('adcheck')!=='1')return;
 var A=window.DM_ADS||{};
 var box=document.createElement('div');
 box.id='dmDiag';
 box.style.cssText='position:fixed;right:10px;bottom:10px;z-index:99999;background:#fffefa;border:1px solid #dceae7;border-radius:12px;padding:12px 14px;font:12px/1.55 ui-monospace,Menlo,Consolas,monospace;box-shadow:0 12px 34px rgba(7,52,59,.24);max-width:min(94vw,430px);max-height:80vh;overflow:auto';
 document.body.appendChild(box);
 var tc={applies:null,consent:null};
 try{if(window.__tcfapi)window.__tcfapi('getTCData',2,function(d,ok){if(ok&&d){tc.applies=!!d.gdprApplies;try{tc.consent=!!(d.purpose&&d.purpose.consents&&d.purpose.consents[1])}catch(e){}}});}catch(e){}
 var adstxt='pruefe...';
 try{fetch('/ads.txt',{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).then(function(t){adstxt=(t.indexOf(String(A.client||'').replace('ca-',''))>=0)?'ok':'FEHLT/falsch';}).catch(function(){adstxt='nicht erreichbar'});}catch(e){}
 function paint(){
  var ins=[].slice.call(document.querySelectorAll('ins.adsbygoogle'));
  var st=ins.map(function(e){return e.getAttribute('data-ad-status')||'(keine Antwort)'});
  var filled=st.filter(function(x){return x==='filled'}).length;
  var unfilled=st.filter(function(x){return x==='unfilled'}).length;
  var pending=st.filter(function(x){return x==='(keine Antwort)'}).length;
  var loaded=!!(window.adsbygoogle&&(window.adsbygoogle.loaded===true||Array.isArray(window.adsbygoogle)));
  var cmp=!!window.googlefc, tcf=!!window.__tcfapi;
  var verdict, why;
  if(filled>0){verdict='ANZEIGEN WERDEN AUSGELIEFERT';why='Alles laeuft. Falls du nichts siehst: Ad-Blocker.'}
  else if(unfilled>0){verdict='GOOGLE ANTWORTET: "unfilled"';why='Die Anzeigenanfrage geht raus, Google liefert aber nichts. Ursache liegt IM KONTO: Website noch nicht freigegeben, oder Einwilligung verweigert. Nicht im Code.'}
  else if(ins.length===0){verdict='KEIN ANZEIGENPLATZ';why='Auto ads hat nichts eingefuegt. In AdSense: Anzeigen -> deine Website -> Automatische Anzeigen EIN -> Auf Website anwenden.'}
  else if(pending>0){verdict='NOCH KEINE ANTWORT VON GOOGLE';why='Der Platz existiert, aber Google hat noch nicht geantwortet. Meist: Konto/Website noch in Pruefung. Kann bis zu 1 Stunde nach dem Einschalten dauern.'}
  else{verdict='UNKLAR';why=''}
  function r(k,v,ok){return '<tr><td style="padding-right:10px;color:#5f8189">'+k+'</td><td><b>'+v+'</b></td><td style="padding-left:6px">'+(ok===null?'':(ok?'\u2713':'\u2717'))+'</td></tr>'}
  box.innerHTML='<div style="font:700 12.5px/1.6 system-ui;margin-bottom:6px">Anzeigen-Diagnose v2</div><table>'
   +r('Protokoll',location.protocol,location.protocol!=='file:')
   +r('Publisher-ID',A.client||'fehlt',!!A.client)
   +r('AdSense-Skript geladen',loaded?'ja':'NEIN \u2013 Ad-Blocker?',loaded)
   +r('ads.txt',adstxt,adstxt==='ok')
   +r('Anzeigenpl\u00e4tze (ins)',String(ins.length),ins.length>0)
   +r('&nbsp;\u2514 filled',String(filled),filled>0?true:null)
   +r('&nbsp;\u2514 unfilled',String(unfilled),unfilled>0?false:null)
   +r('&nbsp;\u2514 keine Antwort',String(pending),pending>0?false:null)
   +r('Google CMP geladen',cmp?'ja':'nein',cmp)
   +r('TCF-API vorhanden',tcf?'ja':'nein',tcf)
   +r('DSGVO gilt hier',tc.applies===null?'unbekannt':(tc.applies?'ja':'nein'),null)
   +r('Einwilligung erteilt',tc.consent===null?'unbekannt':(tc.consent?'ja':'NEIN \u2013 keine Anzeigen'),tc.consent===null?null:tc.consent)
   +r('Startbild offen',dmGateVisible()?'ja':'nein',!dmGateVisible())
   +'</table>'
   +'<div style="margin-top:9px;padding:8px 10px;background:#f4fbfa;border:1px solid #dceae7;border-radius:9px">'
   +'<b style="font:700 12px/1.5 system-ui">'+verdict+'</b><div style="margin-top:3px;color:#33606a">'+why+'</div></div>'
   +'<button style="margin-top:9px;border:1px solid #dceae7;background:#fff;border-radius:8px;padding:5px 10px;cursor:pointer;font:inherit" onclick="document.getElementById(\'dmDiag\').remove()">Schliessen</button>';
 }
 paint(); var n=0; var iv=setInterval(function(){paint(); if(++n>12)clearInterval(iv)},2000);
}catch(e){}}
function mountAds(){try{
 if(!dmAdsReady()||dmGateVisible())return;
 var A=window.DM_ADS;
 if(A.header&&!document.getElementById('dmAdTop')){var h=document.querySelector('header.topbar');
  if(h&&h.parentNode){var b=dmAdBox('dmAdTop',A.header,'horizontal');h.parentNode.insertBefore(b,h.nextSibling);dmPush(b)}}
 if(A.mid&&!document.getElementById('dmAdMid')){var m=document.getElementById('mapPanel');
  if(m&&m.parentNode){var b2=dmAdBox('dmAdMid',A.mid,'auto');m.parentNode.insertBefore(b2,m.nextSibling);dmPush(b2)}}
 if(A.list&&!document.getElementById('dmAdList')){var rl=document.getElementById('results');if(rl&&rl.parentNode){var b4=dmAdBox('dmAdList',A.list,'auto');rl.parentNode.insertBefore(b4,rl.nextSibling);dmPush(b4)}}
  if(A.footer&&!document.getElementById('dmAdBottom')){var l=document.querySelector('.legal');
  if(l&&l.parentNode){var b3=dmAdBox('dmAdBottom',A.footer,'auto');l.parentNode.insertBefore(b3,l);dmPush(b3)}}
}catch(e){}}
function gateOff(){if(!els.gate)return;els.gate.classList.add('hidden');els.gate.style.display='none';try{const _b=els.gate.querySelector('.dmGateFull');if(_b)_b.remove()}catch(e){}setTimeout(mountAds,80)}
function priceHtml(v){if(!v.price)return'';const c=v.price.currency||'USD',rows=[];for(const [k,label] of [['adult','Adult'],['child','Child'],['youth','Youth'],['senior','Senior']])if(v.price[k]!=null)rows.push(`<div class="fact"><div class="k">${label}</div><div>${usd(v.price[k],c)}</div></div>`);return rows.join('')}
function weatherHtml(v){const days=['Today','Tomorrow','+2 days','Weekend'];return `<div class="weather">${days.map((d,i)=>`<div class="day"><div class="wicon">${i===0?'🌤️':i===2?'🌧️':'☀️'}</div><div>${d}</div><div>${Math.round((((state.currentWeather&&state.currentWeather.temp)||21))-3+i)}–${Math.round((((state.currentWeather&&state.currentWeather.temp)||21))+3+i)}°C</div><div class="muted">rain ${Math.min(95,Math.round((((state.currentWeather&&state.currentWeather.rainProb)||20))+i*8))}% · wind ${Math.round((((state.currentWeather&&state.currentWeather.wind)||10))+i*2)} km/h</div><div>💧 ${dmWaterLabel(v)}</div></div>`).join('')}</div>`}
function adminKey(v){const t=norm([state.label,v.name,v.address].join(' '));if(t.includes('herrliberg')||t.includes('steinrad'))return 'herrliberg';if(t.includes('meilen')||t.includes('dorfmeilen')||t.includes('feldmeilen')||t.includes('ländeli')||t.includes('laendeli')||t.includes('dollikon'))return 'meilen';if(t.includes('zurich')||t.includes('zürich'))return 'zurich';if(t.includes('rostock')||t.includes('warnem')||t.includes('markgrafenheide')||t.includes('hohe düne')||t.includes('hohe duene'))return 'rostock';if(t.includes('rhodes')||t.includes('faliraki')||t.includes('lindos'))return 'rhodes';if(t.includes('miami')||t.includes('south beach')||t.includes('key biscayne'))return 'miami';if(t.includes('palma')||t.includes('mallorca'))return 'palma';return 'generic'}
function adminBadges(v){const a=ASSETS[adminKey(v)]||ASSETS.generic;const rows=[['Municipality',a[0],a[4][0]],['Region',a[1],a[4][1]],['Country',a[2],a[4][2]||a[3]]];return `<div class="badges">${rows.map(r=>`<div class="badge"><div class="badgeIcon">${r[2]?`<img src="${esc(r[2])}" alt="" onerror="this.replaceWith(document.createTextNode('${esc(a[3])}'))">`:esc(a[3])}</div><div><div class="k">${r[0]}</div><div>${esc(r[1])}</div></div></div>`).join('')}</div>`}
function areaStory(v){const t=norm([state.label,v.name,v.address].join(' '));if(t.includes('zurich')||t.includes('zürich'))return 'The Zürich lakefront adds a lot around the swim: tram stops, promenades, cafés, shaded quays, Stadelhofen or Bellevue for arrival, and quick alternatives if wind or weather changes. It is urban and practical rather than hidden.';if(t.includes('rostock')||t.includes('warnem')||t.includes('markgrafenheide'))return 'Rostock gives you a proper Baltic choice set: quick S-Bahn access to Warnemünde, quieter sand toward Hohe Düne and Markgrafenheide, and an indoor fallback in town when wind, cold water or rain make the coast less attractive.';if(t.includes('rhodes'))return 'Rhodes works best with a small plan around the swim: town beaches for convenience, Faliraki for services, Anthony Quinn or Ladiko for a scenic cove, and Lindos when you want streets and viewpoints with the bay.';if(t.includes('miami')||t.includes('south beach')||t.includes('key biscayne'))return 'Around Miami, the practical choice is about section and timing: South Beach for the full urban swim impression, Lummus for easiest visitor logistics, Virginia Key or Crandon for more space, and Haulover when you want a longer Atlantic beach with parking planned up front.';if(t.includes('palma')||t.includes('mallorca'))return 'Around Palma, beach choice depends on mood: the bay for easy logistics, Cala Major for a compact sea edge, and municipal pools when wind, jellyfish or beach crowds make a controlled swim better.';return 'Look beyond the water: shade, food, toilets, transit and a backup route are what turn a nice swim into a good visit.'}
function sourceLinks(v){const links=[];if(v.website)links.push(['⌂','Operator',v.website]);links.push(['◎','Map data',`https://www.openstreetmap.org/search?query=${encodeURIComponent(v.lat+' '+v.lon)}`]);links.push(['▧','Open photos',`https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(plainName(v))}`]);links.push(['☀','Weather','https://open-meteo.com/']);links.push(['★','Reviews lookup',`https://www.openstreetmap.org/search?query=${encodeURIComponent(plainName(v)+' '+(v.address||state.label))}`]);return `<div class="sources">${links.map(x=>`<a class="source" href="${esc(x[2])}" target="_blank" rel="noopener">${x[0]} ${x[1]}</a>`).join('')}</div>`}
function cleanParkingName(t){return (t.name||t['name:en']||t.operator||'Public parking').replace(/\s+/g,' ').trim()}
function parkingAllowed(t){const blob=norm(Object.entries(t||{}).map(([k,v])=>k+' '+v).join(' '));if(/private|customers|customer|permit|residents|resident|no parking|construction|closed|employees|staff|reserved|delivery/.test(blob))return false;if(t.access&&/private|customers|permit|residents|no/.test(String(t.access)))return false;if(t.parking&&/private|customers/.test(String(t.parking)))return false;return true}
function parkingScore(p){return (p.fee==='free'?-500:0)+(p.open==='yes'?-100:0)+(p.congestion==='low'?0:p.congestion==='medium'?90:180)+(p.d||9)*100}
function parkingFor(v){const cached=state.parkingCache.get(v.id)||[];const seeded=(v.parking||[]).map(p=>({...p,source:p.source||'operator/seed',open:p.open||'likely',d:dist(v.lat,v.lon,p.lat,p.lon)}));const by=new Map();for(const p of [...cached,...seeded]){if(!p||!p.lat||!p.lon)continue;const key=(norm(p.name||'parking')+'-'+p.lat.toFixed(4)+'-'+p.lon.toFixed(4));by.set(key,{...p,d:dist(v.lat,v.lon,p.lat,p.lon)})}return [...by.values()].filter(p=>p.d<1.3).sort((a,b)=>parkingScore(a)-parkingScore(b)).slice(0,6)}
function saveParkingForVenue(v,items){const current=state.parkingCache.get(v.id)||[];const all=[...current,...(items||[])].map(p=>({...p,d:dist(v.lat,v.lon,p.lat,p.lon)}));const by=new Map();for(const p of all){if(!p||!p.lat||!p.lon)continue;by.set(norm(p.name||'parking')+'-'+p.lat.toFixed(4)+'-'+p.lon.toFixed(4),p)}state.parkingCache.set(v.id,[...by.values()].sort((a,b)=>parkingScore(a)-parkingScore(b)).slice(0,8));state.parkingPrefetch.add(v.id)}
function fetchJsonTimeout(url,opts={},ms=5500){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms);return fetch(url,{...opts,signal:ac.signal}).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()}).finally(()=>clearTimeout(t))}
async function overpassFast(q,ms=34000){const eps=['https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://z.overpass-api.de/api/interpreter','https://lz4.overpass-api.de/api/interpreter'].slice().sort(function(){return Math.random()-0.5});const encoded='data='+encodeURIComponent(q);return new Promise(resolve=>{let pending=eps.length,best={elements:[]},done=false,fails=0;const finish=d=>{if(!done){done=true;d=d||best;try{d._fails=fails;d._tried=eps.length}catch(e){}resolve(d)}};const timer=setTimeout(()=>finish(best),ms+350);const check=d=>{if(done)return;const els=d&&d.elements?d.elements:[];if(els.length){clearTimeout(timer);finish(d)}else{pending--;if(els.length>(best.elements||[]).length)best=d;if(!pending){clearTimeout(timer);finish(best)}}};const fail=()=>{fails++;pending--;if(!pending){clearTimeout(timer);finish(best)}};eps.forEach(u=>{fetchJsonTimeout(u+'?'+encoded,{},ms).then(check).catch(fail)})})}
function prefetchParkingSoon(reason=''){clearTimeout(state.parkingTimer);state.parkingTimer=setTimeout(()=>prefetchParking(),250)}
async function prefetchParking(){if(state.parkingBusy||!state.center)return;const list=filtered().slice(0,10);const todo=list.filter(v=>!state.parkingPrefetch.has(v.id));if(!todo.length)return;state.parkingBusy=true;const tick=++state.parkingTick;try{for(const v of todo){if(v.parking?.length)saveParkingForVenue(v,v.parking.map(p=>({...p,source:'operator/seed'})))}render();drawMap();const union=todo.slice(0,10).map(v=>`nwr["amenity"="parking"](around:950,${v.lat},${v.lon});nwr["parking"~"surface|multi-storey|underground"](around:950,${v.lat},${v.lon});`).join('');const q=`[out:json][timeout:6];(${union});out body center qt 120;`;const data=await overpassFast(q,5200);if(tick!==state.parkingTick)return;const raw=(data.elements||[]).map(e=>{const t=e.tags||{},lat=+(e.lat??e.center?.lat),lon=+(e.lon??e.center?.lon);if(!lat||!lon||!parkingAllowed(t))return null;return {name:cleanParkingName(t),lat,lon,fee:t.fee==='no'?'free':(t.fee==='yes'?'paid':'fee unknown'),open:t.opening_hours?'check hours':'likely',congestion:'model check',source:'open map'}}).filter(Boolean);for(const v of todo){const near=raw.filter(p=>dist(v.lat,v.lon,p.lat,p.lon)<1.2);saveParkingForVenue(v,near)}if(state.selected){const v=state.results.find(x=>x.id===state.selected);if(v){state.parking=parkingFor(v);openCard(v.id,true)}}render();drawMap()}finally{state.parkingBusy=false}}
async function loadParking(v){state.parking=parkingFor(v);drawMap();if(state.parkingPrefetch.has(v.id)&&state.parking.length)return;try{const q=`[out:json][timeout:5];(nwr["amenity"="parking"](around:950,${v.lat},${v.lon});nwr["parking"~"surface|multi-storey|underground"](around:950,${v.lat},${v.lon}););out body center qt 60;`;const data=await overpassFast(q,5000);const found=(data.elements||[]).map(e=>{const t=e.tags||{},lat=+(e.lat??e.center?.lat),lon=+(e.lon??e.center?.lon);if(!lat||!lon||!parkingAllowed(t))return null;return {name:cleanParkingName(t),lat,lon,fee:t.fee==='no'?'free':(t.fee==='yes'?'paid':'fee unknown'),open:t.opening_hours?'check hours':'likely',congestion:'model check',source:'open map',d:dist(v.lat,v.lon,lat,lon)}}).filter(Boolean);saveParkingForVenue(v,found);state.parking=parkingFor(v);if(state.selected===v.id)openCard(v.id,true);drawMap()}catch(e){state.parkingPrefetch.add(v.id)}}
function venueDetails(v){const b=[];const ac=String(v.access||'').toLowerCase();
 if(v.operator)b.push('Operated by '+v.operator+'.');
 if(ac==='customers')b.push('Access is for customers of the venue only.');
 else if(ac==='members')b.push('Access is for members only.');
 else if(ac==='yes'||ac==='public')b.push('Publicly accessible.');
 if(v.feeTag==='yes')b.push('An entry fee applies.');else if(v.feeTag==='no')b.push('Entry is free.');
 if(v.hours)b.push('Listed hours: '+String(v.hours).replace(/[.\s]+$/,'')+'.');
 if(v.driveMin!=null&&v.driveKm!=null)b.push('About '+v.driveMin+' min by road ('+v.driveKm.toFixed(1)+' km).');
 if(v.detour&&v.detour>=1.8)b.push('The road route is much longer than the straight-line distance, so it is further than it looks on the map.');
 if(!v.website)b.push('No official website is listed in the map data \u2014 use Research to look it up.');
 return b.length?(' '+esc(b.join(' '))):''}
async function fetchOfficialSite(v){if(!v||v.website||!v.wikidata||v._wdTried)return;v._wdTried=1;
 try{const j=await fetchJsonTimeout('https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P856&entity='+encodeURIComponent(v.wikidata)+'&format=json&origin=*',{},4500);
  const c=j&&j.claims&&j.claims.P856&&j.claims.P856[0];const u=c&&c.mainsnak&&c.mainsnak.datavalue&&c.mainsnak.datavalue.value;
  if(u&&/^https?:\/\//i.test(u)){v.website=u;if(state.selected===v.id)openCard(v.id,true)}}catch(e){}}
const FAC_EN=[[/badeshop|bade-shop/i,'Swim shop'],[/liegewiese|liegeflaeche|meadow|rasen/i,'Lawn'],[/kinderplansch\w*|planschbecken|paddling/i,'Children\u2019s paddling pool'],[/rutschbahn|wasserrutsche|rutsche|slide/i,'Water slide'],[/spielplatz|playground/i,'Playground'],[/beachvolleyball|volleyball/i,'Beach volleyball'],[/tischtennis|table tennis/i,'Table tennis'],[/sprungturm|sprungbrett|diving/i,'Diving board'],[/nichtschwimmer/i,'Non-swimmer area'],[/kneipp/i,'Kneipp pool'],[/parkplatz|parking/i,'Parking'],[/dusche|shower/i,'Showers'],[/umkleide|garderobe|kabine|changing|locker/i,'Changing rooms'],[/^wc$|toilette|toilet/i,'Toilets'],[/kiosk|imbiss|snack/i,'Kiosk'],[/restaurant|bistro|caf/i,'Restaurant'],[/sauna|dampfbad/i,'Sauna'],[/feuerstelle|grill|bbq|barbecue/i,'BBQ'],[/bootsverleih|boat rent|kayak|pedalo/i,'Boat rental'],[/steg|jetty|pier/i,'Jetty'],[/liegestuhl|sun lounger/i,'Sun loungers'],[/rollstuhl|barrierefrei|wheelchair|accessible|step-free/i,'Step-free access'],[/aufsicht|badmeister|supervised|lifeguard/i,'Lifeguard'],[/food/i,'Food']];
function dmNoLifeguard(v){return /no lifeguard|not supervised|unsupervised|kein(e)?\s+(aufsicht|badmeister)|ohne aufsicht/i.test([v.season,v.hours,v.story,v.setting].join(' '))}
function facilityLabel(f){const t=String(f||'').trim();for(const [re,en] of FAC_EN){if(re.test(t))return en}return t.charAt(0).toUpperCase()+t.slice(1)}
function facilityIcon(f){const t=String(f||'');if(/\b\d+\s*m\b.*pool|lanes?\b|teaching pool|indoor pool|lap pool/i.test(t))return '🏊';if(/swim shop/i.test(t))return '🛍️';if(/massage/i.test(t))return '💆';
 if(/toilet|wc/i.test(t))return '🚻'; if(/kiosk|snack|food/i.test(t))return '🏪'; if(/restaurant|bistro|caf/i.test(t))return '🍴';
 if(/shower/i.test(t))return '🚿'; if(/changing|locker/i.test(t))return '🚪'; if(/step-free|accessible|wheelchair/i.test(t))return '\u267F';
 if(/lifeguard|supervis/i.test(t))return '👁\uFE0F'; if(/playground/i.test(t))return '🧒'; if(/slide/i.test(t))return '🎢';
 if(/volleyball/i.test(t))return '🏐'; if(/table tennis/i.test(t))return '🏓'; if(/diving/i.test(t))return '🤿';
 if(/lawn|meadow/i.test(t))return '🌱'; if(/parking/i.test(t))return '🅿\uFE0F'; if(/sauna/i.test(t))return '🧖';
 if(/bbq|barbecue/i.test(t))return '🔥'; if(/boat|kayak|jetty/i.test(t))return '🚣'; if(/paddling/i.test(t))return '👶';
 if(/kneipp|non-swimmer/i.test(t))return '💧'; if(/sun lounger/i.test(t))return '\u26F1\uFE0F'; return '💧'}
function openCard(id,soft=false){const v=state.results.find(x=>x.id===id);if(!v)return;state.selected=id;state.parking=parkingFor(v);els.cardTitle.innerHTML=displayName(v);els.cardMeta.textContent=`${cat(v).toUpperCase()} · ${fmt(v.distance||0)}${v.driveMin!=null?' · '+v.driveMin+' min by road':''} · ${v.address||state.label}`;try{var _en=dmEntryNotice(v);var _eb=els.cardMeta.parentNode&&els.cardMeta.parentNode.querySelector('.dmEntryBar');if(_eb)_eb.remove();if(_en){var _d=document.createElement('div');_d.className='dmEntryBar'+(dmIdRequired(v)?' hard':'');_d.innerHTML='<span class="ic">🪪</span><span><b>Entry requirement.</b> '+_en+'</span>';els.cardMeta.insertAdjacentElement('afterend',_d)}}catch(e){}const photos=photoDeck(v).slice();if(!photos.length&&window.dmAerialPhoto){var _dmA=window.dmAerialPhoto(v);if(_dmA)photos.push(_dmA)}while(photos.length<3)photos.push(null);const gallery=`<div class="gallery">${photos.slice(0,3).map((p,i)=>p?`<button class="photo" data-photo="${esc(p.url)}" data-title="${esc(plainName(v))}" data-cap="${esc(p.caption+' · '+p.credit)}">${img(p.url,plainName(v),v.id)}<span class="photoSrc">${esc(p.credit)}</span><span class="photoTag">${esc(p.label)}</span></button>`:`<div class="photo loadingPhoto"><div>finding local photo</div></div>`).join('')}</div>`;hydrateMedia(v,false);fetchOfficialSite(v);const facts=[setting(v)&&`<div class="fact"><div class="k">Indoor / outdoor</div><div>${esc(setting(v))}</div></div>`,v.hours&&`<div class="fact"><div class="k">Opening / hours</div><div>${esc(v.hours)}</div></div>`,v.season&&`<div class="fact"><div class="k">Season</div><div>${esc(v.season)}</div></div>`,priceHtml(v)].filter(Boolean).join('');const fac=(v.facilities||[]).filter(f=>!(facilityLabel(f)==='Lifeguard'&&dmNoLifeguard(v))).map(f=>{const L=facilityLabel(f);return `<span class="facility">${facilityIcon(L)} ${esc(L)}</span>`}).join('');const parking=state.parking.length?state.parking.slice(0,6).map((p,i)=>`<div class="parkingRow"><div>${i===0?'Best P pick · ':''}${esc(p.name)}<div class="muted">${fmt(p.d||0)} walk · ${esc(p.fee||'fee unknown')} · ${esc(p.open||'likely open')} · congestion ${esc(p.congestion||'unknown')} · ${esc(p.source||'open map')}</div></div><a class="btn" href="${route(p.lat,p.lon)}" target="_blank" rel="noopener">Route</a></div>`).join(''):'<p class="muted">Parking is being checked now. P Drive routes to the venue until a better local parking point is ready.</p>';
const parkingHint=state.parking.length?`${state.parking.length} parking options ready`:'parking check running';els.cardBody.innerHTML=`${gallery}<div class="muted" style="margin-top:6px">Tap photos to enlarge. Credits and source notes are shown in the photo viewer.</div><div class="story">${esc(v.story||makeStory(v.name,cat(v)))}${v.descr?(' '+esc(v.descr)):''}${venueDetails(v)}</div>${adminBadges(v)}<div class="actions"><a class="btn" href="${route((state.parking[0]||v).lat,(state.parking[0]||v).lon)}" target="_blank" rel="noopener">🅿 P Drive</a><a class="btn" href="${route(v.lat,v.lon,'walk')}" target="_blank" rel="noopener">↗ Transit / walk</a>${v.website?`<a class="btn" href="${esc(v.website)}" target="_blank" rel="noopener">⌂ Official</a>`:''}${v.phone?`<a class="btn" href="tel:${esc(String(v.phone).replace(/\s+/g,''))}">☎ Call</a>`:''}<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(plainName(v)+' '+(v.address||state.label)+' swimming')}" target="_blank" rel="noopener">🔎 Research</a>${v.osmType?`<a class="btn" href="https://www.openstreetmap.org/${esc(v.osmType)}/${esc(String(v.osmId))}" target="_blank" rel="noopener">🗺 Map data</a>`:''}${v.wikipedia?`<a class="btn" href="https://${esc(String(v.wikipedia).split(':')[0])}.wikipedia.org/wiki/${encodeURIComponent(String(v.wikipedia).split(':').slice(1).join(':'))}" target="_blank" rel="noopener">📖 Wikipedia</a>`:''}<a class="btn" href="https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(plainName(v))}&ns6=1" target="_blank" rel="noopener">▣ More photos</a></div><div class="section"><h3>Area around</h3><p>${esc(areaStory(v))}</p></div><div class="section"><h3>Weather and water</h3>${weatherHtml(v)}</div>${facts?`<div class="section"><h3>Opening, season and prices</h3><div class="factGrid">${facts}</div></div>`:''}${fac?`<div class="section"><h3>Facilities</h3><div class="facilities">${fac}</div></div>`:''}<div class="section"><h3>Rating</h3><p><span class="dmStars" aria-label="${(Math.max(3,Math.min(5,(v.score||80)/20))).toFixed(1)} out of 5">${'★'.repeat(Math.round(+(Math.max(3,Math.min(5,(v.score||80)/20))).toFixed(1)))}${'☆'.repeat(5-Math.round(+(Math.max(3,Math.min(5,(v.score||80)/20))).toFixed(1)))}</span> ${(Math.max(3,Math.min(5,(v.score||80)/20))).toFixed(1)}/5 — DipMapper score. ${isQuietNow(v)?'Likely quiet now from '+quietText()+'.':''}</p></div><div class="section"><h3>Parking and arrival</h3><p class="muted">${parkingHint}. Free and closer public options rank first; restricted/private lots are filtered.</p>${parking}${v.transit?.length?`<p class="muted">Transit: ${v.transit.map(esc).join(' · ')}</p>`:''}</div><div class="section"><h3>Contact</h3><div class="factGrid">${v.operator?`<div class="fact"><div class="k">Operator</div><div>${esc(v.operator)}</div></div>`:''}${v.address?`<div class="fact"><div class="k">Address</div><div>${esc(v.address)}</div></div>`:''}<div class="fact"><div class="k">Coordinate</div><div>${v.lat.toFixed(5)}, ${v.lon.toFixed(5)}</div></div></div></div><div class="section"><h3>External sources</h3>${sourceLinks(v)}</div>`;els.drawer.classList.add('open');els.back.classList.add('open');bindImages();if(!soft)loadParking(v);drawMap()}
function closeCard(){state.selected=null;els.drawer.classList.remove('open');els.back.classList.remove('open');state.parking=[];drawMap()}
function openLegal(k){$('#modalTitle').textContent=k[0].toUpperCase()+k.slice(1);$('#modalBody').innerHTML=LEGAL[k]||LEGAL.disclaimer;els.modal.classList.add('open')}
function hideCookie(c){try{localStorage.setItem('dm_seen','1')}catch(e){}}
function openPrivacySettings(){try{if(window.googlefc&&typeof window.googlefc.showRevocationMessage==='function'){window.googlefc.showRevocationMessage();return}}catch(e){}
 try{if(window.__tcfapi){window.__tcfapi('displayConsentUi',2,function(){});return}}catch(e){}
 try{openLegal('privacy')}catch(e){location.href='/privacy.html'}}


function openPlaceById(id,source='tap'){
 if(!id)return false;const sid=String(id);const v=(state.renderIndex&&state.renderIndex.get(sid))||state.results.find(x=>String(x.id)===sid);if(!v)return false;state.lastOpenAt=Date.now();state.clickLockUntil=Date.now()+900;openCard(v.id);return true
}
function activatePlaceElement(el,e,source='tap'){if(!el)return false;const id=el.dataset.id||el.dataset.mid;if(!id)return false;if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}return openPlaceById(id,source)}
const tapState={id:null,x:0,y:0,t:0,scrollY:0,armed:false};
function pointerPoint(e){const p=e?.changedTouches?.[0]||e?.touches?.[0]||e;return {x:p?.clientX||0,y:p?.clientY||0}}
function recordTapStart(el,e){if(e&&e.pointerType==='mouse'&&e.button!==0)return true;const p=pointerPoint(e);tapState.id=el.dataset.id||el.dataset.mid;tapState.x=p.x;tapState.y=p.y;tapState.t=Date.now();tapState.scrollY=window.scrollY||0;tapState.armed=true;try{el.dataset.tapReady='true';setTimeout(()=>{delete el.dataset.tapReady},180)}catch(_){ }return true}
function cleanTap(el,e){const id=el?.dataset?.id||el?.dataset?.mid;if(!id)return false;if(e&&e.pointerType==='mouse')return true;const p=pointerPoint(e);const dx=Math.abs(p.x-tapState.x),dy=Math.abs(p.y-tapState.y),ds=Math.abs((window.scrollY||0)-tapState.scrollY),dt=Date.now()-tapState.t;return tapState.armed&&tapState.id===id&&dx<=10&&dy<=10&&ds<=3&&dt<700}
window.cleanDipTap=cleanTap;
window.__dipOpenFromElement=function(el,e){if(!cleanTap(el,e))return true;tapState.armed=false;return activatePlaceElement(el,e,'clean-tap')?false:true};
window.__dipPressFromElement=function(el,e){return recordTapStart(el,e)};
function handlePlaceActivation(e){const el=e.target.closest?.('.marker[data-mid]');if(!el)return false;if(!cleanTap(el,e))return false;tapState.armed=false;return activatePlaceElement(el,e,'delegated-clean-tap')}
document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.marker[data-mid]');if(!el)return;recordTapStart(el,e)},true);
document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('.marker[data-mid]');if(!el)return;recordTapStart(el,e)},true);
document.addEventListener('click',e=>{const el=e.target.closest?.('.marker[data-mid]');if(!el)return;if(!cleanTap(el,e))return;tapState.armed=false;activatePlaceElement(el,e,'global-clean-click')},true);
document.addEventListener('keydown',e=>{const el=e.target.closest?.('.marker[data-mid]');if(el&&(e.key==='Enter'||e.key===' ')){activatePlaceElement(el,e,'keyboard')}},true);
document.addEventListener('click',e=>{const ph=e.target.closest('[data-photo]');if(ph){$('#lightImg').src=ph.dataset.photo;$('#lightTitle').textContent=ph.dataset.title;$('#lightCap').textContent=ph.dataset.cap;els.light.classList.add('open');return}const l=e.target.closest('[data-legal]');if(l){openLegal(l.dataset.legal);return}const s=e.target.closest('[data-scroll]');if(s){document.getElementById(s.dataset.scroll)?.scrollIntoView({behavior:'smooth'});return}});
els.results.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;e.preventDefault();e.stopPropagation();openPlaceById(b.dataset.open,'open-button-local')});els.results.addEventListener('keydown',e=>{const b=e.target.closest('[data-open]');if(!b)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();openPlaceById(b.dataset.open,'open-button-key-local')}});

// v23.8.3 mobile scroll safety: do not open cards while the user is scrolling the result list.
els.results.addEventListener('touchstart',e=>{const b=e.target.closest('.result');if(!b)return;recordTapStart(b,e)},{passive:true});
els.results.addEventListener('touchmove',e=>{tapState.armed=false},{passive:true});
els.map.addEventListener('touchstart',e=>{const m=e.target.closest('[data-mid]');if(!m)return;recordTapStart(m,e)},{passive:true});
els.map.addEventListener('touchmove',e=>{tapState.armed=false},{passive:true});

$('#close').onclick=closeCard;els.back.onclick=closeCard;$('#copy').onclick=()=>navigator.clipboard?.writeText(location.href.split('#')[0]+'#'+(state.selected||''));$('#lightClose').onclick=()=>els.light.classList.remove('open');els.light.onclick=e=>{if(e.target===els.light)els.light.classList.remove('open')};$('#modalClose').onclick=()=>els.modal.classList.remove('open');els.modal.onclick=e=>{if(e.target===els.modal)els.modal.classList.remove('open')};document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCard();els.light.classList.remove('open');els.modal.classList.remove('open');}});
$('#search').onclick=search;$('#gateSearch').onclick=()=>{$('#dest').value=$('#gateDest').value;search()};$('#dest').addEventListener('keydown',e=>{if(e.key==='Enter')search()});$('#gateDest').addEventListener('keydown',e=>{if(e.key==='Enter'){$('#dest').value=$('#gateDest').value;search()}});$('#useLoc').onclick=requestLocation;$('#gateLoc').onclick=requestLocation;$('#gateSkip').onclick=()=>{gateOff();$('#dest').focus();progress('Search manually',8,'Enter a destination; no preset location is selected.')};function rerunCurrentSearch(reason='Refreshing local search'){if(!state.center){requestLocation();return}state.scanId++;state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();state.photoLocks.clear();state.rankPhotoCache.clear();state.mediaBusy.clear();state.failedPhotos.clear();state.currentWeather=null;state.weatherBusy=false;state.selected=null;resetFilterToAll();closeCard();progress(reason,12,'Old results cleared. The closest 5 km are searched first; wider layers follow only if needed.');render();drawMap();restoreCachedResults();setTimeout(()=>backgroundScan(true),20)}
$('#rescan').onclick=()=>rerunCurrentSearch('Re-scanning here');$('#sort').onchange=()=>{sortResults();render()};$('#radius').onchange=()=>rerunCurrentSearch('Search radius updated');$('#fit').onclick=()=>fitToSpots();$('#zin').onclick=()=>dmZoom(1);$('#zout').onclick=()=>dmZoom(-1);$('#movePoint').onclick=()=>{state.move=!state.move;progress('Choose map point',20,'Click the map where you want to search.')};els.map.addEventListener('click',e=>{const hit=e.target.closest('[data-mid]');if(hit){if(!cleanTap(hit,e))return;e.preventDefault();e.stopPropagation();tapState.armed=false;openPlaceById(hit.dataset.mid,'map');return}if(!state.move)return;const r=els.map.getBoundingClientRect(),cp=project(state.mapCenter[0],state.mapCenter[1],state.zoom),left=cp[0]-r.width/2,top=cp[1]-r.height/2;state.center=unproject(left+e.clientX-r.left,top+e.clientY-r.top,state.zoom);state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0]);state.label='selected map point';state.results=[];state.parking=[];state.parkingCache.clear();state.parkingPrefetch.clear();state.photoLocks.clear();state.mediaBusy.clear();state.failedPhotos.clear();state.currentWeather=null;state.weatherBusy=false;resetFilterToAll();state.move=false;backgroundScan()});els.map.addEventListener('click',e=>{const m=e.target.closest('[data-mid]');if(m){if(!cleanTap(m,e))return;e.preventDefault();e.stopPropagation();tapState.armed=false;openPlaceById(m.dataset.mid,'map');return}});
try{const _ps=$('#privacySettings');if(_ps)_ps.onclick=openPrivacySettings}catch(e){}
function isMobileDevice(){return matchMedia('(max-width: 900px), (pointer: coarse)').matches}
function applyDeviceMode(){document.documentElement.classList.toggle('mobileApp',isMobileDevice());document.body.classList.toggle('appMode',matchMedia('(display-mode: standalone)').matches||navigator.standalone===true);if(!applyDeviceMode._done){applyDeviceMode._done=1;if(isMobileDevice()&&$('#radius').value==='30'&&!localStorage.getItem('dm_radius'))$('#radius').value='5'}setTimeout(drawMap,80)}
addEventListener('resize',applyDeviceMode,{passive:true});applyDeviceMode();setTimeout(function(){try{mountAds()}catch(e){}},1200);setTimeout(function(){try{dmAdCheck()}catch(e){}},3500);try{const _sp=new URLSearchParams(location.search);const _la=dmCoordinateParam(_sp.get('lat')),_lo=dmCoordinateParam(_sp.get('lon'));if(dmValidCoordinates(_la,_lo)){const _nm=(_sp.get('name')||'this spot').slice(0,80);gateOff();state.center=[_la,_lo];state.mapCenter=state.center.slice();state.zoom=zoomForRadius(Number($('#radius').value||5),_la);state.label=_nm;const _d=$('#dest');if(_d)_d.value=_nm;setTimeout(function(){try{seedNearbyPacks();render();drawMap();backgroundScan()}catch(e){}},60);}else{const _qp=_sp.get('q');if(_qp&&_qp.trim()){const _d=$('#dest'),_g=$('#gateDest');if(_d)_d.value=_qp.trim();if(_g)_g.value=_qp.trim();setTimeout(function(){try{search()}catch(e){}},60)}}}catch(e){}try{window.dmAppBoot&&window.dmAppBoot()}catch(e){}

// DipMapper v23.8.3 - explicit card opening, 10 second visible search lifecycle, repeat-visit privacy/location skip
const SEARCH_VISIBLE_MS=10000;
state.searchCutoffTimer=null;state.scanFrozen=false;state.lastOriginRestored=false;
function saveLastOrigin(){if(window.__dmExample)return;try{if(state.center){localStorage.setItem('dm_seen','1');localStorage.setItem('dm_last_origin',JSON.stringify({lat:state.center[0],lon:state.center[1],label:state.label||'last search',radius:$('#radius').value||'5',t:Date.now()}));}}catch(e){}}
function getLastOrigin(){try{const x=JSON.parse(localStorage.getItem('dm_last_origin')||'null');if(x&&typeof x.lat==='number'&&typeof x.lon==='number'&&dmValidCoordinates(x.lat,x.lon)&&Number.isFinite(x.t)&&x.t<=Date.now()+600000&&Date.now()-x.t<60*86400000)return x}catch(e){}return null}
const _v203Merge=merge;merge=function(items){return _v203Merge(items)};
const _v203PrefetchMediaSoon=prefetchMediaSoon;prefetchMediaSoon=function(reason=''){return _v203PrefetchMediaSoon(reason)};
const _v203PrefetchParkingSoon=prefetchParkingSoon;prefetchParkingSoon=function(reason=''){return _v203PrefetchParkingSoon(reason)};
const _v203HydrateMedia=hydrateMedia;hydrateMedia=function(v,force=false){return _v203HydrateMedia(v,force)};
function freezeVisibleSearch(scanId){if(scanId!==state.scanId)return;state.scanFrozen=true;stopContinuousLoading();clearTimeout(state.mediaTimer);sortResults();render();drawMap();try{fitToSpots()}catch(e){}try{prefetchMedia()}catch(e){}try{fetchTravelTimes()}catch(e){}const n=Math.min(10,filtered().length||state.results.length);try{console.log('[DipMapper] scan',{sent:state._dSent,replied:state._dTried,failed:state._dFail,raw:state._dRaw,kept:state._dKept});}catch(e){}try{if(state._ck&&state.results.length)saveScanCache(state._ck,state.results);}catch(e){}if(!n&&(state._expandCount||0)<2){const _sel=$('#radius');const _cur=Number((_sel&&_sel.value)||5);const _next=[5,10,15,20,30,50].find(x=>x>_cur);if(_next&&_sel){state._expandCount=(state._expandCount||0)+1;_sel.value=String(_next);progress('Widening search',45,'No spots within '+_cur+' km. Trying '+_next+' km\u2026');backgroundScan(true);return}}progress(n>=10?'Spots ready':n>=5?'Top 5 ready':'Ready',100,n?(n+' nearby choices are ready. Use Open for details, or change radius to search again.'):'No swim spots found nearby. Try a larger radius or search a specific town.');saveLastOrigin()}
const _v203BackgroundScan=backgroundScan;backgroundScan=function(...args){state.scanFrozen=false;clearTimeout(state.searchCutoffTimer);const out=_v203BackgroundScan(...args);const sid=state.scanId;state.searchCutoffTimer=setTimeout(()=>freezeVisibleSearch(sid),SEARCH_VISIBLE_MS);return out};
const _v203ClearForNewOrigin=clearForNewOrigin;clearForNewOrigin=function(label=''){clearTimeout(state.searchCutoffTimer);state.scanFrozen=false;return _v203ClearForNewOrigin(label)};
const _v203ResetForSearch=resetForSearch;resetForSearch=function(q){clearTimeout(state.searchCutoffTimer);state.scanFrozen=false;return _v203ResetForSearch(q)};
const _v203StartPack=startPack;startPack=function(p){clearTimeout(state.searchCutoffTimer);state.scanFrozen=false;const out=_v203StartPack(p);const sid=state.scanId;state.searchCutoffTimer=setTimeout(()=>freezeVisibleSearch(sid),SEARCH_VISIBLE_MS);return out};
// Redefine place targeting: list cards never open by accident. Only explicit Open buttons and map markers open cards.
function placeEl(e){return e.target.closest?.('[data-open],.marker[data-mid]')}
function tapId(el){return el?.dataset?.open||el?.dataset?.mid||''}
window.__dipOpenFromElement=function(el,e){const id=tapId(el);if(!id)return true;if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}openPlaceById(id,'explicit');return false};
window.__dipOpenButton=function(el,e){const id=el?.dataset?.open||el?.dataset?.openId||'';if(!id)return true;if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}openPlaceById(id,'open-button-inline');return false};
window.__dipPressFromElement=function(){return true};
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-open]');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openPlaceById(b.dataset.open,'open-button')},true);
document.addEventListener('keydown',e=>{const b=e.target.closest?.('[data-open]');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPlaceById(b.dataset.open,'open-button-key')}});
els.results.addEventListener('click',e=>{if(e.target.closest('[data-open]'))return;const row=e.target.closest('.result');if(row){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}},true);
els.results.addEventListener('touchend',e=>{if(e.target.closest('[data-open]'))return;const row=e.target.closest('.result');if(row){e.stopPropagation();}},true);
const _v203OpenCard=openCard;openCard=function(id,soft=false){state.scanFrozen=true;stopContinuousLoading();clearTimeout(state.mediaTimer);return _v203OpenCard(id,soft)};
const _v203CloseCard=closeCard;closeCard=function(){const out=_v203CloseCard();setTimeout(()=>{state.selected=null;drawMap()},30);return out};
function bootV203(){
 renderFilters();render();drawMap();
 try{const q=new URLSearchParams(location.search),a=dmCoordinateParam(q.get('lat')),b=dmCoordinateParam(q.get('lon'));if(dmValidCoordinates(a,b)||(q.get('q')||'').trim()){window.__dmExample=false;return}}catch(e){}
 const last=getLastOrigin();
 if(last){window.__dmExample=false;gateOff();state.center=[last.lat,last.lon];state.mapCenter=state.center.slice();state.label=last.label||'your last search';const radius=String(last.radius||'5');$('#radius').value=[...$('#radius').options].some(o=>o.value===radius)?radius:'5';state.zoom=zoomForRadius(Number($('#radius').value||5),state.center[0]);progress('Welcome back',22,'Using your last search. Location is requested only when you choose it.');seedNearbyPacks();render();drawMap();backgroundScan(true);return}
 window.__dmExample=true;
 const demo=PACKS.find(p=>p.key==='palma');
 state.center=[39.57,2.65];state.mapCenter=state.center.slice();state.label='Palma Bay, example location';state.zoom=11;state.results=[];
 if(demo)state.results=demo.venues.map(v=>enrich({...v,packKey:demo.key}));
 gateOff();render();drawMap();progress('Explore Palma Bay',100,'Example location, not your position. Search a destination or choose Use my location. This example is not saved as your home.');
}

bootV203();

// v23.8.3 hardening: guarded taps, scroll-safe mobile cards, sticky close button, full mobile filters, three-size typography
(function(){
 const boot=()=>{
  document.body.classList.add('dm-v20');
  const openBy=(id)=>{try{ if(window.openPlaceById&&window.openPlaceById(id,'v20')) return true; }catch(e){} try{ const ev=new CustomEvent('dip-open',{detail:{id}}); document.dispatchEvent(ev); }catch(e){} return false;};
  document.addEventListener('click',function(e){const target=e.target.closest&&e.target.closest('.marker[data-mid]'); if(!target)return; if(!window.cleanDipTap||!window.cleanDipTap(target,e))return; e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); openBy(target.dataset.id||target.dataset.mid);},true);
  document.addEventListener('touchend',function(e){const target=e.target.closest&&e.target.closest('.marker[data-mid]'); if(!target)return; if(!window.cleanDipTap||!window.cleanDipTap(target,e))return; e.preventDefault(); openBy(target.dataset.id||target.dataset.mid);},{capture:true,passive:false});
  document.addEventListener('dip-open',function(e){try{ if(e.detail&&e.detail.id&&window.openPlaceById) window.openPlaceById(e.detail.id,'custom'); }catch(_){} });
  const closeCookie=()=>{const c=document.getElementById('cookie'); if(c){c.classList.add('hide');c.style.display='none'} try{localStorage.setItem('ow_cookie_choice','dismissed');localStorage.setItem('dip_cookie_choice','dismissed')}catch(e){}};
  ['essential','optional','cookieClose'].forEach(id=>{const b=document.getElementById(id); if(b)b.addEventListener('click',closeCookie,{capture:true});});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();



// v23.8.3 final hardening: explicit open only, map-dot open, 10s no-flicker search window.
(function(){
  const openId=function(id,source){
    if(!id)return false;
    try{return openPlaceById(String(id),source||'final-open')}catch(e){return false}
  };
  document.addEventListener('click',function(e){
    const open=e.target.closest&&e.target.closest('[data-open]');
    if(open){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openId(open.getAttribute('data-open'),'explicit-button');return false}
    const marker=e.target.closest&&e.target.closest('.marker[data-mid]');
    if(marker){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openId(marker.getAttribute('data-mid'),'map-marker');return false}
    const row=e.target.closest&&e.target.closest('.result');
    if(row){e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return false}
  },true);
  document.addEventListener('keydown',function(e){
    const open=e.target.closest&&e.target.closest('[data-open]');
    if(open&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openId(open.getAttribute('data-open'),'explicit-keyboard')}
    const marker=e.target.closest&&e.target.closest('.marker[data-mid]');
    if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openId(marker.getAttribute('data-mid'),'map-keyboard')}
  },true);
  const oldHide=window.hideCookie;
  window.__dmDismissNotice=function(choice){
    try{localStorage.setItem('ow_cookie_choice',choice||'dismissed');localStorage.setItem('dip_cookie_choice',choice||'dismissed');localStorage.setItem('dm_seen','1')}catch(e){}
    const c=document.getElementById('cookie');if(c){c.classList.add('hide');c.style.display='none'}
    return false
  };
  ['essential','optional','cookieClose'].forEach(function(id){const b=document.getElementById(id);if(b)b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.__dmDismissNotice(id)},true)});
  try{if(localStorage.getItem('ow_cookie_choice')||localStorage.getItem('dip_cookie_choice')){const c=document.getElementById('cookie');if(c){c.classList.add('hide');c.style.display='none'}}}catch(e){}
})();



// v23.8.3 reliability polish: freeze flicker after 10s, deliberate Open button, and reset interaction locks on close.
(function(){
  const stopRowAccident=function(e){
    const row=e.target && e.target.closest && e.target.closest('.result');
    const open=e.target && e.target.closest && e.target.closest('[data-open]');
    if(row && !open){e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();}
  };
  document.addEventListener('click',stopRowAccident,true);
  document.addEventListener('touchend',stopRowAccident,{capture:true,passive:true});
  document.addEventListener('pointerup',function(e){
    const open=e.target && e.target.closest && e.target.closest('[data-open]');
    if(open){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();window.__dipOpenButton(open,e);}
  },true);
  const resetLocks=function(){
    try{state.clickLockUntil=0;tapState.armed=false;state.mediaBusy.clear();clearTimeout(state.mediaTimer);}catch(_){ }
  };
  const originalClose=window.closeCard||closeCard;
  window.closeCard=function(){resetLocks();return originalClose.apply(this,arguments)};
  const c=document.getElementById('close');if(c)c.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.closeCard();},true);
  window.addEventListener('pageshow',function(){try{if(localStorage.getItem('ow_cookie_choice')||localStorage.getItem('dip_cookie_choice')){const c=document.getElementById('cookie');if(c){c.classList.add('hide');c.style.display='none'}}}catch(_){}});
})();



/* DipMapper v23.8.3 final interaction controller: no accidental list opens, direct map-dot opens, stable after repeated cards */
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  let scrollBlockUntil = 0;
  let touch = {x:0,y:0,t:0,scrollTop:0,moved:false};
  function now(){return Date.now()}
  function pt(e){const p=e.changedTouches&&e.changedTouches[0] || e.touches&&e.touches[0] || e; return {x:p&&p.clientX||0,y:p&&p.clientY||0}}
  function safeOpen(id, source){
    if(!id || !window.openPlaceById) return false;
    try { return !!window.openPlaceById(String(id), source || 'v20.4'); } catch(e) { return false; }
  }
  const results = document.getElementById('results');
  const map = document.getElementById('map');
  if(results){
    results.addEventListener('touchstart', e=>{const p=pt(e); touch={x:p.x,y:p.y,t:now(),scrollTop:results.scrollTop,moved:false};}, {passive:true});
    results.addEventListener('touchmove', e=>{const p=pt(e); if(Math.abs(p.y-touch.y)>7 || Math.abs(p.x-touch.x)>12 || Math.abs(results.scrollTop-touch.scrollTop)>3){ touch.moved=true; scrollBlockUntil=now()+350;}}, {passive:true});
    results.addEventListener('click', e=>{
      const btn=e.target.closest && e.target.closest('[data-open]');
      if(!btn) return;
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      if(touch.moved || now()<scrollBlockUntil) return;
      safeOpen(btn.getAttribute('data-open'),'open-button-v20.4');
    }, true);
    results.addEventListener('click', e=>{ if(e.target.closest && e.target.closest('.result') && !e.target.closest('[data-open]')) { return; } }, true);
  }
  function wireMarker(e){
    const m=e.target.closest && e.target.closest('.marker[data-mid]');
    if(!m) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    safeOpen(m.getAttribute('data-mid'),'map-dot-v20.4');
  }
  document.addEventListener('click', wireMarker, true);
  document.addEventListener('touchend', wireMarker, {capture:true,passive:false});
  if(map){
    map.addEventListener('click', e=>{const m=e.target.closest && e.target.closest('.marker[data-mid]'); if(m) wireMarker(e);}, true);
  }
  // Keep the UI responsive after repeated card use: close leaves the map and list clickable.
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ const close=document.getElementById('close'); if(close) close.click(); } });
  window.__dipV204Ready = true;
})();



/* DipMapper v23.8.3 - icon filters, outside-card close, persistent settings */
(function(){
  const ICON_LABELS={
    all:['🌊','All'], beach:['🏖','Beaches'], pool:['🏊','Pools'], bath:['≈','Bathing places'], thermal:['♨','Thermal'], wild:['〰','Wild swim'], indoor:['⌂','Indoor'], outdoor:['☀','Outdoor'], free:['0','Free'], hours:['◷','Hours'], quiet:['◌','Quietness estimate'], parking:['P','Parking nearby'], family:['♡','Good with kids'], supervised:['◎','Supervised'], women:['♀','Women-friendly'], food:['🍴','Food'], wc:['WC','Toilets'], accessible:['♿','Accessible'], sauna:['♨','Sauna'], waterok:['💧','Water 18C+ estimate']
  };
  const FILTER_ORDER=['all','beach','pool','bath','thermal','wild','indoor','outdoor','free','hours','quiet','parking','family','supervised','women','food','wc','accessible','sauna','waterok'];
  function filterHtml(k){const p=ICON_LABELS[k]||['',k];return `<button class="filter ${state.filter===k?'active':''}" data-filter="${k}" aria-pressed="${state.filter===k?'true':'false'}"><span class="fi" aria-hidden="true">${p[0]}</span><span class="fl">${p[1]}</span></button>`}
  window.renderFilters=function(){
    if(!els||!els.filters)return;
    els.filters.innerHTML=FILTER_ORDER.map(filterHtml).join('');
    Array.from(els.filters.querySelectorAll('[data-filter]')).forEach(b=>{
      b.onclick=()=>{state.filter=b.dataset.filter;persistDipState();renderFilters();render();drawMap()};
    });
  };
  function persistDipState(){
    if(window.__dmExample)return;
    try{
      localStorage.setItem('dm_seen','1');
      const r=document.getElementById('radius')?.value||'5', so=document.getElementById('sort')?.value||'best';
      localStorage.setItem('dm_radius',r); localStorage.setItem('dm_sort',so); localStorage.setItem('dm_filter',state.filter||'all');
      if(state.center&&Number.isFinite(+state.center[0])&&Number.isFinite(+state.center[1])){
        localStorage.setItem('dm_last_origin',JSON.stringify({lat:+state.center[0],lon:+state.center[1],label:state.label||'last search',radius:r,sort:so,t:Date.now()}));
      }
    }catch(e){}
  }
  window.persistDipState=persistDipState;
  function restoreDipSettings(){
    try{
      const r=localStorage.getItem('dm_radius'); if(r&&document.getElementById('radius')) document.getElementById('radius').value=r;
      const so=localStorage.getItem('dm_sort'); if(so&&document.getElementById('sort')) document.getElementById('sort').value=so;
      const f=localStorage.getItem('dm_filter'); if(f&&ICON_LABELS[f]) state.filter=f;
      if(localStorage.getItem('dip_cookie_choice')||localStorage.getItem('ow_cookie_choice')){const c=document.getElementById('cookie'); if(c){c.classList.add('hide'); c.style.display='none';}}
    }catch(e){}
  }
  restoreDipSettings(); renderFilters();
  ['radius','sort','dest'].forEach(id=>{const el=document.getElementById(id); if(el) el.addEventListener('change',persistDipState,{passive:true});});
  ['essential','optional','cookieClose'].forEach(id=>{const el=document.getElementById(id); if(el) el.addEventListener('click',persistDipState,true);});
  window.addEventListener('beforeunload',persistDipState); document.addEventListener('visibilitychange',()=>{if(document.hidden)persistDipState()});
  // Close travel card when the dimmed background is clicked, while preserving clicks inside the card.
  const back=document.getElementById('back');
  if(back){back.addEventListener('click',function(e){if(e.target===back||e.currentTarget===back){e.preventDefault(); e.stopPropagation(); if(window.closeCard) window.closeCard();}},true);}
  document.addEventListener('click',function(e){
    const backOpen=document.getElementById('back')?.classList.contains('open');
    const drawer=document.getElementById('drawer');
    if(backOpen&&drawer&&!drawer.contains(e.target)&&!e.target.closest('.marker,[data-open],.photo,.lightbox,.modal')){ if(window.closeCard) window.closeCard(); }
  },false);
})();


/* DipMapper v23.8.3 mobile-first control layer: stable 10-second search, compact mobile cards, no flicker after freeze. */
(function(){
  const oldProgress = window.progress || progress;
  const allowedAfterFreeze = /^(Ready|Spots ready|Top 5 ready|Search radius updated|Re-scanning|Choose map point|Destination|Search manually|Waiting|Using location)/i;
  window.progress = progress = function(title,pct,text){
    if(state && state.scanFrozen && !allowedAfterFreeze.test(String(title||''))) return;
    return oldProgress.apply(this,arguments);
  };
  const oldFreeze = window.freezeVisibleSearch || freezeVisibleSearch;
  window.freezeVisibleSearch = freezeVisibleSearch = function(scanId){
    const out = oldFreeze.apply(this,arguments);
    try{
      state.scanFrozen = true;
      clearTimeout(state.mediaTimer); clearTimeout(state.parkingTimer);
      document.body.classList.add('searchLocked');
      const note=document.getElementById('listNote'); if(note) note.textContent='Top choices are locked after 10 seconds. Use Open for details.';
    }catch(e){}
    return out;
  };
  const oldClear = window.clearForNewOrigin || clearForNewOrigin;
  if(oldClear){ window.clearForNewOrigin = clearForNewOrigin = function(){ document.body.classList.remove('searchLocked'); return oldClear.apply(this,arguments); }; }
  const oldReset = window.resetForSearch || resetForSearch;
  if(oldReset){ window.resetForSearch = resetForSearch = function(){ document.body.classList.remove('searchLocked'); return oldReset.apply(this,arguments); }; }
  // Never open a result row itself on mobile. Only its Open button does that.
  document.addEventListener('click',function(e){
    const row=e.target.closest && e.target.closest('.result');
    if(row && !e.target.closest('[data-open]')){ e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); }
  },true);
})();

