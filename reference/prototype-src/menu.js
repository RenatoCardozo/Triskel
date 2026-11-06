/* ===== Menu lateral + páginas do menu (criador, comércio, agência) ===== */
const ICN={
grid:'<rect x="3" y="3" width="7" height="18" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="14" width="8" height="7" rx="1.6"/>',
user:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.2 18.3c1.5-2.6 3.4-3.6 5.8-3.6s4.3 1 5.8 3.6"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M16.2 16.2 21 21"/>',
port:'<rect x="3" y="3" width="8" height="10" rx="1.6"/><rect x="13" y="3" width="8" height="6" rx="1.6"/><rect x="3" y="15" width="8" height="6" rx="1.6"/><rect x="13" y="11" width="8" height="10" rx="1.6"/>',
star:'<path d="M12 3l2.8 5.9 6.2.8-4.6 4.3 1.2 6.4L12 17.3 6.4 20.4l1.2-6.4L3 9.7l6.2-.8z"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.4 9.6a2.6 2.6 0 1 1 3.7 2.3c-.8.4-1.1 1-1.1 1.8"/><circle cx="12" cy="17.2" r=".7" fill="currentColor"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.6 20c.5-3.5 3-5 6.4-5s5.9 1.5 6.4 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.4c2.5 0 4 1.2 4.4 4"/>',
camp:'<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>',
up:'<path d="M6 15l6-6 6 6"/>',back:'<path d="M15 18l-6-6 6-6"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
eyeoff:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>',
copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>'};
const IC=(k,s=20,w=1.8)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICN[k]}</svg>`;
const HBG='<svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true"><rect x="6" y="14" width="38" height="5" rx="2.5" fill="#4b5dca"/><rect x="6" y="23" width="38" height="5" rx="2.5" fill="#4b5dca"/><rect x="6" y="32" width="38" height="5" rx="2.5" fill="#4b5dca"/></svg>';
const PF=[
{p:'c',n:'Marjorie Moreira',lab:'ID do creator',id:'12345678',ini:'MM',nome:'Marjorie',tel:'(53) 99912-3456',mail:'marjorie@email.com'},
{p:'e',n:'Doce Vale Confeitaria',lab:'ID do comércio',id:'23456789',ini:'DV',nome:'Doce Vale',tel:'(53) 3222-4410',mail:'contato@docevale.com.br'},
{p:'a',n:'Maré Digital',lab:'ID da agência',id:'34567890',ini:'MD',nome:'Maré Digital',tel:'(53) 99871-2200',mail:'oi@maredigital.com.br'}];
const PU={c:0,e:1,a:2};
const mkMenu=p=>{const d=k=>p+'_'+k;
const perfil=['perfil','Perfil','user',[[d('pv'),'Visualizar perfil'],[d('pe'),'Editar perfil'],...(p=='c'?[[d('va'),'Editar valores']]:[]),[d('nu'),'Trocar número'],[d('em'),'Trocar email'],[d('se'),'Trocar senha']]];
const mid={c:[['c4','Buscar oportunidades','search'],['c3','Meu portfólio','port']],e:[['e4','Buscar criadores','search'],[d('ca'),'Minhas campanhas','camp']],a:[['a4','Buscar criadores','search'],['a2','Meus clientes','users'],[d('ca'),'Campanhas','camp']]}[p];
return[[d('pn'),'Painel','grid'],perfil,...mid,[d('ct'),'Contatos','chat'],[d('en'),'Entregas','check'],[d('pgt'),'Pagamentos','wallet'],[d('av'),'Avaliações','star'],[d('aj'),'Ajuda e suporte','help'],[d('cf'),'Configurações','gear'],['out','Sair','out']]};

/* ---------- estado da conta (cadastro novo x conta de demonstração) ---------- */
const ST0=()=>({fresh:0,comp:1,ver:1,av:1,cv:1,avv:0,cvv:0});
const ST={c:ST0(),e:ST0(),a:ST0()};
const newAcc=(p,d)=>{ST[p]={fresh:1,comp:0,ver:0,av:0,cv:0,avv:0,cvv:0};const o=PD[p]=blankPD(p);d=d||{};o.nome=d.nome||PF0[PU[p]].n;o.resp=d.resp||'';o.doc=d.doc||'';o[p=='c'?'nasc':'fund']=d.nasc||'';o.cidade=d.cidade||'';o.uf=d.uf||'';o.mail=d.mail||PF0[PU[p]].mail;o.tel=d.tel||'';PF[PU[p]].id=String(Math.floor(1e7+Math.random()*9e7));PF[PU[p]].tel='';delete CD[p];resetPay(p);resetNeg(p);applyPF(p)};
const AUD={c:'empresas e agências',e:'criadores',a:'criadores'};
const visOf=p=>!!(ST[p].comp&&ST[p].ver);
const b64=x=>'data:image/svg+xml;base64,'+btoa(x);
const AVC3=[['#5fdfa1','#3dd4c6'],['#4b5dca','#7b8be8'],['#f2b84b','#f08a5d']];
const avArt=v=>{const c=AVC3[v%3];return b64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><circle cx="60" cy="46" r="20" fill="#fff" fill-opacity=".92"/><path d="M20 120c4-26 20-38 40-38s36 12 40 38z" fill="#fff" fill-opacity=".92"/></svg>`)};
const cvArt=v=>{const c=AVC3[v%3];return b64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="400" height="130" fill="url(#g)"/><path d="M0 92C60 60 120 120 200 88S340 60 400 84V130H0z" fill="#fff" fill-opacity=".18"/><path d="M0 108C80 84 150 128 240 104S350 90 400 106V130H0z" fill="#fff" fill-opacity=".16"/><circle cx="330" cy="30" r="34" fill="#fff" fill-opacity=".14"/><circle cx="70" cy="22" r="14" fill="#fff" fill-opacity=".12"/></svg>`)};
const phAv=p=>ST[p].av?(p=='c'&&IMG.av?IMG.av:avArt(ST[p].avv+(p=='c'?0:p=='e'?1:2))):'';
const phCv=p=>ST[p].cv?(IMG.cover||cvArt(ST[p].cvv+(p=='c'?0:p=='e'?1:2))):'';
const bgi=u=>u?`style="background-image:url('${u}')"`:'';
const SUMM=p=>{const P=PF[PU[p]],s=ST[p],vis=visOf(p),av=phAv(p),cv=phCv(p);
return`<div class="sm"><div class="smc" ${bgi(cv)}>${cv?'':'<span>Sem foto de capa</span>'}</div><div class="smb"><div class="sma" ${bgi(av)}>${av?'':P.ini}</div><div class="smt"><b>${P.n}</b><small>${s.comp?subOf(p):'Perfil em construção'}</small></div></div><div class="smg"><span class="pl ${vis?'':'w'}">${vis?'Perfil visível':'Perfil oculto'}</span><span class="pl ${s.ver?'':'w'}">${s.ver?'E-mail validado':'E-mail pendente'}</span></div><button class="bt o smv" data-g="${p}_pv">${s.comp?'Ver meu perfil':'Ver prévia do perfil'}</button></div>`};
const BNR=p=>{const s=ST[p];if(s.comp&&s.ver)return'';const done=1+(s.ver?1:0)+(s.comp?1:0),pct=Math.round(done/3*100);
const row=(ok,l,lab,g)=>ok?`<div class="bst ok"><i>${IC('check',14,2.6)}</i><span>${l}</span></div>`:`<button class="bst go" data-g="${g}"><i></i><span>${l}</span><em>${lab} ›</em></button>`;
return`<div class="bn" role="region" aria-label="Complete seu perfil"><b>${s.comp?'Falta validar o e-mail':s.ver?'Complete o seu perfil':'Deixe o seu perfil pronto'}</b><p>Seu perfil só aparece para ${AUD[p]} depois de completar as informações e validar o e-mail.</p><div class="bpg" aria-label="${pct}% concluído"><i style="width:${pct}%"></i></div><small>${pct}% concluído</small>${row(1,'Conta criada')}${row(s.ver,'Validar e-mail','Validar',p+'_ve')}${row(s.comp,'Completar perfil (fotos e informações)','Completar',p+'_pe')}</div>`};
const PHI=p=>{const av=phAv(p),cv=phCv(p);return`<button class="phc" data-photo="cv" ${bgi(cv)} aria-label="${cv?'Trocar':'Adicionar'} foto de capa"><span>${IC('camera',16,2)} ${cv?'Trocar foto de capa':'Adicionar foto de capa'}</span></button><button class="pha" data-photo="av" ${bgi(av)} aria-label="${av?'Trocar':'Adicionar'} foto de perfil">${av?'':IC('camera',24,1.8)}<em>${IC('camera',12,2.2)}</em></button>`};
const FR=(l,v,k,t)=>`<label>${l}<input type="${t||'text'}" value="${v}" data-req="${k}" data-lab="${l}"></label>`;
const FTX=(l,v,k,ph)=>`<label>${l}<textarea rows="3" data-req="${k}" data-lab="${l}" placeholder="${ph||''}">${v}</textarea></label>`;
const MENU={c:mkMenu('c'),e:mkMenu('e'),a:mkMenu('a')};
let mOpen=false,pfOpen=false,idShow=false;
const profOf=id=>{const s=S[id];return s&&s.u>=0?PF[s.u]:null};
const idLine=P=>`${P.lab}: ${idShow?P.id:'********'}`;
function menuHTML(){const P=profOf(cur);if(!P)return'';const it=MENU[P.p],S0=ST[P.p],subs=it.find(x=>x[0]=='perfil')[3].map(([i,l])=>[i,i==P.p+'_pe'&&!S0.comp?'Completar perfil':l]),subs2=S0.ver?subs:[subs[0],subs[1],[P.p+'_ve','Validar e-mail'],...subs.slice(2)],sub=subs2.map(x=>x[0]),inSub=sub.includes(cur);
if(inSub)pfOpen=true;
return`<div class="ov" data-close></div><aside class="mn" role="dialog" aria-label="Menu"><div class="mh"><div class="av" ${bgi(phAv(P.p))}>${phAv(P.p)?'':P.ini}</div><div class="mt"><b${P.n.length>16?' class="lo"':''}>${P.n}</b><div class="ir"><small id="idl">${idLine(P)}</small><button class="ib" data-eyeid aria-label="${idShow?'Ocultar':'Mostrar'} ID">${IC(idShow?'eye':'eyeoff',14,2)}</button><button class="ib" data-cpid aria-label="Copiar ID">${IC('copy',14,2)}</button></div></div></div><nav class="ml" aria-label="Menu principal">`+it.map(x=>{
if(x[0]=='perfil')return`<button class="mi${inSub?' on':''}" data-pf aria-expanded="${pfOpen}">${IC(x[2])}<span>${x[1]}</span><span class="cv">${IC('up',22,2)}</span></button><div class="sub${pfOpen?' open':''}" id="sbp">${subs2.map(([i,l])=>`<button class="si${i==cur?' on':''}" data-mi="${i}">${l}</button>`).join('')}</div>`;
const on=x[0]==cur||(x[0]==P.p+'_av'&&cur==P.p+'_ev');return`<button class="mi${on?' on':''}" data-mi="${x[0]}"${on?' aria-current="page"':''}>${IC(x[2])}<span>${x[1]}</span>${x[0]==P.p+'_ct'&&typeof ctUnread=='function'&&ctUnread(P.p)?`<em class="bdg" aria-label="${ctUnread(P.p)} novas">${ctUnread(P.p)}</em>`:''}</button>`}).join('')+'</nav></aside>'}
function openMenu(){if(!profOf(cur))return;const d=$('#dr');d.innerHTML=menuHTML();d.className='on';mOpen=true;$('#mn').setAttribute('aria-expanded','true')}
function closeMenu(){$('#dr').className='';mOpen=false;const b=$('#mn');if(b)b.setAttribute('aria-expanded','false')}
const mask=(s,k)=>!s?'':k=='t'?s.replace(/\d(?=(?:\D*\d){4})/g,'•'):s.replace(/^(.)[^@]*/,'$1•••••');
/* helpers visuais */
const KP=a=>`<div class="kp">${a.map(([v,l,s])=>`<div><b>${v}</b><span>${l}</span>${s?`<small>${s}</small>`:''}</div>`).join('')}</div>`;
const SHD=t=>`<h3 class="sh">${t}</h3>`;
const SW=(l,on,s)=>`<div class="sw${on?' on':''}" role="switch" aria-checked="${!!on}" tabindex="0" data-sw><span><b>${l}</b>${s?`<small>${s}</small>`:''}</span><i></i></div>`;
const FQ=(q,a)=>`<details class="fq"><summary>${q}</summary><p>${a}</p></details>`;
const BR=(l,v)=>`<div class="br"><span>${l}</span><div><i style="width:${v/5*100}%"></i></div><b>${String(v.toFixed(1)).replace('.',',')}</b></div>`;
const RV=(n,w,s,t)=>`<div class="rv"><div class="rh"><b>${n}</b><span class="st" aria-label="${s} de 5">${'★'.repeat(s)+'☆'.repeat(5-s)}</span></div><small style="color:#6b78d4">${w}</small><p>${t}</p></div>`;
const PC=(P,sub,r,tg)=>`<div class="pc"><div class="top" ${bgi(phCv(P.p))}></div><div class="bd"><div class="big" ${bgi(phAv(P.p))}>${phAv(P.p)?'':P.ini}</div><h2>${P.n}</h2><p>${sub}</p><div class="rt">${r}</div>${tg||''}</div></div>`;
const BTN=(l,g,c,t)=>`<button class="bt ${c||''}" ${g?`data-g="${g}"`:''}${t?` data-toast="${t}"`:''}>${l}</button>`;
const pg=(gi,u,id,t,h,b,o)=>{S[id]={t,h,b,u,o:o||[]};G[gi][1].push(id)};
G.push(['Menu · Criador',[]],['Menu · Empresa',[]],['Menu · Agência',[]]);
const GI={c:4,e:5,a:6};


/* ---------- avaliação simplificada (só parcerias com campanha/negociação realizada) ---------- */
const PARC={
c:[{k:'dv',n:'Doce Vale Confeitaria',ini:'DV',t:'Empresa',w:'Linha de doces coloniais · concluída em 28/10',ok:1},{k:'fl',n:'Pizzaria Forno a Lenha',ini:'FL',t:'Empresa',w:'Cardápio de inverno · concluída em 20/09',ok:1},{k:'md',n:'Maré Digital',ini:'MD',t:'Agência',w:'Negociação realizada · 1 contraproposta',ok:1},{k:'bp',n:'Studio Bela Pele',ini:'BP',t:'Empresa',w:'Ainda sem campanha ou negociação',ok:0}],
e:[{k:'mm',n:'Marjorie Moreira',ini:'MM',t:'Criadora',w:'Linha de doces coloniais · concluída em 28/10',ok:1},{k:'la',n:'Lucas Amaral',ini:'LA',t:'Criador',w:'Negociação realizada · cardápio de verão',ok:1},{k:'bt',n:'Bianca Teixeira',ini:'BT',t:'Criadora',w:'Só convite enviado, sem resposta',ok:0}],
a:[{k:'mm',n:'Marjorie Moreira',ini:'MM',t:'Criadora',w:'Cliente Doce Vale · concluída em 28/10',ok:1},{k:'la',n:'Lucas Amaral',ini:'LA',t:'Criador',w:'Cliente Sorriso Sul · negociação realizada',ok:1},{k:'bt',n:'Bianca Teixeira',ini:'BT',t:'Criadora',w:'Convite pendente, sem resposta',ok:0}]};
const RATED={},TAGS={c:['Briefing claro','Pagamento em dia','Boa comunicação','Respeito ao prazo'],e:['Qualidade','Entrega no prazo','Boa comunicação','Profissionalismo'],a:['Qualidade','Entrega no prazo','Boa comunicação','Profissionalismo']};
const STL=['Ruim','Regular','Bom','Muito bom','Excelente'];
let evSel=null,evStar=0;
const PL=p=>ST[p].fresh?PARC[p].map(x=>({...x,ok:0,w:'Ainda sem campanha ou negociação'})):PARC[p];
const pend=p=>PL(p).filter(x=>x.ok&&!RATED[p+x.k]).length;
const AVC=p=>{if(ST[p].fresh)return'';const n=pend(p);return n?`<div class="evc"><div><b>Avalie suas parcerias</b><span>${n} ${n>1?'parcerias aguardam':'parceria aguarda'} a sua avaliação. Leva menos de 1 minuto.</span></div><button class="bt" data-g="${p}_ev">Avaliar agora</button></div>`:`<div class="evc ok"><div><b>Avaliações em dia</b><span>Você avaliou todas as parcerias concluídas.</span></div></div>`};
const STR=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const EVB=p=>()=>{const L=PL(p),el=L.filter(x=>x.ok&&!RATED[p+x.k]),dn=L.filter(x=>x.ok&&RATED[p+x.k]),lk=L.filter(x=>!x.ok);
return`<p class="hi">Avalie em poucos toques. Só aparecem pessoas e negócios com campanha concluída ou negociação realizada.</p>`+
(el.length?SHD('Quem você quer avaliar?')+`<div id="evl">${el.map(x=>`<button class="pk" data-pick="${x.k}" aria-pressed="false"><span class="av2">${x.ini}</span><span class="pt"><b>${x.n}</b><small>${x.t} · ${x.w}</small></span><i>${IC('check',16,2.4)}</i></button>`).join('')}</div>`+SHD('Sua nota')+`<div class="stars" role="radiogroup" aria-label="Nota de 1 a 5">${[1,2,3,4,5].map(n=>`<button data-star="${n}" role="radio" aria-checked="false" aria-label="${n} ${n>1?'estrelas':'estrela'}">★</button>`).join('')}</div><p class="cap" id="stl">Toque nas estrelas</p>`+SHD('O que mais marcou? (opcional)')+C(TAGS[p])+`<label>Comentário (opcional)<textarea rows="2" id="evc" placeholder="Escreva em uma frase"></textarea></label><button class="bt" data-rate>Enviar avaliação</button>`
:`<div class="cd" style="text-align:center"><b>Tudo em dia</b><small>Você já avaliou todas as parcerias disponíveis.</small></div>`)+
(dn.length?SHD('Já avaliados')+dn.map(x=>`<div class="pk dn"><span class="av2">${x.ini}</span><span class="pt"><b>${x.n}</b><small class="st2">${STR(RATED[p+x.k].s)} · ${STL[RATED[p+x.k].s-1]}</small></span><i style="opacity:1">${IC('check',16,2.4)}</i></div>`).join(''):'')+
(lk.length?SHD('Ainda não disponíveis')+lk.map(x=>`<div class="pk lk"><span class="av2">${x.ini}</span><span class="pt"><b>${x.n}</b><small>${x.w}</small></span><i style="opacity:1">${IC('lock',16,2)}</i></div>`).join('')+'<p class="cap" style="text-align:left">A avaliação libera depois de uma campanha concluída ou de uma negociação realizada.</p>':'')};

/* ---------- dados do perfil (PD) e esquema de campos ---------- */
const PF0=PF.map(x=>({...x}));
const OPT={
nichos:['Gastronomia','Lifestyle','Beleza','Moda','Humor','Fitness','Saúde e bem-estar','Viagem','Tecnologia','Games','Educação','Maternidade e família','Pets','Casa e decoração','Finanças','Automotivo','Esportes','Música','Arte e design','Sustentabilidade'],
idades:['18–24','25–34','35–44','45–59','60+'],gen:['Mulheres','Homens','Todos os gêneros'],reg:['Pelotas e região','Rio Grande do Sul','Sul do Brasil','Brasil todo'],
fmt:['Reels 9:16','Stories','TikTok','YouTube Shorts','Foto ou carrossel','Vídeo para anúncio (UGC)'],idi:['Português','Inglês','Espanhol'],
segE:['Alimentação','Beleza','Moda','Saúde','Serviços','Casa e decoração','Pets','Educação','Esportes','Tecnologia','Outros'],
canais:['Loja física','Delivery','E-commerce','Sob encomenda','Marketplace'],
serv:['Campanhas com creators','Gestão de redes sociais','Produção de conteúdo','Tráfego pago','Branding','Assessoria de imprensa'],
porteCr:['Nano (até 10 mil)','Micro (10 a 100 mil)','Médio (mais de 100 mil)']};
const SCH={
c:[['Sobre você',[{k:'nome',l:'Nome completo',t:'text',req:1},{k:'cpf',l:'CPF',t:'text',ph:'000.000.000-00'},{k:'genero',l:'Gênero',t:'sel',o:['Mulher','Homem','Não-binário','Prefiro não informar'],req:1},{k:'idade',l:'Idade',t:'ro'},{k:'cidade',l:'Cidade',t:'text',req:1},{k:'uf',l:'Estado',t:'text',req:1},{k:'idiomas',l:'Idiomas',t:'chips',o:OPT.idi,req:1},{k:'sobre',l:'Sobre você',t:'area',req:1,ph:'Conte em poucas linhas o que você cria.'}]],
['Redes e alcance',[{k:'insta',l:'Instagram',t:'text',req:1,ph:'@seuusuario'},{k:'tiktok',l:'TikTok',t:'text',ph:'@seuusuario'},{k:'yt',l:'YouTube',t:'text',ph:'Nome do canal'},{k:'seg',l:'Seguidores da sua maior rede',t:'sel',o:['Até 10 mil (nano)','10 a 50 mil (micro)','50 a 100 mil (micro)','Mais de 100 mil'],req:1}]],
['O que você cria',[{k:'nichos',l:'Nichos de atuação',t:'chips',o:OPT.nichos,req:1},{k:'fmt',l:'Formatos de vídeo',t:'chips',o:OPT.fmt,req:1},{k:'prazo',l:'Prazo médio de entrega',t:'sel',o:['Até 3 dias','Até 5 dias','Até 7 dias','Até 10 dias'],req:1},{k:'val.reels',l:'Valor mínimo por vídeo (R$)',t:'num',req:1}]],
['Público que você alcança',[{k:'pIdade',l:'Faixa etária',t:'chips',o:OPT.idades,req:1},{k:'pGen',l:'Gênero predominante',t:'sel',o:OPT.gen,req:1},{k:'pReg',l:'Região do público',t:'sel',o:OPT.reg,req:1},{k:'pInt',l:'Interesses do público',t:'chips',o:OPT.nichos}]]],
e:[['Sobre o negócio',[{k:'nome',l:'Nome do comércio',t:'text',req:1},{k:'cnpj',l:'CNPJ',t:'text',ph:'00.000.000/0000-00'},{k:'resp',l:'Nome do responsável',t:'text'},{k:'seg',l:'Segmento',t:'sel',o:OPT.segE,req:1},{k:'porte',l:'Porte',t:'sel',o:['MEI','Microempresa','Pequena empresa'],req:1},{k:'tempo',l:'Tempo de mercado',t:'ro'},{k:'cidade',l:'Cidade',t:'text',req:1},{k:'uf',l:'Estado',t:'text',req:1},{k:'sobre',l:'Sobre o negócio',t:'area',req:1,ph:'Conte em poucas linhas o que o seu negócio faz.'}]],
['Presença e vendas',[{k:'insta',l:'Instagram',t:'text',req:1,ph:'@seunegocio'},{k:'site',l:'Site ou cardápio online',t:'text',ph:'seunegocio.com.br'},{k:'canais',l:'Canais de venda',t:'chips',o:OPT.canais,req:1}]],
['Público-alvo',[{k:'pIdade',l:'Faixa etária',t:'chips',o:OPT.idades,req:1},{k:'pGen',l:'Gênero predominante',t:'sel',o:OPT.gen,req:1},{k:'pReg',l:'Região dos clientes',t:'sel',o:OPT.reg,req:1},{k:'pInt',l:'Interesses do público',t:'chips',o:OPT.nichos,req:1}]],
['Campanhas que você quer fazer',[{k:'fmt',l:'Formatos desejados',t:'chips',o:OPT.fmt,req:1},{k:'orc',l:'Orçamento médio por vídeo',t:'sel',o:['Até R$ 200','R$ 200 a 500','R$ 500 a 1.000','Acima de R$ 1.000'],req:1},{k:'porteCr',l:'Porte de criador buscado',t:'chips',o:OPT.porteCr,req:1},{k:'nichosCr',l:'Nichos de criadores preferidos',t:'chips',o:OPT.nichos}]]],
a:[['Sobre a agência',[{k:'nome',l:'Nome da agência',t:'text',req:1},{k:'cnpj',l:'CNPJ',t:'text',ph:'00.000.000/0000-00'},{k:'resp',l:'Nome do responsável',t:'text'},{k:'servicos',l:'Serviços oferecidos',t:'chips',o:OPT.serv,req:1},{k:'tempo',l:'Tempo de mercado',t:'ro'},{k:'equipe',l:'Tamanho da equipe',t:'sel',o:['1 a 5 pessoas','6 a 15 pessoas','16 a 50 pessoas','Mais de 50 pessoas'],req:1},{k:'cidade',l:'Cidade',t:'text',req:1},{k:'uf',l:'Estado',t:'text',req:1},{k:'sobre',l:'Sobre a agência',t:'area',req:1,ph:'Conte em poucas linhas o que a agência faz.'}]],
['Presença',[{k:'insta',l:'Instagram',t:'text',req:1,ph:'@suaagencia'},{k:'site',l:'Site',t:'text',ph:'suaagencia.com.br'}]],
['Clientes atendidos',[{k:'segs',l:'Segmentos atendidos',t:'chips',o:OPT.segE,req:1},{k:'nCli',l:'Clientes ativos',t:'sel',o:['1 a 5','6 a 15','16 a 30','Mais de 30'],req:1},{k:'pIdade',l:'Faixa etária dos públicos',t:'chips',o:OPT.idades,req:1},{k:'reg',l:'Regiões atendidas',t:'sel',o:OPT.reg,req:1}]],
['Campanhas',[{k:'orc',l:'Orçamento médio por campanha',t:'sel',o:['Até R$ 1.000','R$ 1.000 a 3.000','R$ 3.000 a 10.000','Acima de R$ 10.000'],req:1},{k:'fmt',l:'Formatos mais produzidos',t:'chips',o:OPT.fmt,req:1},{k:'porteCr',l:'Porte de criador buscado',t:'chips',o:OPT.porteCr,req:1}]]]};
const PD={
c:{nome:'Marjorie Moreira',cpf:'529.982.247-25',nasc:'14/03/1996',genero:'Mulher',cidade:'Pelotas',uf:'RS',idiomas:['Português','Inglês'],sobre:'Criadora de conteúdo gastronômico em Pelotas. Gosto de vídeos curtos, com bastidores e receitas.',insta:'@marjorie.cria',tiktok:'@marjorie.cria',yt:'',seg:'10 a 50 mil (micro)',nichos:['Gastronomia','Lifestyle'],fmt:['Reels 9:16','Stories','TikTok'],prazo:'Até 5 dias',val:{reels:200,stories:120,tiktok:180,img:'Incluso por 90 dias'},pIdade:['25–34','35–44'],pGen:'Mulheres',pReg:'Pelotas e região',pInt:['Gastronomia','Casa e decoração','Maternidade e família'],mail:'marjorie@email.com',tel:'(53) 99912-3456'},
e:{nome:'Doce Vale Confeitaria',cnpj:'11.222.333/0001-81',resp:'Helena Vale',fund:'10/05/2018',seg:'Alimentação',porte:'Microempresa',cidade:'Pelotas',uf:'RS',sobre:'Confeitaria artesanal com receitas coloniais, vendas na loja e por encomenda.',insta:'@docevale',site:'docevale.com.br',canais:['Loja física','Sob encomenda','Delivery'],pIdade:['25–34','35–44'],pGen:'Mulheres',pReg:'Pelotas e região',pInt:['Gastronomia','Maternidade e família'],fmt:['Reels 9:16','Stories'],orc:'R$ 200 a 500',porteCr:['Nano (até 10 mil)','Micro (10 a 100 mil)'],nichosCr:['Gastronomia','Lifestyle'],mail:'contato@docevale.com.br',tel:'(53) 3222-4410'},
a:{nome:'Maré Digital',cnpj:'12.345.678/0001-95',resp:'Ricardo Soares',fund:'02/02/2019',servicos:['Campanhas com creators','Gestão de redes sociais','Produção de conteúdo'],equipe:'6 a 15 pessoas',cidade:'Pelotas',uf:'RS',sobre:'Agência de marketing digital focada em pequenos negócios do Sul do país, com campanhas de creators.',insta:'@maredigital',site:'maredigital.com.br',segs:['Saúde','Beleza','Alimentação'],nCli:'1 a 5',pIdade:['25–34','35–44'],reg:'Rio Grande do Sul',orc:'R$ 1.000 a 3.000',fmt:['Reels 9:16','Vídeo para anúncio (UGC)'],porteCr:['Nano (até 10 mil)','Micro (10 a 100 mil)'],mail:'oi@maredigital.com.br',tel:'(53) 99871-2200'}};
const gp=(o,k)=>k.split('.').reduce((a,x)=>a&&a[x],o);
const sp=(o,k,v)=>{const a=k.split('.');let t=o;a.slice(0,-1).forEach(x=>t=t[x]=t[x]||{});t[a[a.length-1]]=v};
const dparse=s=>{const r=String(s||'').match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);return r?new Date(+r[3],+r[2]-1,+r[1]):null};
const yrs=s=>{const d=dparse(s);if(!d||isNaN(d))return'';const n=new Date(2026,10,5);let y=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))y--;return y>=0&&y<120?y:''};
const roVal=(p,k)=>{if(k=='idade'){const y=yrs(PD.c.nasc);return y!==''?y+' anos':'—'}if(k=='tempo'){const y=yrs(PD[p].fund);return y===''?'—':y<1?'Menos de 1 ano':y+(y>1?' anos':' ano')}return'—'};
const ini=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('');
function applyPF(p){const P=PF[PU[p]],d=PD[p];if(d.nome){P.n=d.nome;P.nome=p=='c'?d.nome.split(/\s+/)[0]:d.nome;P.ini=ini(d.nome)}if(d.mail)P.mail=d.mail;if(d.tel)P.tel=d.tel}
const blankPD=p=>({nome:'',nichos:[],idiomas:[],fmt:[],pIdade:[],pInt:[],canais:[],servicos:[],segs:[],porteCr:[],nichosCr:[],val:{},mail:'',tel:''});
const subOf=p=>{const d=PD[p],loc=[d.cidade,d.uf].filter(Boolean).join(', ');return p=='c'?[d.insta?'Instagram'+(d.tiktok?' e TikTok':''):'',loc].filter(Boolean).join(' · '):[p=='e'?d.seg:'Agência',loc].filter(Boolean).join(' · ')};
const fld=(p,f,st)=>{const v=gp(st||PD[p],f.k),at=`data-f="${f.k}" data-lab="${f.l}"${f.req?' data-req="1"':''}`;
if(f.t=='sel')return`<label>${f.l}<select ${at}><option value="">Selecione</option>${f.o.map(x=>`<option${x==v?' selected':''}>${x}</option>`).join('')}</select></label>`;
if(f.t=='area')return`<label>${f.l}<textarea rows="3" ${at} placeholder="${f.ph||''}">${v||''}</textarea></label>`;
if(f.t=='chips')return`<label>${f.l}</label><div class="chg" data-fg="${f.k}" data-lab="${f.l}"${f.req?' data-reqg="1"':''}>${f.o.map(x=>`<span class="ch${(v||[]).includes(x)?' on':''}">${x}</span>`).join('')}</div>`;
if(f.t=='ro')return`<label>${f.l}<input value="${roVal(p,f.k)}" disabled></label>`;
return`<label>${f.l}<input type="${f.t=='num'?'number':'text'}" value="${v==null?'':v}" ${at} placeholder="${f.ph||''}"></label>`};
function collect(p,root,st){const miss=[],T=st||PD[p];root.querySelectorAll('[data-f]').forEach(x=>{const v=x.value.trim();if(x.dataset.req&&!v)miss.push(x.dataset.lab.toLowerCase());if(x.dataset.f=='tel'&&!v)return;sp(T,x.dataset.f,x.dataset.num?(v===''?'':mkNum(v,x.dataset.num)):x.type=='number'?(v===''?'':+v):v)});
root.querySelectorAll('[data-fg]').forEach(g=>{const a=[...g.querySelectorAll('.ch.on')].map(c=>c.textContent);if(g.dataset.reqg&&!a.length)miss.push(g.dataset.lab.toLowerCase());sp(T,g.dataset.fg,a)});if(!st)applyPF(p);return miss}
const VK=(l,v)=>`<div class="vk"><small>${l}</small><div>${v}</div></div>`;
const TGV=a=>a.map(x=>`<span class="tgv">${x}</span>`).join('');
const viewSec=p=>SCH[p].map(([t,fs])=>{const rows=fs.filter(f=>f.k!='nome'&&!['insta','tiktok','yt','site'].includes(f.k)).map(f=>{const v=f.t=='ro'?roVal(p,f.k):gp(PD[p],f.k);if(f.t=='chips')return(v&&v.length)?VK(f.l,TGV(v)):'';if(v===''||v==null||v==='—')return'';let s=f.k=='val.reels'?'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2}):v;if(f.k=='cidade')s=v+(PD[p].uf?', '+PD[p].uf:'');if(f.k=='uf')return'';return VK(f.l,s)}).join('');return rows?SHD(t)+Card(rows):''}).join('');
const NEGNOTE=`<div class="np">${IC('lock',18,2)}<span>Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Telefone, e-mail, redes sociais e site não aparecem no perfil público: quem quiser falar com você envia uma proposta pela Triskel.</span></div>`;
const mailHTML=p=>{const P=PF[PU[p]];return`<div class="mail"><div class="mt1"><button class="mb bkl" aria-label="Voltar para a Triskel">${IC('back',22,2)}</button><span>Caixa de entrada</span></div><h2>Seu código de verificação da Triskel<span class="lbl">Caixa de entrada</span></h2><div class="snd"><div class="sav">T</div><div><b>Triskel</b> <small>&lt;nao-responda@triskel.com.br&gt;</small><br><small>para ${P.mail} · agora</small></div></div><div class="bdy"><p>Olá, ${P.nome}!</p><p>Use o código abaixo para validar o seu e-mail na Triskel. Ele vale por 15 minutos.</p><div class="code" aria-label="Código 4 8 2 9 1 3">482913</div><p>Copie o código e digite no app, ou toque no botão abaixo para abrir a Triskel com o código já preenchido.</p><button class="mbt bkl" data-prefill>Abrir a Triskel com o código</button><p style="font-size:13px;color:#5f6368;margin-top:6px">Se você não criou uma conta na Triskel, ignore esta mensagem.</p><p style="font-size:12px;color:#80868b">Triskel · Plataforma de criadores</p></div><div class="sim">Esta tela simula o e-mail que a pessoa recebe, fora do app.</div></div>`};
FIG.mail=()=>mailHTML(profOf(cur).p);

/* ---------- páginas ---------- */
const NICH={c:['*Gastronomia','*Lifestyle','Beleza','Moda','Humor'],e:['*Famílias','Jovens 18–24','*Mulheres 25–39'],a:['*Alimentação','*Saúde','*Beleza','Moda']};
[0,1,2].forEach(u=>{const P=PF[u],p=P.p,g=GI[p],d=k=>p+'_'+k;
/* PAINEL */
const KPI={c:[['2','Propostas novas','1 vence em 3 dias'],['1','Campanha ativa','Entrega em 25/11'],['R$ 420','A receber','Libera após aprovação'],['★ 4,9','Nota média','13 avaliações']],
e:[['2','Campanhas ativas','1 aguardando entrega'],['5','Convites enviados','3 responderam'],['1','Entrega para revisar','Relatório da IA pronto'],['R$ 1.120','Investido no mês','4 vídeos aprovados']],
a:[['3','Clientes ativos','Doce Vale, Sorriso Sul, Bela Pele'],['4','Campanhas ativas','2 em produção'],['7','Criadores contratados','5 com entrega no prazo'],['2','Entregas para revisar','Relatórios da IA prontos']]}[p];
const ATT={c:Cd('Proposta de Doce Vale Confeitaria','R$ 350 · 1 vídeo · responder até 12/11','Ver proposta','c7')+Cd('Entrega em produção','Linha de doces coloniais · prazo 25/11','Ver briefing','c11'),
e:Cd('Marjorie Moreira enviou o vídeo','Linha de doces coloniais · relatório da IA pronto','Revisar entrega','e14')+Cd('Resposta à proposta','Marjorie pediu para negociar o valor','Ver resposta','e7'),
a:Cd('Entrega de Marjorie Moreira','Cliente Doce Vale · relatório da IA pronto','Revisar entrega','a14')+Cd('Criadores responderam','Campanha Linha de doces coloniais · 2 de 3 aceitaram','Ver respostas','a7')}[p];
const SUG={c:SHD('Sugeridas pela IA para o seu perfil')+Cd('Cardápio de inverno','Pizzaria Forno a Lenha · R$ 250 · 81% compatível','','c5'),
e:SHD('Criadores recomendados pela IA')+Cd('Lucas Amaral','Gastronomia, Humor · Pelotas · ★ 4,7 · 88% compatível','','e4'),
a:SHD('Criadores recomendados pela IA')+Cd('Bianca Teixeira','Lifestyle · Pelotas · ★ 4,8 · 81% compatível','','a4')}[p];
const KPI0={c:[['0','Propostas novas'],['0','Campanhas ativas'],['R$ 0','A receber'],['—','Nota média']],e:[['0','Campanhas ativas'],['0','Convites enviados'],['0','Entregas para revisar'],['R$ 0','Investido no mês']],a:[['0','Clientes ativos'],['0','Campanhas ativas'],['0','Criadores contratados'],['0','Entregas para revisar']]};
const EMP={c:'Quando o seu perfil estiver visível, as propostas e convites de empresas aparecem aqui.',e:'Quando o seu perfil estiver pronto, crie a primeira campanha e convide criadores.',a:'Quando o seu perfil estiver pronto, cadastre clientes e crie a primeira campanha.'};
pg(g,u,d('pn'),'Painel','Menu · Painel',()=>{const s=ST[p];return`<p class="hi">${s.fresh?'Bem-vindo(a) à Triskel, '+P.nome+'.':'Olá, '+P.nome+'. Veja o que pede a sua atenção hoje.'}</p>`+SUMM(p)+BNR(p)+KP(s.fresh?KPI0[p]:kpiLive(p,KPI))+walStrip(p)+(s.fresh?`<div class="cd" style="margin-top:16px;text-align:center"><b>Nada por aqui ainda</b><small>${EMP[p]}</small></div>`:AVC(p)+SHD('Precisa da sua atenção')+attLive(p)+SUG)});

/* PERFIL: visualizar */
const RATE={c:'★ 4,9 · 13 trabalhos',e:'★ 4,8 · 6 campanhas',a:'3 clientes · 4 campanhas ativas'},TAG={c:'Aberta a convites',e:'Aceita candidaturas',a:'Aceita convites de clientes'};
pg(g,u,d('pv'),'Visualizar perfil','Menu · Perfil',()=>{const s=ST[p],vis=visOf(p);
const body=s.comp?PC(P,subOf(p),s.fresh?'Novo na Triskel':RATE[p],`<div><span class="pl">${TAG[p]}</span></div>`)+viewSec(p)+(p=='c'?SHD('Portfólio')+(s.fresh?Cd('Meu portfólio','Adicione seus melhores vídeos','Abrir portfólio','c3'):Cd('Receita de bolo de rolo','Doce Vale Confeitaria · Reels','12,4 mil visualizações','c3')+Cd('Tour pelo Mercado Central','Mercado Central de Pelotas · TikTok','8,1 mil visualizações','c3')):'')+NEGNOTE:`<div class="cd" style="text-align:center"><b>Prévia indisponível</b><small>Complete o perfil para ver como ${AUD[p]} vão enxergar você.</small></div>`;
return(vis?`<div class="vok">${IC('check',16,2.4)}<span>Seu perfil está visível para ${AUD[p]}.</span></div>`:BNR(p))+body},
()=>[[ST[p].comp?'Editar perfil':'Completar perfil',d('pe')]]);

/* PERFIL: editar / completar */
pg(g,u,d('pe'),()=>ST[p].comp?'Editar perfil':'Completar perfil','Menu · Perfil',()=>{const c=ST[p].comp,dd=PD[p];
const priv=Card(K([[p=='c'?'CPF':'CNPJ',dd.doc?'•••.'+String(dd.doc).replace(/\D/g,'').slice(-5,-2)+'.•••-••':'não informado'],[p=='c'?'Data de nascimento':'Data de fundação',(p=='c'?dd.nasc:dd.fund)||'não informada'],['E-mail',mask(P.mail,'m')],['Celular',P.tel?mask(P.tel,'t'):'não informado']]))+'<p class="cap" style="text-align:left">Dados da conta, vindos do cadastro. Eles não aparecem no seu perfil.</p>';
return(c?'':`<p class="hi">Falta pouco. Os dados do cadastro já vieram preenchidos. Adicione as fotos e complete o restante para o perfil ficar visível para ${AUD[p]}.</p>`)+`<div class="phw" id="phw">${PHI(p)}</div>`+SCH[p].map(([t,fs])=>SHD(t)+fs.map(f=>fld(p,f)).join('')).join('')+SHD('Dados da conta (privados)')+priv},
()=>ST[p].comp?[['Salvar alterações','','','','','data-comp="1"'],['Cancelar',d('pv'),'o']]:[['Concluir perfil','','','','','data-comp="1"'],['Cancelar',d('pn'),'o']]);

/* PERFIL: validar e-mail (a caixa de entrada é outra tela) */
pg(g,u,d('ve'),'Validar e-mail','Menu · Perfil',()=>ST[p].ver?`<div class="vok">${IC('check',16,2.4)}<span>E-mail validado: ${mask(P.mail,'m')}</span></div><p class="cap">Nada a fazer por aqui.</p>`:`<p class="hi">Enviamos um código de 6 dígitos para <b>${mask(P.mail,'m')}</b>. Abra o e-mail, copie o código e volte para digitar aqui.</p>`+BTN('Abrir meu e-mail',d('mail'),'o')+`<label>Código de 6 dígitos<input id="vcode" inputmode="numeric" maxlength="6" placeholder="000000" value="${ST[p].pre?'482913':''}" autocomplete="one-time-code"></label><p class="cap" style="text-align:left">Sem validar o e-mail, o seu perfil não aparece para outras pessoas.</p>`,()=>ST[p].ver?[['Voltar ao painel',d('pn')]]:[['Validar e-mail','','','','','data-ve="1"'],['Reenviar código','','o','Novo código enviado para '+mask(P.mail,'m')+'.']]);
pg(g,u,d('mail'),'E-mail recebido (simulado)','Fora da tela · E-mail','');S[d('mail')].fig='mail';

/* PERFIL: editar valores (só criador) */
if(p=='c')pg(g,u,d('va'),'Editar valores','Menu · Perfil',()=>'<p class="hi">Seus valores aparecem para empresas e agências ao buscarem criadores.</p>'+[['val.reels','Reels 9:16 (R$)'],['val.stories','Stories, pacote de 3 (R$)'],['val.tiktok','TikTok (R$)']].map(([k,l])=>`<label>${l}<input type="number" data-f="${k}" data-lab="${l}" value="${gp(PD.c,k)||''}"></label>`).join('')+`<label>Uso de imagem<select data-f="val.img" data-lab="Uso de imagem">${['Incluso por 90 dias','+20% por 180 dias','+40% por 12 meses'].map(x=>`<option${x==gp(PD.c,'val.img')?' selected':''}>${x}</option>`).join('')}</select></label>`+Card(SW('Mostrar valores no perfil público',1,'Desligado, só aparece “sob consulta”.')+SW('Aceitar propostas abaixo do meu mínimo',0)),[['Salvar valores',d('pv'),'','Valores atualizados.','','data-col="1"'],['Cancelar',d('pv'),'o']]);

/* PERFIL: trocar número (sem validação) / e-mail (com validação) */
pg(g,u,d('nu'),'Trocar número','Menu · Perfil',()=>`<p class="hi">Número atual: <b>${P.tel?mask(P.tel,'t'):'não informado'}</b></p><label>Novo número de celular<input type="tel" data-f="tel" placeholder="(53) 99999-9999" autocomplete="tel"></label><p class="cap" style="text-align:left">Usamos o número só para avisar sobre propostas e pagamentos. Não precisa de validação e nunca aparece no seu perfil.</p>`,[['Salvar número',d('pv'),'','Número atualizado.','','data-col="1"'],['Cancelar',d('pv'),'o']]);
pg(g,u,d('em'),'Trocar email','Menu · Perfil',()=>`<p class="hi">E-mail atual: <b>${mask(P.mail,'m')}</b></p><label>Novo e-mail<input type="email" id="nmail" placeholder="novo@email.com" autocomplete="email"></label><p class="cap" style="text-align:left">Vamos enviar um código para o novo e-mail. Até validar, o seu perfil fica oculto para outras pessoas.</p>`,[['Enviar código ao novo e-mail','','','','','data-newmail="1"'],['Cancelar',d('pv'),'o']]);
pg(g,u,d('se'),'Trocar senha','Menu · Perfil','<label>Senha atual<input type="password" value="senhaantiga1" aria-label="Senha atual"></label><label>Nova senha<input type="password" data-pw="1" placeholder="Crie uma senha forte" autocomplete="new-password"></label><label>Confirmar nova senha<input type="password" data-pw="2" placeholder="Repita a nova senha" autocomplete="new-password"></label><div id="pwb" style="margin-top:12px"></div>',[[`Salvar nova senha`,d('pv'),'','Senha alterada com sucesso.'],['Cancelar',d('pv'),'o']]);
S[d('se')].o[0].push(1);

/* AVALIAÇÕES */
const AVL={c:KP([['★ 4,9','Nota média','13 avaliações'],['100%','Entregas no prazo','Últimos 90 dias']])+SHD('Por critério')+Card(BR('Qualidade',5)+BR('Prazo',4.9)+BR('Comunicação',4.9)+BR('Briefing',4.8)+BR('Profissionalismo',5))+SHD('Comentários recebidos')+RV('Doce Vale Confeitaria','Linha de doces coloniais · out/2026',5,'Entrega no prazo, vídeo caprichado e ótima comunicação.')+RV('Pizzaria Forno a Lenha','Cardápio de inverno · set/2026',5,'Roteiro criativo e respeitou todo o briefing.')+RV('Chocolates da Serra','Vitrine de Páscoa · mar/2026',4,'Bom resultado; pediu um ajuste de áudio, resolvido rápido.'),
e:KP([['★ 4,8','Nota média','6 avaliações'],['92%','Pagamentos em dia','Últimos 90 dias']])+SHD('Por critério')+Card(BR('Clareza do briefing',4.8)+BR('Comunicação',4.9)+BR('Pagamento',4.7)+BR('Respeito ao prazo',4.8))+SHD('Comentários dos criadores')+RV('Marjorie Moreira','Linha de doces coloniais · out/2026',5,'Briefing claro, aprovação rápida e pagamento liberado no dia.')+RV('Lucas Amaral','Cardápio de inverno · set/2026',5,'Equipe atenciosa e fácil de negociar.'),
a:KP([['★ 4,9','Nota média','11 avaliações'],['86%','Aprovadas de 1ª','Últimos 90 dias']])+SHD('Por critério')+Card(BR('Clareza do briefing',4.9)+BR('Comunicação',4.9)+BR('Pagamento',4.8)+BR('Respeito ao prazo',4.8))+SHD('Comentários dos criadores')+RV('Bianca Teixeira','Cliente Studio Bela Pele · out/2026',5,'Agência organizada, briefing completo e retorno rápido.')+RV('Marjorie Moreira','Cliente Doce Vale · out/2026',5,'Ótimo acompanhamento durante toda a campanha.')}[p];
pg(g,u,d('av'),'Avaliações','Menu · Avaliações · RF20',()=>ST[p].fresh?`<div class="cd" style="text-align:center"><b>Nenhuma avaliação ainda</b><small>As avaliações aparecem aqui depois da sua primeira campanha ou negociação.</small></div>`:AVC(p)+AVL);
pg(g,u,d('ev'),'Avaliar parcerias','Menu · Avaliar · RF20',EVB(p));

/* CAMPANHAS (comércio e agência) */
if(p=='e')pg(g,u,d('ca'),'Minhas campanhas','Menu · Campanhas',Cd('Linha de doces coloniais','1 vídeo · R$ 350 · prazo 25/11/2026','<span class="pl w">Entrega para revisar</span>','e14')+Cd('Cardápio de verão','2 vídeos · R$ 600 · prazo 15/12/2026','<span class="pl">Convites enviados</span>','e5')+Cd('Páscoa 2026','1 vídeo · R$ 300 · concluída em 28/03','<span class="pl g">Concluída</span>')+'',[['+ Nova campanha','e2']]);
if(p=='a')pg(g,u,d('ca'),'Campanhas','Menu · Campanhas',SHD('Doce Vale Confeitaria')+Cd('Linha de doces coloniais','3 criadores · R$ 1.050 · prazo 25/11','<span class="pl w">Entrega para revisar</span>','a14')+SHD('Clínica Sorriso Sul')+Cd('Check-up em família','2 criadores · R$ 900 · prazo 10/12','<span class="pl">Em produção</span>','a12')+SHD('Studio Bela Pele')+Cd('Cuidados de verão','2 criadores · R$ 800 · prazo 20/12','<span class="pl">Convites enviados</span>','a5'),[['+ Nova campanha','a3']]);

/* AJUDA E SUPORTE */
const FAQ={c:FQ('Como recebo o pagamento?','Depois que o contratante aprova a entrega, o pagamento é liberado e você recebe um aviso por e-mail.')+FQ('O que a IA analisa no meu vídeo?','Ela compara o vídeo com o briefing: logo, produto, duração, áudio e conteúdo humanizado. É um apoio, a decisão final é do contratante.')+FQ('Posso negociar o valor de uma proposta?','Sim. Em “Negociar proposta” você envia uma contraproposta com valor, prazo e uso de imagem.')+FQ('Posso negociar fora da plataforma?','Não. Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Isso protege as duas partes e guarda o histórico para a avaliação.')+FQ('Quem vê o meu telefone e o meu e-mail?','Ninguém. Eles não aparecem no perfil. A conversa entre as partes acontece pelo chat da Triskel.')+FQ('Como altero os meus dados?','Em Perfil, escolha Editar perfil, Editar valores, Trocar número, e-mail ou senha.'),
e:FQ('Como encontro o criador ideal?','Em Buscar criadores, use os filtros e veja as recomendações da IA com a porcentagem de compatibilidade.')+FQ('Quando o pagamento é liberado?','Depois que você aprova a entrega do criador. Você recebe a confirmação por e-mail.')+FQ('A IA decide se aprovo o vídeo?','Não. O relatório da IA é um apoio; você pode aprovar, pedir ajustes ou ignorar a sugestão.')+FQ('Como peço ajustes ao criador?','Na revisão da entrega, escolha “Pedir ajustes” e escreva o comentário.')+FQ('Posso negociar fora da plataforma?','Não. Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Isso protege as duas partes e guarda o histórico para a avaliação.')+FQ('Quem vê o meu telefone e o meu e-mail?','Ninguém. Eles não aparecem no perfil. A conversa entre as partes acontece pelo chat da Triskel.'),
a:FQ('Como cadastro um novo cliente?','Em Meus clientes, toque em “+ Cadastrar cliente” e informe o nome e o segmento.')+FQ('Posso contratar vários criadores numa campanha?','Sim. Em Selecionar criadores, marque quantos quiser e envie os convites de uma vez.')+FQ('Quem aprova a entrega?','A agência revisa o relatório da IA e aprova ou pede ajustes em nome do cliente.')+FQ('Posso negociar fora da plataforma?','Não. Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Isso protege as duas partes e guarda o histórico para a avaliação.')+FQ('Quem vê o meu telefone e o meu e-mail?','Ninguém. Eles não aparecem no perfil. A conversa entre as partes acontece pelo chat da Triskel.')+FQ('Como altero os dados da agência?','Em Perfil, escolha Editar perfil, Trocar número, e-mail ou senha.')}[p];
pg(g,u,d('aj'),'Ajuda e suporte','Menu · Ajuda',SHD('Perguntas frequentes')+FAQ+FQ('Posso negociar ou combinar algo fora da Triskel?','Não. Propostas, contrapropostas, mensagens, contrato e pagamento acontecem só na plataforma, e é isso que protege o valor em custódia. Mensagens com telefone, e-mail, links ou redes sociais são bloqueadas.')+FQ('Qual é a taxa da Triskel?','10% sobre o valor do criador, paga por quem contrata. Ela aparece na proposta, na contraproposta e no contrato, e não é descontada do que o criador recebe.')+SHD('Fale com a gente')+Card(K([['E-mail','suporte@triskel.com.br'],['Atendimento','Seg a sex, 9h às 18h'],['Resposta','Em até 1 dia útil']]))+'<label>Descreva o problema<textarea rows="3" placeholder="Conte o que aconteceu"></textarea></label>',[['Enviar mensagem','','','Mensagem enviada. Respondemos em até 1 dia útil.']]);

/* CONFIGURAÇÕES */
pg(g,u,d('cf'),'Configurações','Menu · Configurações',()=>SHD('Aparência')+Card(THM())+SHD('Notificações')+Card(SW('Avisos no celular (push)',1,p=='c'?'Propostas, respostas e pagamentos':'Respostas, entregas e relatórios')+SW('Avisos por e-mail',1,'Pagamentos e contratos')+SW('Resumo semanal',0,'Toda segunda-feira'))+SHD('Privacidade')+Card(visOf(p)?SW('Aparecer para '+AUD[p],1,'Você pode pausar quando quiser'):`<div class="sw dis" aria-disabled="true"><span><b>Aparecer para ${AUD[p]}</b><small>Disponível depois de completar o perfil e validar o e-mail.</small></span><i></i></div>`)+SHD('Seus dados (LGPD)')+Card('Guardamos só o necessário para a plataforma funcionar. Você pode baixar uma cópia dos seus dados ou pedir a exclusão da conta.')+BTN('Baixar meus dados','','o','Enviaremos o arquivo para o seu e-mail em até 48 horas.')+BTN('Excluir minha conta','','o dg','Pedido recebido. Vamos confirmar por e-mail antes de excluir.'));
});

/* ===== Criar campanha: formulário completo + campanha gerada (comércio e agência) ===== */
const CD={};
const CSCH=p=>[
['Sobre a campanha',[...(p=='a'?[{k:'cliente',l:'Cliente',t:'sel',o:['Doce Vale Confeitaria','Clínica Sorriso Sul','Studio Bela Pele'],req:1}]:[]),
{k:'nome',l:'Nome da campanha',t:'text',req:1,ph:'Ex.: Lançamento do cardápio de inverno'},
{k:'produto',l:'Produto ou serviço divulgado',t:'text',req:1,ph:'Ex.: Bolo de rolo e cucas artesanais'},
{k:'obj',l:'Objetivo',t:'sel',o:['Divulgar lançamento','Gerar visitas à loja','Aumentar vendas','Ganhar seguidores','Reconhecimento de marca','Gerar conteúdo para anúncios'],req:1},
{k:'desc',l:'Descrição e briefing',t:'area',req:1,ph:'Conte o que o criador deve mostrar e como.'},
{k:'msg',l:'Mensagem principal',t:'text',req:1,ph:'A ideia que o público deve levar'},
{k:'cta',l:'Chamada para ação',t:'text',ph:'Ex.: Peça pelo link da bio'}]],
['Público da campanha',[{k:'pIdade',l:'Faixa etária',t:'chips',o:OPT.idades,req:1},{k:'pGen',l:'Gênero predominante',t:'sel',o:OPT.gen,req:1},{k:'pReg',l:'Região do público',t:'sel',o:OPT.reg,req:1},{k:'pInt',l:'Interesses do público',t:'chips',o:OPT.nichos}]],
['Criadores que você procura',[{k:'nichosCr',l:'Nichos do criador',t:'chips',o:OPT.nichos,req:1},{k:'porteCr',l:'Porte do criador',t:'chips',o:OPT.porteCr,req:1},{k:'genCr',l:'Gênero do criador',t:'sel',o:['Sem preferência','Mulher','Homem','Não-binário'],req:1},{k:'idCr',l:'Idade do criador',t:'sel',o:['Sem preferência','18–24','25–34','35–44','45 ou mais'],req:1},{k:'regCr',l:'Localização do criador',t:'sel',o:OPT.reg,req:1},{k:'nota',l:'Nota mínima',t:'sel',o:['Sem mínimo','4,0 ou mais','4,5 ou mais'],req:1},{k:'qCr',l:'Quantidade de criadores',t:'num',req:1}]],
['Conteúdo',[{k:'fmt',l:'Formatos',t:'chips',o:OPT.fmt,req:1},{k:'plat',l:'Onde será publicado',t:'chips',o:['Instagram','TikTok','YouTube'],req:1},{k:'qVid',l:'Vídeos por criador',t:'num',req:1},{k:'dur',l:'Duração do vídeo',t:'sel',o:['Até 15 s','Até 30 s','Até 60 s','Até 90 s'],req:1},{k:'tom',l:'Tom do vídeo',t:'chips',o:['Descontraído','Profissional','Humorístico','Educativo','Inspirador','Emocional'],req:1},{k:'mencoes',l:'Menções e hashtags',t:'text',ph:'@seunegocio #suahashtag'},{k:'refs',l:'Vídeos de referência (links)',t:'text',ph:'Cole um link que você gostou'},{k:'nao',l:'O que não pode aparecer',t:'area',ph:'Ex.: concorrentes, preços promocionais'}]],
['Orçamento e prazos',[{k:'valor',l:'Valor por vídeo (R$)',t:'num',req:1},{k:'inicio',l:'Início da campanha',t:'text',req:1,ph:'dd/mm/aaaa'},{k:'entrega',l:'Prazo de entrega do vídeo',t:'text',req:1,ph:'dd/mm/aaaa'},{k:'publi',l:'Data de publicação',t:'text',ph:'dd/mm/aaaa'},{k:'rev',l:'Rodadas de ajuste incluídas',t:'sel',o:['1 rodada','2 rodadas','3 rodadas'],req:1},{k:'uso',l:'Uso de imagem',t:'sel',o:['60 dias','90 dias','180 dias','12 meses'],req:1},{k:'excl',l:'Exclusividade',t:'sel',o:['Nenhuma','30 dias','60 dias'],req:1},{k:'envio',l:'Produto para o criador',t:'sel',o:['Não precisa enviar','Envio pelo contratante','Retirada na loja'],req:1}]]];
const CD0=p=>{const f=ST[p].fresh,d=PD[p];const pub={pIdade:[...(d.pIdade||[])],pGen:d.pGen||'',pReg:d.pReg||'',pInt:[...(d.pInt||[])]};
if(f)return{...pub,nichosCr:[...(d.nichosCr||[])],porteCr:[...(d.porteCr||[])],fmt:[],plat:[],tom:[],cliente:'',qCr:1,qVid:1,regCr:d.pReg||''};
return{cliente:'Doce Vale Confeitaria',nome:'Linha de doces coloniais',produto:'Doces coloniais artesanais (bolo de rolo, cuca e brigadeiro)',obj:'Divulgar lançamento',desc:'Queremos mostrar os doces sendo preparados e provados, com clima caseiro e close nos detalhes da receita.',msg:'Doce de verdade, feito como na casa da vovó.',cta:'Peça pelo link da bio',
pIdade:['25–34','35–44'],pGen:'Mulheres',pReg:'Pelotas e região',pInt:['Gastronomia','Maternidade e família'],nichosCr:['Gastronomia','Lifestyle'],porteCr:['Nano (até 10 mil)','Micro (10 a 100 mil)'],genCr:'Sem preferência',idCr:'Sem preferência',regCr:'Pelotas e região',nota:'4,0 ou mais',qCr:1,
fmt:['Reels 9:16'],plat:['Instagram','TikTok'],qVid:1,dur:'Até 60 s',tom:['Descontraído','Emocional'],mencoes:'@docevale #docescoloniais',refs:'',nao:'Não citar concorrentes nem preços promocionais.',valor:350,inicio:'10/11/2026',entrega:'25/11/2026',publi:'30/11/2026',rev:'2 rodadas',uso:'90 dias',excl:'Nenhuma',envio:'Envio pelo contratante'}};
const cdGet=p=>CD[p]||(CD[p]=CD0(p));
const cform=p=>{const c=cdGet(p);return`<p class="hi">Quanto mais completo o briefing, melhor a campanha gerada e a recomendação de criadores. Etapa 1 de 2.</p>`+CSCH(p).map(([t,fs])=>SHD(t)+fs.map(f=>fld(p,f,c)).join('')).join('')};
const brl=n=>'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2});
const lst=a=>!a||!a.length?'—':a.length>1?a.slice(0,-1).join(', ')+' e '+a[a.length-1]:a[0];
const cgen=p=>{const c=Object.assign({nome:'',produto:'',obj:'',msg:'',cta:'',dur:'',genCr:'Sem preferência',regCr:'',pReg:'',pGen:'',nichosCr:[],porteCr:[],pIdade:[],fmt:[],tom:[],plat:[],qCr:1,qVid:1,valor:0,inicio:'',entrega:'',publi:'',rev:'',uso:'',excl:'',envio:'',nao:'',mencoes:''},cdGet(p)),P=PF[PU[p]],tot=(+c.valor||0)*(+c.qVid||1)*(+c.qCr||1),cli=p=='a'?c.cliente:P.n,m1=(c.mencoes||'').split(/\s+/)[0];
const hl=`Campanha “${c.nome}” de ${cli} para divulgar ${c.produto.toLowerCase()}. Objetivo: ${c.obj.toLowerCase()}. Mensagem principal: “${c.msg}”${c.cta?', com a chamada “'+c.cta+'”':''}.`;
const cr=`Buscamos ${c.qCr} ${+c.qCr>1?'criadores':'criador'} de ${lst(c.nichosCr.map(x=>x.toLowerCase()))} (${lst(c.porteCr.map(x=>x.split(' (')[0].toLowerCase()))}), ${c.genCr=='Sem preferência'?'sem preferência de gênero':c.genCr.toLowerCase()}, em ${c.regCr}, com público de ${c.pIdade.join(' e ')} anos, ${(c.pGen||'').toLowerCase()}, em ${c.pReg}.`;
const ct=`Cada criador produz ${c.qVid} ${+c.qVid>1?'vídeos':'vídeo'} em ${lst(c.fmt)}, ${c.dur.toLowerCase()}, com tom ${lst(c.tom.map(x=>x.toLowerCase()))}, para ${lst(c.plat)}.`;
const reqs=['Logo nos primeiros 10 s','Mostrar o produto','Citar a mensagem principal','Duração '+c.dur.toLowerCase().replace('até','máx.'),'Formato '+(c.fmt[0]||'vertical 9:16'),'Mín. 60% de conteúdo humanizado'];if(m1)reqs.splice(2,0,'Mencionar '+m1);if(c.nao)reqs.push('Evitar: '+c.nao.replace(/\.$/,'').toLowerCase());if(c.cta)reqs.push('Incluir a chamada: “'+c.cta+'”');
return`<div class="gen"><span class="pl">Campanha gerada</span><h2>${c.nome}</h2><p>${hl}</p><p>${cr}</p><p>${ct}</p></div>`+SHD('Condições')+Card(K([['Valor por vídeo',brl(c.valor)],['Total estimado ao criador',brl(tot)],['Taxa da Triskel (10%)',brl(r2(tot*FEE))],['Investimento total',`<b>${brl(r2(tot*(1+FEE)))}</b>`],['Início',c.inicio],['Entrega',c.entrega],['Publicação',c.publi||'a combinar'],['Ajustes',c.rev],['Uso de imagem',c.uso],['Exclusividade',c.excl],['Produto',c.envio]]))+SHD('Requisitos para a análise da IA')+'<p class="cap" style="text-align:left;margin:-4px 0 6px">Sugeridos a partir do briefing. Desmarque o que não se aplica.</p>'+Card(reqs.map(x=>Ck(x,1)).join(''))+'<p class="cap">Toda a negociação com os criadores acontece dentro da Triskel.</p>'};
S.e2.t='Criar campanha';S.e2.b=()=>cform('e');S.e2.o=[['Gerar campanha','','','','','data-gen="e3"']];
S.e3.t='Campanha gerada e requisitos';S.e3.b=()=>cgen('e');S.e3.o=[['Confirmar e buscar criadores','e4'],['Editar dados','e2','o']];
S.a3.t='Criar campanha';S.a3.b=()=>cform('a');S.a3.o=[['Gerar campanha','','','','','data-gen="a3b"']];S.a3.n='a3b';
S.a3b={t:'Campanha gerada e requisitos',h:'HU14',u:2,b:()=>cgen('a'),o:[['Confirmar e buscar criadores','a4'],['Editar dados','a3','o']],n:'a4'};
G[3][1].splice(G[3][1].indexOf('a3')+1,0,'a3b');

/* ===== Tema claro / escuro (Configurações → Aparência) ===== */
let theme='light';try{theme=localStorage.getItem('triskel-theme')==='dark'?'dark':'light'}catch(e){}
function setTheme(t){theme=t;try{localStorage.setItem('triskel-theme',t)}catch(e){}$('#ph').classList.toggle('dark',t=='dark');document.body.classList.toggle('dark',t=='dark')}
const THM=()=>`<div class="thm" role="radiogroup" aria-label="Tema do aplicativo">${[['light','Claro'],['dark','Escuro']].map(([k,l])=>`<button class="th${theme==k?' on':''}" role="radio" aria-checked="${theme==k}" data-theme="${k}"><span class="pv ${k}"><i></i><i></i><i></i></span><b>${l}</b></button>`).join('')}</div><p class="cap" style="text-align:left;margin:8px 0 0">A escolha fica salva neste navegador.</p>`;
setTheme(theme);
document.addEventListener('click',e=>{const th=e.target.closest&&e.target.closest('[data-theme]');if(!th)return;const k=th.dataset.theme=='dark'?'dark':'light';setTheme(k);document.querySelectorAll('[data-theme]').forEach(x=>{const on=x.dataset.theme==k;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)});toast('Tema '+(k=='dark'?'escuro':'claro')+' ativado.')});
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="dkh" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.0860" intercept="-0.0860"/><feFuncG type="linear" slope="1.0814" intercept="-0.0814"/><feFuncB type="linear" slope="1.0633" intercept="-0.0633"/></feComponentTransfer></filter></svg>');

/* =====================================================================
   Triskel Pay · carteira + gateway de pagamento SIMULADO (Pix e cartão)
   Nenhum valor real é cobrado e nenhum dado de cartão é guardado.
   Comércio e agência pagam os contratos com o SALDO DA CARTEIRA; o saldo é
   adicionado por Pix ou cartão. O valor do contrato fica em CUSTÓDIA e é
   LIBERADO ao criador quando a entrega é aprovada; o criador SACA via Pix.
   ===================================================================== */
ICN.wallet='<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10V7.5A2.5 2.5 0 0 1 5.5 5H17"/><circle cx="16.5" cy="13" r="1.2"/>';
ICN.pix='<path d="M12 3l9 9-9 9-9-9z"/><path d="M9 12l3-3 3 3-3 3z"/>';
ICN.card='<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/>';
ICN.xx='<path d="M6 6l12 12M18 6L6 18"/>';
ICN.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
ICN.plus='<path d="M12 5v14M5 12h14"/>';

const FEE=.10,MC='Marjorie Moreira',PIXK='pagamentos@triskel.simulado',RMIN=20,RMAX=10000;
const pyEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dtf=d=>d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const rid=n=>Array.from({length:n},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random()*32|0]).join('');
const dig=s=>String(s||'').replace(/\D/g,'');
const brl0=n=>'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
const r2=n=>Math.round(n*100)/100;

/* ---- livro de movimentações (semente da conta de demonstração + o que for gerado nos fluxos) ----
   recarga  = saldo adicionado por Pix/cartão (comércio e agência)
   pay      = contrato pago com o saldo (fica em custódia e depois é liberado ao criador)
   saque    = criador transfere o saldo disponível por Pix */
const SALDO='Saldo da carteira';
const TXS=[
{id:'TRX-1A9QXM3P',kind:'recarga',payer:'e',desc:'Adição de saldo',valor:1000,total:1000,fee:0,met:'pix',det:'Pix',st:'concluido',dt:new Date(2026,9,10,9,15),seed:1},
{id:'TRX-2PD6ZV8R',kind:'pay',payer:'e',desc:'Reels · Cardápio de verão',cr:MC,valor:280,fee:28,total:308,met:'saldo',det:SALDO,st:'liberado',dt:new Date(2026,9,12,9,20),seed:1},
{id:'TRX-5NB3JF7Y',kind:'saque',payer:'c',desc:'Saque via Pix',cr:MC,valor:280,total:280,fee:0,met:'pix',det:'Pix · CPF',st:'concluido',dt:new Date(2026,9,14,11,2),seed:1},
{id:'TRX-9HX2LC5B',kind:'pay',payer:'e',desc:'Vídeos Dia das Mães',cr:'Lucas Amaral e Bianca Teixeira',valor:270,fee:27,total:297,met:'saldo',det:SALDO,st:'liberado',dt:new Date(2026,9,20,16,48),seed:1},
{id:'TRX-3NQ7DW5H',kind:'recarga',payer:'a',desc:'Adição de saldo',valor:2500,total:2500,fee:0,met:'pix',det:'Pix',st:'concluido',dt:new Date(2026,9,20,8,30),seed:1},
{id:'TRX-3ZK5HT9D',kind:'pay',payer:'a',desc:'Campanha Bela Pele · 2 criadores',cr:'2 criadores',valor:600,fee:60,total:660,met:'saldo',det:SALDO,st:'liberado',dt:new Date(2026,9,22,13,40),seed:1},
{id:'TRX-6RC4TV2K',kind:'recarga',payer:'e',desc:'Adição de saldo',valor:500,total:500,fee:0,met:'credito',det:'Visa •••• 4242 · crédito',st:'concluido',dt:new Date(2026,9,28,9,58),seed:1},
{id:'TRX-4TQ8WD6N',kind:'pay',payer:'e',desc:'Reels · Bolo de pote',cr:MC,valor:150,fee:15,total:165,met:'saldo',det:SALDO,st:'liberado',dt:new Date(2026,9,28,10,5),seed:1},
{id:'TRX-7K3M9QX2',kind:'pay',payer:'e',desc:'Linha de doces coloniais',cr:MC,valor:420,fee:42,total:462,met:'saldo',det:SALDO,st:'custodia',dt:new Date(2026,10,2,14,32),seed:1},
{id:'TRX-8WQ1MR4C',kind:'pay',payer:'a',desc:'Campanha Sorriso Sul · 3 criadores',cr:'3 criadores',valor:900,fee:90,total:990,met:'saldo',det:SALDO,st:'custodia',dt:new Date(2026,10,3,15,10),seed:1}];
const PAYM={e:[{id:'s1',brand:'Visa',last4:'4242',val:'12/30',nome:'MARJORIE MOREIRA',rule:'ok'}],a:[{id:'s2',brand:'Mastercard',last4:'4444',val:'09/29',nome:'AGÊNCIA',rule:'ok'}]};
const resetPay=p=>{ST[p].t0=new Date();PAYM[p]=[]};
const txFor=p=>TXS.filter(t=>!(ST[p].fresh&&t.seed)&&(!ST[p].t0||t.dt>=ST[p].t0)&&(p=='c'?(t.kind=='saque'?t.payer=='c':t.kind=='pay'&&t.cr==MC&&(t.st=='custodia'||t.st=='liberado')):((t.kind=='pay'||t.kind=='recarga')&&t.payer==p))).sort((a,b)=>b.dt-a.dt);
const sum=(a,f)=>r2(a.reduce((s,t)=>s+f(t),0));
/* carteira do criador */
const wal=()=>{const v=txFor('c'),cust=sum(v.filter(t=>t.kind=='pay'&&t.st=='custodia'),t=>t.valor),lib=sum(v.filter(t=>t.kind=='pay'&&t.st=='liberado'),t=>t.valor),sq=sum(v.filter(t=>t.kind=='saque'),t=>t.valor);return{cust,lib,sq,disp:r2(lib-sq)}};
/* carteira de comércio e agência: saldo = recargas concluídas − contratos pagos (valor + taxa) */
const walOf=p=>{const v=txFor(p),rec=sum(v.filter(t=>t.kind=='recarga'&&t.st=='concluido'),t=>t.valor),pg=v.filter(t=>t.kind=='pay'&&(t.st=='custodia'||t.st=='liberado')),deb=sum(pg,t=>t.total);return{rec,deb,saldo:r2(rec-deb),cust:sum(pg.filter(t=>t.st=='custodia'),t=>t.valor),lib:sum(pg.filter(t=>t.st=='liberado'),t=>t.valor),fee:sum(pg,t=>t.fee)}};
function kpiLive(p,k){if(p!='c')return k;const w=wal();return k.map((x,i)=>i==2?[brl0(w.cust),'A receber',w.cust>0?'Libera após aprovação':'Nada pendente']:x)}
const calc=valor=>{const fee=r2(valor*FEE);return{fee,tot:r2(valor+fee)}};
/* valor do contrato = valor combinado na proposta em foco (ver ctv em Contatos) */

/* ---- cartão: máscara, bandeira, Luhn, validade ---- */
const luhn=n=>{let s=0;[...n].reverse().forEach((c,i)=>{let d=+c;if(i%2){d*=2;if(d>9)d-=9}s+=d});return n.length>=13&&s%10==0};
const brandOf=n=>/^(636368|438935|504175|451416|509|5067|4576|4011)/.test(n)?'Elo':/^606282/.test(n)?'Hipercard':/^3[47]/.test(n)?'Amex':/^4/.test(n)?'Visa':/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(n)?'Mastercard':n?'Cartão':'';
const fmtNum=n=>/^3[47]/.test(n)?n.replace(/^(.{4})(.{0,6})(.{0,5}).*/,(a,b,c,d)=>[b,c,d].filter(Boolean).join(' ')):n.replace(/(.{4})/g,'$1 ').trim();
const fmtDoc=d=>d.length<=11?d.replace(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,2}).*/,(a,b,c,e,f)=>b+(c?'.'+c:'')+(e?'.'+e:'')+(f?'-'+f:'')):d.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/,(a,b,c,e,f,g)=>b+(c?'.'+c:'')+(e?'.'+e:'')+(f?'/'+f:'')+(g?'-'+g:''));
const fmtVal=v=>{const d=dig(v).slice(0,4);return d.length>2?d.slice(0,2)+'/'+d.slice(2):d};
const valOk=v=>{const m=+v.slice(0,2),y=2000+ +v.slice(3,5),n=new Date(),cy=n.getFullYear(),cm=n.getMonth()+1;return v.length==5&&m>=1&&m<=12&&(y>cy||(y==cy&&m>=cm))&&y<=cy+20};
/* cartões de teste (o último bloco define o resultado) */
const TC=[['4111111111111111','Visa · aprovado','ok'],['5555555555554444','Mastercard · aprovado','ok'],['4000000000003220','Visa · pede 3-D Secure (código 123456)','3ds'],['4000000000000002','Recusado pelo banco emissor','dec'],['4000000000009995','Saldo ou limite insuficiente','fund'],['4000000000000069','Cartão vencido','exp'],['4000000000000127','CVV incorreto','cvc']];
const RULE={'0002':'dec','9995':'fund','0069':'exp','0127':'cvc','3220':'3ds'};
const ruleOf=n=>RULE[n.slice(-4)]||'ok';
const DECL={dec:['05','Transação não autorizada pelo banco emissor. Tente outro cartão ou fale com o seu banco.'],fund:['51','Saldo ou limite insuficiente no cartão. Tente outro cartão ou use Pix.'],exp:['54','Cartão vencido. Use outro cartão.'],cvc:['N7','Código de segurança (CVV) incorreto. Confira o verso do cartão.'],tds:['57','Autenticação não concluída. O banco bloqueou a tentativa.']};

/* ---- Pix: BR Code (copia e cola) simulado com CRC16 e QR ilustrativo ---- */
const crc16=s=>{let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')};
const tlv=(i,v)=>i+String(v.length).padStart(2,'0')+v;
const brCode=(v,tx)=>{const p=tlv('00','01')+tlv('26',tlv('00','BR.GOV.BCB.PIX')+tlv('01',PIXK))+tlv('52','0000')+tlv('53','986')+tlv('54',v.toFixed(2))+tlv('58','BR')+tlv('59','TRISKEL SIMULADO')+tlv('60','PELOTAS')+tlv('62',tlv('05',tx))+'6304';return p+crc16(p)};
function qrSvg(seed){const N=29;let h=0;for(const ch of seed)h=(h*31+ch.charCodeAt(0))>>>0;const rnd=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
const M=Array.from({length:N},()=>Array.from({length:N},()=>rnd()<.48));
const fin=(r0,c0)=>{for(let i=-1;i<8;i++)for(let j=-1;j<8;j++){const r=r0+i,c=c0+j;if(r<0||c<0||r>=N||c>=N)continue;M[r][c]=i>=0&&i<=6&&j>=0&&j<=6&&(i==0||i==6||j==0||j==6||(i>=2&&i<=4&&j>=2&&j<=4))}};
fin(0,0);fin(0,N-7);fin(N-7,0);
for(let i=8;i<N-8;i++){M[6][i]=M[i][6]=i%2==0}
for(let i=0;i<5;i++)for(let j=0;j<5;j++)M[N-9+i][N-9+j]=i==0||i==4||j==0||j==4||(i==2&&j==2);
let d='';M.forEach((row,r)=>row.forEach((v,c)=>{if(v)d+=`M${c+4} ${r+4}h1v1h-1z`}));
return`<svg viewBox="0 0 ${N+8} ${N+8}" width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true"><rect width="${N+8}" height="${N+8}" fill="#fff"/><path d="${d}" fill="#0b1020"/></svg>`}

/* ---- estado do checkout (adicionar saldo) ---- */
const ccBlank=()=>({sel:'new',num:'',nome:'',val:'',cvv:'',doc:'',tipo:'credito',save:0});
const PAY={ctx:null,scr:'',step:'m',met:'pix',cc:ccBlank(),pix:null,res:null,otp:'',tries:0,errs:{},iv:0,rid:'',sq:null};
const sqBlank=()=>({step:'f',val:'',key:'cpf',err:'',tx:null});
PAY.sq=sqBlank();
const pyRedraw=keep=>{if(cur!=PAY.scr)return;const y=m.scrollTop;draw();if(keep){m.scrollTop=y;sbUpdate()}};
const pyStep=s=>{PAY.step=s;if(s!='pix'&&PAY.iv){clearInterval(PAY.iv);PAY.iv=0}};
const amtChk=()=>{const v=PAY.ctx.valor;return v<RMIN?`O valor mínimo é ${brl(RMIN)}.`:v>RMAX?`O limite por adição é ${brl(RMAX)}.`:''};

function payOpen(p,next,sug){const P=PF[PU[p]],d=PD[p]||{};if(PAY.iv){clearInterval(PAY.iv);PAY.iv=0}
const need=+sug>0?+sug:0;PAY.ctx={p,valor:need>0?Math.max(RMIN,Math.ceil(need/10)*10):100,need,next:next||p+'_pgt'};PAY.step='m';PAY.met='pix';PAY.cc=ccBlank();PAY.cc.nome=String(d.resp||P.nome||P.n||'').toUpperCase();PAY.cc.doc=dig(d.doc).slice(0,14);
const sv=PAYM[p]||[];if(sv.length)PAY.cc.sel=sv[0].id;PAY.pix=null;PAY.res=null;PAY.errs={};PAY.scr=p+'_pay';go(PAY.scr)}

function mkTx(o){const c=PAY.ctx;const t=Object.assign({id:'TRX-'+rid(8),kind:'recarga',payer:c.p,desc:'Adição de saldo',valor:c.valor,fee:0,total:c.valor,met:PAY.met=='pix'?'pix':PAY.cc.tipo,det:'Pix',st:'concluido',dt:new Date(),flow:1},o||{});TXS.unshift(t);PAY.rid=t.id;return t}

/* Pix */
function pyGerar(){const e=amtChk();if(e){PAY.errs={amt:e};return pyRedraw(1)}PAY.errs={};const c=PAY.ctx,tx='TRISKELSIM'+rid(10);PAY.pix={tx,e2e:'E'+rid(31),code:brCode(c.valor,tx),exp:Date.now()+10*60*1000,total:c.valor};pyStep('pix');if(PAY.iv)clearInterval(PAY.iv);PAY.iv=setInterval(pyTick,1000);pyRedraw()}
function pyTick(){const el=$('#pxt');if(PAY.step!='pix'||!PAY.pix){clearInterval(PAY.iv);PAY.iv=0;return}const s=Math.max(0,Math.round((PAY.pix.exp-Date.now())/1000));if(el)el.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s<=0)pyExpire()}
function pyExpire(){if(PAY.step!='pix')return;mkTx({valor:PAY.pix.total,total:PAY.pix.total,met:'pix',det:'Pix',st:'expirado',msg:'Pix expirado sem pagamento. Nada foi cobrado.',e2e:PAY.pix&&PAY.pix.e2e});pyStep('exp');pyRedraw()}
function pyPixPaid(){if(PAY.step!='pix')return;pyStep('proc');PAY.procKind='pix';pyRedraw();setTimeout(()=>{const t=mkTx({valor:PAY.pix.total,total:PAY.pix.total,met:'pix',det:'Pix',st:'concluido',e2e:PAY.pix.e2e});PAY.res={ok:1,tx:t};pyStep('ok');pyRedraw()},1900)}

/* Cartão */
function pyCard(){const e0=amtChk();const c=PAY.cc,E={},saved=(PAYM[PAY.ctx.p]||[]).find(x=>x.id==c.sel),n=dig(c.num);if(e0)E.amt=e0;
if(saved){if(!/^\d{3,4}$/.test(c.cvv))E.cvv='Informe o código de segurança.'}
else{if(!luhn(n))E.num='Número de cartão inválido. Confira os dígitos.';if(!valOk(c.val))E.val='Validade inválida.';if(!/^\d{3,4}$/.test(c.cvv)||(brandOf(n)=='Amex'?c.cvv.length!=4:c.cvv.length!=3))E.cvv=brandOf(n)=='Amex'?'4 dígitos.':'3 dígitos.';if(c.nome.trim().length<3)E.nome='Informe o nome como está no cartão.';if(!(cpfOk(c.doc)||cnpjOk(c.doc)))E.doc='Informe um CPF ou CNPJ válido.'}
PAY.errs=E;if(Object.keys(E).length){pyRedraw(1);const f=m.querySelector('.er');if(f)f.scrollIntoView({block:'center'});return}
const rule=saved?saved.rule:ruleOf(n);PAY.rule=rule;if(rule=='3ds'){PAY.otp='';PAY.tries=0;PAY.errs={};pyStep('tds');pyRedraw()}else pyRun(rule)}
function pyRun(rule){pyStep('proc');PAY.procKind='card';pyRedraw();setTimeout(()=>pyFinish(rule),2300)}
function pyFinish(rule){const c=PAY.cc,saved=(PAYM[PAY.ctx.p]||[]).find(x=>x.id==c.sel),n=dig(c.num),brand=saved?saved.brand:brandOf(n),l4=saved?saved.last4:n.slice(-4),tp=saved?'credito':c.tipo,det=`${brand} •••• ${l4} · ${tp=='credito'?'crédito':'débito'}`;
if(DECL[rule]){const t=mkTx({met:tp,det,st:'recusado',msg:DECL[rule][1],code:DECL[rule][0]});PAY.res={ok:0,tx:t};pyStep('fail')}
else{const t=mkTx({met:tp,det,st:'concluido'});if(!saved&&c.save){const L=PAYM[PAY.ctx.p]||(PAYM[PAY.ctx.p]=[]);L.push({id:'s'+rid(4),brand,last4:l4,val:c.val,nome:c.nome.trim(),rule})}PAY.res={ok:1,tx:t};pyStep('ok')}
c.cvv='';if(!DECL[rule])c.num='';pyRedraw()}

/* pagamento de contrato com o saldo da carteira */
function walPay(p){const q=ctxP(p);if(!q||q.st!='aceita'){toast('Não há proposta aceita para pagar.');return}{const cf=exQ(q);if(cf){toast(exTxt(cf,'k'));return}}{const ms=partyK(q).miss;if(ms.length){toast('Complete '+ms.join(' e ')+' no seu perfil para assinar o contrato.');go(p+'_pe');return}}const v=ctv(p),k=calc(v),w=walOf(p);if(w.saldo<k.tot){toast('Saldo insuficiente. Adicione saldo para pagar.');return}
const cr=crOf(q.cr),t={id:'TRX-'+rid(8),kind:'pay',payer:p,desc:q.camp.nome||'Campanha',cr:cr.n,valor:v,fee:k.fee,total:k.tot,met:'saldo',det:SALDO,st:'custodia',dt:new Date(),flow:1};TXS.unshift(t);PAY.rid=t.id;q.st='contrato';q.tx=t.id;signAs(q,'k');sysMsg(q,'Contrato confirmado por '+q.kn+'. '+brl(v)+' ficam em custódia até a aprovação da entrega.');markUnread(q,'c');go(p+'_wpay')}

/* ---- telas ---- */
const stg=t=>({custodia:['c','Em custódia'],liberado:['l','Liberado'],concluido:['l','Concluído'],recusado:['r','Recusado'],expirado:['r','Expirado']})[t.st];
const metL=t=>t.kind=='saque'?'Pix':t.met=='pix'?'Pix':t.met=='debito'?'Cartão de débito':t.met=='saldo'?'Saldo da carteira':'Cartão de crédito';
const TXI=(t,p)=>{const[c,l]=stg(t),cre=p=='c',rc=t.kind=='recarga',inc=(cre&&t.kind=='pay')||(rc&&t.st=='concluido'),neg=t.kind=='saque'||(t.kind=='pay'&&!cre),ic=t.kind=='saque'?'out':rc||t.kind=='pay'&&!cre?(t.met=='pix'?'pix':t.met=='saldo'?'wallet':'card'):'wallet';
const sub=t.kind=='saque'?'Saque via Pix':rc?pyEsc(t.det):cre?'Recebimento · '+pyEsc(t.desc.split(' · ')[0]):'Pago com o saldo · '+pyEsc(t.cr);
return`<div class="tx" role="button" tabindex="0" data-py="rcp:${t.id}"><span class="ti">${IC(ic,20,1.8)}</span><span class="tt"><b>${pyEsc(t.desc)}</b><small>${dtf(t.dt)} · ${sub}</small></span><span class="ta"><b class="${inc&&t.st!='recusado'&&t.st!='expirado'?'ok':''}">${inc&&c=='l'?'+ ':neg?'− ':''}${brl(cre?t.valor:rc?t.valor:t.total)}</b><i class="stg ${c}">${l}</i></span></div>`};
const TXL=(p,empty)=>{const v=txFor(p);return v.length?v.map(t=>TXI(t,p)).join(''):`<div class="cd" style="text-align:center"><b>${empty}</b></div>`};

function sumHTML(){const v=PAY.ctx.valor;return K([['Adicionar ao saldo',brl(v)],['Taxa','R$ 0,00']])+`<div class="pytot"><span>Você paga</span><b>${brl(v)}</b></div>`}
const erL=k=>PAY.errs[k]?`<small class="er" role="alert">${PAY.errs[k]}</small>`:'';
function pyUpd(){const v=PAY.ctx.valor,s=$('#pysum');if(s)s.innerHTML=sumHTML();const a=$('#pxbtn'),b=$('#pybtn');if(a)a.textContent='Gerar Pix de '+brl(v);if(b)b.textContent='Pagar '+brl(v);const e=$('#amtE');if(e&&!amtChk())e.remove()}
function pyForm(){const c=PAY.cc,p=PAY.ctx.p,saved=PAYM[p]||[],sv=c.sel!='new'?saved.find(x=>x.id==c.sel):null,brand=brandOf(dig(c.num));
let h='';
if(saved.length)h+=`<label>Cartão<select data-cc="sel">${saved.map(x=>`<option value="${x.id}"${c.sel==x.id?' selected':''}>${x.brand} •••• ${x.last4} · val. ${x.val}</option>`).join('')}<option value="new"${c.sel=='new'?' selected':''}>Usar outro cartão</option></select></label>`;
if(sv){h+=`<label>Código de segurança (CVV)<input data-cc="cvv" inputmode="numeric" autocomplete="off" maxlength="4" value="${pyEsc(c.cvv)}" placeholder="000" style="max-width:140px"></label>${erL('cvv')}`}
else{h+=`<div class="pyts sm" role="group" aria-label="Tipo de cartão"><button class="pyt${c.tipo=='credito'?' on':''}" data-py="tipo:credito"><span>Crédito</span></button><button class="pyt${c.tipo=='debito'?' on':''}" data-py="tipo:debito"><span>Débito</span></button></div>
<label>Número do cartão<span class="ccw"><input data-cc="num" inputmode="numeric" autocomplete="off" maxlength="23" value="${pyEsc(fmtNum(dig(c.num)))}" placeholder="0000 0000 0000 0000"><em id="ccb" class="cb">${brand}</em></span></label>${erL('num')}
<label>Nome impresso no cartão<input data-cc="nome" autocomplete="off" value="${pyEsc(c.nome)}" placeholder="NOME COMO NO CARTÃO"></label>${erL('nome')}
<div class="row2"><label>Validade<input data-cc="val" inputmode="numeric" autocomplete="off" maxlength="5" value="${pyEsc(c.val)}" placeholder="MM/AA"></label><label>CVV<input data-cc="cvv" inputmode="numeric" autocomplete="off" maxlength="4" value="${pyEsc(c.cvv)}" placeholder="000"></label></div>${erL('val')}${erL('cvv')}
<label>CPF ou CNPJ do titular<input data-cc="doc" inputmode="numeric" autocomplete="off" maxlength="18" value="${pyEsc(fmtDoc(dig(c.doc)))}" placeholder="000.000.000-00"></label>${erL('doc')}
<label class="ck"><input type="checkbox" data-cc="save"${c.save?' checked':''}><span>Salvar este cartão para as próximas adições de saldo</span></label>`}
h+=`<button class="bt" id="pybtn" data-py="paycard">Pagar ${brl(PAY.ctx.valor)}</button><p class="cap" style="text-align:left">${IC('lock',14,2)} Os dados do cartão vão direto para o gateway e não ficam guardados na Triskel.</p>`;
if(!sv)h+=`<div class="sim"><b>Cartões de teste</b><small>Toque para preencher. Use validade futura e qualquer CVV.</small>${TC.map(([n,l])=>`<button class="tcb" data-py="tc:${n}"><b>${fmtNum(n)}</b><span>${l}</span></button>`).join('')}</div>`;
return h}

function payBody(){const c=PAY.ctx;if(!c)return`<div class="cd" style="text-align:center"><b>Nenhuma adição de saldo em andamento.</b></div>`+BTN('Ver pagamentos',(profOf(cur)||PF[1]).p+'_pgt','o');
const s=PAY.step,sim='<div class="pysim">Ambiente de simulação · nenhum valor real é cobrado</div>';
if(s=='proc')return sim+`<div class="pyc" role="status" aria-live="polite"><div class="spn"></div><h2>Processando pagamento…</h2><p>${PAY.procKind=='pix'?'Confirmando o Pix com o banco.':'Consultando o banco emissor.'} Não feche esta tela.</p></div>`;
if(s=='ok'){const t=PAY.res.tx,back=/10$/.test(c.next);return sim+`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Saldo adicionado</h2><p><b>${brl(t.valor)}</b> foram adicionados à sua carteira via ${pyEsc(t.met=='pix'?'Pix':t.det)}.<br>Novo saldo: <b>${brl(walOf(c.p).saldo)}</b></p></div>`+Card(K([['ID da transação',t.id],['Valor adicionado',brl(t.valor)],['Forma de pagamento',pyEsc(t.met=='pix'?'Pix':t.det)],['Saldo atual',`<b>${brl(walOf(c.p).saldo)}</b>`],['Status','<i class="stg l">Concluído</i>']]))+`<button class="bt" data-py="fim">${back?'Voltar ao contrato':'Ver carteira'}</button><button class="bt o" data-py="rcp:${t.id}">Ver comprovante</button>`}
if(s=='fail'){const t=PAY.res.tx;return sim+`<div class="pyc"><div class="pyic bad">${IC('xx',44,2.6)}</div><h2>Pagamento recusado</h2><p>${pyEsc(t.msg)}</p><small class="cap">Código de retorno ${t.code} · simulado · nada foi cobrado</small></div><button class="bt" data-py="retry">Tentar de novo</button><button class="bt o" data-py="tab:pix">Pagar com Pix</button>`}
if(s=='exp')return sim+`<div class="pyc"><div class="pyic warn">${IC('clock',44,2.2)}</div><h2>Pix expirado</h2><p>O tempo para pagar acabou e nada foi cobrado. Gere um novo Pix para adicionar o saldo.</p></div><button class="bt" data-py="gerar">Gerar novo Pix</button><button class="bt o" data-py="back">Escolher outra forma de pagamento</button>`;
if(s=='tds')return sim+`<div class="bank"><b>Banco emissor · simulado</b><small>Autenticação 3-D Secure</small></div><p class="hi">Para confirmar a compra de <b>${brl(c.valor)}</b> na Triskel, digite o código de 6 dígitos que o seu banco enviou.</p><label>Código de verificação<input data-otp inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${pyEsc(PAY.otp)}" placeholder="000000" style="letter-spacing:6px;font-size:20px"></label>${erL('otp')}<button class="bt" data-py="otp">Confirmar</button><button class="bt o" data-py="back">Cancelar</button><div class="sim"><b>Simulação do banco</b><small>Código de teste: <b>123456</b>. Qualquer outro código é recusado; após 3 erros a tentativa é bloqueada.</small></div>`;
if(s=='pix'){const x=PAY.pix,sec=Math.max(0,Math.round((x.exp-Date.now())/1000));return sim+`<p class="hi">Pague <b>${brl(x.total)}</b> com Pix. Leva menos de um minuto.</p><div class="qr" role="img" aria-label="QR Code Pix ilustrativo, simulado">${qrSvg(x.tx)}</div><p class="tmr">${IC('clock',16,2)} Expira em <b id="pxt">${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}</b></p><label>Pix copia e cola</label><div class="cpc" id="pcode">${x.code}</div><button class="bt o" data-py="copy">Copiar código</button><ol class="stp"><li>Abra o app do seu banco e escolha Pix.</li><li>Use <b>Pagar com QR Code</b> ou <b>Pix Copia e Cola</b>.</li><li>Confira os dados e confirme o pagamento.</li></ol><p class="aw" role="status"><span class="dots"></span> Aguardando pagamento…</p><div class="sim"><b>Simulação do banco</b><small>Escolha o que acontece com este Pix.</small><button class="bt" data-py="simpay">Pagar agora (simula o banco)</button><button class="bt o" data-py="simexp">Deixar o Pix expirar</button></div><button class="bt o" data-py="back">Escolher outra forma de pagamento</button>`}
/* valor + forma de pagamento */
const w=walOf(c.p);
return sim+Card(`<div class="pyst">${IC('wallet',16,2)}<span>Adicionar saldo · Triskel Pay</span></div>`+(c.need>0?`<p class="hi" style="margin:0 0 8px">Para pagar o contrato, faltam <b>${brl(c.need)}</b> no seu saldo.</p>`:`<p class="hi" style="margin:0 0 8px">Saldo atual: <b>${brl(w.saldo)}</b></p>`)+`<label>Quanto você quer adicionar?<input data-cc="amt" inputmode="numeric" autocomplete="off" value="${mkBRL(String(Math.round(c.valor*100)))}" placeholder="0,00"></label>${PAY.errs.amt?`<small class="er" id="amtE" role="alert">${PAY.errs.amt}</small>`:''}<div class="chg">${[50,100,250,500,1000].map(v=>`<button class="ch" type="button" data-py="amt:${v}">R$ ${v.toLocaleString('pt-BR')}</button>`).join('')}</div><div id="pysum">${sumHTML()}</div>`)+SHD('Forma de pagamento')+`<div class="pyts" role="tablist" aria-label="Forma de pagamento"><button class="pyt${PAY.met=='pix'?' on':''}" role="tab" aria-selected="${PAY.met=='pix'}" data-py="tab:pix">${IC('pix',22)}<span>Pix</span><small>Cai na hora</small></button><button class="pyt${PAY.met=='card'?' on':''}" role="tab" aria-selected="${PAY.met=='card'}" data-py="tab:card">${IC('card',22)}<span>Cartão</span><small>Crédito ou débito</small></button></div>`+(PAY.met=='pix'?`<p class="hi">O Pix é confirmado na hora e o valor entra no seu saldo.</p><button class="bt" id="pxbtn" data-py="gerar">Gerar Pix de ${brl(c.valor)}</button>`:pyForm())}

/* ---- saque via Pix (criador) ---- */
function sqBody(){const w=wal(),q=PAY.sq,P=PF[0],doc=dig((PD.c||{}).doc),mail=(PD.c||{}).mail||P.mail||'',keys=[['cpf',doc.length==11?`CPF •••.${doc.slice(3,6)}.${doc.slice(6,9)}-••`:'CPF (não informado)',doc.length==11],['mail',`E-mail ${mask(mail,'m')}`,!!mail]];if(q.key=='cpf'&&doc.length!=11&&mail)q.key='mail';
const sim='<div class="pysim">Ambiente de simulação · nenhum valor real é movimentado</div>';
if(q.step=='proc')return sim+`<div class="pyc" role="status" aria-live="polite"><div class="spn"></div><h2>Enviando o Pix…</h2><p>Confirmando com o banco. Não feche esta tela.</p></div>`;
if(q.step=='ok'){const t=q.tx;return sim+`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Saque concluído</h2><p>${brl(t.valor)} enviados por Pix para ${pyEsc(t.det.replace('Pix · ',''))}.</p></div>`+Card(K([['ID da transação',t.id],['Valor',brl(t.valor)],['Taxa','R$ 0,00'],['Data',dtf(t.dt)],['Status','<i class="stg l">Concluído</i>']]))+BTN('Ver pagamentos','c_pgt')+`<button class="bt o" data-py="rcp:${t.id}">Ver comprovante</button>`}
if(w.disp<=0)return sim+`<div class="cd" style="text-align:center"><b>Nenhum valor disponível para saque.</b><small>O valor entra aqui quando o contratante aprova a sua entrega.</small></div>`+BTN('Ver pagamentos','c_pgt','o');
return sim+KP([[brl(w.disp),'Disponível para saque',''],[brl(w.cust),'Em custódia','Libera após aprovação']])+Card(`<label>Valor do saque<input data-sq="val" inputmode="numeric" autocomplete="off" value="${pyEsc(q.val)}" placeholder="${brl(w.disp).replace('R$ ','')}"></label>${q.err?`<small class="er" role="alert">${q.err}</small>`:''}<button class="ch" data-py="sqall" type="button">Sacar tudo</button><label>Enviar para a chave Pix<select data-sq="key">${keys.map(([k,l,ok])=>`<option value="${k}"${q.key==k?' selected':''}${ok?'':' disabled'}>${l}</option>`).join('')}</select></label><p class="cap" style="text-align:left">Saque por Pix, sem taxa e com valor mínimo de R$ 10,00. Cai na hora, em qualquer dia.</p>`)+`<button class="bt" data-py="sqgo">Sacar</button>`}
function sqRun(){const w=wal(),q=PAY.sq,v=r2(parseInt(dig(q.val)||'0',10)/100);
if(v<10){q.err='O valor mínimo para saque é R$ 10,00.';return pyRedraw0(1)}
if(v>w.disp){q.err=`O valor é maior que o saldo disponível (${brl(w.disp)}).`;return pyRedraw0(1)}
q.err='';q.step='proc';const doc=dig((PD.c||{}).doc),det=q.key=='cpf'?`Pix · CPF •••.${doc.slice(3,6)}.${doc.slice(6,9)}-••`:`Pix · E-mail ${mask((PD.c||{}).mail||PF[0].mail||'','m')}`;pyRedraw0();
setTimeout(()=>{const t={id:'TRX-'+rid(8),kind:'saque',payer:'c',desc:'Saque via Pix',cr:MC,valor:v,total:v,fee:0,met:'pix',det,st:'concluido',dt:new Date(),flow:1};TXS.unshift(t);PAY.rid=t.id;q.tx=t;q.step='ok';pyRedraw0()},1700)}
const pyRedraw0=keep=>{if(cur!='c_sq')return;const y=m.scrollTop;draw();if(keep){m.scrollTop=y;sbUpdate()}};

/* ---- comprovante, confirmação de pagamento e carteira ---- */
function rcpBody(p){const t=TXS.find(x=>x.id==PAY.rid)||txFor(p)[0];if(!t)return'<div class="cd" style="text-align:center"><b>Nenhum comprovante.</b></div>';const[c,l]=stg(t);
let rows,title,ic;
if(t.kind=='saque'){title='Comprovante de saque';ic='out';rows=[['ID da transação',t.id],['Tipo','Saque via Pix'],['Destino',pyEsc(t.det.replace('Pix · ',''))],['Valor',brl(t.valor)],['Taxa','R$ 0,00']]}
else if(t.kind=='recarga'){title='Comprovante de adição de saldo';ic=t.met=='pix'?'pix':'card';rows=[['ID da transação',t.id],['Tipo','Adição de saldo'],['Forma de pagamento',metL(t)],['Detalhe',pyEsc(t.det)],['Valor',brl(t.valor)],['Taxa','R$ 0,00']].concat(t.e2e?[['ID Pix (E2E)',`<span style="word-break:break-all;font-size:12px">${t.e2e}</span>`]]:[])}
else{title='Comprovante de pagamento';ic='wallet';rows=[['ID da transação',t.id],['Descrição',pyEsc(t.desc)],['Criador',pyEsc(t.cr)],['Pago com','Saldo da carteira'],['Valor ao criador',brl(t.valor)],['Taxa de serviço Triskel (10%)',brl(t.fee)],['Total debitado',brl(t.total)]]}
return`<div class="pysim">Comprovante simulado · sem valor fiscal</div>`+Card(`<div class="pyst">${IC(ic,16,2)}<span>${title}</span></div>`+K(rows.concat([['Data',dtf(t.dt)],['Status',`<i class="stg ${c}">${l}</i>`]])))+(t.msg?`<div class="np">${IC('lock',18,2)}<span>${pyEsc(t.msg)}${t.code?' (código '+t.code+')':''}</span></div>`:'')+(t.kind=='pay'&&t.st=='custodia'&&p!='c'?`<div class="np">${IC('lock',18,2)}<span>Valor em custódia: é liberado ao criador quando você aprovar a entrega.</span></div>`:'')+BTN('Voltar aos pagamentos',p+'_pgt','o')}

function wpayBody(p){const t=TXS.find(x=>x.id==PAY.rid&&x.kind=='pay');if(!t)return'<div class="cd" style="text-align:center"><b>Nenhum pagamento recente.</b></div>'+BTN('Ver pagamentos',p+'_pgt','o');
return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Contrato pago</h2><p><b>${brl(t.total)}</b> foram debitados da sua carteira.<br>O valor fica em <b>custódia</b> e só é liberado ao criador depois que você aprovar a entrega e a Triskel confirmar a publicação do post.</p></div>`+Card(K([['ID da transação',t.id],['Valor ao criador',brl(t.valor)],['Taxa de serviço',brl(t.fee)],['Total debitado',brl(t.total)],['Saldo atual',`<b>${brl(walOf(p).saldo)}</b>`],['Status','<i class="stg c">Em custódia</i>']]))+`<button class="bt" data-py="wnext:${p}">Continuar</button><button class="bt o" data-py="rcp:${t.id}">Ver comprovante</button>`}

function pgtBody(p){const s=ST[p];
if(p=='c'){const w=wal();return KP([[brl(w.disp),'Disponível para saque',''],[brl(w.cust),'A receber','Em custódia até a aprovação']])+`<button class="bt" data-py="sqopen"${w.disp>0?'':' disabled style="opacity:.5"'}>Sacar via Pix</button>`+`<div class="np">${IC('lock',18,2)}<span>O contratante paga com o saldo da carteira dele antes de você começar. O valor fica em custódia na Triskel e é liberado quando a entrega é aprovada.</span></div>`+SHD('Histórico')+TXL(p,s.fresh?'Você ainda não recebeu pagamentos.':'Nenhuma movimentação.')}
const w=walOf(p),sv=PAYM[p]||[];
return KP([[brl(w.saldo),'Saldo disponível','Usado para pagar contratos'],[brl(w.cust),'Em custódia','Liberado após aprovação']])+`<button class="bt" data-py="topup:${p}:${p}_pgt:0">${IC('plus',18,2.4)} Adicionar saldo</button>`+`<div class="np">${IC('lock',18,2)}<span>Você paga os criadores com o saldo da carteira. Adicione saldo por Pix ou cartão; ao confirmar um contrato, o valor mais a taxa de serviço saem do saldo e ficam em custódia até você aprovar a entrega.</span></div>`+SHD('Formas de adicionar saldo')+Card(`<div class="kv" style="border:0"><span>${IC('pix',18,1.8)} Pix</span><b>Disponível</b></div>`+(sv.length?sv.map(x=>`<div class="kv"><span>${IC('card',18,1.8)} ${x.brand} •••• ${x.last4} · val. ${x.val}</span><button class="lk" data-py="cardrm:${x.id}" aria-label="Remover cartão ${x.brand} final ${x.last4}">Remover</button></div>`).join(''):`<div class="kv"><span class="cap" style="margin:0">Nenhum cartão salvo. Ao adicionar saldo, você pode salvar o cartão para as próximas vezes.</span></div>`))+SHD('Movimentações')+TXL(p,s.fresh?'Você ainda não adicionou saldo nem pagou contratos.':'Nenhuma movimentação.')}
const walStrip=p=>p=='c'?'':Card(`<div class="wst"><span><small>Saldo da carteira</small><b>${brl(walOf(p).saldo)}</b></span><button class="bt" data-py="topup:${p}:${p}_pn:0">${IC('plus',16,2.4)} Adicionar saldo</button></div>`);

/* ---- registro das páginas (por perfil) ---- */
[0,1,2].forEach(u=>{const P=PF[u],p=P.p,g=GI[p],d=k=>p+'_'+k;
pg(g,u,d('pgt'),'Pagamentos','Menu · Pagamentos',()=>pgtBody(p));
pg(g,u,d('rcp'),'Comprovante','Menu · Pagamentos',()=>rcpBody(p));
if(p!='c'){pg(g,u,d('pay'),'Adicionar saldo','Triskel Pay · simulação',()=>payBody());pg(g,u,d('wpay'),'Pagamento confirmado','Triskel Pay · simulação',()=>wpayBody(p))}
if(p=='c')pg(g,u,d('sq'),'Sacar via Pix','Triskel Pay · simulação',()=>sqBody())});

/* ---- contratos: pagamento com o saldo / aviso de custódia ---- */
const short=p=>r2(calc(ctv(p)).tot-walOf(p).saldo);
const resumo=p=>{const k=calc(ctv(p)),w=walOf(p),ok=w.saldo>=k.tot;return SHD('Pagamento com a carteira')+Card(K([['Total a pagar',`<b>${brl(k.tot)}</b>`],['Saldo da carteira',`<b class="${ok?'ok':'wn'}">${brl(w.saldo)}</b>`]].concat(ok?[['Saldo após o pagamento',brl(r2(w.saldo-k.tot))]]:[['Falta no saldo',`<b class="wn">${brl(short(p))}</b>`]]))+`<p class="cap" style="text-align:left">${IC('lock',14,2)} O contrato é pago com o saldo da sua carteira. O valor fica em custódia na Triskel e só é liberado ao criador depois que você aprovar a entrega e a Triskel confirmar a publicação do post.</p>`)};
['e','a'].forEach(p=>{const k=p+'10',b0=S[k].b;S[k].b=()=>(typeof b0=='function'?b0():b0)+resumo(p);
S[k].o=()=>!ctxP(p)||ctxP(p).st!='aceita'?[['Ver conversa','','','','',`data-nx="open:"`],['Buscar criadores',p+'4','o']]:walOf(p).saldo>=calc(ctv(p)).tot?[['Pagar com o saldo e confirmar','','','','',`data-py="walpay:${p}"`],['Adicionar saldo','','o','','',`data-py="topup:${p}:${k}:0"`]]:[['Adicionar saldo para pagar','','','','',`data-py="topup:${p}:${k}:${short(p)}"`]]});
{const b0=S.c10.b;S.c10.b=()=>(typeof b0=='function'?b0():b0)+`<div class="np">${IC('lock',18,2)}<span>O contratante paga com o saldo da carteira dele ao confirmar o contrato. O valor fica em custódia na Triskel e é liberado para você quando a entrega for aprovada e a Triskel confirmar a publicação do seu post.</span></div>`}

/* ---- liberação da custódia na aprovação da entrega ---- */
const RLS={k:'',t:null};
function releaseEscrow(p){const key=cur+'#'+Hs.length;if(RLS.k==key)return RLS.t;RLS.k=key;
const c=TXS.filter(t=>t.kind=='pay'&&t.st=='custodia'&&(p=='c'?t.cr==MC:t.payer==p)).sort((a,b)=>(a.seed?1:0)-(b.seed?1:0)||b.dt-a.dt);
const t=c[0]||null;if(t){t.st='liberado';t.rel=new Date()}RLS.t=t;return t}
const relCard=(p,t)=>t?Card(`<div class="pyst">${IC('check',16,2.4)}<span>${p=='c'?'Pagamento disponível na sua carteira':'Custódia liberada ao criador'}</span></div>`+K([['Campanha',pyEsc(t.desc)],['Valor',brl(t.valor)],['Transação',t.id]])):'';

/* ---- eventos ---- */
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-py]');if(!el)return;const[a,...r]=el.dataset.py.split(':'),arg=r.join(':'),c=PAY.cc;
if(a=='topup'){const[p,nx,sg]=arg.split(':');return payOpen(p,nx,sg)}
if(a=='walpay')return walPay(arg);
if(a=='wnext')return go(arg+'11');
if(a=='amt'){PAY.ctx.valor=+arg;const i=$('[data-cc=amt]');if(i)i.value=mkBRL(String(+arg*100));PAY.errs={};return pyUpd()}
if(a=='tab'){PAY.met=arg;pyStep('m');return pyRedraw(1)}
if(a=='tipo'){c.tipo=arg;return pyRedraw(1)}
if(a=='gerar')return pyGerar();
if(a=='copy'){const code=PAY.pix&&PAY.pix.code;if(!code)return;const ok=()=>toast('Código Pix copiado.'),no=()=>{try{const rg=document.createRange();rg.selectNodeContents($('#pcode'));const s=getSelection();s.removeAllRanges();s.addRange(rg);toast(document.execCommand('copy')?'Código Pix copiado.':'Selecione o código e copie.')}catch(x){toast('Selecione o código e copie.')}};try{navigator.clipboard.writeText(code).then(ok,no)}catch(x){no()}return}
if(a=='simpay')return pyPixPaid();
if(a=='simexp')return pyExpire();
if(a=='back'){pyStep('m');PAY.errs={};return pyRedraw()}
if(a=='retry'){c.cvv='';pyStep('m');PAY.met='card';PAY.errs={};return pyRedraw()}
if(a=='paycard')return pyCard();
if(a=='otp'){const v=dig($('[data-otp]').value);PAY.otp=v;if(v=='123456'){PAY.errs={};return pyRun('ok')}PAY.tries++;if(PAY.tries>=3){PAY.errs={};return pyFinish('tds')}PAY.errs={otp:`Código incorreto. ${3-PAY.tries===1?'Resta 1 tentativa.':'Restam '+(3-PAY.tries)+' tentativas.'}`};return pyRedraw(1)}
if(a=='tc'){c.sel='new';c.num=arg;c.tipo='credito';if(!c.val)c.val='12/30';if(!c.cvv)c.cvv='123';if(!c.nome)c.nome='NOME DO TITULAR';if(!c.doc)c.doc='12345678909';PAY.errs={};return pyRedraw(1)}
if(a=='fim'){const n=PAY.ctx.next;return go(n)}
if(a=='rcp'){PAY.rid=arg;const p=(profOf(cur)||PF[0]).p;return go(p+'_rcp')}
if(a=='cardrm'){const p=(profOf(cur)||PF[1]).p;PAYM[p]=(PAYM[p]||[]).filter(x=>x.id!=arg);toast('Cartão removido.');return draw()}
if(a=='sqopen'){PAY.sq=sqBlank();return go('c_sq')}
if(a=='sqall'){const w=wal();PAY.sq.val=String(Math.round(w.disp*100));return pyRedraw0(1)}
if(a=='sqgo')return sqRun()});
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset)return;
if(t.dataset.cc){const k=t.dataset.cc,c=PAY.cc;
if(k=='amt'){const d=dig(t.value).slice(0,7);PAY.ctx.valor=parseInt(d||'0',10)/100;t.value=d?mkBRL(d):'';if(PAY.errs.amt&&!amtChk()){delete PAY.errs.amt;const x=$('#amtE');if(x)x.remove()}pyUpd()}
else if(k=='num'){const n=dig(t.value).slice(0,19);c.num=n;t.value=fmtNum(n);const b=$('#ccb');if(b)b.textContent=brandOf(n)}
else if(k=='val'){c.val=fmtVal(t.value);t.value=c.val}
else if(k=='cvv'){c.cvv=dig(t.value).slice(0,4);t.value=c.cvv}
else if(k=='doc'){c.doc=dig(t.value).slice(0,14);t.value=fmtDoc(c.doc)}
else if(k=='nome'){c.nome=t.value.toUpperCase();t.value=c.nome}
else if(k=='save')c.save=t.checked?1:0}
else if(t.dataset.sq=='val'){const d=dig(t.value).slice(0,9);PAY.sq.val=d;t.value=d?(parseInt(d,10)/100).toLocaleString('pt-BR',{minimumFractionDigits:2}):''}});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;
if(t.dataset.cc=='sel'){PAY.cc.sel=t.value;PAY.cc.cvv='';pyRedraw(1)}
else if(t.dataset.sq=='key')PAY.sq.key=t.value});
document.addEventListener('keydown',e=>{const el=e.target.closest&&e.target.closest('[data-py][role=button]');if(el&&(e.key=='Enter'||e.key==' ')){e.preventDefault();el.click()}});

/* =====================================================================
   Máscaras de campo (toda a plataforma)
   - Formatam enquanto a pessoa digita (cursor preservado, apagar funciona)
   - Validam ao sair do campo e bloqueiam o salvamento quando inválidos
   - Nas páginas do Figma (home, login, cadastro) só formatam, sem mensagens
   ===================================================================== */
const UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const DDDS=new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
const PART=new Set(['da','de','do','das','dos','e','di','du']);
const mkNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const mkTitle=s=>{if(s!==s.toLowerCase()&&s!==s.toUpperCase())return s;return s.trim().split(/\s+/).map((w,i)=>{const l=w.toLowerCase();return i&&PART.has(l)?l:l.replace(/(^|[-'])([a-zà-ÿ])/g,(m,a,b)=>a+b.toUpperCase())}).join(' ')};
const mkSp=s=>s.replace(/^\s+/,'').replace(/\s{2,}/g,' ');

/* ---- documentos ---- */
const fmtCPF=d=>d.replace(/^(\d{3})(\d{0,3})(\d{0,3})(\d{0,2}).*/,(a,b,c,e,f)=>b+(c?'.'+c:'')+(e?'.'+e:'')+(f?'-'+f:''));
const fmtCNPJ=d=>d.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/,(a,b,c,e,f,g)=>b+(c?'.'+c:'')+(e?'.'+e:'')+(f?'/'+f:'')+(g?'-'+g:''));
const cpfOk=v=>{const d=dig(v);if(d.length!=11||/^(\d)\1+$/.test(d))return false;const c=n=>{let s=0;for(let i=0;i<n;i++)s+=+d[i]*(n+1-i);return s*10%11%10};return c(9)==+d[9]&&c(10)==+d[10]};
const cnpjOk=v=>{const d=dig(v);if(d.length!=14||/^(\d)\1+$/.test(d))return false;const c=n=>{const w=n==12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];let s=0;for(let i=0;i<n;i++)s+=+d[i]*w[i];const r=s%11;return r<2?0:11-r};return c(12)==+d[12]&&c(13)==+d[13]};

/* ---- data dd/mm/aaaa ---- */
const mkDate=v=>{let d=dig(v).slice(0,8);if(d.length>=1&&+d[0]>3)d='0'+d;
if(d.length>=2){const dd=+d.slice(0,2);if(dd>31)d='31'+d.slice(2);else if(dd==0)d='01'+d.slice(2)}
if(d.length>=3&&+d[2]>1)d=d.slice(0,2)+'0'+d.slice(2);
if(d.length>=4){const mm=+d.slice(2,4);if(mm>12)d=d.slice(0,2)+'12'+d.slice(4);else if(mm==0)d=d.slice(0,2)+'01'+d.slice(4)}
d=d.slice(0,8);return d.length>4?d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4):d.length>2?d.slice(0,2)+'/'+d.slice(2):d};
const dateChk=(v,el)=>{if(v.length<10)return'Use o formato dd/mm/aaaa.';const[d,m,y]=v.split('/').map(Number),dt=new Date(y,m-1,d);
if(dt.getFullYear()!=y||dt.getMonth()!=m-1||dt.getDate()!=d||y<1900||y>2100)return'Data inválida.';
const L=mkNorm(el.dataset.lab||el.getAttribute('aria-label')||((el.closest('label')||{}).childNodes||[{}])[0].textContent||'');
if(/nascimento|fundacao/.test(L)&&dt>new Date())return'A data não pode ser futura.';return''};

/* ---- telefone ---- */
const mkTel=v=>{let d=dig(v);if(d.length>11&&d.startsWith('55'))d=d.slice(2);d=d.slice(0,11);if(!d)return'';if(d.length<3)return'('+d;const r=d.slice(2),cut=d.length>10?5:4;return'('+d.slice(0,2)+') '+(r.length>cut?r.slice(0,cut)+'-'+r.slice(cut):r)};
const telChk=v=>{const d=dig(v);if(d.length<10||d.length>11||!DDDS.has(d.slice(0,2))||(d.length==11&&d[2]!='9'))return'Informe DDD e número. Ex.: (53) 99999-9999.';return''};

/* ---- redes, site e links ---- */
const mkHandle=v=>{v=String(v).trim();const at=v.startsWith('@');if(v.includes('/'))v=v.split(/[?#]/)[0].replace(/\/+$/,'').split('/').pop();v=v.replace(/[^A-Za-z0-9._]/g,'').toLowerCase().slice(0,30);return v?'@'+v:at?'@':''};
const mkSite=v=>{v=String(v).replace(/\s/g,'').replace(/^https?:\/\//i,'').slice(0,100);const i=v.indexOf('/');return i<0?v.toLowerCase():v.slice(0,i).toLowerCase()+v.slice(i)};
const mkTags=v=>v.replace(/[^@#\wÀ-ÿ. ]/g,'').replace(/^\s+/,'').replace(/\s{2,}/g,' ').slice(0,120);

/* ---- dinheiro e números ---- */
const mkBRL=v=>{let d=dig(v).replace(/^0+(?=\d)/,'').slice(0,9);if(!d)return'';d=d.padStart(3,'0');return d.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+d.slice(-2)};
const parseBR=v=>Number(String(v).replace(/\./g,'').replace(',','.'))||0;
const mkNum=(v,k)=>k=='int'?(parseInt(v,10)||0):parseBR(v);
const INTMAX={qCr:50,qVid:20};

/* ---- tipos de máscara ---- */
const MKS={
cpf:{f:v=>fmtCPF(dig(v).slice(0,11)),im:'numeric',num:1,chk:v=>cpfOk(v)?'':'CPF inválido.'},
cnpj:{f:v=>fmtCNPJ(dig(v).slice(0,14)),im:'numeric',num:1,chk:v=>cnpjOk(v)?'':'CNPJ inválido.'},
date:{f:mkDate,im:'numeric',num:1,chk:dateChk},
tel:{f:mkTel,im:'tel',num:1,chk:telChk},
email:{f:v=>v.replace(/\s/g,'').toLowerCase(),im:'email',chk:v=>/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)?'':'Digite um e-mail válido.'},
uf:{f:v=>v.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,2),chk:v=>UFS.includes(v)?'':'UF inválida. Ex.: RS.'},
city:{f:v=>mkSp(v.replace(/[^A-Za-zÀ-ÿ'\- .,]/g,'')).slice(0,40),title:1},
person:{f:v=>mkSp(v.replace(/[^A-Za-zÀ-ÿ'\- .]/g,'')).slice(0,60),title:1},
biz:{f:v=>mkSp(v.replace(/[^\wÀ-ÿ'\-&.,! ]/g,'')).slice(0,60)},
text:{f:v=>mkSp(v.replace(/[\u0000-\u001f]/g,'')).slice(0,140)},
handle:{f:mkHandle,im:'url',chk:v=>v.length<3||/\.$/.test(v)||/\.\./.test(v)?'Usuário inválido. Use letras, números, ponto ou _.':''},
site:{f:mkSite,im:'url',chk:v=>/^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/.test(v)?'':'Endereço inválido. Ex.: seunegocio.com.br'},
url:{f:v=>v.replace(/\s/g,'').slice(0,200),im:'url',chk:v=>/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v)?'':'Link inválido. Cole o endereço completo.'},
tags:{f:mkTags,chk:v=>v.split(' ').every(t=>/^[@#][\wÀ-ÿ.]+$/.test(t))?'':'Use @ para menções e # para hashtags, separados por espaço.'},
brl:{f:mkBRL,im:'numeric',chk:v=>parseBR(v)>0?'':'Informe um valor maior que zero.'},
int:{f:(v,el)=>{let d=dig(v).replace(/^0+/,'').slice(0,3);const mx=INTMAX[el.dataset.f]||999;if(d&&+d>mx)d=String(mx);return d},im:'numeric'}};

/* ---- identificação do campo ---- */
const mkLabel=el=>mkNorm(el.dataset.lab||el.getAttribute('aria-label')||((el.closest('label')||{}).childNodes||[{}])[0].textContent||'').trim();
function mkType(el){if(el.dataset.mask)return el.dataset.mask;if(el.dataset.nomask)return'';
if(el.disabled||el.readOnly||el.dataset.cc||el.dataset.sq||el.hasAttribute('data-otp')||['password','checkbox','radio','file','hidden','range','color','date'].includes(el.type))return'';
if(el.tagName=='TEXTAREA')return'area';
const L=mkLabel(el),k=el.dataset.f||'',ph=el.placeholder||'';
if(k=='tel'||el.type=='tel'||/celular|telefone/.test(L))return'tel';
if(el.type=='email'||/e-?mail/.test(L))return'email';
if(/\bcnpj\b/.test(L)&&!/cpf/.test(L))return'cnpj';
if(/^cpf\b/.test(L))return'cpf';
if(ph=='dd/mm/aaaa'||/nascimento|fundacao|^inicio|prazo de entrega|publicacao/.test(L))return'date';
if(k=='uf'||L=='estado')return'uf';
if(/\(r\$\)/.test(L)||k=='valor'||/^val\./.test(k)||/^valor/.test(L))return'brl';
if(k=='insta'||k=='tiktok'||/instagram|tiktok|rede social/.test(L))return'handle';
if(k=='site'||/^site/.test(L))return'site';
if(k=='refs'||/links?\)/.test(L))return'url';
if(k=='mencoes')return'tags';
if(k=='qCr'||k=='qVid'||/^quantidade|por criador/.test(L))return'int';
if(/^(cidade|pais)$/.test(L))return'city';
if(/^nome completo$|nome do respons|^nome$/.test(L))return'person';
if(/^nome do comercio|^nome da agencia/.test(L))return'biz';
return el.type=='text'||el.type==''||el.type=='search'?'text':''}

const mkQuiet=el=>/(^|\s)(in|ct)(\s|$)/.test(el.className);
function mkEl(el){if(el._mkd)return el._mk;el._mkd=1;const t=mkType(el);el._mk=t;if(!t)return'';el.dataset.mk=t;
if(t=='area'){if(!el.maxLength||el.maxLength<0)el.maxLength=600;return t}
const R=MKS[t];if(R.im&&!el.inputMode)el.inputMode=R.im;
if(['handle','site','url','email','tags'].includes(t)){el.setAttribute('autocapitalize','none');el.spellcheck=false}
if(t=='brl'||t=='int'){el.dataset.num=t;if(el.type=='number')el.type='text'}
if(el.value!==''){let v=el.value;if(t=='brl'&&!/,/.test(v)){const n=parseFloat(v);v=isNaN(n)?'':mkBRL(String(Math.round(n*100)))}else v=R.f(v,el);el.value=v}
el._mkv=el.value;return t}
function mkInit(root){(root||document).querySelectorAll('input,textarea').forEach(mkEl)}

function mkSet(el,nv){let pos=null,n=0;try{pos=el.selectionStart;if(pos!=null&&document.activeElement===el&&pos<el.value.length)n=(el.value.slice(0,pos).match(/[0-9A-Za-zÀ-ÿ]/g)||[]).length;else pos=null}catch(x){pos=null}
el.value=nv;if(pos!=null){let i=0,c=0;while(i<nv.length&&c<n){if(/[0-9A-Za-zÀ-ÿ]/.test(nv[i]))c++;i++}try{el.setSelectionRange(i,i)}catch(x){}}}
function mkShow(el,msg){const q=el.closest('label')||el;let e=q.nextElementSibling;const has=e&&e.classList.contains('mkE');
if(msg){el.setAttribute('aria-invalid','true');if(!has){e=document.createElement('small');e.className='er mkE';e.setAttribute('role','alert');q.after(e)}e.textContent=msg}
else{el.removeAttribute('aria-invalid');if(has)e.remove()}}
function mkCheck(el){const R=MKS[el._mk];if(!R||!R.chk)return'';const v=el.value.trim(),msg=v?R.chk(v,el):'';if(!mkQuiet(el))mkShow(el,msg);return msg}
function mkBad(root){const bad=[];let first=null;(root||document).querySelectorAll('[data-mk]').forEach(el=>{if(mkQuiet(el)||el.disabled)return;if(mkCheck(el)){bad.push((el.dataset.lab||mkLabel(el)||'campo').toLowerCase());if(!first)first=el}});
if(first){try{first.scrollIntoView({block:'center'});first.focus({preventScroll:true})}catch(x){}}return bad}

document.addEventListener('input',e=>{const el=e.target;if(!el||(el.tagName!='INPUT'&&el.tagName!='TEXTAREA')||e.isComposing)return;const t=mkEl(el);if(!t||t=='area')return;const R=MKS[t],old=el.value,prev=el._mkv==null?'':el._mkv;let nv=R.f(old,el);
if(R.num&&/^delete/.test(e.inputType||'')&&nv===prev&&old!==prev){let pos=old.length;try{if(el.selectionStart!=null)pos=el.selectionStart}catch(x){}const b=dig(old.slice(0,pos)).length,d=dig(old);nv=R.f(d.slice(0,Math.max(0,b-1))+d.slice(b),el)}
if(nv!==old)mkSet(el,nv);el._mkv=nv;if(el.getAttribute('aria-invalid'))mkCheck(el)});
document.addEventListener('focusout',e=>{const el=e.target;if(!el||!el.dataset||!el.dataset.mk||el.dataset.mk=='area')return;const R=MKS[el._mk];if(!R)return;let v=el.value.trim();if(R.title)v=mkTitle(v);if(v!==el.value){el.value=v}el._mkv=el.value;mkCheck(el)});

/* formata os campos já presentes a cada tela desenhada */
{const _d0=draw;draw=function(){_d0.apply(this,arguments);mkInit($('#m'))}}

/* =====================================================================
   Busca com filtros · Propostas · Contrapropostas · Contatos
   Toda a negociação e todo o contato acontecem DENTRO da Triskel.
   Taxa da plataforma: 10% sobre o valor do criador, paga pelo contratante,
   informada na proposta, na contraproposta e no contrato.
   ===================================================================== */
const ME='mm',FPCT=Math.round(FEE*100),FEEL='Taxa Triskel ('+FPCT+'%)';
const nz=s=>String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const nf1=n=>String(n.toFixed(1)).replace('.',',');
const rl=p=>p=='c'?'c':'k';                       /* papel: c = criador, k = contratante */
const DAY0=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const roundUp=v=>Math.ceil(v/10)*10,roundDn=v=>Math.max(10,Math.floor(v/10)*10);

/* ---------- criadores ---------- */
const CRD=[
{id:'mm',n:'Marjorie Moreira',nichos:['Gastronomia','Lifestyle'],cid:'Pelotas',near:1,porte:'Micro',seg:'12,4 mil',nota:4.9,trab:12,vmin:200,vmax:420,prazo:'Até 5 dias',sobre:'Criadora de conteúdo gastronômico em Pelotas. Gosto de vídeos curtos, com bastidores e receitas.',redes:[['Instagram','12,4 mil'],['TikTok','8,1 mil']],port:[['Receita de bolo de rolo','Doce Vale Confeitaria · Reels','12,4 mil visualizações'],['Tour pelo Mercado Central','Mercado Central de Pelotas · TikTok','8,1 mil visualizações']]},
{id:'la',n:'Lucas Amaral',nichos:['Gastronomia','Humor'],cid:'Pelotas',near:1,porte:'Micro',seg:'31 mil',nota:4.7,trab:9,vmin:180,vmax:350,prazo:'Até 7 dias',sobre:'Humor e comida: receitas rápidas, testes de restaurantes e bastidores de cozinha.',redes:[['Instagram','31 mil'],['TikTok','22 mil']],port:[['Teste de pizzas da cidade','Pizzaria da Praça · Reels','18 mil visualizações']]},
{id:'bt',n:'Bianca Teixeira',nichos:['Lifestyle','Beleza'],cid:'Pelotas',near:1,porte:'Nano',seg:'8,7 mil',nota:4.8,trab:7,vmin:150,vmax:300,prazo:'Até 4 dias',sobre:'Rotina, autocuidado e dia a dia de uma jovem empreendedora do Sul.',redes:[['Instagram','8,7 mil']],port:[['Rotina de skincare','Studio Bela Pele · Reels','9,2 mil visualizações']]},
{id:'js',n:'Juliana Souza',nichos:['Maternidade e família','Casa e decoração','Gastronomia'],cid:'Canguçu',near:1,porte:'Nano',seg:'9,3 mil',nota:4.8,trab:11,vmin:160,vmax:320,prazo:'Até 6 dias',sobre:'Vida em família, casa e receitas simples para o dia a dia.',redes:[['Instagram','9,3 mil'],['TikTok','4,1 mil']],port:[['Lanche da tarde em família','Padaria Dona Rosa · Reels','7,6 mil visualizações']]},
{id:'rf',n:'Rafael Gomes',nichos:['Fitness','Saúde e bem-estar'],cid:'Rio Grande',near:1,porte:'Micro',seg:'46 mil',nota:4.6,trab:15,vmin:300,vmax:600,prazo:'Até 7 dias',sobre:'Treino, alimentação e rotina saudável. Vídeos objetivos e motivadores.',redes:[['Instagram','46 mil'],['YouTube','12 mil']],port:[['Treino em 20 minutos','Academia Vital · Reels','31 mil visualizações']]},
{id:'ca',n:'Camila Duarte',nichos:['Gastronomia','Viagem'],cid:'Porto Alegre',near:0,porte:'Micro',seg:'62 mil',nota:4.9,trab:21,vmin:450,vmax:900,prazo:'Até 10 dias',sobre:'Roteiros gastronômicos pelo Sul. Produção cuidadosa e boa edição.',redes:[['Instagram','62 mil'],['YouTube','38 mil']],port:[['Rota dos cafés coloniais','Serra Gaúcha · Reels','54 mil visualizações']]},
{id:'tb',n:'Thiago Brandão',nichos:['Tecnologia','Games'],cid:'Pelotas',near:1,porte:'Nano',seg:'6,2 mil',nota:4.4,trab:4,vmin:120,vmax:250,prazo:'Até 5 dias',sobre:'Análises rápidas de gadgets e jogos.',redes:[['TikTok','6,2 mil'],['YouTube','3,5 mil']],port:[['Review de fone sem fio','Loja Conecta · Shorts','4,4 mil visualizações']]},
{id:'pm',n:'Pedro Matos',nichos:['Moda','Lifestyle'],cid:'Santa Maria',near:0,porte:'Micro',seg:'27 mil',nota:4.5,trab:8,vmin:250,vmax:500,prazo:'Até 7 dias',sobre:'Moda masculina acessível e looks para o dia a dia.',redes:[['Instagram','27 mil']],port:[['Looks de outono','Brechó Centro · Reels','15 mil visualizações']]}];
const crOf=id=>CRD.find(x=>x.id==id)||CRD[0];
const nearReg=(c,reg)=>!reg||reg=='Sem preferência'||reg=='Brasil todo'||reg=='Sul do Brasil'||reg=='Rio Grande do Sul'||(reg=='Pelotas e região'&&c.near);
const notaMin=t=>t=='4,5 ou mais'?4.5:t=='4,0 ou mais'?4:0;
const porteK=x=>String(x).split(' ')[0];
function compat(cr,c){const nm=(c.nichosCr||[]).filter(x=>cr.nichos.includes(x)).length,why=[];let s=0;
if(nm>=2){s+=40;why.push('Nichos compatíveis')}else if(nm==1){s+=28;why.push('Nicho compatível')}
if(nearReg(cr,c.regCr)){s+=20;if(c.regCr&&c.regCr!='Brasil todo'&&c.regCr!='Sul do Brasil')why.push('Na região')}
if(cr.nota>=notaMin(c.nota)){s+=10;if(cr.nota>=4.8){s+=5;why.push('Nota '+nf1(cr.nota))}}
if(!(c.porteCr||[]).length||(c.porteCr||[]).map(porteK).includes(cr.porte))s+=10;
const v=+c.valor||0;if(v>=cr.vmin){s+=15;why.push('Dentro do orçamento')}else if(v>=cr.vmin*.85){s+=7;why.push('Perto do orçamento')}else why.push('Acima do orçamento');
return{pct:Math.min(97,Math.max(35,s)),why}}

/* ---------- bloqueio de contato fora da plataforma ---------- */
const LKS=[
[/[\w.+-]+\s*(@|\(\s*at\s*\)|\[\s*at\s*\]|\barroba\b)\s*[\w-]+(\s*(\.|\bponto\b|\bdot\b)\s*\w{2,})/i,'e-mails'],
[/\b(https?:\/\/|www\.)\S+|\b[\w-]+\.(com|net|org|io|app|me|link|br|co|ly|bio)\b/i,'links'],
[/(?:\d[\s().+\-_]*){8,}/,'telefones ou outros números de contato'],
[/\b(whats\s*app|whats|zap|zapzap|wpp|telegram|signal|messenger|discord|skype|direct|dm|inbox)\b/i,'aplicativos de conversa ou redes sociais'],
[/\b(meu|me\s+(chama|segue|manda|add|adiciona)|no\s+meu)\s+(insta|instagram|tiktok|face|facebook|perfil)\b/i,'perfis de redes sociais'],
[/(^|\s)@\w{3,}/,'perfis de redes sociais'],
[/\b(fora\s+(da|do)\s+(plataforma|app|aplicativo|triskel|sistema)|por\s+fora|me\s+chama|chama\s+no|nos\s+falamos\s+em)\b/i,'combinados fora da plataforma']];
function leak(t){t=String(t||'').replace(/R\$\s*[\d.,]+/gi,' ').replace(/\b\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?\b/g,' ');for(const[r,l]of LKS)if(r.test(t))return l;return''}
const leakMsg=l=>`Por segurança, não compartilhe ${l} nas mensagens. Toda a negociação acontece dentro da Triskel, com pagamento protegido.`;
const POLICY=`<div class="np">${IC('lock',18,2)}<span>Toda a negociação, as mensagens e o contrato acontecem aqui na Triskel. Telefone, e-mail, links e redes sociais são bloqueados nas mensagens, e o pagamento só é protegido dentro da plataforma.</span></div>`;

/* ---------- propostas (store) ---------- */
const PRP=[];let PRN=100;
const RR=(by,valor,prazo,uso,msg,m,d,h,mi)=>({by,valor,prazo,uso,msg,dt:new Date(2026,m-1,d,h,mi)});
const SM=(by,txt,m,d,h,mi)=>({by,txt,dt:new Date(2026,m-1,d,h,mi)});
const CP={doces:{nome:'Linha de doces coloniais',obj:'Divulgar lançamento',fmt:'Reels 9:16',vids:1},verao:{nome:'Cardápio de verão',obj:'Gerar visitas à loja',fmt:'Reels 9:16',vids:2},inverno:{nome:'Cardápio de inverno',obj:'Aumentar vendas',fmt:'Reels 9:16',vids:1},check:{nome:'Check-up em família',obj:'Gerar consultas',fmt:'Reels 9:16',vids:1},bela:{nome:'Cuidados de verão',obj:'Divulgar serviços',fmt:'Reels 9:16',vids:1},lume:{nome:'Brunch de fim de ano',obj:'Gerar visitas à loja',fmt:'Reels 9:16',vids:1,seg:'Alimentação',excl:60},aurora:{nome:'Pele de verão',obj:'Divulgar serviços',fmt:'Reels 9:16',vids:1,seg:'Beleza',excl:30}};
Object.entries({doces:'Alimentação',verao:'Alimentação',inverno:'Alimentação',check:'Saúde',bela:'Beleza'}).forEach(([k,v])=>{CP[k].seg=v;CP[k].excl=0});
PRP.push(
{id:'PR-1',k:'e',kn:'Doce Vale Confeitaria',cr:'mm',camp:CP.doces,st:'contrato',signed:1,tx:'TRX-7K3M9QX2',seed:1,acc:{by:'k'},un:{c:0,k:0},
 rounds:[RR('k',350,'25/11/2026','90 dias','Oi, Marjorie! Adorei os seus vídeos de receita. Queremos mostrar a nossa linha de doces coloniais sendo preparada e provada.',10,29,9,12),RR('c',420,'30/11/2026','90 dias','Posso incluir 2 stories extras? Com isso o valor fica em R$ 420.',10,29,10,40)],
 msgs:[SM('s','Proposta aceita por Doce Vale Confeitaria em R$ 420,00.',10,30,8,5),SM('c','Obrigada! Vou começar a gravar amanhã.',10,30,8,30),SM('s','Contrato confirmado por Doce Vale Confeitaria. R$ 420,00 ficam em custódia até a aprovação da entrega e a confirmação da publicação.',11,2,14,32)]},
{id:'PR-2',k:'e',kn:'Doce Vale Confeitaria',cr:'la',camp:CP.verao,st:'aberta',seed:1,un:{c:0,k:1},
 rounds:[RR('k',600,'15/12/2026','90 dias','Oi, Lucas! Queremos você no cardápio de verão: 2 vídeos mostrando as sobremesas geladas.',11,3,10,15),RR('c',700,'15/12/2026','90 dias','Consigo entregar os 2 vídeos com edição completa por R$ 700.',11,4,9,40)],msgs:[]},
{id:'PR-3',k:'e',kn:'Doce Vale Confeitaria',cr:'bt',camp:CP.verao,st:'aceita',seed:1,un:{c:0,k:1},acc:{by:'c'},
 rounds:[RR('k',600,'15/12/2026','90 dias','Oi, Bianca! Queremos você no cardápio de verão: 2 vídeos mostrando as sobremesas geladas.',11,3,10,16)],msgs:[SM('s','Proposta aceita por Bianca Teixeira em R$ 600,00.',11,4,16,20)]},
{id:'PR-4',k:'x',kn:'Pizzaria Forno a Lenha',cr:'mm',camp:CP.inverno,st:'aberta',seed:1,un:{c:1,k:0},venc:'responder até 12/11',
 rounds:[RR('k',250,'20/11/2026','60 dias','Oi, Marjorie! Vimos o seu trabalho e queremos você no nosso cardápio de inverno.',11,4,14,32)],msgs:[]},
{id:'PR-5',k:'a',kn:'Maré Digital',cli:'Doce Vale Confeitaria',cr:'mm',camp:CP.doces,st:'aceita',seed:1,un:{c:0,k:1},acc:{by:'c'},
 rounds:[RR('k',350,'25/11/2026','90 dias','Olá, Marjorie! Somos a Maré Digital e vamos conduzir a campanha do nosso cliente Doce Vale.',10,28,11,0)],msgs:[SM('s','Proposta aceita por Marjorie Moreira em R$ 350,00.',10,29,9,5)]},
{id:'PR-6',k:'a',kn:'Maré Digital',cli:'Clínica Sorriso Sul',cr:'la',camp:CP.check,st:'aberta',seed:1,un:{c:0,k:1},
 rounds:[RR('k',450,'10/12/2026','90 dias','Olá, Lucas! Campanha de check-up em família para a Clínica Sorriso Sul.',11,2,10,0),RR('c',500,'10/12/2026','90 dias','Consigo fechar em R$ 500, com roteiro incluso.',11,3,11,20)],msgs:[]},
{id:'PR-7',k:'a',kn:'Maré Digital',cli:'Studio Bela Pele',cr:'bt',camp:CP.bela,st:'aberta',seed:1,un:{c:0,k:0},
 rounds:[RR('k',400,'20/12/2026','90 dias','Olá, Bianca! Campanha Cuidados de verão para o Studio Bela Pele.',11,4,15,0)],msgs:[]},
{id:'PR-8',k:'x',kn:'Café Lume',cr:'la',camp:CP.lume,st:'contrato',signed:1,tx:'TRX-L8U2M5AA',seed:1,acc:{by:'k'},un:{c:0,k:0},
 rounds:[RR('k',380,'20/11/2026','90 dias','Oi, Lucas! Brunch de fim de ano com exclusividade de 60 dias no ramo de alimentação.',10,20,9,0)],msgs:[SM('s','Contrato assinado por Lucas Amaral. Exclusividade de 60 dias a partir de 20/11/2026.',10,27,10,0)]},
{id:'PR-9',k:'x',kn:'Estética Aurora',cr:'bt',camp:CP.aurora,st:'contrato',signed:1,tx:'TRX-A9R3O7BB',seed:1,acc:{by:'k'},un:{c:0,k:0},
 rounds:[RR('k',320,'25/11/2026','90 dias','Oi, Bianca! Pele de verão com exclusividade de 30 dias no ramo de beleza.',10,22,9,30)],msgs:[SM('s','Contrato assinado por Bianca Teixeira. Exclusividade de 30 dias a partir de 25/11/2026.',10,28,15,0)]});
[['PR-1','2026-11-02T14:32:00-03:00','2026-11-02T16:05:00-03:00'],['PR-8','2026-10-21T11:00:00-03:00','2026-10-27T10:00:00-03:00'],['PR-9','2026-10-23T09:40:00-03:00','2026-10-28T15:00:00-03:00']].forEach(([id,a,b])=>{PRP.find(x=>x.id==id).sg={k:{dt:new Date(a)},c:{dt:new Date(b)}}});
const last=q=>q.rounds[q.rounds.length-1];
const turn=q=>q.st=='aberta'?(last(q).by=='k'?'c':'k'):'';
const t0q=q=>q.rounds[0].dt;
const actq=q=>[...q.rounds,...q.msgs].reduce((m,x)=>x.dt>m?x.dt:m,t0q(q));
const mine=p=>PRP.filter(q=>(p=='c'?q.cr==ME:q.k==p)&&!(ST[p].fresh&&q.seed)&&(!ST[p].t0||t0q(q)>=ST[p].t0)).sort((a,b)=>actq(b)-actq(a));
const needs=(q,p)=>(q.st=='aberta'&&turn(q)==rl(p))||(q.st=='aceita'&&p!='c');
const ctUnread=p=>ST[p].fresh&&!mine(p).length?0:mine(p).filter(q=>q.un[rl(p)]).length;
const sysMsg=(q,txt)=>q.msgs.push({by:'s',txt,dt:new Date()});
const markUnread=(q,r)=>{q.un[r]=1};
const nameOf=(q,by)=>by=='c'?crOf(q.cr).n:q.kn;
const otherOf=(q,p)=>p=='c'?q.kn+(q.cli?' · cliente '+q.cli:''):crOf(q.cr).n;
const CTX={c:null,e:null,a:null},TH={c:null,e:null,a:null},PICK={e:'mm',a:'mm'};
function ctxP(p,pref){const L=mine(p);let q=L.find(x=>x.id==CTX[p]);if(q)return q;const op=L.find(x=>x.st=='aberta'&&turn(x)==rl(p));if(pref=='open')return op||L.find(x=>x.st=='aberta')||L[0]||null;return L.find(x=>x.st=='aceita'&&x.signed!==1)||op||L[0]||null}
const ctv=p=>{const q=ctxP(p);return q?last(q).valor:420};
function resetNeg(p){CTX[p]=null;TH[p]=null;delete SRCH[p];delete FRM[p];delete CPF[p];if(CSR.p==p)CSR.q=''}

/* ---------- exclusividade (só contratos já assinados) ---------- */
const SEGOF={'Doce Vale Confeitaria':'Alimentação','Pizzaria Forno a Lenha':'Alimentação','Café Colonial da Serra':'Alimentação','Café Lume':'Alimentação','Clínica Sorriso Sul':'Saúde','Studio Bela Pele':'Beleza','Estética Aurora':'Beleza','Academia Vital':'Esportes','PetShop Amigo Fiel':'Pets','Loja Maré Moda':'Moda'};
const SEGREL=[['Saúde','Beleza','Esportes']];
const segRel=(a,b)=>!!a&&!!b&&a!='Outros'&&b!='Outros'&&(a==b||SEGREL.some(g=>g.includes(a)&&g.includes(b)));
const exDias=v=>{const n=parseInt(String(v==null?'':v).replace(/\D/g,''),10);return n>0?n:0};
const fdt=d=>d.toLocaleDateString('pt-BR');
const exMk=(co,seg,dias,pz)=>({co:co||'',seg:seg||'',dias,pz,fim:pz&&dias?new Date(pz.getTime()+dias*864e5):null});
const exInfo=q=>{const c=q.camp||{},co=q.cli||q.kn;return exMk(co,c.seg||SEGOF[co]||'',exDias(c.excl),dparse(last(q).prazo))};
const isSig=q=>q.st=='contrato'&&q.signed===1;
function exPair(a,b){if(!a.pz||!b.pz||!a.co||a.co==b.co||!segRel(a.seg,b.seg))return null;if(a.dias&&b.pz>=a.pz&&b.pz<=a.fim)return'a';if(b.dias&&a.pz>=b.pz&&a.pz<=b.fim)return'b';return null}
function exCheck(cr,b,skip){for(const q of PRP){if(q.cr!=cr||q.id==skip||!isSig(q))continue;if(q.cr==ME&&q.seed&&ST.c.fresh)continue;const a=exInfo(q),by=exPair(a,b);if(by)return{q,a,b,by,rel:a.seg!=b.seg}}return null}
const exQ=q=>exCheck(q.cr,exInfo(q),q.id);
const exCand=(p,pz)=>{const c=cdGet(p),co=p=='a'?c.cliente:PF[PU[p]].n,seg=p=='a'?(SEGOF[c.cliente]||''):((PD[p]&&PD[p].seg)||'');return exMk(co,seg,exDias(c.excl),pz||dparse(c.entrega))};
const exBlocked=(p,id,pz)=>campOk(p)?exCheck(id,exCand(p,pz)):null;
const exCamp=x=>exCheck(ME,exMk(x.e,x.seg||SEGOF[x.e]||'',exDias(x.excl),dparse(x.prazo)));
function exTxt(cf,v){const a=cf.a,b=cf.b,rm=cf.rel?'de ramo relacionado':'do mesmo ramo';
if(v=='c')return cf.by=='a'?`Você assinou exclusividade com ${a.co} (${a.seg}) até ${fdt(a.fim)}. Esta campanha tem entrega em ${fdt(b.pz)}, dentro desse período, e é ${rm} (${b.seg}). Peça à empresa uma entrega depois de ${fdt(a.fim)}.`:`Esta campanha exige exclusividade até ${fdt(b.fim)}, e você já tem contrato assinado com ${a.co} (${a.seg}) com entrega em ${fdt(a.pz)}, dentro desse período.`;
return cf.by=='a'?`Este criador tem contrato de exclusividade assinado com outra marca ${rm} (${a.seg}) até ${fdt(a.fim)}. A entrega em ${fdt(b.pz)} cai dentro desse período. Escolha uma entrega depois de ${fdt(a.fim)} ou outro criador.`:`A exclusividade desta campanha vai até ${fdt(b.fim)}, e este criador já tem contrato assinado com outra marca ${rm} (${a.seg}) com entrega em ${fdt(a.pz)}. Reduza a exclusividade, mude a entrega ou escolha outro criador.`}
const exBan=(cf,v)=>`<div class="np wn">${IC('lock',18,2)}<span><b>Conflito de exclusividade.</b> ${pyEsc(exTxt(cf,v))}</span></div>`;
const exLine=(dias,pz)=>dias&&pz?`${dias} dias, de ${fdt(pz)} até ${fdt(new Date(pz.getTime()+dias*864e5))}`:'Nenhuma';
function exCmp(p,ids,F){const pz=dparse(F.prazo)||null;return ids.map(id=>{const cf=pz?exBlocked(p,id,pz):exBlocked(p,id);return cf?`<div class="np wn">${IC('lock',18,2)}<span><b>${pyEsc(crOf(id).n)}: conflito de exclusividade.</b> ${pyEsc(exTxt(cf,'k'))}</span></div>`:''}).join('')}
function exCpt(p,q,F){const pz=dparse(F.prazo);if(!pz)return'';const a=exInfo(q),cf=exCheck(q.cr,exMk(a.co,a.seg,a.dias,pz),q.id);return cf?exBan(cf,rl(p)):''}
const EXSK={e:[],a:[]};

/* ---------- visual das propostas ---------- */
const brkRows=(v,view)=>{const k=calc(v);return view=='c'?[['Você recebe',`<b>${brl(v)}</b>`],[FEEL+' · paga pelo contratante',brl(k.fee)],['Custo total do contratante',brl(k.tot)]]:[['Valor ao criador',brl(v)],[FEEL,brl(k.fee)],['Total a pagar',`<b>${brl(k.tot)}</b>`]]};
const brkCard=(v,view)=>`<div class="brk">${K(brkRows(v,view))}</div>`;
function rndCard(q,r,i,view){const me=r.by==rl(view),who=nameOf(q,r.by),first=i==0;
const t=me?(first?'Sua proposta':'Sua contraproposta'):(first?'Proposta de '+who:'Contraproposta de '+who);
return`<div class="rd${me?' me':''}"><div class="rdh"><b>${pyEsc(t)}</b><small>${dtf(r.dt)}</small></div>`+K([['Prazo de entrega',pyEsc(r.prazo)],['Uso de imagem',pyEsc(r.uso)]])+brkCard(r.valor,view)+(r.msg?`<p class="rdm">“${pyEsc(r.msg)}”</p>`:'')+'</div>'}
const stTxt=(q,p)=>{const v=rl(p),t=turn(q);if(q.st=='contrato')return['g','Contrato fechado'];if(q.st=='aceita')return['',v=='k'?'Aceita · falta pagar':'Proposta aceita'];if(q.st=='recusada')return['g','Recusada'];if(q.st=='encerrada')return['g','Encerrada'];return t==v?['w','Sua vez de responder']:['','Aguardando '+(v=='c'?'o contratante':'o criador')]};
const stPill=(q,p)=>{const[c,l]=stTxt(q,p);return`<span class="pl ${c}">${l}</span>`};
const dshort=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
function preview(q){const ev=[...q.rounds.map(r=>({dt:r.dt,t:(q.rounds[0]===r?'Proposta':'Contraproposta')+' de '+brl(r.valor)})),...q.msgs.map(m=>({dt:m.dt,t:m.by=='s'?m.txt:m.txt}))].sort((a,b)=>b.dt-a.dt)[0];return ev?ev.t:''}

/* ---------- conversa ---------- */
function simBox(q,p){const v=rl(p),by=v=='c'?'k':'c',who=nameOf(q,by);return`<div class="sim"><b>Simulação · responder como ${pyEsc(who)}</b><small>No uso real, a resposta chega do outro lado pela Triskel. Aqui você escolhe o que acontece.</small><button class="bt" data-nx="sim:accept:${q.id}">${pyEsc(who)} aceita</button><button class="bt o" data-nx="sim:counter:${q.id}">${pyEsc(who)} faz uma contraproposta</button><button class="bt o dg" data-nx="sim:decline:${q.id}">${pyEsc(who)} recusa</button></div>`}
function actions(q,p){const v=rl(p),t=turn(q),id=q.id,l=last(q),cf=q.st=='aberta'||q.st=='aceita'?exQ(q):null,bn=cf?exBan(cf,v):'';
if(q.st=='aberta'){if(t==v)return bn+`<div class="np ok">${IC('check',18,2)}<span>Sua vez: aceite, faça uma contraproposta ou recuse. O valor, a taxa de ${FPCT}% e o total aparecem em cada etapa.</span></div>${cf?`<button class="bt" disabled>Aceite indisponível: conflito de exclusividade</button>`:`<button class="bt" data-nx="accept:${id}">Aceitar proposta de ${brl(l.valor)}</button>`}<button class="bt o" data-nx="cp:${id}">Fazer contraproposta</button><button class="bt o dg" data-nx="decline:${id}">${v=='c'?'Recusar':'Encerrar negociação'}</button>`;
return bn+`<p class="cap" style="text-align:left">${IC('clock',14,2)} Aguardando resposta de ${pyEsc(otherOf(q,p).split(' · ')[0])}. Você será avisado aqui e por notificação.</p>`+simBox(q,p)}
if(q.st=='aceita')return bn+`<div class="np ok">${IC('check',18,2)}<span>${v=='k'?'Proposta aceita. Falta revisar o contrato e pagar com o saldo da carteira para o valor ficar em custódia.':'Proposta aceita. Assim que o contratante pagar, o valor fica em custódia e você assina o contrato.'}</span></div><button class="bt" data-nx="contract:${id}">${v=='k'?'Revisar contrato e pagar':'Ver contrato'}</button>`;
if(q.st=='contrato')return`<div class="np ok">${IC('lock',18,2)}<span>Contrato fechado. O valor está em custódia e só é liberado depois que a entrega for aprovada e a Triskel confirmar a publicação do post.</span></div><button class="bt" data-dl="open:${id}">Acompanhar entrega</button><button class="bt o" data-nx="contract:${id}">Ver contrato</button>`+pdfBtns(q)+(v=='k'&&!q.signed&&q.cr!=ME?simSign(q):'');
return`<p class="cap" style="text-align:left">Esta negociação foi ${q.st}. ${v=='k'?'Você pode buscar outros criadores.':'Você pode buscar outras oportunidades.'}</p><button class="bt o" data-g="${v=='k'?p+'4':'c4'}">${v=='k'?'Buscar criadores':'Buscar oportunidades'}</button>`}
function timeline(q,p){const ev=[...q.rounds.map((r,i)=>({dt:r.dt,h:rndCard(q,r,i,p)})),...q.msgs.map(m=>({dt:m.dt,h:m.by=='s'?`<div class="bs">${IC('lock',14,2)}<span>${pyEsc(m.txt)}</span></div>`:`<div class="bb${m.by==rl(p)?' me':''}"><small>${pyEsc(nameOf(q,m.by))} · ${dtf(m.dt)}</small><p>${pyEsc(m.txt)}</p></div>`}))].sort((a,b)=>a.dt-b.dt);return ev.map(x=>x.h).join('')}
function thBody(p){const q=ctxP(p);if(!q)return`<div class="cd" style="text-align:center"><b>Nenhuma conversa selecionada</b><small>As propostas e mensagens ficam em Contatos.</small></div>`+BTN('Abrir contatos',p+'_ct');
TH[p]=q.id;CTX[p]=q.id;q.un[rl(p)]=0;const other=otherOf(q,p),open=['aberta','aceita','contrato'].includes(q.st);
return Card(`<div class="thh"><span class="av2">${ini(other.split(' · ')[0])}</span><div><b>${pyEsc(other)}</b><small>${pyEsc(q.camp.nome)} · ${q.camp.vids} ${q.camp.vids>1?'vídeos':'vídeo'}</small></div></div>${stPill(q,p)}${q.venc&&q.st=='aberta'&&turn(q)==rl(p)?`<span class="pl w">${q.venc}</span>`:''}`)
+POLICY
+(q.camp.html?`<details class="fq"><summary>Ver a campanha enviada</summary><div class="cmpx">${q.camp.html}</div></details>`:Card(K([['Campanha',pyEsc(q.camp.nome)],['Objetivo',pyEsc(q.camp.obj||'—')],['Formato',pyEsc(q.camp.fmt||'—')],['Vídeos por criador',q.camp.vids]])))
+SHD('Conversa')+timeline(q,p)+actions(q,p)
+(open?SHD('Mensagem')+`<label>Mensagem para ${pyEsc(other.split(' · ')[0])}<textarea rows="2" data-th="msg" placeholder="Escreva aqui. Telefone, e-mail e links são bloqueados."></textarea></label><button class="bt o" data-nx="msg">Enviar mensagem</button>`:'')}

/* ---------- Contatos (lista) ---------- */
const CTF={c:'all',e:'all',a:'all'};
const ctFilt=(q,p,f)=>f=='me'?needs(q,p):f=='open'?['aberta','aceita'].includes(q.st):f=='closed'?['contrato','recusada','encerrada'].includes(q.st):true;
function exAct(){const L=mine('c').filter(q=>isSig(q)&&exInfo(q).dias&&exInfo(q).fim>=DAY0());if(!L.length)return'';return SHD('Exclusividades vigentes')+Card(K(L.map(q=>{const a=exInfo(q);return[pyEsc(a.co)+' · '+pyEsc(a.seg),'até '+fdt(a.fim)]})))+`<p class="cap" style="text-align:left;margin-bottom:6px">Nesse período, a Triskel bloqueia propostas e candidaturas de marcas do mesmo ramo ou de ramos relacionados.</p>`}
function ctBody(p){const L=mine(p),f=CTF[p],n=L.filter(q=>needs(q,p)).length,v=L.filter(q=>ctFilt(q,p,f));
const chips=[['all','Todas'],['me','Aguardam você'],['open','Em andamento'],['closed','Fechadas']];
return`<p class="hi">Propostas, contrapropostas e mensagens ficam só aqui. Ninguém precisa passar telefone, e-mail ou rede social.</p>`+KP([[String(L.length),'Conversas',''],[String(n),'Aguardam você',n?'Responda para não perder':'Tudo em dia']])
+(p=='c'?exAct():'')+`<div class="chg" role="group" aria-label="Filtrar conversas">${chips.map(([k,l])=>`<button type="button" class="sfc${f==k?' on':''}" aria-pressed="${f==k}" data-nx="ctf:${k}">${l}</button>`).join('')}</div>`
+(L.length?(v.length?v.map(q=>{const other=otherOf(q,p),[c,l]=stTxt(q,p);return`<button class="ctc" data-nx="open:${q.id}"><span class="av2">${ini(other.split(' · ')[0])}</span><span class="ctt"><b>${pyEsc(other.split(' · ')[0])}${q.un[rl(p)]?'<i class="ud" aria-label="Não lida"></i>':''}</b><small>${pyEsc(q.camp.nome)}${q.cli?' · '+pyEsc(q.cli):''} · ${brl(last(q).valor)}</small><small class="ctl">${pyEsc(preview(q)).slice(0,70)}</small></span><span class="cts"><em class="pl ${c}">${l}</em><small>${dshort(actq(q))}</small></span></button>`}).join(''):`<div class="cd" style="text-align:center"><b>Nada nesta lista</b></div>`):`<div class="cd" style="text-align:center"><b>Nenhum contato ainda</b><small>${p=='c'?'Quando uma empresa ou agência enviar uma proposta, ela aparece aqui. Você também pode se candidatar a campanhas.':'Envie uma proposta a um criador e a conversa começa aqui.'}</small></div>`+BTN(p=='c'?'Buscar oportunidades':'Buscar criadores',p=='c'?'c4':p+'4'))+POLICY}
const ctSec=p=>{const L=mine(p),n=L.filter(q=>needs(q,p)).length;return SHD('Contatos')+Card(`<div class="pyst">${IC('chat',16,2)}<span>Área de contatos</span></div><p style="margin:0 0 10px;font-size:14px;line-height:1.5">${p=='c'?'Empresas e agências falam com você aqui, por meio de propostas e mensagens.':'Os criadores respondem às suas propostas aqui.'} Nada de telefone, e-mail ou redes sociais: tudo fica registrado na Triskel.</p>${K([['Conversas',L.length],['Aguardam você',n]])}`)+BTN('Abrir contatos',p+'_ct')};

/* ---------- busca de criadores (comércio e agência) ---------- */
const SRCH={};
const srcInit=p=>{const c=cdGet(p);return{q:'',nich:[...(c.nichosCr||[])],reg:c.regCr||'Sem preferência',porte:(c.porteCr||[]).map(porteK),nota:c.nota||'Sem mínimo',vmax:'',ord:'compat',sel:[],open:0}};
const srcGet=p=>SRCH[p]||(SRCH[p]=srcInit(p));
const ORD=[['compat','Compatibilidade'],['nota','Melhor nota'],['valor','Menor valor'],['trab','Mais trabalhos']];
function srcRun(p){const f=srcGet(p),c=cdGet(p),q=nz(f.q.trim()),vm=parseBR(f.vmax);
const L=CRD.map(x=>({x,cp:compat(x,c)})).filter(({x})=>{if(q&&!(nz(x.n).includes(q)||x.nichos.some(n=>nz(n).includes(q))||nz(x.cid).includes(q)))return false;if(f.nich.length&&!x.nichos.some(n=>f.nich.includes(n)))return false;if(!nearReg(x,f.reg))return false;if(f.porte.length&&!f.porte.includes(x.porte))return false;if(x.nota<notaMin(f.nota))return false;if(vm&&x.vmin>vm)return false;return true});
L.sort((a,b)=>f.ord=='nota'?b.x.nota-a.x.nota:f.ord=='valor'?a.x.vmin-b.x.vmin:f.ord=='trab'?b.x.trab-a.x.trab:b.cp.pct-a.cp.pct);return L}
const srcCount=p=>{const f=srcGet(p),c=srcInit(p);let n=0;if(f.nich.length)n++;if(f.reg&&f.reg!='Sem preferência')n++;if(f.porte.length)n++;if(f.nota&&f.nota!='Sem mínimo')n++;if(parseBR(f.vmax))n++;return n};
const srcSum=p=>{const f=srcGet(p),a=[];if(f.nich.length)a.push(f.nich.slice(0,2).join(', ')+(f.nich.length>2?' +'+(f.nich.length-2):''));if(f.reg&&f.reg!='Sem preferência')a.push(f.reg);if(f.porte.length)a.push(f.porte.join(', '));if(f.nota&&f.nota!='Sem mínimo')a.push('Nota '+f.nota.replace(' ou mais','+'));if(parseBR(f.vmax))a.push('até R$ '+f.vmax);return a.length?a.join(' · '):'Nenhum filtro ativo'};
function crCard(p,x,cp,f){const ag=p=='a',has=mine(p).find(q=>q.cr==x.id&&['aberta','aceita','contrato'].includes(q.st)&&q.camp.nome==cdGet(p).nome),on=f.sel.includes(x.id),cf=has?null:exBlocked(p,x.id);
return`<div class="cd rs"><div class="rt1"><span class="av2">${ini(x.n)}</span><div class="rtn"><b>${x.n}</b><small>${x.nichos.join(', ')} · ${x.cid}</small></div><span class="mt" title="Compatibilidade com a campanha">${cp.pct}%</span></div><div class="rt2"><span>★ ${nf1(x.nota)} · ${x.trab} trabalhos</span><span>${x.porte} · ${x.seg} seg.</span><span>${brl0(x.vmin)}–${brl0(x.vmax)} por vídeo</span></div><div>${cp.why.map(w=>`<span class="pl${/Acima/.test(w)?' w':''}">${w}</span>`).join(' ')}${cf?' <span class="pl dn">Conflito de exclusividade</span>':''}</div>${cf?`<p class="exn">${pyEsc(exTxt(cf,'k'))}</p>`:''}<div class="rb"><button type="button" class="bt o" data-nx="view:${x.id}">Ver perfil</button>${has?`<button type="button" class="bt o" data-nx="open:${has.id}">Ver conversa</button>`:cf?`<button type="button" class="bt" disabled>Indisponível no período</button>`:ag?`<button type="button" class="bt${on?'':' o'}" data-nx="sel:${x.id}" aria-pressed="${on}">${on?'✓ Selecionado':'Selecionar'}</button>`:`<button type="button" class="bt" data-nx="prop:${x.id}">Enviar proposta</button>`}</div></div>`}
function srcRes(p){const f=srcGet(p),c=cdGet(p),L=srcRun(p),ag=p=='a',n=srcCount(p);
return`<p class="cap" style="text-align:left;margin:6px 0">${L.length} ${L.length==1?'criador encontrado':'criadores encontrados'} · ordenados por ${ORD.find(o=>o[0]==f.ord)[1].toLowerCase()}${n?` · ${n} ${n>1?'filtros':'filtro'} ativo${n>1?'s':''}`:''}</p>`
+(L.length?L.map(({x,cp})=>crCard(p,x,cp,f)).join(''):`<div class="cd" style="text-align:center"><b>Nenhum criador com esses filtros</b><small>Tente ampliar a região, tirar a nota mínima ou limpar os filtros.</small></div><button class="bt o" data-sf="clear">Limpar filtros</button>`)
+(ag&&f.sel.length?`<div class="selbar"><b>${f.sel.length} ${f.sel.length>1?'selecionados':'selecionado'}</b><button class="bt" data-nx="prop-sel">Enviar proposta</button></div>`:'')}
function srcBody(p){const f=srcGet(p),c=cdGet(p),chips=[...new Set([...OPT.nichos,...f.nich])];
const sel=(k,l,a,v)=>`<label>${l}<select data-sf="${k}">${a.map(x=>`<option${x==v?' selected':''}>${x}</option>`).join('')}</select></label>`;
return(campOk(p)?'':`<div class="np">${IC('lock',18,2)}<span>Para enviar uma proposta, primeiro crie a campanha. Você já pode explorar os criadores.</span></div><button class="bt o" data-g="${p=='e'?'e2':'a3'}">Criar campanha</button>`)+(campOk(p)?`<p class="hi">${p=='a'?'Cliente':'Campanha'}: <b>${pyEsc(c.nome||'sem nome')}</b>${p=='a'&&c.cliente?' · '+pyEsc(c.cliente):''} · ${brl(c.valor||0)} por vídeo</p>`:'')
+`<label>Buscar<input type="search" data-sf="q" value="${pyEsc(f.q)}" placeholder="Nome, nicho ou cidade" aria-label="Buscar criadores" autocomplete="off"></label>`
+`<details class="fq sfp"${f.open?' open':''}><summary><span>Filtros<span class="sfsum" id="sfs">${srcSum(p)}</span></span><span class="sfn" id="sfn">${srcCount(p)}</span></summary><div class="sfb"><label>Nichos</label><div class="chg">${chips.map(n=>`<button type="button" class="sfc${f.nich.includes(n)?' on':''}" aria-pressed="${f.nich.includes(n)}" data-sf="nich:${n}">${n}</button>`).join('')}</div>`
+sel('reg','Localização',['Sem preferência',...OPT.reg],f.reg)+`<label>Porte</label><div class="chg">${['Nano','Micro','Médio'].map(n=>`<button type="button" class="sfc${f.porte.includes(n)?' on':''}" aria-pressed="${f.porte.includes(n)}" data-sf="porte:${n}">${n}</button>`).join('')}</div>`
+sel('nota','Nota mínima',['Sem mínimo','4,0 ou mais','4,5 ou mais'],f.nota)+`<label>Valor máximo por vídeo, em reais<input data-sf="vmax" inputmode="numeric" value="${pyEsc(f.vmax)}" placeholder="Ex.: 300 (sem limite)" data-nomask="1"></label>`
+`<label>Ordenar por<select data-sf="ord">${ORD.map(([k,l])=>`<option value="${k}"${f.ord==k?' selected':''}>${l}</option>`).join('')}</select></label>`
+`<div class="sfa"><button type="button" class="bt o" data-sf="reset">Usar filtros da campanha</button><button type="button" class="lk" data-sf="clear">Limpar filtros</button></div></div></details>`
+`<div id="sres">${srcRes(p)}</div>`+POLICY}

/* ---------- perfil do criador (visto por comércio e agência) ---------- */
function crBody(p){const x=crOf(PICK[p]),c=cdGet(p),cp=compat(x,c),v=(+c.valor||0)*(+c.qVid||1),k=calc(v),has=mine(p).find(q=>q.cr==x.id&&['aberta','aceita','contrato'].includes(q.st)),f=srcGet(p),on=f.sel.includes(x.id),cf=has?null:exBlocked(p,x.id);
return`<div class="cd crh"><span class="av2 big2">${ini(x.n)}</span><h2>${x.n}</h2><p>${x.nichos.join(' · ')} · ${x.cid}, RS</p><div class="rt2"><span>★ ${nf1(x.nota)} · ${x.trab} trabalhos</span><span>${x.porte} · ${x.seg} seguidores</span></div><div><span class="pl">${cp.pct}% compatível com a campanha</span> ${cp.why.map(w=>`<span class="pl${/Acima/.test(w)?' w':''}">${w}</span>`).join(' ')}${cf?' <span class="pl dn">Conflito de exclusividade</span>':''}</div></div>`+(cf?exBan(cf,'k'):'')
+SHD('Sobre')+Card(`<p style="margin:0;line-height:1.55;font-size:14px">${pyEsc(x.sobre)}</p>`)
+SHD('Redes e alcance')+Card(K(x.redes.map(([n,s])=>[n,s+' seguidores'])))+`<p class="cap" style="text-align:left">${IC('lock',14,2)} O @ das redes só é liberado depois do contrato. Até lá, todo contato é pela Triskel.</p>`
+SHD('Valores')+Card(K([['Por vídeo',brl0(x.vmin)+' a '+brl0(x.vmax)],['Prazo médio',x.prazo]]))
+`<p class="cap" style="text-align:left;margin-bottom:6px">Com o valor da sua campanha:</p>`+Card(K(brkRows(v,'k')))
+SHD('Portfólio')+x.port.map(([a,b,d])=>Cd(a,b,d)).join('')
+SHD('Contato')+Card(`<div class="pyst">${IC('lock',16,2)}<span>Só pela Triskel</span></div><p style="margin:0;font-size:14px;line-height:1.5">Para falar com ${x.n.split(' ')[0]}, envie uma proposta. Ela recebe a campanha gerada, responde ou faz uma contraproposta aqui mesmo.</p>`)
+(has?`<button class="bt" data-nx="open:${has.id}">Ver conversa</button>`:cf?`<button class="bt" disabled>Indisponível no período</button>`:p=='a'?`<button class="bt${on?' o':''}" data-nx="sel:${x.id}:back">${on?'Remover da seleção':'Selecionar para a campanha'}</button>`:`<button class="bt" data-nx="prop:${x.id}">Enviar proposta</button>`)}

/* ---------- enviar proposta (campanha gerada + condições) ---------- */
const FRM={},CPF={};
const msgDefault=(p,x)=>{const c=cdGet(p);return`Olá, ${x.n.split(' ')[0]}! Gostamos do seu trabalho e queremos você na campanha “${c.nome}”${p=='a'&&c.cliente?' do cliente '+c.cliente:''}. Veja a campanha e as condições e me diga o que acha.`};
function frmInit(p,ids){const c=cdGet(p),x=crOf(ids[0]);return FRM[p]={key:ids.join(','),valor:mkBRL(String(Math.round((+c.valor||0)*(+c.qVid||1)*100))),prazo:c.entrega||'',uso:c.uso||'90 dias',msg:msgDefault(p,x)}}
const frmGet=(p,ids)=>FRM[p]&&FRM[p].key==ids.join(',')?FRM[p]:frmInit(p,ids);
const USOS=['60 dias','90 dias','180 dias','12 meses'];
function brkLive(p,v,n){const k=calc(v);return n>1?brkCard(v,'k')+`<div class="brk">${K([['Total para '+n+' criadores',`<b>${brl(r2(k.tot*n))}</b>`]])}</div>`:brkCard(v,'k')}
function cmpIds(p){if(p=='e')return[PICK.e||'mm'];const f=srcGet(p);f.sel=f.sel.filter(id=>!exBlocked(p,id));if(!f.sel.length){f.sel=srcRun(p).filter(o=>!exBlocked(p,o.x.id)).slice(0,2).map(o=>o.x.id);if(!f.sel.length)f.sel=['mm']}return f.sel}
function cmpBody(p){if(!campOk(p))return noCamp(p);const c=cdGet(p),ids=cmpIds(p),F=frmGet(p,ids),n=ids.length,v=parseBR(F.valor);
return`<p class="hi">A campanha gerada vai junto com a proposta. ${n>1?'Cada criador responde separadamente.':'O criador responde ou faz uma contraproposta pela Triskel.'}</p>`
+SHD(n>1?'Criadores selecionados':'Criador')+Card(ids.map(id=>{const x=crOf(id);return`<div class="thh"><span class="av2">${ini(x.n)}</span><div><b>${x.n}</b><small>${x.nichos.join(', ')} · ${x.cid} · ★ ${nf1(x.nota)}</small></div></div>`}).join(''))
+`<details class="fq"><summary>Ver a campanha que será enviada</summary><div class="cmpx">${cgen(p)}</div></details>`
+SHD('Condições da proposta')
+`<label>${n>1?'Valor por criador (R$)':'Valor ao criador (R$)'}<input data-nf="valor" inputmode="numeric" value="${pyEsc(F.valor)}" placeholder="0,00"></label>`
+`<label>Prazo de entrega<input data-nf="prazo" inputmode="numeric" value="${pyEsc(F.prazo)}" placeholder="dd/mm/aaaa"></label>`
+`<div id="exw">${exCmp(p,ids,F)}</div>`
+`<label>Uso de imagem<select data-nf="uso">${USOS.map(x=>`<option${x==F.uso?' selected':''}>${x}</option>`).join('')}</select></label>`
+`<label>Mensagem<textarea rows="4" data-nf="msg" placeholder="Apresente a campanha">${pyEsc(F.msg)}</textarea></label>`
+SHD('Valores')+`<div id="brk">${brkLive(p,v,n)}</div><p class="cap" style="text-align:left">A taxa de ${FPCT}% da Triskel é somada ao valor do criador e paga por você. Ela já aparece aqui, na proposta, na contraproposta e no contrato.</p>`+POLICY}
function cmpSend(p){if(campGate(p))return;const ids=cmpIds(p),F=frmGet(p,ids),c=cdGet(p),bad=mkBad(m);if(bad.length)return toast('Corrija: '+bad.slice(0,3).join(', ')+'.');
const v=parseBR(F.valor),d=dparse(F.prazo);if(v<10)return toast('Informe o valor ao criador (mínimo R$ 10,00).');if(!d)return toast('Informe o prazo no formato dd/mm/aaaa.');if(d<=DAY0())return toast('O prazo de entrega precisa ser uma data futura.');
if(!F.msg.trim())return toast('Escreva uma mensagem para o criador.');const lk=leak(F.msg);if(lk)return toast(leakMsg(lk));
const html=cgen(p),sent=[],bl=ids.filter(id=>exBlocked(p,id,d)),cd=exCand(p,d);
if(bl.length==ids.length)return toast(exTxt(exBlocked(p,bl[0],d),'k'));EXSK[p]=bl;
ids.forEach(id=>{if(bl.includes(id))return;const dup=mine(p).find(q=>q.cr==id&&['aberta','aceita','contrato'].includes(q.st)&&q.camp.nome==c.nome);if(dup){sent.push(dup.id);return}
const q={id:'PR-'+(++PRN),k:p,kn:PF[PU[p]].n,cli:p=='a'?c.cliente:'',cr:id,camp:{nome:c.nome,obj:c.obj,fmt:lst(c.fmt),vids:+c.qVid||1,html,seg:cd.seg,excl:cd.dias},st:'aberta',seed:0,un:{c:1,k:0},rounds:[{by:'k',valor:v,prazo:F.prazo,uso:F.uso,msg:F.msg.trim(),dt:new Date()}],msgs:[]};PRP.push(q);sent.push(q.id)});
SENT[p]=sent;CTX[p]=sent[0];go(p+'_sent')}
const SENT={e:[],a:[]};
const campOk=p=>{const c=cdGet(p);return!!(c.nome&&c.produto&&+c.valor>0&&c.entrega)};
const campGate=p=>{if(campOk(p))return false;toast('Crie a campanha antes de enviar a proposta.');go(p=='e'?'e2':'a3');return true};
const noCamp=p=>`<div class="cd" style="text-align:center"><b>Você ainda não criou uma campanha</b><small>A proposta leva a campanha gerada. Preencha o briefing e volte para escolher o criador.</small></div>`+BTN('Criar campanha',p=='e'?'e2':'a3');
function sentBody(p){const L=(SENT[p]||[]).map(id=>PRP.find(q=>q.id==id)).filter(Boolean);if(!L.length)return`<div class="cd" style="text-align:center"><b>Nenhuma proposta enviada ainda</b></div>`+BTN('Buscar criadores',p+'4');const q=L[0],l=last(q);
return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>${L.length>1?'Propostas enviadas':'Proposta enviada'}</h2><p>A campanha gerada foi enviada pela Triskel para <b>${L.map(x=>pyEsc(crOf(x.cr).n)).join(', ')}</b>. As respostas chegam em Contatos.</p></div>`
+((EXSK[p]||[]).length?`<div class="np wn">${IC('lock',18,2)}<span><b>Não enviada a ${(EXSK[p]).map(id=>pyEsc(crOf(id).n)).join(', ')}.</b> Há conflito de exclusividade com contrato já assinado por ${EXSK[p].length>1?'esses criadores':'esse criador'}.</span></div>`:'')+Card(K([['Campanha',pyEsc(q.camp.nome)],['Prazo de entrega',pyEsc(l.prazo)],['Uso de imagem',pyEsc(l.uso)]]))+brkCard(l.valor,'k')+(L.length>1?`<div class="brk">${K([['Total para '+L.length+' criadores',`<b>${brl(r2(calc(l.valor).tot*L.length))}</b>`]])}</div>`:'')
+POLICY+`<button class="bt" data-nx="open:${q.id}">${L.length>1?'Ver primeira conversa':'Ver conversa'}</button><button class="bt o" data-g="${p}_ct">Abrir contatos</button><button class="bt o" data-g="${p}4">Buscar outros criadores</button>`}

/* ---------- contraproposta (formulário) ---------- */
function cpBody(p){const q=ctxP(p,'open');if(!q)return`<div class="cd" style="text-align:center"><b>Nenhuma negociação em andamento</b></div>`+BTN('Abrir contatos',p+'_ct');
if(q.st!='aberta'||turn(q)!=rl(p))return`<div class="cd" style="text-align:center"><b>Não há nada para responder agora</b><small>${stTxt(q,p)[1]}.</small></div>`+`<button class="bt" data-nx="open:${q.id}">Voltar à conversa</button>`;
const l=last(q),key=q.id+':'+q.rounds.length;if(!CPF[p]||CPF[p].key!=key)CPF[p]={key,valor:mkBRL(String(Math.round(l.valor*100))),prazo:l.prazo,uso:l.uso,msg:''};const F=CPF[p],v=parseBR(F.valor),view=rl(p);
return`<p class="hi">Responda à proposta de ${pyEsc(nameOf(q,l.by))} com novas condições. Os valores já mostram a taxa de ${FPCT}%.</p>`+rndCard(q,l,q.rounds.length-1,p)
+SHD('Sua contraproposta')
+`<label>${view=='c'?'Valor que você quer receber (R$)':'Valor ao criador (R$)'}<input data-nf="valor" inputmode="numeric" value="${pyEsc(F.valor)}" placeholder="0,00"></label>`
+`<label>Prazo de entrega<input data-nf="prazo" inputmode="numeric" value="${pyEsc(F.prazo)}" placeholder="dd/mm/aaaa"></label>`
+`<div id="exw">${exCpt(p,q,F)}</div>`
+`<label>Uso de imagem<select data-nf="uso">${USOS.map(x=>`<option${x==F.uso?' selected':''}>${x}</option>`).join('')}</select></label>`
+`<label>Mensagem<textarea rows="3" data-nf="msg" placeholder="Explique a sua contraproposta">${pyEsc(F.msg)}</textarea></label>`
+SHD('Valores')+`<div id="brk">${brkCard(v,view)}</div><p class="cap" style="text-align:left">${view=='c'?'A taxa de '+FPCT+'% é paga pelo contratante e não desconta do valor que você recebe.':'A taxa de '+FPCT+'% da Triskel é somada ao valor do criador e paga por você.'}</p>`+POLICY}
function cpSend(p){const q=ctxP(p,'open');if(!q||q.st!='aberta'||turn(q)!=rl(p))return toast('Não há proposta para responder.');const F=CPF[p],l=last(q),bad=mkBad(m);if(bad.length)return toast('Corrija: '+bad.slice(0,3).join(', ')+'.');
const v=parseBR(F.valor),d=dparse(F.prazo);if(v<10)return toast('Informe o valor (mínimo R$ 10,00).');if(!d)return toast('Informe o prazo no formato dd/mm/aaaa.');if(d<=DAY0())return toast('O prazo de entrega precisa ser uma data futura.');
const lk=leak(F.msg);if(lk)return toast(leakMsg(lk));if(v==l.valor&&F.prazo==l.prazo&&F.uso==l.uso&&!F.msg.trim())return toast('Altere uma condição ou escreva uma mensagem.');
q.rounds.push({by:rl(p),valor:v,prazo:F.prazo,uso:F.uso,msg:F.msg.trim(),dt:new Date()});markUnread(q,rl(p)=='c'?'k':'c');delete CPF[p];toast('Contraproposta enviada.');TH[p]=q.id;Hs.pop();go(p+'_th','p')}

/* ---------- aceitar · recusar · simular · mensagem ---------- */
function doAccept(q,by){const l=last(q);q.st='aceita';q.acc={by,dt:new Date()};sysMsg(q,`Proposta aceita por ${nameOf(q,by)} em ${brl(l.valor)}.`);markUnread(q,by=='c'?'k':'c')}
function doDecline(q,by){q.st=by=='c'?'recusada':'encerrada';sysMsg(q,by=='c'?`${crOf(q.cr).n} recusou a proposta.`:`${q.kn} encerrou a negociação.`);markUnread(q,by=='c'?'k':'c')}
function doSimCounter(q,by){const l=last(q);const v=by=='c'?roundUp(l.valor*1.15):roundDn(l.valor*.9);q.rounds.push({by,valor:v,prazo:l.prazo,uso:l.uso,msg:by=='c'?'Consigo fechar com esses números. O que você acha?':'Conseguimos chegar nesse valor. Podemos fechar assim?',dt:new Date()});markUnread(q,by=='c'?'k':'c')}
const refresh=()=>{const y=m.scrollTop;draw();m.scrollTop=y;sbUpdate()};
function nx(a,r){const p=(profOf(cur)||PF[1]).p,q=PRP.find(x=>x.id==r[0]);
if(a=='open'){const x=q||ctxP(p);if(!x)return go(p+'_ct');CTX[p]=x.id;TH[p]=x.id;return go(p+'_th')}
if(a=='ctf'){CTF[p]=r[0];return refresh()}
if(a=='view'){PICK[p]=r[0];return go(p+'_cr')}
if(a=='prop'){if(campGate(p))return;{const cf=exBlocked(p,r[0]);if(cf)return toast(exTxt(cf,'k'))}PICK[p]=r[0];return go(p+'5',cur==p+'_cr'?'p':undefined)}
if(a=='sel'){const f=srcGet(p),i=f.sel.indexOf(r[0]);if(i>=0)f.sel.splice(i,1);else{const cf=exBlocked(p,r[0]);if(cf)return toast(exTxt(cf,'k'));f.sel.push(r[0])}if(r[1]=='back')return refresh();const rs=$('#sres');if(rs)rs.innerHTML=srcRes(p);return}
if(a=='prop-sel'){if(campGate(p))return;return go('a5')}
if(a=='send')return cmpSend(p);
if(a=='accept'&&q){if(!(q.st=='aberta'&&turn(q)==rl(p)))return;{const cf=exQ(q);if(cf)return toast(exTxt(cf,rl(p)))}doAccept(q,rl(p));toast('Proposta aceita.');CTX[p]=q.id;return cur.endsWith('_th')?refresh():go(p+'_th')}
if(a=='decline'&&q){if(!(q.st=='aberta'&&turn(q)==rl(p)))return;doDecline(q,rl(p));toast(rl(p)=='c'?'Proposta recusada.':'Negociação encerrada.');return cur.endsWith('_th')?refresh():go(p+'_th')}
if(a=='cp'&&q){CTX[p]=q.id;return go(p+'8')}
if(a=='cpsend')return cpSend(p);
if(a=='sim'){const by=rl(p)=='c'?'k':'c',how=r[0];const qq=PRP.find(x=>x.id==r[1]);if(!qq||!(qq.st=='aberta'&&turn(qq)==by))return;if(how=='accept'){const cf=exQ(qq);if(cf)return toast(exTxt(cf,rl(p)));doAccept(qq,by)}else if(how=='decline'){doDecline(qq,by)}else{doSimCounter(qq,by)}CTX[p]=qq.id;return refresh()}
if(a=='contract'&&q){CTX[p]=q.id;return go(p+'10')}
if(a=='sign'){const x=ctxP(p);if(x){const cf=exQ(x);if(cf)return toast(exTxt(cf,'c'));const ms=partyC(x).miss;if(ms.length){toast('Complete '+ms.join(' e ')+' no seu perfil para assinar o contrato.');return go('c_pe')}const ck=m.querySelector('label.ck input');if(ck&&!ck.checked)return toast('Marque que leu e concorda com o contrato para assinar.');signAs(x,'c');sysMsg(x,'Contrato assinado por '+crOf(x.cr).n+'.'+(sigBoth(x)?' As duas partes assinaram e o PDF com as assinaturas digitais está disponível.':''));markUnread(x,'k');toast('Contrato assinado. O PDF com as assinaturas já está disponível.')}return refresh()}
if(a=='simsign'){if(!q||q.st!='contrato'||q.signed||q.cr==ME)return;const cf=exQ(q);if(cf)return toast(exTxt(cf,'k'));signAs(q,'c');sysMsg(q,'Contrato assinado por '+crOf(q.cr).n+'. As duas partes assinaram e o PDF com as assinaturas digitais está disponível.');markUnread(q,'k');toast('Contrato assinado pelo criador.');return refresh()}
if(a=='msg'){const x=ctxP(p),t=m.querySelector('[data-th=msg]'),txt=t?t.value.trim():'';if(!x)return;if(txt.length<2)return toast('Escreva a mensagem antes de enviar.');const lk=leak(txt);if(lk){t.setAttribute('aria-invalid','true');return toast(leakMsg(lk))}
x.msgs.push({by:rl(p),txt,dt:new Date()});markUnread(x,rl(p)=='c'?'k':'c');toast('Mensagem enviada.');return refresh()}
if(a=='camp'){CSR.pick=r[0];return go('c5')}
if(a=='apply')return applySend();
}

/* ---------- criador: buscar oportunidades e candidatar-se ---------- */
const CMP=[
{id:'cv',seg:'Alimentação',excl:'Nenhuma',k:'e',e:'Doce Vale Confeitaria',nome:'Cardápio de verão',nichos:['Gastronomia','Lifestyle'],cid:'Pelotas',near:1,valor:600,vids:2,fmt:'Reels 9:16',prazo:'15/12/2026',uso:'90 dias',obj:'Gerar visitas à loja',desc:'Mostrar as novas sobremesas geladas do verão, com clima leve e close nos detalhes.'},
{id:'ci',seg:'Alimentação',excl:'Nenhuma',k:'x',e:'Pizzaria Forno a Lenha',nome:'Cardápio de inverno',nichos:['Gastronomia'],cid:'Pelotas',near:1,valor:250,vids:1,fmt:'Reels 9:16',prazo:'20/11/2026',uso:'60 dias',obj:'Aumentar vendas',desc:'Mostrar as pizzas de inverno saindo do forno, com foco no queijo e na massa.'},
{id:'cs',seg:'Beleza',excl:'30 dias',k:'x',e:'Studio Bela Pele',nome:'Rotina de skincare',nichos:['Beleza','Lifestyle'],cid:'Pelotas',near:1,valor:300,vids:1,fmt:'Reels 9:16',prazo:'30/11/2026',uso:'90 dias',obj:'Divulgar serviços',desc:'Uma rotina de cuidados simples, mostrando os produtos usados no estúdio.'},
{id:'cc',seg:'Saúde',excl:'Nenhuma',k:'x',e:'Clínica Sorriso Sul',nome:'Check-up em família',nichos:['Saúde e bem-estar','Maternidade e família'],cid:'Pelotas',near:1,valor:450,vids:1,fmt:'Reels 9:16',prazo:'10/12/2026',uso:'90 dias',obj:'Gerar consultas',desc:'Uma família passando pelo check-up e contando como foi a experiência.'},
{id:'ct',seg:'Alimentação',excl:'60 dias',k:'x',e:'Café Colonial da Serra',nome:'Café da manhã colonial',nichos:['Gastronomia','Viagem'],cid:'Canguçu',near:1,valor:500,vids:1,fmt:'Reels 9:16',prazo:'05/12/2026',uso:'90 dias',obj:'Gerar visitas à loja',desc:'Mostrar a mesa de café colonial e o clima do lugar.'},
{id:'cf',seg:'Esportes',excl:'30 dias',k:'x',e:'Academia Vital',nome:'Treino em casa',nichos:['Fitness','Saúde e bem-estar'],cid:'Rio Grande',near:1,valor:380,vids:1,fmt:'Reels 9:16',prazo:'12/12/2026',uso:'90 dias',obj:'Captar alunos',desc:'Um treino de 15 minutos para fazer em casa, com a assinatura da academia.'},
{id:'cp',seg:'Pets',excl:'Nenhuma',k:'x',e:'PetShop Amigo Fiel',nome:'Dia de banho e tosa',nichos:['Pets'],cid:'Pelotas',near:1,valor:220,vids:1,fmt:'Reels 9:16',prazo:'28/11/2026',uso:'60 dias',obj:'Aumentar agendamentos',desc:'O dia de um pet no banho e tosa, do começo ao fim.'},
{id:'cm',seg:'Moda',excl:'Nenhuma',k:'x',e:'Loja Maré Moda',nome:'Coleção primavera',nichos:['Moda','Lifestyle'],cid:'Porto Alegre',near:0,valor:700,vids:2,fmt:'Reels 9:16',prazo:'18/12/2026',uso:'180 dias',obj:'Divulgar coleção',desc:'Looks da nova coleção, em 2 vídeos curtos.'}];
const campOf=id=>CMP.find(x=>x.id==id)||CMP[0];
const CSR={p:'c',q:'',nich:['Gastronomia','Lifestyle'],reg:'Pelotas e região',vmin:'',ord:'compat',pick:'cv',open:0,ini:0};
function ccompat(cm){const me=CRD[0],d=PD.c||{},my=(d.nichos&&d.nichos.length?d.nichos:me.nichos),nm=cm.nichos.filter(x=>my.includes(x)).length,why=[];let s=0;if(nm>=2){s+=45;why.push('Nichos compatíveis')}else if(nm==1){s+=32;why.push('Nicho compatível')}
if(cm.near){s+=25;why.push('Na sua região')}
const vm=gp(d,'val.reels')||me.vmin;if(cm.valor/cm.vids>=vm){s+=20;why.push('Valor acima do seu mínimo')}else why.push('Abaixo do seu mínimo');s+=8;return{pct:Math.min(97,Math.max(35,s)),why}}
const hasProp=id=>{const cm=campOf(id);return mine('c').find(q=>q.camp.nome==cm.nome&&q.kn==cm.e&&['aberta','aceita','contrato'].includes(q.st))};
function cmRun(){const q=nz(CSR.q.trim()),vm=parseBR(CSR.vmin);const L=CMP.map(x=>({x,cp:ccompat(x)})).filter(({x})=>{if(q&&!(nz(x.nome).includes(q)||nz(x.e).includes(q)||x.nichos.some(n=>nz(n).includes(q))||nz(x.cid).includes(q)))return false;if(CSR.nich.length&&!x.nichos.some(n=>CSR.nich.includes(n)))return false;if(!nearReg({near:x.near},CSR.reg))return false;if(vm&&x.valor<vm)return false;return true});
L.sort((a,b)=>CSR.ord=='valor'?b.x.valor-a.x.valor:CSR.ord=='prazo'?(dparse(a.x.prazo)-dparse(b.x.prazo)):b.cp.pct-a.cp.pct);return L}
const cmSum=()=>{const a=[];if(CSR.nich.length)a.push(CSR.nich.slice(0,2).join(', ')+(CSR.nich.length>2?' +'+(CSR.nich.length-2):''));if(CSR.reg&&CSR.reg!='Sem preferência')a.push(CSR.reg);if(parseBR(CSR.vmin))a.push('a partir de R$ '+CSR.vmin);return a.length?a.join(' · '):'Nenhum filtro ativo'};
const cmCount=()=>{let n=0;if(CSR.nich.length)n++;if(CSR.reg&&CSR.reg!='Sem preferência')n++;if(parseBR(CSR.vmin))n++;return n};
function cmRes(){const L=cmRun(),n=cmCount();return`<p class="cap" style="text-align:left;margin:6px 0">${L.length} ${L.length==1?'campanha encontrada':'campanhas encontradas'} · ordenadas por ${({compat:'compatibilidade',valor:'maior valor',prazo:'prazo mais próximo'})[CSR.ord]}${n?` · ${n} ${n>1?'filtros':'filtro'} ativo${n>1?'s':''}`:''}</p>`
+(L.length?L.map(({x,cp})=>{const has=hasProp(x.id),k=calc(x.valor),cf=has?null:exCamp(x);return`<div class="cd rs"><div class="rt1"><span class="av2">${ini(x.e)}</span><div class="rtn"><b>${x.nome}</b><small>${x.e} · ${x.cid}</small></div><span class="mt" title="Compatibilidade com o seu perfil">${cp.pct}%</span></div><div class="rt2"><span>${x.nichos.join(', ')}</span><span>${x.vids} ${x.vids>1?'vídeos':'vídeo'} · ${x.fmt} · entrega até ${x.prazo}</span></div><div class="brk">${K([['Você recebe',`<b>${brl(x.valor)}</b>`],[FEEL+' · paga pela empresa',brl(k.fee)]])}</div><div>${cp.why.map(w=>`<span class="pl${/Abaixo/.test(w)?' w':''}">${w}</span>`).join(' ')}${exDias(x.excl)?` <span class="pl w">Exclusividade de ${exDias(x.excl)} dias</span>`:''}${cf?' <span class="pl dn">Conflito de exclusividade</span>':''}${has?' <span class="pl g">Proposta em andamento</span>':''}</div>${cf?`<p class="exn">${pyEsc(exTxt(cf,'c'))}</p>`:''}<div class="rb">${has?`<button type="button" class="bt" data-nx="open:${has.id}">Ver conversa</button>`:cf?`<button type="button" class="bt o" data-nx="camp:${x.id}">Ver detalhes</button>`:`<button type="button" class="bt" data-nx="camp:${x.id}">Ver e candidatar-se</button>`}</div></div>`}).join(''):`<div class="cd" style="text-align:center"><b>Nenhuma campanha com esses filtros</b><small>Tente ampliar a região ou limpar os filtros.</small></div><button class="bt o" data-sf="cclear">Limpar filtros</button>`)}
function cmBody(){const chips=[...new Set([...OPT.nichos,...CSR.nich])];
return`<p class="hi">Campanhas abertas. Candidate-se e converse com a empresa ou agência só pela Triskel.</p>`
+`<label>Buscar<input type="search" data-sf="cq" value="${pyEsc(CSR.q)}" placeholder="Campanha, empresa, nicho ou cidade" aria-label="Buscar campanhas" autocomplete="off"></label>`
+`<details class="fq sfp"${CSR.open?' open':''}><summary><span>Filtros<span class="sfsum" id="sfs">${cmSum()}</span></span><span class="sfn" id="sfn">${cmCount()}</span></summary><div class="sfb"><label>Nichos</label><div class="chg">${chips.map(n=>`<button type="button" class="sfc${CSR.nich.includes(n)?' on':''}" aria-pressed="${CSR.nich.includes(n)}" data-sf="cnich:${n}">${n}</button>`).join('')}</div>`
+`<label>Localização<select data-sf="creg">${['Sem preferência',...OPT.reg].map(x=>`<option${x==CSR.reg?' selected':''}>${x}</option>`).join('')}</select></label>`
+`<label>Valor mínimo por campanha, em reais<input data-sf="cvmin" inputmode="numeric" value="${pyEsc(CSR.vmin)}" placeholder="Ex.: 300 (sem mínimo)" data-nomask="1"></label>`
+`<label>Ordenar por<select data-sf="cord">${[['compat','Compatibilidade'],['valor','Maior valor'],['prazo','Prazo mais próximo']].map(([k,l])=>`<option value="${k}"${CSR.ord==k?' selected':''}>${l}</option>`).join('')}</select></label>`
+`<div class="sfa"><button type="button" class="bt o" data-sf="creset">Usar meu perfil</button><button type="button" class="lk" data-sf="cclear">Limpar filtros</button></div></div></details><div id="sres">${cmRes()}</div>`+POLICY}
const CAP={};
function applyBody(){const x=campOf(CSR.pick),cp=ccompat(x),has=hasProp(x.id),cf=has?null:exCamp(x),xd=exDias(x.excl);if(!CAP.id||CAP.id!=x.id)Object.assign(CAP,{id:x.id,valor:mkBRL(String(x.valor*100)),msg:`Olá! Tenho interesse na campanha “${x.nome}”. Posso entregar no prazo e adaptar o roteiro ao estilo da marca.`});const v=parseBR(CAP.valor);
return`<div class="gen"><span class="pl">Campanha aberta</span><h2>${x.nome}</h2><p>${x.e} · ${x.cid}</p><p>${x.desc}</p></div>`
+SHD('Condições')+Card(K([['Objetivo',x.obj],['Formato',x.fmt],['Vídeos',x.vids],['Entrega até',x.prazo],['Uso de imagem',x.uso+' · Instagram e TikTok'],['Ajustes','2 rodadas'],['Exclusividade',exLine(xd,dparse(x.prazo))]]))
+(cf?exBan(cf,'c'):xd&&!has?`<div class="np">${IC('lock',18,2)}<span>Esta campanha tem exclusividade. Depois de assinar o contrato, você não pode fechar campanhas de marcas do mesmo ramo (${pyEsc(x.seg)}) ou de ramos relacionados com entrega de ${fdt(dparse(x.prazo))} até ${fdt(new Date(dparse(x.prazo).getTime()+xd*864e5))}.</span></div>`:'')
+SHD('Valores')+brkCard(x.valor,'c')+`<p class="cap" style="text-align:left">A taxa de ${FPCT}% é paga pela empresa e não desconta do que você recebe.</p>`
+(has?`<button class="bt" data-nx="open:${has.id}">Ver conversa</button>`:cf?`<button class="bt o" data-g="c4">Buscar outras campanhas</button>`:SHD('Sua candidatura')+`<label>Valor que você quer receber (R$)<input data-nf="avalor" inputmode="numeric" value="${pyEsc(CAP.valor)}" placeholder="0,00"></label><div id="brk">${brkCard(v,'c')}</div><label>Mensagem<textarea rows="3" data-nf="amsg" placeholder="Conte por que você é a pessoa certa">${pyEsc(CAP.msg)}</textarea></label>`+POLICY)}
function applySend(){const x=campOf(CSR.pick),bad=mkBad(m);if(bad.length)return toast('Corrija: '+bad.slice(0,3).join(', ')+'.');const v=parseBR(CAP.valor);if(v<10)return toast('Informe o valor (mínimo R$ 10,00).');if(!CAP.msg.trim())return toast('Escreva uma mensagem.');const lk=leak(CAP.msg);if(lk)return toast(leakMsg(lk));
if(hasProp(x.id))return toast('Você já tem uma conversa para esta campanha.');{const cf=exCamp(x);if(cf)return toast(exTxt(cf,'c'))}
const q={id:'PR-'+(++PRN),k:x.k,kn:x.e,cr:ME,camp:{nome:x.nome,obj:x.obj,fmt:x.fmt,vids:x.vids,seg:x.seg,excl:exDias(x.excl)},st:'aberta',seed:0,un:{c:0,k:1},rounds:[{by:'c',valor:v,prazo:x.prazo,uso:x.uso,msg:CAP.msg.trim(),dt:new Date()}],msgs:[]};PRP.push(q);CTX.c=q.id;TH.c=q.id;delete CAP.id;toast('Candidatura enviada pela Triskel.');go('c_th')}

/* ---------- contrato (dinâmico, com taxa) ---------- */
function ctDyn(p){const q=ctxP(p);if(!q)return`<div class="cd" style="text-align:center"><b>Nenhuma proposta aceita ainda</b><small>Quando as partes chegarem a um acordo, o contrato aparece aqui.</small></div>`;const l=last(q),cr=crOf(q.cr),v=rl(p),k=calc(l.valor);
return Card(K([['Partes',pyEsc(cr.n+' · '+q.kn)],...(q.cli?[['Cliente',pyEsc(q.cli)]]:[]),['Campanha',pyEsc(q.camp.nome)],['Valor ao criador',brl(l.valor)],[v=='c'?FEEL+' · paga pelo contratante':FEEL,brl(k.fee)],[v=='c'?'Você recebe':'Total a pagar',`<b>${brl(v=='c'?l.valor:k.tot)}</b>`],['Prazo de entrega',pyEsc(l.prazo)],['Revisões','2 rodadas'],['Uso de imagem',pyEsc(l.uso)+' · Instagram e TikTok'],['Exclusividade',exLine(exInfo(q).dias,exInfo(q).pz)],['Conflito de exclusividade',exQ(q)?'<i style="color:#b42318;font-style:normal;font-weight:700">Há conflito</i>':'<i class="ok">Nenhum conflito ✓</i>']])+(exQ(q)?exBan(exQ(q),v):'')+Ck('Li e concordo com os termos. A análise da IA é apoio; a decisão final é humana.'))
+`<div class="np">${IC('lock',18,2)}<span>Valores combinados na negociação${q.rounds.length>1?' ('+q.rounds.length+' rodadas)':''}. A taxa de ${FPCT}% da Triskel está incluída acima. Prazo, entrega e pagamento seguem aqui na plataforma.</span></div>`+ctPanel(q,v,p)}

/* ---------- avisos e telas do fluxo guiado ---------- */
function pushBody(p){const q=ctxP(p,'open');if(!q)return N('Notificação push','Sem novidades','Quando houver resposta, o aviso aparece aqui.','Agora');const l=last(q),v=rl(p);
const t=l.by==v?'Proposta enviada':(q.rounds.length==1?'Nova proposta':'Contraproposta recebida'),b=l.by==v?`Sua proposta de ${brl(l.valor)} foi enviada para ${otherOf(q,p).split(' · ')[0]}.`:`${nameOf(q,l.by)} ${q.rounds.length==1?'enviou uma proposta':'respondeu com uma contraproposta'}: ${brl(l.valor)} até ${l.prazo}.`;
return N('Notificação push',t,b,dtf(l.dt))}
const flowBody=p=>{const q=ctxP(p,'open');if(!q)return`<div class="cd" style="text-align:center"><b>Nenhuma proposta em andamento</b><small>${p=='c'?'Candidate-se a uma campanha ou aguarde uma proposta.':'Escolha um criador e envie uma proposta.'}</small></div>`+BTN(p=='c'?'Buscar oportunidades':'Buscar criadores',p=='c'?'c4':p+'4');return Card(`<div class="thh"><span class="av2">${ini(otherOf(q,p).split(' · ')[0])}</span><div><b>${pyEsc(otherOf(q,p))}</b><small>${pyEsc(q.camp.nome)}</small></div></div>${stPill(q,p)}`)+rndCard(q,last(q),q.rounds.length-1,p)+actions(q,p)+POLICY};

/* ---------- registro das páginas ---------- */
[['e',1],['a',2]].forEach(([p,u])=>{const g=GI[p];
pg(g,u,p+'_cr','Perfil do criador','Menu · Busca',()=>crBody(p),[]);
pg(g,u,p+'_sent','Proposta enviada','Menu · Busca',()=>sentBody(p),[]);
S[p+'4'].t=p=='a'?'Buscar criadores':'Buscar criadores';S[p+'4'].b=()=>srcBody(p);S[p+'4'].o=()=>p=='a'?[]:[];
S[p+'5'].t='Enviar proposta';S[p+'5'].h=p=='a'?'HU12':'HU07';S[p+'5'].b=()=>cmpBody(p);S[p+'5'].o=()=>[['Enviar proposta','','','','','data-nx="send"'],['Voltar à busca',p+'4','o']];S[p+'5'].n=p+'6'});
[['c',0],['e',1],['a',2]].forEach(([p,u])=>{const g=GI[p];
pg(g,u,p+'_ct','Contatos','Menu · Contatos',()=>ctBody(p),[]);
pg(g,u,p+'_th','Conversa','Menu · Contatos',()=>thBody(p),[]);
S[p+'6'].b=()=>pushBody(p);S[p+'6'].o=()=>[['Abrir conversa','','','','',`data-nx="open:${(ctxP(p)||{}).id||''}"`]];
S[p+'7'].t=p=='c'?'Condições ok?':'Criador aceita?';S[p+'7'].b=()=>flowBody(p);S[p+'7'].o=[];
S[p+'8'].t=p=='c'?'Negociar proposta':'Negociar condições';S[p+'8'].h=p=='c'?'HU04':'Contraproposta';S[p+'8'].b=()=>cpBody(p);S[p+'8'].o=()=>{const q=ctxP(p,'open');return q&&q.st=='aberta'&&turn(q)==rl(p)?[[p=='c'?'Enviar contraproposta':'Enviar nova proposta','','','','','data-nx="cpsend"'],['Voltar à conversa','','o','','',`data-nx="open:${q.id}"`]]:[]};
S[p+'9'].b=()=>flowBody(p);S[p+'9'].o=[];
S[p+'10'].b=()=>ctDyn(p)+(p!='c'&&(ctxP(p)||{}).st=='aceita'?resumo(p):p!='c'&&(ctxP(p)||{}).st=='contrato'?`<div class="np ok">${IC('lock',18,2)}<span>Contrato pago com o saldo da carteira. O valor está em custódia até a aprovação da entrega e a confirmação da publicação.</span></div>`:'')+(p=='c'?`<div class="np">${IC('lock',18,2)}<span>O contratante paga com o saldo da carteira ao confirmar o contrato. O valor fica em custódia na Triskel e é liberado para você quando a entrega for aprovada e a Triskel confirmar a publicação do seu post.</span></div>`:'')});
['e','a'].forEach(p=>{S[p+'10'].o=()=>{const q=ctxP(p);if(!q)return[['Buscar criadores',p+'4']];const op=['Ver conversa','','o','','',`data-nx="open:${q.id}"`];if(q.st=='contrato')return[['Acompanhar a entrega',p+'11'],op];if(q.st!='aceita')return[op,['Buscar criadores',p+'4','o']];
return walOf(p).saldo>=calc(ctv(p)).tot?[['Pagar com o saldo e confirmar','','','','',`data-py="walpay:${p}"`],['Adicionar saldo','','o','','',`data-py="topup:${p}:${p}10:0"`],op]:[['Adicionar saldo para pagar','','','','',`data-py="topup:${p}:${p}10:${short(p)}"`],op]}});
S.c10.o=()=>{const q=ctxP('c');if(!q)return[['Buscar oportunidades','c4']];const op=['Ver conversa','','o','','',`data-nx="open:${q.id}"`];if(q.st=='contrato')return q.signed?[['Ir para a produção','c11'],op]:[['Assinar contrato','','','','','data-nx="sign"'],op];return[op]};
S.c4.b=()=>cmBody();S.c4.o=[];S.c4.t='Buscar oportunidades';
S.c5.t='Candidatar-se';S.c5.b=()=>applyBody();S.c5.o=()=>{const x=campOf(CSR.pick);return hasProp(x.id)||exCamp(x)?[['Buscar oportunidades','c4','o']]:[['Candidatar-se','','','','','data-nx="apply"'],['Voltar às campanhas','c4','o']]};

/* ---------- Painel, KPIs e perfil ---------- */
const ATTD={c:Cd('Entrega em produção','Linha de doces coloniais · prazo 25/11','Ver briefing','c11'),e:Cd('Marjorie Moreira enviou o vídeo','Linha de doces coloniais · relatório da IA pronto','Revisar entrega','e14'),a:Cd('Entrega de Marjorie Moreira','Cliente Doce Vale · relatório da IA pronto','Revisar entrega','a14')};
function attTxt(q,p){const v=rl(p),l=last(q),who=nameOf(q,l.by),cr=crOf(q.cr).n;if(q.st=='aceita')return[`${cr} aceitou a proposta`,`${q.camp.nome} · ${brl(l.valor)} · falta confirmar e pagar`,'Revisar contrato'];
return[q.rounds.length==1?(v=='c'?`Proposta de ${q.kn}`:`Candidatura de ${cr}`):`Contraproposta de ${who}`,`${q.camp.nome} · ${brl(l.valor)}${q.venc?' · '+q.venc:''}`,'Responder']}
function attLive(p){const L=mine(p).filter(q=>needs(q,p)).slice(0,2);return L.map(q=>{const[t,s,c]=attTxt(q,p);return`<div class="cd tpx" role="button" tabindex="0" data-nx="open:${q.id}"><b>${pyEsc(t)}</b><small>${pyEsc(s)}</small><em>${c}</em></div>`}).join('')+dlAtt(p)+`<div class="cd tpx" role="button" tabindex="0" data-g="${p}_ct"><b>Contatos</b><small>${mine(p).length} conversas · ${mine(p).filter(q=>needs(q,p)).length} aguardam você</small><em>Abrir contatos</em></div>`}
function kpiLive(p,k){if(p=='c'){const w=wal(),L=mine('c'),n=L.filter(q=>q.st=='aberta'&&turn(q)=='c').length;return k.map((x,i)=>i==0?[String(n),'Propostas novas',n?(n>1?'Aguardam a sua resposta':'Aguarda a sua resposta'):'Nenhuma pendente']:i==2?[brl0(w.cust),'A receber',w.cust>0?'Libera após aprovação':'Nada pendente']:x)}
const L=mine(p),resp=L.filter(q=>q.rounds.some(r=>r.by=='c')||['recusada'].includes(q.st)).length,nr=dlList(p).filter(q=>dlOf(q).st=='aprov').length;return k.map((x,i)=>(p=='e'&&i==1)||(p=='a'&&i==2)?[String(L.length),'Propostas enviadas',resp+' '+(resp==1?'respondeu':'responderam')]:/^Entregas? para revisar/i.test(x[1])?[String(nr),nr==1?'Entrega para revisar':'Entregas para revisar',nr?'Relatório da IA pronto':'Nenhuma pendente']:x)}
['c','e','a'].forEach(p=>{const k=p+'_pv',b0=S[k].b;S[k].b=()=>(typeof b0=='function'?b0():b0)+(ST[p].comp?ctSec(p):'')});
/* Painel: sugestões dinâmicas para o criador */
{const k='c_pn',b0=S[k].b;S[k].b=()=>{let h=(typeof b0=='function'?b0():b0);if(!ST.c.fresh){const x=cmRun().find(({x})=>!hasProp(x.id));if(x){const r=SHD('Sugeridas pela IA para o seu perfil')+`<div class="cd tpx" role="button" tabindex="0" data-nx="camp:${x.x.id}"><b>${x.x.nome}</b><small>${x.x.e} · ${brl(x.x.valor)} · ${x.x.vids} ${x.x.vids>1?'vídeos':'vídeo'} · ${x.cp.pct}% compatível</small></div>`;h=h.replace(/<h3 class="sh">Sugeridas pela IA para o seu perfil<\/h3>[\s\S]*$/,r)}}return h}}

/* ---------- eventos ---------- */
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;const sf=t.closest('[data-sf]');
if(sf&&!/^(INPUT|SELECT)$/.test(sf.tagName)){const[a,...r]=sf.dataset.sf.split(':'),arg=r.join(':'),p=(profOf(cur)||PF[1]).p,res=()=>{const rs=$('#sres');if(rs)rs.innerHTML=(cur=='c4'?cmRes():srcRes(p));const n=$('#sfn');if(n)n.textContent=cur=='c4'?cmCount():srcCount(p);const sm=$('#sfs');if(sm)sm.textContent=cur=='c4'?cmSum():srcSum(p)};
const tog=(arr,v)=>{const i=arr.indexOf(v);i>=0?arr.splice(i,1):arr.push(v)};
if(a=='nich'){tog(srcGet(p).nich,arg);sf.classList.toggle('on');sf.setAttribute('aria-pressed',sf.classList.contains('on'));return res()}
if(a=='porte'){tog(srcGet(p).porte,arg);sf.classList.toggle('on');sf.setAttribute('aria-pressed',sf.classList.contains('on'));return res()}
if(a=='cnich'){tog(CSR.nich,arg);sf.classList.toggle('on');sf.setAttribute('aria-pressed',sf.classList.contains('on'));return res()}
if(a=='clear'){const f=srcGet(p);Object.assign(f,{q:'',nich:[],reg:'Sem preferência',porte:[],nota:'Sem mínimo',vmax:'',ord:'compat'});return refresh()}
if(a=='reset'){const s=srcGet(p).sel,o=srcGet(p).open;SRCH[p]=srcInit(p);SRCH[p].sel=s;SRCH[p].open=o;return refresh()}
if(a=='cclear'){Object.assign(CSR,{q:'',nich:[],reg:'Sem preferência',vmin:'',ord:'compat'});return refresh()}
if(a=='creset'){Object.assign(CSR,{q:'',nich:[...((PD.c&&PD.c.nichos)||[])],reg:'Pelotas e região',vmin:'',ord:'compat'});return refresh()}}
const el=t.closest('[data-nx]');if(!el)return;e.stopPropagation();const[a,...r]=el.dataset.nx.split(':');nx(a,r)},true);
document.addEventListener('toggle',e=>{const d=e.target;if(!d.classList||!d.classList.contains('sfp'))return;const p=(profOf(cur)||PF[1]).p;if(cur=='c4')CSR.open=d.open?1:0;else if(SRCH[p]||cur==p+'4')srcGet(p).open=d.open?1:0},true);
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset)return;const p=(profOf(cur)||PF[1]).p;
if(t.dataset.sf){const k=t.dataset.sf,rs=()=>{const x=$('#sres');if(x)x.innerHTML=(cur=='c4'?cmRes():srcRes(p));const n=$('#sfn');if(n)n.textContent=cur=='c4'?cmCount():srcCount(p);const sm=$('#sfs');if(sm)sm.textContent=cur=='c4'?cmSum():srcSum(p)};
if(k=='q'){srcGet(p).q=t.value;rs()}else if(k=='vmax'){t.value=t.value.replace(/\D/g,'').slice(0,6);srcGet(p).vmax=t.value;rs()}else if(k=='cq'){CSR.q=t.value;rs()}else if(k=='cvmin'){t.value=t.value.replace(/\D/g,'').slice(0,6);CSR.vmin=t.value;rs()}}
else if(t.dataset.nf){const k=t.dataset.nf;
if(k=='valor'||k=='prazo'||k=='uso'||k=='msg'){const F=cur==p+'8'?CPF[p]:frmGet(p,cmpIds(p));if(!F)return;F[k]=t.value;if(k=='valor'){const b=$('#brk');if(b)b.innerHTML=cur==p+'8'?brkCard(parseBR(t.value),rl(p)):brkLive(p,parseBR(t.value),cmpIds(p).length)}if(k=='prazo'){const w=$('#exw');if(w)w.innerHTML=cur==p+'8'?exCpt(p,ctxP(p,'open'),F):exCmp(p,cmpIds(p),F)}}
else if(k=='avalor'){CAP.valor=t.value;const b=$('#brk');if(b)b.innerHTML=brkCard(parseBR(t.value),'c')}else if(k=='amsg')CAP.msg=t.value;
if(t.getAttribute('aria-invalid')&&k=='msg'&&!leak(t.value))t.removeAttribute('aria-invalid')}
else if(t.dataset.th&&t.getAttribute('aria-invalid')&&!leak(t.value))t.removeAttribute('aria-invalid')});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;const p=(profOf(cur)||PF[1]).p;
if(t.dataset.sf){const k=t.dataset.sf;if(['reg','nota','ord'].includes(k)){srcGet(p)[k]=t.value;const x=$('#sres');if(x)x.innerHTML=srcRes(p);const n=$('#sfn');if(n)n.textContent=srcCount(p);const sm=$('#sfs');if(sm)sm.textContent=srcSum(p)}
else if(k=='creg'||k=='cord'){CSR[k=='creg'?'reg':'ord']=t.value;const x=$('#sres');if(x)x.innerHTML=cmRes();const n=$('#sfn');if(n)n.textContent=cmCount();const sm=$('#sfs');if(sm)sm.textContent=cmSum()}}
else if(t.dataset.nf=='uso'){const F=cur==p+'8'?CPF[p]:frmGet(p,cmpIds(p));if(F)F.uso=t.value}});
document.addEventListener('keydown',e=>{const el=e.target.closest&&e.target.closest('[data-nx][role=button],[data-g][role=button]');if(el&&(e.key=='Enter'||e.key==' ')){e.preventDefault();el.click()}});

/* =====================================================================
   Entrega: envio do vídeo/post, análise da IA (simulada), aprovação do
   contratante, publicação confirmada pela Triskel e liberação da custódia
   ===================================================================== */
const DLX={c:null,e:null,a:null},PB={q:null,run:0,url:''};
const DRF={tipo:'video',nome:'',tam:'',durN:32,up:0,url:'',mode:'ok',k:''};
let ADJ='',DLT=0,DLU=0;
const REQI=[['logo','Logo nos primeiros 10 s'],['prod','Produto apresentado'],['msg','Mensagem principal citada'],['men','Menção à marca'],['dur','Duração máxima de 60 s'],['fmt','Formato vertical 9:16'],['hum','Conteúdo humanizado (mín. 60%)'],['tec','Qualidade técnica (imagem e áudio)']];
const POSTRX=/^(https?:\/\/)?(www\.|m\.)?(instagram\.com\/(p|reel|reels|tv)\/[\w-]{5,}|tiktok\.com\/@[\w.]+\/video\/\d{8,}|vm\.tiktok\.com\/[\w-]{5,})/i;
const dlOf=q=>q&&q.st=='contrato'?(q.dl||(q.dl={st:'prod',env:[],aj:0,cmt:'',pub:null,rel:null})):null;
const dlList=p=>mine(p).filter(q=>q.st=='contrato');
const lastEnv=d=>d.env[d.env.length-1];
const dlNeeds=(q,p)=>{const d=dlOf(q);if(!d)return false;if(p=='c')return !q.signed||['prod','ia','aprovado'].includes(d.st);return d.st=='aprov'};
function dlq(p){const L=dlList(p);return L.find(x=>x.id==DLX[p])||L.find(x=>dlNeeds(x,p))||L[0]||null}
function dlPill(q,p){const d=dlOf(q),c=p=='c';if(c&&!q.signed)return['w','Assine o contrato'];
switch(d.st){case'prod':return c?(d.cmt?['w','Ajustes pedidos']:['','Em produção']):['','Aguardando o criador'];
case'ia':return c?['w','Envie para aprovação']:['','Em análise da IA'];
case'aprov':return c?['','Aguardando aprovação']:['w','Sua vez: revisar'];
case'aprovado':return c?['w','Aprovada · publique o post']:['','Aguardando publicação'];
default:return['g','Pagamento liberado']}}
const noDl=p=>Card(`<div style="text-align:center"><b>Nenhum contrato em andamento</b><small>${p=='c'?'Quando um contratante pagar um contrato aceito, a produção começa aqui.':'Quando você pagar um contrato, o acompanhamento da entrega começa aqui.'}</small></div>`)+BTN(p=='c'?'Abrir contatos':'Abrir contatos',p+'_ct');
const dlTop=(q,p)=>{const other=otherOf(q,p),[c,l]=dlPill(q,p);return Card(`<div class="thh"><span class="av2">${ini(other.split(' · ')[0])}</span><div><b>${pyEsc(other)}</b><small>${pyEsc(q.camp.nome)} · prazo ${pyEsc(last(q).prazo)}</small></div></div><span class="pl ${c}">${l}</span>`)};
function dlSteps(q,p){const d=dlOf(q),s=d.st,pag=!!q.tx,rank={prod:0,ia:1,aprov:2,aprovado:3,liberado:5}[s];
const row=(l,ok,now)=>[l,ok?'<i class="ok">✓ Concluído</i>':now?'<b>Agora</b>':'—'];
return Card(K([row('Contrato pago e valor em custódia',pag,0),row('Produção e envio do vídeo ou post',rank>=2||(rank==1),rank<1),row('Análise da IA',d.env.length>0&&(lastEnv(d).ia.ok),d.env.length>0&&!lastEnv(d).ia.ok),row('Aprovação do contratante',rank>=3,rank==2),row('Publicação confirmada pela Triskel',rank>=5,rank==3),row('Pagamento liberado ao criador',rank>=5,0)]))}
function dlNext(q,p){const d=dlOf(q),c=p=='c';if(!q)return[];
if(c){if(!q.signed)return[['Assinar contrato','','','','',`data-nx="contract:${q.id}"`]];return{prod:[['Enviar entrega','c12']],ia:[['Ver análise da IA','c14']],aprov:[['Acompanhar aprovação','c15']],aprovado:[['Publicar e confirmar','c_pb']],liberado:[['Ver pagamento liberado','c18']]}[d.st]}
return{prod:[['Atualizar acompanhamento',p+'12']],ia:[['Atualizar acompanhamento',p+'12']],aprov:[['Ler relatório da IA',p+'14']],aprovado:[['Ver publicação',p+'17']],liberado:[['Ver pagamento',p+'17']]}[d.st]}

/* ---- análise da IA (simulada) ---- */
function dlIA(mode,tipo,durN){const bad=mode=='bad',longo=tipo=='video'&&durN>60;
const it=REQI.map(([k,l])=>{let ok=true,det='Cumprido';
if(k=='dur'){ok=!longo;det=(tipo=='video'?durN:28)+' s / máx. 60 s'}
if(k=='fmt')det='9:16';if(k=='tec')det='Aprovado';
if(k=='hum'){ok=!bad;det=bad?'57% (mín. 60%)':'74% (mín. 60%)'}
if(k=='logo'&&bad){ok=false;det='Logo aparece aos 14 s'}
return{k,l,ok,det}});
const okAll=it.every(x=>x.ok);return{ok:okAll,score:okAll?94:68,it,dt:new Date()}}
const iaRows=ia=>ia.it.map(x=>[x.l,x.ok?`<i class="ok">✓ ${x.det}</i>`:`<i class="wn">! ${x.det}</i>`]);
const vidCard=e=>e.tipo=='post'?Card(`<div class="pyst">${IC('check',16,2.4)}<span>Link do post enviado</span></div>`+K([['Link',`<span class="brk-u">${pyEsc(e.url.replace(/^https?:\/\//,''))}</span>`],['Enviado em',dtf(e.dt)],['Rodada',e.n]]))
:`<div class="vp" role="img" aria-label="Pré-visualização do vídeo"><span class="vpb"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><small>${pyEsc(e.nome)} · ${e.durN} s · ${pyEsc(e.tam)}</small></div>`+Card(K([['Arquivo',pyEsc(e.nome)],['Duração',e.durN+' s'],['Enviado em',dtf(e.dt)],['Rodada',e.n]]));
function mkEnv(q,F){const d=dlOf(q),tipo=F.tipo,e={n:d.env.length+1,tipo,nome:tipo=='video'?F.nome:'',tam:tipo=='video'?F.tam:'',durN:tipo=='video'?F.durN:0,url:tipo=='post'?F.url.trim():'',dt:new Date(),ia:dlIA(F.mode,tipo,F.durN),dec:null,cmt:''};d.env.push(e);d.st=e.ia.ok?'ia':'prod';return e}
const sampleEnv=(q,mode)=>mkEnv(q,{tipo:'video',nome:'doces_coloniais_v'+(dlOf(q).env.length+1)+'.mp4',tam:'46 MB',durN:32,url:'',mode});

/* ---- pagamento do contrato (também usado na simulação do contratante) ---- */
function payQ(q){const v=last(q).valor,k=calc(v),p=q.k;if(p!='x'&&walOf(p).saldo<k.tot)return null;
const t={id:'TRX-'+rid(8),kind:'pay',payer:p,desc:q.camp.nome,cr:crOf(q.cr).n,valor:v,fee:k.fee,total:k.tot,met:'saldo',det:SALDO,st:'custodia',dt:new Date()};TXS.unshift(t);q.st='contrato';q.tx=t.id;signAs(q,'k');
sysMsg(q,`Contrato pago por ${q.kn}. ${brl(v)} ficam em custódia até a aprovação da entrega e a confirmação da publicação.`);markUnread(q,'c');return t}

/* ---- decisão do contratante e liberação ---- */
function dlDecide(q,how,cmt){const d=dlOf(q);if(!d||d.st!='aprov')return false;const e=lastEnv(d);
if(how=='approve'){e.dec='aprovada';d.st='aprovado';sysMsg(q,`Entrega aprovada por ${q.kn}. Falta a publicação: o pagamento é liberado quando a Triskel confirmar o post no ar.`);markUnread(q,'c')}
else{e.dec='ajustes';e.cmt=cmt;d.aj++;d.cmt=cmt;d.st='prod';sysMsg(q,`${q.kn} pediu ajustes (${d.aj} de 2): “${cmt}”`);markUnread(q,'c')}
return true}
function dlRelease(q,url){const d=dlOf(q);if(!d||d.st!='aprovado')return null;const t=TXS.find(x=>x.id==q.tx);if(t&&t.st=='custodia'){t.st='liberado';t.rel=new Date()}
d.pub={url:url||'',dt:new Date()};d.st='liberado';d.rel=new Date();
sysMsg(q,`Publicação confirmada pela Triskel. ${brl(last(q).valor)} foram liberados para ${crOf(q.cr).n}.`);markUnread(q,'c');markUnread(q,'k');return t}

/* ---- Entregas (lista) ---- */
function enBody(p){const L=dlList(p),n=L.filter(q=>dlNeeds(q,p)).length;
if(!L.length)return`<p class="hi">Aqui você acompanha vídeo, análise da IA, aprovação, publicação e pagamento de cada contrato.</p>`+noDl(p);
return`<p class="hi">Do envio do vídeo à liberação do pagamento, tudo acontece aqui, pela Triskel.</p>`+KP([[String(L.length),'Contratos',''],[String(n),'Aguardam você',n?'Veja abaixo':'Tudo em dia']])
+L.map(q=>{const other=otherOf(q,p),[c,l]=dlPill(q,p);return`<button class="ctc" data-dl="open:${q.id}"><span class="av2">${ini(other.split(' · ')[0])}</span><span class="ctt"><b>${pyEsc(other.split(' · ')[0])}</b><small>${pyEsc(q.camp.nome)} · ${brl(last(q).valor)}</small><small class="ctl">Prazo ${pyEsc(last(q).prazo)}</small></span><span class="cts"><em class="pl ${c}">${l}</em></span></button>`}).join('')+POLICY}

/* ---- criador: briefing e produção ---- */
function prodBody(){const q=dlq('c');if(!q)return noDl('c');const d=dlOf(q),L=dlList('c');
if(!q.signed)return`<div class="np">${IC('lock',18,2)}<span>O contrato de ${pyEsc(q.kn)} foi pago e o valor está em custódia. Assine o contrato para começar a produção.</span></div>`;
return`<p class="hi">${pyEsc(q.camp.nome)} · ${pyEsc(q.kn)}. Envie o vídeo ou o link do post pela Triskel para a IA conferir os requisitos.</p>`
+(d.cmt&&d.st=='prod'?`<div class="np">${IC('chat',18,2)}<span><b>Pedido de ajustes de ${pyEsc(q.kn)}:</b> “${pyEsc(d.cmt)}”</span></div>`:'')
+dlTop(q,'c')+Card(K([['Você recebe',`<b>${brl(last(q).valor)}</b>`],['Prazo de entrega',pyEsc(last(q).prazo)],['Uso de imagem',pyEsc(last(q).uso)],['Revisões','2 rodadas']]))
+SHD('Requisitos analisados pela IA')+Card(REQI.map(([k,l])=>`<div class="rqi">${IC('check',14,2.4)}<span>${l}</span></div>`).join(''))
+SHD('Etapas')+dlSteps(q,'c')+POLICY}
const dlOpt=(p,extra)=>()=>{const q=dlq(p);if(!q)return[[p=='c'?'Abrir contatos':'Abrir contatos',p+'_ct']];return[...(dlNext(q,p)||[]),...(extra?extra(q):[])]};

/* ---- criador: enviar vídeo ou post ---- */
const DLUP=()=>{clearInterval(DLU);DLU=setInterval(()=>{if(cur!='c12'||DRF.up>=100){clearInterval(DLU);return}DRF.up=Math.min(100,DRF.up+25);const b=$('#upb'),t=$('#upt');if(b)b.style.width=DRF.up+'%';if(t)t.textContent=DRF.up>=100?'Envio concluído':'Enviando… '+DRF.up+'%';if(DRF.up>=100)clearInterval(DLU)},260)};
function sendBody(){const q=dlq('c');if(!q)return noDl('c');const d=dlOf(q);
if(!q.signed)return`<div class="np">${IC('lock',18,2)}<span>Assine o contrato antes de enviar a entrega.</span></div>`;
if(d.st!='prod'){const[c,l]=dlPill(q,'c');return Card(`<div style="text-align:center"><b>${l}</b><small>${d.st=='ia'?'A análise da IA terminou. Envie a entrega para aprovação.':d.st=='aprov'?'A entrega está com '+pyEsc(q.kn)+' para aprovação.':d.st=='aprovado'?'A entrega foi aprovada. Falta publicar e confirmar.':'Esta entrega já foi concluída.'}</small></div>`)}
if(DRF.k!=q.id+':'+d.env.length){Object.assign(DRF,{tipo:'video',nome:'',tam:'',durN:32,up:0,url:'',mode:'ok',k:q.id+':'+d.env.length})}
const F=DRF,rodada=d.env.length+1;
return`<p class="hi">Envie o vídeo ou o link do post. A IA confere o briefing antes de a entrega seguir para ${pyEsc(q.kn)}.</p>`
+(d.cmt?`<div class="np">${IC('chat',18,2)}<span><b>Ajustes pedidos:</b> “${pyEsc(d.cmt)}”</span></div>`:'')
+Card(K([['Campanha',pyEsc(q.camp.nome)],['Prazo de entrega',pyEsc(last(q).prazo)],['Envio',rodada+'º']]))
+`<div class="chg" role="group" aria-label="Tipo de entrega"><button type="button" class="sfc${F.tipo=='video'?' on':''}" aria-pressed="${F.tipo=='video'}" data-dl="tab:video">Enviar vídeo</button><button type="button" class="sfc${F.tipo=='post'?' on':''}" aria-pressed="${F.tipo=='post'}" data-dl="tab:post">Link do post</button></div>`
+(F.tipo=='video'?(F.nome?Card(`<div class="pyst">${IC('check',16,2.4)}<span>${pyEsc(F.nome)}</span></div>`+K([['Tamanho',pyEsc(F.tam)],['Duração',F.durN+' s']])+`<div class="pgb"><i id="upb" style="width:${F.up}%"></i></div><small id="upt" class="cap" style="text-align:left">${F.up>=100?'Envio concluído':'Enviando… '+F.up+'%'}</small>`):'')
+`<input type="file" accept="video/*" data-dl-file hidden><button type="button" class="bt o" data-dl="pickfile">${F.nome?'Trocar vídeo':'Escolher vídeo no aparelho'}</button><button type="button" class="lk" data-dl="sample">Usar vídeo de exemplo</button><p class="cap" style="text-align:left">Vertical 9:16, até 60 s.</p>`
:`<label>Link do post (Instagram ou TikTok)<input data-dl-url inputmode="url" autocomplete="off" value="${pyEsc(F.url)}" placeholder="instagram.com/reel/Cxyz123" data-nomask="1"></label><p class="cap" style="text-align:left">O post precisa estar público. A Triskel confere o conteúdo e a menção à marca.</p>`)
+`<div class="sim"><b>Simulação · resultado da análise da IA</b><small>No uso real, a IA analisa o vídeo de verdade. Aqui você escolhe o resultado para ver os dois caminhos.</small><label>Resultado<select data-dl-mode><option value="ok"${F.mode=='ok'?' selected':''}>Dentro dos padrões</option><option value="bad"${F.mode=='bad'?' selected':''}>Fora dos padrões</option></select></label></div>`+POLICY}
const sendOpt=()=>{const q=dlq('c');if(!q||!q.signed)return[];const d=dlOf(q);return d.st=='prod'?[['Enviar para análise da IA','','','','','data-dl="submit"'],['Voltar ao briefing','c11','o']]:dlNext(q,'c')||[]};

/* ---- análise da IA: tela de processamento (animada) ---- */
function procBody(p){const q=dlq(p),d=dlOf(q);if(!q||!d||!d.env.length)return`<div class="cd" style="text-align:center"><b>Nenhuma entrega em análise</b></div>`+BTN('Voltar',p=='c'?'c11':p+'12');const e=lastEnv(d);
return Card(`<div class="pyst">${IC('clock',16,2)}<span>${p=='c'?'Analisando a sua entrega':'A IA está analisando a entrega'}</span></div><div class="pgb"><i id="iaPb" style="width:0%"></i></div><small class="cap" style="text-align:left">A IA compara ${e.tipo=='video'?'o vídeo':'o post'} com o briefing. É uma simulação de cerca de 3 segundos.</small>`)
+Card(e.ia.it.map((x,i)=>`<div class="iar w" id="iar${i}" data-ok="${x.ok?1:0}" data-det="${pyEsc(x.det)}"><span class="iai"></span><span>${x.l}</span><i class="iav">Aguardando</i></div>`).join(''))}
function dlAnim(pref,n,ms,done){const my=++DLT,id=cur;let i=0;const step=()=>{if(my!=DLT||cur!=id)return;const el=$('#'+pref+i),pb=$('#'+(pref=='iar'?'iaPb':'pbPb'));if(!el){return}
el.className=(el.className||'').replace(/\bw\b/,'r');const v=el.querySelector('.iav');if(v)v.textContent='Verificando…';
setTimeout(()=>{if(my!=DLT||cur!=id)return;const ok=el.dataset.ok=='1';el.className='iar '+(ok?'ok':'no');if(v)v.textContent=(ok?'✓ ':'! ')+(el.dataset.det||'');if(pb)pb.style.width=Math.round((i+1)/n*100)+'%';i++;if(i<n)step();else setTimeout(()=>{if(my==DLT&&cur==id)done()},500)},ms)};step()}
function dlHook(){DLT++;clearInterval(DLU);
if(cur=='c13'||cur=='e13'||cur=='a13'){const p=cur[0];dlAnim('iar',REQI.length,300,()=>go(p+'14','p'))}
else if(cur=='c_pb'&&PB.run){dlAnim('pbr',5,420,()=>{const q=PRP.find(x=>x.id==PB.q);PB.run=0;if(q)dlRelease(q,PB.url);go('c18','p')})}
else if(cur=='c12'&&DRF.nome&&DRF.up<100)DLUP()}
{const _dl=draw;draw=function(){_dl.apply(this,arguments);dlHook()}}

/* ---- relatório da IA (criador e contratante) ---- */
function repBody(p){const q=dlq(p),d=dlOf(q);if(!q||!d||!d.env.length)return`<div class="cd" style="text-align:center"><b>${p=='c'?'Nenhuma entrega analisada ainda':'Nenhuma entrega para revisar'}</b><small>${p=='c'?'Envie o vídeo ou o link do post para a IA analisar.':'Quando o criador enviar, o relatório da IA aparece aqui.'}</small></div>`+BTN(p=='c'?'Enviar entrega':'Acompanhar entregas',p=='c'?'c12':p+'11');
const e=lastEnv(d),ia=e.ia,[c,l]=dlPill(q,p);
return(p=='c'?'':`<p class="hi">Entrega de ${pyEsc(crOf(q.cr).n)} · ${pyEsc(q.camp.nome)}</p>`+vidCard(e))
+`<div class="rd"><div class="rdh"><b>Relatório da IA</b><small>${dtf(ia.dt)}</small></div><div style="padding:2px 0 8px"><span class="pl ${ia.ok?'':'w'}">${ia.ok?'Dentro dos padrões':'Fora dos padrões'}</span> <span class="pl">Pontuação ${ia.score}/100</span></div>`+K(iaRows(ia))+`</div>`
+(p=='c'?(ia.ok?`<div class="np ok">${IC('check',18,2)}<span>Sua entrega segue os padrões do briefing. Envie para a aprovação de ${pyEsc(q.kn)}.</span></div>`:`<div class="np">${IC('lock',18,2)}<span>A entrega ainda não segue todos os padrões. Corrija os itens com “!” e envie de novo. Ela só vai para o contratante depois de passar na análise.</span></div>`):`<p class="cap" style="text-align:left">Resultado de apoio: a decisão final é sua.</p>`)}
const repOpt=p=>()=>{const q=dlq(p),d=dlOf(q);if(!q||!d||!d.env.length)return[];const e=lastEnv(d);
if(p=='c')return d.st=='ia'?[['Enviar para aprovação','','','','','data-dl="send"'],['Enviar outro arquivo','','o','','','data-dl="fix"']]:d.st=='prod'&&!e.ia.ok?[['Corrigir e reenviar','','','','','data-dl="fix"']]:dlNext(q,'c')||[];
return d.st=='aprov'?[['Continuar para a decisão',p+'15']]:dlNext(q,p)||[]};

/* ---- criador: aguardando aprovação / resultado ---- */
function waitBody(){const q=dlq('c');if(!q)return noDl('c');const d=dlOf(q),[c,l]=dlPill(q,'c');
const base=dlTop(q,'c')+SHD('Etapas')+dlSteps(q,'c');
if(d.st=='aprov')return`<div class="np">${IC('clock',18,2)}<span>Sua entrega está com ${pyEsc(q.kn)}. Você recebe um aviso aqui assim que houver resposta.</span></div>`+base
+`<div class="sim"><b>Simulação · responder como ${pyEsc(q.kn)}</b><small>No uso real, a decisão chega do contratante pela Triskel. Aqui você escolhe o que acontece.</small><button class="bt" data-dl="sim-approve">${pyEsc(q.kn)} aprova a entrega</button><button class="bt o" data-dl="sim-adjust">${pyEsc(q.kn)} pede ajustes</button></div>`;
return`<div class="np">${IC('lock',18,2)}<span>${d.st=='prod'?'Não há entrega aguardando aprovação.':d.st=='ia'?'A análise da IA terminou. Envie a entrega para aprovação.':d.st=='aprovado'?'Entrega aprovada. Falta publicar o post.':'Entrega concluída.'}</span></div>`+base}
function resBody(){const q=dlq('c');if(!q)return noDl('c');const d=dlOf(q);
if(d.st=='aprovado'||d.st=='liberado')return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Entrega aprovada</h2><p>${pyEsc(q.kn)} aprovou a sua entrega. ${d.st=='liberado'?'O pagamento já foi liberado.':'Agora publique o post e confirme pela Triskel. O pagamento é liberado depois da confirmação.'}</p></div>`+dlSteps(q,'c');
if(d.st=='prod'&&d.cmt)return`<div class="np">${IC('chat',18,2)}<span>${pyEsc(q.kn)} pediu ajustes. Faça as mudanças e reenvie.</span></div>`+Card(`<b>Comentário de ${pyEsc(q.kn)}</b><p style="margin:6px 0 0;line-height:1.5">“${pyEsc(d.cmt)}”</p>`)+Card(K([['Pedidos de ajuste',d.aj+' de 2'],['Prazo de entrega',pyEsc(last(q).prazo)]]));
return`<div class="cd" style="text-align:center"><b>Sem resposta ainda</b><small>${d.st=='aprov'?'Aguardando a decisão de '+pyEsc(q.kn)+'.':'Envie a entrega para o contratante decidir.'}</small></div>`}
const resOpt=()=>{const q=dlq('c');if(!q)return[];const d=dlOf(q);if(d.st=='aprovado')return[['Publicar e confirmar','c_pb']];if(d.st=='liberado')return[['Ver pagamento','c18']];if(d.st=='prod'&&d.cmt)return[['Ajustar e reenviar','c12']];if(d.st=='aprov')return[['Acompanhar aprovação','c15']];return[['Voltar ao briefing','c11']]};

/* ---- criador: publicar e confirmar ---- */
function pbBody(){const q=dlq('c');if(!q)return noDl('c');const d=dlOf(q);
if(d.st=='liberado')return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Publicação confirmada</h2><p>A Triskel confirmou o post no ar e liberou o pagamento.</p></div>`+dlSteps(q,'c');
if(d.st!='aprovado')return`<div class="np">${IC('lock',18,2)}<span>${d.st=='aprov'?'Aguarde a aprovação de '+pyEsc(q.kn)+' antes de publicar.':'Envie a entrega e aguarde a aprovação antes de publicar.'}</span></div>`+dlSteps(q,'c');
const e=lastEnv(d),pre=e.tipo=='post'?e.url:'';if(PB.q!=q.id){PB.q=q.id;PB.url=pre;PB.run=0}
if(PB.run)return Card(`<div class="pyst">${IC('clock',16,2)}<span>A Triskel está conferindo o post</span></div><div class="pgb"><i id="pbPb" style="width:0%"></i></div><small class="cap" style="text-align:left">Simulação de cerca de 3 segundos.</small>`)
+Card(['Post público e no ar','Vídeo igual ao aprovado','Menção à marca e hashtags','Dentro do prazo de publicação','Sem contato externo na legenda'].map((l,i)=>`<div class="iar w" id="pbr${i}" data-ok="1" data-det="Conferido"><span class="iai"></span><span>${l}</span><i class="iav">Aguardando</i></div>`).join(''));
return`<p class="hi">${pyEsc(q.kn)} aprovou a entrega. Publique o conteúdo aprovado e cole o link do post para a Triskel confirmar.</p>`
+Card(K([['Campanha',pyEsc(q.camp.nome)],['Você recebe',`<b>${brl(last(q).valor)}</b>`],['Em custódia','Liberado após a confirmação']]))
+`<label>Link do post (Instagram ou TikTok)<input data-dl-pub inputmode="url" autocomplete="off" value="${pyEsc(PB.url)}" placeholder="instagram.com/reel/Cxyz123" data-nomask="1"></label>`
+`<p class="cap" style="text-align:left">${pre?'Link enviado na entrega. Confirme que o post continua no ar.':'Publique com a menção à marca e as hashtags do briefing. O post precisa estar público.'}</p>`+POLICY}
const pbOpt=()=>{const q=dlq('c'),d=dlOf(q);if(!q)return[];if(d.st=='aprovado'&&!PB.run)return[['Confirmar publicação','','','','','data-dl="publish"'],['Voltar ao resultado','c16','o']];if(d.st=='liberado')return[['Ver pagamento liberado','c18']];return[]};

/* ---- pagamento liberado (3 perfis) ---- */
function relBody(p){const q=dlq(p);if(!q)return noDl(p);const d=dlOf(q);
if(d.st!='liberado'){const t=TXS.find(x=>x.id==q.tx);return`<div class="np">${IC('lock',18,2)}<span>${p=='c'?'O pagamento ainda está em custódia.':'O pagamento ainda está em custódia na Triskel.'} ${d.st=='aprovado'?'A entrega foi aprovada. Falta a Triskel confirmar a publicação do post.':d.st=='aprov'?'Falta a aprovação da entrega.':'Falta a entrega e a aprovação.'}</span></div>`+dlTop(q,p)+Card(K([['Em custódia',brl(last(q).valor)],['Transação',t?t.id:'—']]))+dlSteps(q,p)
+(p!='c'&&d.st=='aprovado'?`<div class="sim"><b>Simulação · publicação do criador</b><small>No uso real, o criador publica e a Triskel confere o post. Aqui você simula essa confirmação.</small><button class="bt" data-dl="sim-pub">${pyEsc(crOf(q.cr).n.split(' ')[0])} publica e a Triskel confirma</button></div>`:'')}
const t=TXS.find(x=>x.id==q.tx)||{id:'—',valor:last(q).valor};
return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>${p=='c'?'Valor na sua carteira':'Pagamento liberado'}</h2><p>${p=='c'?'A Triskel confirmou a publicação e liberou o pagamento para a sua carteira.':'A Triskel confirmou a publicação do post e liberou o pagamento para '+pyEsc(crOf(q.cr).n)+'.'}</p></div>`
+Card(`<div class="pyst">${IC('check',16,2.4)}<span>${p=='c'?'Pagamento disponível na sua carteira':'Custódia liberada ao criador'}</span></div>`+K([['Campanha',pyEsc(q.camp.nome)],[p=='c'?'Valor liberado':'Valor ao criador',brl(last(q).valor)],...(p!='c'?[[FEEL,brl(calc(last(q).valor).fee)]]:[]),['Publicação confirmada',d.pub?dtf(d.pub.dt):'—'],['Transação',t.id]]))
+(p=='c'?`<p class="cap" style="text-align:left">${IC('wallet',14,2)} O valor já pode ser sacado por Pix em Pagamentos.</p>`:'')+dlSteps(q,p)}
const relOpt=p=>()=>{const q=dlq(p),d=dlOf(q);if(!q)return[];return d&&d.st=='liberado'?[['Continuar',p+(p=='c'?'19':'18')],['Ver pagamentos',p+'_pgt','o']]:[['Acompanhar entrega',p=='c'?'c11':p+'12','o']]};

/* ---- contratante: acompanhar, aprovar, pedir ajustes ---- */
function trackBody(p){const q=dlq(p);if(!q)return noDl(p);const d=dlOf(q),L=dlList(p);
const tabs=L.length>1?`<div class="chg" role="group" aria-label="Contratos">${L.map(x=>`<button type="button" class="sfc${x.id==q.id?' on':''}" aria-pressed="${x.id==q.id}" data-dl="open:${x.id}">${pyEsc(crOf(x.cr).n.split(' ')[0])} · ${pyEsc(x.camp.nome.slice(0,18))}</button>`).join('')}</div>`:'';
let h=tabs+dlTop(q,p)+Card(K([['Valor ao criador',brl(last(q).valor)],[FEEL,brl(calc(last(q).valor).fee)],['Total pago',`<b>${brl(calc(last(q).valor).tot)}</b>`],['Em custódia',d.st=='liberado'?'Liberado':brl(last(q).valor)]]))+SHD('Etapas')+dlSteps(q,p);
if(d.st=='prod'||d.st=='ia')h+=`<div class="np">${IC('clock',18,2)}<span>${d.cmt?'Você pediu ajustes. Aguardando o criador reenviar.':'O criador está produzindo. A entrega chega aqui depois da análise da IA.'}</span></div>`+`<div class="sim"><b>Simulação · entrega do criador</b><small>No uso real, o criador envia o vídeo e a IA analisa. Aqui você escolhe o resultado da análise.</small><button class="bt" data-dl="sim-env:ok">${pyEsc(crOf(q.cr).n.split(' ')[0])} envia o vídeo (dentro dos padrões)</button><button class="bt o" data-dl="sim-env:bad">${pyEsc(crOf(q.cr).n.split(' ')[0])} envia o vídeo (fora dos padrões)</button></div>`;
else if(d.st=='aprov')h+=`<div class="np ok">${IC('check',18,2)}<span>A entrega passou na análise da IA e aguarda a sua decisão.</span></div>`;
else if(d.st=='aprovado')h+=`<div class="np">${IC('clock',18,2)}<span>Entrega aprovada. O pagamento é liberado quando a Triskel confirmar a publicação do post.</span></div>`+`<div class="sim"><b>Simulação · publicação do criador</b><small>Aqui você simula o criador publicando e a Triskel confirmando o post no ar.</small><button class="bt" data-dl="sim-pub">${pyEsc(crOf(q.cr).n.split(' ')[0])} publica e a Triskel confirma</button></div>`;
return h+POLICY}
function decBody(p){const q=dlq(p),d=dlOf(q);if(!q||!d||d.st!='aprov')return`<div class="cd" style="text-align:center"><b>Nenhuma entrega aguardando decisão</b></div>`+BTN('Acompanhar entregas',p+'11');
const n=2-d.aj;return`<p class="hi">Você pode aprovar, pedir ajustes ou ignorar a sugestão da IA. Ao aprovar, o criador publica e a Triskel confirma o post antes de liberar o pagamento.</p>`+vidCard(lastEnv(d))+Card(K([['Resultado da IA',lastEnv(d).ia.ok?'<i class="ok">✓ Dentro dos padrões</i>':'<i class="wn">! Fora dos padrões</i>'],['Pedidos de ajuste restantes',n+' de 2']]))+(n<=0?`<p class="cap" style="text-align:left">Os 2 pedidos de ajuste já foram usados. Aprove ou fale com o suporte.</p>`:'')}
const decOpt=p=>()=>{const q=dlq(p),d=dlOf(q);if(!q||!d||d.st!='aprov')return[];return[['Sim, aprovar','','','','','data-dl="approve"'],...(d.aj<2?[['Não, pedir ajustes',p+'16','o']]:[])]};
function adjBody(p){const q=dlq(p),d=dlOf(q);if(!q||!d||d.st!='aprov')return`<div class="cd" style="text-align:center"><b>Nenhuma entrega aguardando decisão</b></div>`+BTN('Acompanhar entregas',p+'11');
return`<p class="hi">Explique o que precisa mudar. Restam ${2-d.aj} de 2 pedidos de ajuste.</p><label>Comentário ao criador<textarea rows="4" data-dl-cmt placeholder="Ex.: mostre o produto logo no início">${pyEsc(ADJ)}</textarea></label><p class="cap" style="text-align:left">Telefone, e-mail, links e redes sociais são bloqueados. Toda a conversa fica na Triskel.</p>`+POLICY}
const adjOpt=p=>()=>{const q=dlq(p),d=dlOf(q);return q&&d&&d.st=='aprov'?[['Enviar pedido','','','','','data-dl="adjust"'],['Voltar à decisão',p+'15','o']]:[]};

/* ---- eventos ---- */
function dlAct(a,r,p){
if(a=='open'){const q=PRP.find(x=>x.id==r[0]);if(!q)return;DLX[p]=q.id;CTX[p]=q.id;return go(p=='c'?'c11':p+'12')}
if(a=='tab'){DRF.tipo=r[0];return refresh()}
if(a=='pickfile'){const f=$('[data-dl-file]');return f&&f.click()}
if(a=='sample'){const q=dlq('c'),d=dlOf(q);DRF.nome='doces_coloniais_v'+(d.env.length+1)+'.mp4';DRF.tam='46 MB';DRF.durN=32;DRF.up=0;return refresh()}
if(a=='submit'){const q=dlq('c'),d=dlOf(q);if(!q||!d||d.st!='prod')return;
if(DRF.tipo=='video'){if(!DRF.nome)return toast('Escolha o vídeo da entrega.');if(DRF.up<100)return toast('Aguarde o envio do vídeo terminar.')}
else{if(!POSTRX.test(DRF.url.trim()))return toast('Informe o link de um post do Instagram ou TikTok.');if(leak(DRF.url.replace(POSTRX,'')))return toast('Informe só o link do post.')}
mkEnv(q,DRF);sysMsg(q,`${crOf(q.cr).n} enviou ${DRF.tipo=='video'?'o vídeo':'o link do post'} (envio ${d.env.length}). A IA está analisando.`);return go('c13')}
if(a=='fix'){const q=dlq('c'),d=dlOf(q);if(!q||!d)return;if(d.st=='ia')d.st='prod';DRF.k='';return go('c12')}
if(a=='send'){const q=dlq('c'),d=dlOf(q);if(!q||!d||d.st!='ia')return;d.st='aprov';sysMsg(q,`${crOf(q.cr).n} enviou a entrega para aprovação (envio ${d.env.length}). A análise da IA ficou dentro dos padrões.`);markUnread(q,'k');toast('Entrega enviada para a aprovação de '+q.kn+'.');return go('c15')}
if(a=='sim-approve'){const q=dlq('c');if(q&&dlDecide(q,'approve')){toast(q.kn+' aprovou a entrega.');go('c16')}return}
if(a=='sim-adjust'){const q=dlq('c');if(q&&dlDecide(q,'adjust','Mostre você provando o doce para aumentar o conteúdo humanizado.')){toast(q.kn+' pediu ajustes.');go('c16')}return}
if(a=='approve'){const q=dlq(p);if(q&&dlDecide(q,'approve')){toast('Entrega aprovada. O criador agora publica o post.');go(p+'17')}return}
if(a=='adjust'){const q=dlq(p),t=ADJ.trim();if(!q)return;if(t.length<5)return toast('Escreva o que precisa mudar.');const lk=leak(t);if(lk){const x=m.querySelector('[data-dl-cmt]');if(x)x.setAttribute('aria-invalid','true');return toast(leakMsg(lk))}
if(dlDecide(q,'adjust',t)){ADJ='';toast('Pedido de ajustes enviado ao criador.');go(p+'12')}return}
if(a=='sim-env'){const q=dlq(p),d=dlOf(q);if(!q||!d||!['prod','ia'].includes(d.st))return;const e=sampleEnv(q,r[0]);
if(e.ia.ok){d.st='aprov';sysMsg(q,`${crOf(q.cr).n} enviou a entrega para aprovação. A análise da IA ficou dentro dos padrões.`);return go(p+'13')}
sysMsg(q,`A análise da IA reprovou o envio de ${crOf(q.cr).n}. O criador vai corrigir e reenviar.`);toast('A IA reprovou o envio. O criador precisa corrigir e reenviar.');return refresh()}
if(a=='sim-pub'){const q=dlq(p);if(q&&dlRelease(q,'instagram.com/reel/CxYz123')){toast('Publicação confirmada. Pagamento liberado.');go(p+'17','p')}return}
if(a=='publish'){const q=dlq('c'),d=dlOf(q);if(!q||!d||d.st!='aprovado')return;const u=(PB.url||'').trim();if(!POSTRX.test(u))return toast('Informe o link de um post do Instagram ou TikTok.');if(leak(u.replace(POSTRX,'')))return toast('Informe só o link do post.');PB.run=1;PB.url=u;return refresh()}
if(a=='simpay'){const q=PRP.find(x=>x.id==r[0]);if(!q||q.st!='aceita')return;{const cf=exQ(q);if(cf)return toast(exTxt(cf,'c'))}const t=payQ(q);if(!t)return toast(q.kn+' ainda não tem saldo suficiente na carteira.');toast('Contrato pago. O valor ficou em custódia.');CTX.c=q.id;return refresh()}}
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-dl]');if(!el)return;e.stopPropagation();const[a,...r]=el.dataset.dl.split(':');dlAct(a,r,(profOf(cur)||PF[1]).p)},true);
document.addEventListener('input',e=>{const t=e.target;if(!t.matches)return;if(t.matches('[data-dl-url]'))DRF.url=t.value;else if(t.matches('[data-dl-pub]'))PB.url=t.value;else if(t.matches('[data-dl-cmt]')){ADJ=t.value;if(t.getAttribute('aria-invalid')&&!leak(t.value))t.removeAttribute('aria-invalid')}});
document.addEventListener('change',e=>{const t=e.target;if(!t.matches)return;
if(t.matches('[data-dl-mode]'))DRF.mode=t.value;
else if(t.matches('[data-dl-file]')&&t.files&&t.files[0]){const f=t.files[0];DRF.nome=f.name;DRF.tam=f.size>1048576?(f.size/1048576).toFixed(0)+' MB':Math.max(1,Math.round(f.size/1024))+' KB';DRF.durN=32;DRF.up=0;
try{const v=document.createElement('video'),u=URL.createObjectURL(f);v.preload='metadata';v.onloadedmetadata=()=>{if(isFinite(v.duration)&&v.duration>0)DRF.durN=Math.round(v.duration);URL.revokeObjectURL(u);if(cur=='c12')refresh()};v.onerror=()=>URL.revokeObjectURL(u);v.src=u}catch(x){}
refresh()}});

/* ---- registro das páginas ---- */
[['c',0],['e',1],['a',2]].forEach(([p,u])=>{pg(GI[p],u,p+'_en','Entregas','Menu · Entregas',()=>enBody(p),[])});
pg(GI.c,0,'c_pb','Publicar e confirmar','Entrega · Publicação',()=>pbBody(),pbOpt);
S.c11.b=()=>prodBody();S.c11.o=dlOpt('c');S.c11.t='Produzir o vídeo';S.c11.h='Briefing';
S.c12.t='Enviar entrega';S.c12.h='Entrega';S.c12.b=()=>sendBody();S.c12.o=sendOpt;
S.c13.t='Análise da IA';S.c13.h='HU05';S.c13.b=()=>procBody('c');S.c13.o=[['Ver resultado agora','c14','o']];
S.c14.t='Apontamentos da IA';S.c14.h='HU05';S.c14.b=()=>repBody('c');S.c14.o=repOpt('c');
S.c15.t='Aguardando aprovação';S.c15.h='Aprovação';S.c15.b=()=>waitBody();S.c15.o=()=>{const q=dlq('c');return q&&dlOf(q).st=='aprov'?[]:dlNext(q,'c')||[]};
S.c16.t='Resultado da entrega';S.c16.h='Decisão';S.c16.b=()=>resBody();S.c16.o=resOpt;
S.c17.t='Ajustar e reenviar';S.c17.h='Ajustes';S.c17.b=()=>resBody();S.c17.o=resOpt;
S.c18.t='Pagamento liberado';S.c18.h='Carteira';S.c18.b=()=>relBody('c');S.c18.o=relOpt('c');
['e','a'].forEach(p=>{
S[p+'11'].t='Entregas em andamento';S[p+'11'].h=p=='a'?'HU15':'RF18';S[p+'11'].b=()=>enBody(p);S[p+'11'].o=[];
S[p+'12'].t='Acompanhar entrega';S[p+'12'].h=p=='a'?'HU15':'RF18';S[p+'12'].b=()=>trackBody(p);S[p+'12'].o=dlOpt(p);
S[p+'13'].t='Análise da IA';S[p+'13'].h=p=='a'?'HU15':'HU10';S[p+'13'].b=()=>procBody(p);S[p+'13'].o=[['Ver relatório agora',p+'14','o']];
S[p+'14'].t='Ler relatório da IA';S[p+'14'].h=p=='a'?'HU15':'HU10';S[p+'14'].b=()=>repBody(p);S[p+'14'].o=repOpt(p);
S[p+'15'].t='Aprovar entrega?';S[p+'15'].h='Decisão';S[p+'15'].b=()=>decBody(p);S[p+'15'].o=decOpt(p);
S[p+'16'].t='Pedir ajustes';S[p+'16'].h='Ajustes';S[p+'16'].b=()=>adjBody(p);S[p+'16'].o=adjOpt(p);
S[p+'17'].t='Pagamento e publicação';S[p+'17'].h='Carteira';S[p+'17'].b=()=>relBody(p);S[p+'17'].o=relOpt(p)});
/* contrato aceito (criador): simulação do pagamento do contratante */
{const b0=S.c10.b;S.c10.b=()=>{const q=ctxP('c');return b0()+(q&&q.st=='aceita'?`<div class="sim"><b>Simulação · pagamento de ${pyEsc(q.kn)}</b><small>No uso real, o contratante paga com o saldo da carteira e o valor fica em custódia. Aqui você simula esse pagamento.</small><button class="bt" data-dl="simpay:${q.id}">${pyEsc(q.kn)} paga o contrato</button></div>`:'')}}
/* Painel: entregas que pedem ação */
function dlAtt(p){return dlList(p).filter(q=>dlNeeds(q,p)).slice(0,2).map(q=>{const d=dlOf(q),cr=crOf(q.cr).n,v=p=='c';let t,s,c;
if(v){if(!q.signed){t='Assine o contrato';s=q.camp.nome+' · '+q.kn;c='Ver contrato'}else if(d.st=='prod'){t=d.cmt?'Ajustes pedidos por '+q.kn:'Entrega em produção';s=q.camp.nome+' · prazo '+last(q).prazo;c=d.cmt?'Ajustar e reenviar':'Enviar entrega'}else if(d.st=='ia'){t='Análise da IA concluída';s=q.camp.nome;c='Enviar para aprovação'}else{t='Entrega aprovada';s=q.camp.nome+' · falta publicar o post';c='Publicar e confirmar'}}
else{t=cr+' enviou a entrega';s=q.camp.nome+(q.cli?' · '+q.cli:'')+' · relatório da IA pronto';c='Revisar entrega'}
return`<div class="cd tpx" role="button" tabindex="0" data-dl="open:${q.id}"><b>${pyEsc(t)}</b><small>${pyEsc(s)}</small><em>${c}</em></div>`}).join('')}

/* =====================================================================
   Dropdown personalizado (substitui o <select> nativo nas páginas internas)
   O <select> original continua no DOM (escondido) e guarda o valor, então
   coleta de dados, máscaras/validação e os eventos input/change seguem iguais.
   ===================================================================== */
const DDCHEV='<svg class="sxc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const DDCK='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
let DD=null,ddN=0;
const ddEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ddLabel(sel){const l=sel.closest('label');if(sel.dataset.lab)return sel.dataset.lab;if(!l)return sel.getAttribute('aria-label')||'';let t='';l.childNodes.forEach(n=>{if(n.nodeType==3)t+=n.textContent});return t.trim()}
function ddText(sel){const o=sel.options[sel.selectedIndex];return o?o.textContent.trim():''}
function ddSync(sel){const w=sel._ddw;if(!w)return;const o=sel.options[sel.selectedIndex],v=w.querySelector('.sxv'),empty=!o||o.value==='';v.textContent=o&&!empty?o.textContent.trim():(sel.options[0]&&sel.options[0].value===''?sel.options[0].textContent.trim():'Selecione');v.classList.toggle('sxp',empty);
w.querySelectorAll('.sxo').forEach((x,i)=>{const on=i==sel.selectedIndex;x.setAttribute('aria-selected',on);x.classList.toggle('sxs',on)})}
function ddBuild(sel){if(sel._ddw||sel.id=='nav')return;
const id='dd'+(++ddN),w=document.createElement('div');w.className='sxw';
const b=document.createElement('button');b.type='button';b.className='sxb';b.setAttribute('role','combobox');b.setAttribute('aria-haspopup','listbox');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',id+'l');b.id=id;
const lab=ddLabel(sel);if(lab)b.setAttribute('aria-label',lab);if(sel.disabled)b.disabled=true;
b.innerHTML='<span class="sxv"></span>'+DDCHEV;
const ul=document.createElement('div');ul.className='sxl';ul.id=id+'l';ul.setAttribute('role','listbox');if(lab)ul.setAttribute('aria-label',lab);ul.hidden=true;
ul.innerHTML=[...sel.options].map((o,i)=>`<div class="sxo${o.disabled?' sxd':''}${o.value===''?' sxe':''}" role="option" id="${id}o${i}" data-i="${i}" aria-selected="false"${o.disabled?' aria-disabled="true"':''}><span>${ddEsc(o.textContent.trim())}</span><i>${DDCK}</i></div>`).join('');
sel.parentNode.insertBefore(w,sel);w.append(b,ul,sel);sel.classList.add('sxn');sel.tabIndex=-1;sel.setAttribute('aria-hidden','true');sel._ddw=w;w._sel=sel;
sel.addEventListener('focus',()=>b.focus());
ddSync(sel)}
function ddInit(root){(root||document).querySelectorAll('.ap select:not(.sxn)').forEach(ddBuild)}
const ddOpts=w=>[...w.querySelectorAll('.sxo')];
function ddActive(w,i,scroll){const L=ddOpts(w),b=w.querySelector('.sxb');L.forEach((x,k)=>x.classList.toggle('sxa',k==i));if(L[i]){b.setAttribute('aria-activedescendant',L[i].id);if(scroll){const ul=w.querySelector('.sxl'),t=L[i].offsetTop,h=L[i].offsetHeight;if(t<ul.scrollTop)ul.scrollTop=t;else if(t+h>ul.scrollTop+ul.clientHeight)ul.scrollTop=t+h-ul.clientHeight}}else b.removeAttribute('aria-activedescendant')}
function ddOpen(w){if(DD&&DD!==w)ddClose(DD);const b=w.querySelector('.sxb'),ul=w.querySelector('.sxl');if(b.disabled)return;
ul.hidden=false;w.classList.add('sxopen');b.setAttribute('aria-expanded','true');DD=w;
/* abre para cima se faltar espaço embaixo */
w.classList.remove('sxup');try{const r=b.getBoundingClientRect(),mr=m.getBoundingClientRect(),k=b.offsetHeight?r.height/b.offsetHeight:1,need=(ul.offsetHeight+8)*k,below=mr.bottom-r.bottom,above=r.top-mr.top;if(below<need&&above>below)w.classList.add('sxup')}catch(x){}
const sel=w._sel;let i=sel.selectedIndex;if(i<0||sel.options[i]&&sel.options[i].disabled)i=[...sel.options].findIndex(o=>!o.disabled);ddActive(w,i,1);
if(!w.classList.contains('sxup')){try{const r=ul.getBoundingClientRect(),mr=m.getBoundingClientRect();if(r.bottom>mr.bottom)m.scrollTop+=Math.ceil((r.bottom-mr.bottom)/(r.height/ul.offsetHeight||1))+8}catch(x){}}}
function ddClose(w,focus){if(!w)return;const b=w.querySelector('.sxb');w.querySelector('.sxl').hidden=true;w.classList.remove('sxopen','sxup');b.setAttribute('aria-expanded','false');b.removeAttribute('aria-activedescendant');if(DD===w)DD=null;if(focus)b.focus()}
function ddPick(w,i){const sel=w._sel,o=sel.options[i];if(!o||o.disabled)return;const ch=sel.selectedIndex!==i;sel.selectedIndex=i;ddSync(sel);ddClose(w,1);if(ch){sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))}if(sel.getAttribute('aria-invalid')){sel.removeAttribute('aria-invalid');const e=w.querySelector('.mkE');if(e)e.remove()}}
function ddMove(w,from,dir){const L=ddOpts(w);let i=from;do{i+=dir}while(L[i]&&L[i].classList.contains('sxd'));return L[i]?i:from}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;const o=t.closest('.sxo'),b=t.closest('.sxb');
if(o){e.preventDefault();e.stopPropagation();const w=o.closest('.sxw');if(!o.classList.contains('sxd'))ddPick(w,+o.dataset.i);return}
if(b){e.stopPropagation();const w=b.closest('.sxw');w.classList.contains('sxopen')?ddClose(w):ddOpen(w);return}
if(DD&&!DD.contains(t))ddClose(DD)},true);
document.addEventListener('mousemove',e=>{const o=e.target.closest&&e.target.closest('.sxo');if(o&&!o.classList.contains('sxd')){const w=o.closest('.sxw');ddActive(w,+o.dataset.i)}});
document.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('.sxb');if(!b)return;const w=b.closest('.sxw'),open=w.classList.contains('sxopen'),L=ddOpts(w);let a=L.findIndex(x=>x.classList.contains('sxa'));if(a<0)a=w._sel.selectedIndex;
const k=e.key;
if(k=='ArrowDown'||k=='ArrowUp'){e.preventDefault();if(!open){ddOpen(w);return}ddActive(w,ddMove(w,a,k=='ArrowDown'?1:-1),1)}
else if(k=='Home'||k=='End'){if(!open)return;e.preventDefault();ddActive(w,k=='Home'?ddMove(w,-1,1):ddMove(w,L.length,-1),1)}
else if(k=='Enter'||k==' '){if(k==' '&&w._ta&&Date.now()-w._ta<600)return;e.preventDefault();if(!open)ddOpen(w);else ddPick(w,a)}
else if(k=='Escape'){if(open){e.preventDefault();e.stopPropagation();ddClose(w,1)}}
else if(k=='Tab'){if(open)ddClose(w)}
else if(k.length==1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){/* busca por digitação */w._tq=(Date.now()-(w._ta||0)<700?w._tq||'':'')+k.toLowerCase();w._ta=Date.now();const q=w._tq,s=a<0?0:a,n=L.length;let f=-1;for(let j=0;j<n;j++){const x=(s+(q.length==1?1:0)+j)%n;if(!L[x].classList.contains('sxd')&&L[x].textContent.trim().toLowerCase().startsWith(q)){f=x;break}}
if(f>=0){e.preventDefault();if(!open)ddOpen(w);ddActive(w,f,1)}}},true);
/* troca de valor feita por código (ex.: restaurar formulário) mantém o botão em dia */
document.addEventListener('change',e=>{if(e.target&&e.target._ddw)ddSync(e.target)});
{const _d1=draw;draw=function(){DD=null;_d1.apply(this,arguments);ddInit($('#m'))}}

/* =====================================================================
   Páginas do rodapé (home): Informações da empresa · Fale Conosco ·
   Política de privacidade · Termos & condições
   ===================================================================== */
const FTU='5 de novembro de 2026',FTD='Textos de demonstração do protótipo. Antes de publicar, passe por revisão jurídica.';
const FTP=a=>a.map(x=>`<p>${x}</p>`).join('');
const FTL=a=>`<ul class="ftl">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const FTS=(n,t,b)=>FQ(`${n}. ${t}`,b);
const FTW=a=>a.map(([t,d],i)=>`<div class="fts"><i>${i+1}</i><span><b>${t}</b><small>${d}</small></span></div>`).join('');
const FTN=t=>`<div class="np">${IC('lock',18,2)}<span>${t}</span></div>`;
const FTG=G[0][1];

/* ---- Informações da empresa ---- */
const ftEmp=()=>`<p class="hi">Conectamos criadores de conteúdo, pequenos negócios e agências em um só lugar.</p>`
+Card(`<div class="pyst">${IC('star',16,2)}<span>Nosso propósito</span></div><p style="margin:0;line-height:1.55;font-size:14px">Democratizar o acesso ao marketing de influência. Campanhas autênticas e de impacto não são privilégio de grandes marcas: acreditamos no potencial dos pequenos negócios e na força criativa dos criadores locais.</p>`)
+SHD('O que a Triskel faz')
+Card(FTP(['O mercado de influência cresce rápido, mas ainda é desorganizado: conversas espalhadas entre redes e aplicativos de mensagem, negociações sem padrão, briefings incompletos e nenhuma forma clara de saber quem é confiável.','A Triskel reúne tudo em um único ambiente: da busca e da negociação ao briefing, à entrega, ao pagamento e à avaliação.']).replace(/<p>/g,'<p style="margin:0 0 10px;line-height:1.55;font-size:14px">'))
+SHD('Como funciona')
+Card(FTW([['Perfil','Cada pessoa monta o seu perfil e valida o e-mail.'],['Encontro','A IA recomenda os criadores mais compatíveis com a campanha.'],['Contrato','Briefing, valor, prazo, revisões e uso de imagem no mesmo lugar.'],['Entrega','O contratante revisa e aprova; a IA apoia a análise.'],['Pagamento','O valor em custódia é liberado ao criador depois da aprovação e da confirmação da publicação.'],['Avaliação','As duas partes se avaliam e constroem reputação.']]))
+SHD('Para quem é')
+Cd('Criadores de conteúdo','UGC, nano e micro influenciadores','Receba propostas reais, com valor e prazo claros e pagamento garantido em custódia.')
+Cd('Pequenos e médios negócios','Comércio local','Encontre criadores da sua região e fale com o seu público de forma mais próxima e genuína.')
+Cd('Agências de marketing','Gestão de clientes e campanhas','Organize clientes, campanhas e criadores contratados em um único painel.')
+SHD('Pagamentos com segurança')
+Card(FTL(['Comércio e agência pagam com o <b>saldo da carteira</b>, que recebe recargas por Pix ou cartão.','O valor do contrato fica em <b>custódia</b> e só é liberado ao criador quando a entrega é aprovada e a Triskel confirma a publicação do post.','Taxa de serviço de <b>10%</b> sobre o valor do contrato, paga pelo contratante.','O criador saca o saldo disponível por <b>Pix</b>, sem taxa de saque.','Valor, taxa e total aparecem em cada proposta, contraproposta e contrato.','Negociação e contato só dentro da plataforma: telefone, e-mail e links são bloqueados nas mensagens.']))
+SHD('Inteligência artificial com decisão humana')
+Card(`<p style="margin:0;line-height:1.55;font-size:14px">A IA ajuda a recomendar criadores compatíveis e a analisar a qualidade das entregas, mas é apenas apoio: <b>a decisão final é sempre de uma pessoa</b>.</p>`)
+SHD('Dados institucionais')
+Card(K([['Nome fantasia','Triskel'],['Razão social','A definir'],['CNPJ','A definir'],['Endereço','A definir'],['E-mail','suporte@triskel.com.br'],['Atendimento','Seg a sex, 9h às 18h']]))
+FTN('Razão social, CNPJ e endereço ficam como “A definir” no protótipo.');

/* ---- Fale Conosco ---- */
const CTT={sent:null};
const ftCtt=()=>{if(CTT.sent){const s=CTT.sent;return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Mensagem enviada</h2><p>Recebemos o seu contato e respondemos em até 1 dia útil, no e-mail <b>${pyEsc(s.mail)}</b>.</p></div>`+Card(K([['Protocolo',s.proto],['Assunto',pyEsc(s.assunto)],['Enviada em',dtf(s.dt)]]))+`<button class="bt" data-g="home" data-m="r">Voltar ao início</button><button class="bt o" data-ctt="novo">Enviar outra mensagem</button>`}
return`<p class="hi">Ficou com alguma dúvida ou precisa de ajuda? Escreva para a gente.</p>`
+Card(K([['E-mail','suporte@triskel.com.br'],['Atendimento','Seg a sex, 9h às 18h'],['Resposta','Em até 1 dia útil']]))
+SHD('Envie uma mensagem')
+`<label>Nome<input data-ctt-f="nome" autocomplete="name" placeholder="Seu nome" aria-label="Nome completo"></label>`
+`<label>E-mail<input data-ctt-f="mail" type="email" autocomplete="email" placeholder="voce@exemplo.com" aria-label="E-mail"></label>`
+`<label>Você é<select data-ctt-f="perfil" data-lab="Perfil"><option value="">Selecione</option>${['Criador de conteúdo','Comércio','Agência','Ainda não tenho conta'].map(x=>`<option>${x}</option>`).join('')}</select></label>`
+`<label>Assunto<select data-ctt-f="assunto" data-lab="Assunto"><option value="">Selecione</option>${['Dúvida sobre a plataforma','Pagamentos e carteira','Contratos e entregas','Problema com a conta','Privacidade e dados (LGPD)','Sugestão ou elogio','Outro assunto'].map(x=>`<option>${x}</option>`).join('')}</select></label>`
+`<label>Mensagem<textarea rows="4" data-ctt-f="msg" placeholder="Conte com detalhes como podemos ajudar" aria-label="Mensagem"></textarea></label>`
+`<p class="cap" style="text-align:left">${IC('lock',14,2)} Usamos seus dados só para responder a este contato, conforme a <span role="link" tabindex="0" data-g="f_priv" style="color:#4b5dca;font-weight:700;cursor:pointer;text-decoration:underline">Política de privacidade</span>.</p>`
+SHD('Talvez ajude')
+FQ('Como recebo o pagamento?','Depois que o contratante aprova a entrega e a Triskel confirma a publicação do post, o valor em custódia é liberado na sua carteira e você saca por Pix.')
+FQ('Como adiciono saldo?','Em Pagamentos, toque em “Adicionar saldo” e escolha Pix ou cartão. O Pix cai na hora.')
+FQ('Esqueci minha senha, e agora?','Na tela de login, use “Esqueci minha senha” e siga as instruções enviadas por e-mail.')};

/* ---- Política de privacidade ---- */
const ftPriv=()=>`<p class="hi">Última atualização: ${FTU}</p>`
+Card(`<div class="pyst">${IC('lock',16,2)}<span>Em resumo</span></div>`+FTL(['Coletamos só o necessário para operar a plataforma (LGPD).','Dados do cartão vão direto ao gateway de pagamento e <b>não ficam guardados</b> na Triskel.','Você pode acessar, corrigir ou excluir os seus dados quando quiser.','Não vendemos dados pessoais.']))
+FTS(1,'Quem somos e o que esta política cobre','A Triskel é a plataforma que conecta criadores de conteúdo, pequenos negócios e agências. Esta política explica quais dados pessoais tratamos, para quê, com quem compartilhamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).')
+FTS(2,'Dados que coletamos',FTL(['<b>Cadastro:</b> nome, e-mail, telefone, data de nascimento, cidade e senha (guardada de forma protegida).','<b>Perfil:</b> nichos, redes sociais, alcance, valores, portfólio, fotos de perfil e capa e, no caso de empresas e agências, razão social, CNPJ e segmento.','<b>Contratos:</b> propostas, briefings, mensagens de negociação, entregas e avaliações.','<b>Pagamentos:</b> CPF ou CNPJ, chave Pix de saque, histórico de transações e saldo da carteira. Números de cartão são tratados pelo gateway de pagamento.','<b>Uso:</b> dados técnicos do aparelho, páginas acessadas e preferências, como o tema claro ou escuro.']))
+FTS(3,'Para que usamos os dados',FTL(['Criar e manter a sua conta e o seu perfil.','Recomendar criadores compatíveis e analisar entregas, com apoio de inteligência artificial.','Viabilizar contratos, pagamentos, custódia, liberação e saques.','Prevenir fraudes e garantir a segurança da plataforma.','Enviar avisos sobre propostas, entregas e pagamentos e responder ao seu suporte.','Cumprir obrigações legais e regulatórias.']))
+FTS(4,'Bases legais','Tratamos dados para a execução do contrato com você, para o cumprimento de obrigações legais, para o nosso legítimo interesse (por exemplo, segurança e melhoria do serviço) e, quando necessário, com o seu consentimento, que pode ser retirado a qualquer momento.')
+FTS(5,'Com quem compartilhamos',FTL(['<b>Outra parte do contrato:</b> o criador e o contratante veem o que é necessário para negociar e executar a campanha.','<b>Gateway de pagamento e bancos:</b> para processar Pix, cartão e saques.','<b>Provedores de tecnologia:</b> hospedagem, envio de e-mails e análise por IA, sob contrato e com dever de sigilo.','<b>Autoridades:</b> quando houver obrigação legal ou ordem judicial.']))
+FTS(6,'Inteligência artificial','Usamos IA para recomendar criadores e apoiar a análise das entregas. A IA não decide sozinha: o resultado é um apoio e a decisão final é sempre humana. Você pode pedir a revisão de qualquer decisão feita com apoio de IA.')
+FTS(7,'Por quanto tempo guardamos','Mantemos os dados enquanto a conta estiver ativa e, depois, pelo prazo necessário para cumprir obrigações legais, resolver disputas e exercer direitos. Depois disso, os dados são excluídos ou anonimizados.')
+FTS(8,'Os seus direitos',FTL(['Confirmar que tratamos dados seus e acessá-los.','Corrigir dados incompletos ou desatualizados.','Pedir anonimização, bloqueio ou exclusão de dados desnecessários.','Pedir a portabilidade dos dados.','Saber com quem compartilhamos os dados.','Retirar o consentimento e pedir a revisão de decisões automatizadas.']))
+FTS(9,'Segurança','Adotamos medidas técnicas e organizacionais para proteger os dados, como controle de acesso, comunicação criptografada e separação dos dados de pagamento. Nenhum sistema é totalmente imune a incidentes; se houver um que afete você, avisaremos nos termos da lei.')
+FTS(10,'Cookies e armazenamento local','Usamos o armazenamento do navegador apenas para lembrar preferências, como o tema da interface. Não usamos cookies de publicidade.')
+FTS(11,'Crianças e adolescentes','A Triskel é voltada a maiores de 18 anos. Não coletamos dados de menores intencionalmente.')
+FTS(12,'Contato do encarregado (DPO)','Para exercer os seus direitos ou tirar dúvidas, use o <b>Fale Conosco</b> e escolha o assunto “Privacidade e dados (LGPD)”, ou escreva para suporte@triskel.com.br.')
+FTN(FTD);

/* ---- Termos & condições ---- */
const ftTer=()=>`<p class="hi">Última atualização: ${FTU}</p>`
+Card(`<div class="pyst">${IC('check',16,2.4)}<span>Em resumo</span></div>`+FTL(['A Triskel conecta criadores, comércio e agências e organiza todo o processo.','Contratos têm briefing, prazo, valor, revisões e prazo de uso de imagem definidos.','O pagamento sai da carteira do contratante, fica em custódia e é liberado depois da aprovação da entrega e da confirmação da publicação.','A IA apoia as análises, mas a decisão final é humana.']))
+FTS(1,'Aceite dos termos','Ao criar uma conta ou usar a Triskel, você declara ter lido e aceitado estes Termos de uso e a Política de privacidade. Se não concordar, não use a plataforma.')
+FTS(2,'Quem pode usar','Maiores de 18 anos e com capacidade civil. Há três perfis: criador de conteúdo, empresa (comércio) e agência. Você é responsável pela veracidade das informações do seu cadastro e deve manter o e-mail validado e a senha em sigilo.')
+FTS(3,'O que a Triskel é, e o que não é','A Triskel é uma plataforma de intermediação: aproxima as partes, organiza a negociação e os pagamentos. O contrato de prestação de serviço é firmado entre contratante e criador. A Triskel não é empregadora de criadores nem garante resultados de vendas ou de alcance.')
+FTS(4,'Contratos, entregas e revisões',FTL(['Cada contrato define valor, prazo de entrega, número de revisões (2 rodadas por padrão) e quais redes terão o conteúdo.','O <b>uso de imagem</b> é incluso por 90 dias; períodos maiores (180 dias ou 12 meses) têm acréscimo combinado no contrato.','O criador entrega no prazo e o contratante revisa e aprova ou pede ajustes dentro das rodadas previstas.','Exclusividade só vale se estiver descrita no contrato. Depois que o contrato com exclusividade é assinado, a Triskel bloqueia novos contratos do criador com marcas do mesmo ramo (ou de ramos relacionados) durante o período combinado, a partir da data de entrega.','O contrato é assinado eletronicamente pelas duas partes dentro da Triskel. Depois das duas assinaturas, a plataforma gera o PDF com as assinaturas digitais, o código de autenticação e o hash SHA-256 do contrato.','<b>Toda a negociação</b> (propostas, contrapropostas e mensagens) e todo o contato entre as partes acontecem dentro da Triskel. Telefone, e-mail, links e redes sociais não podem ser trocados antes do contrato.','Valor, taxa de serviço de <b>10%</b> e total aparecem na proposta, na contraproposta e no contrato.']))
+FTS(5,'Pagamentos, carteira e custódia',FTL(['Comércio e agência pagam contratos com o <b>saldo da carteira</b>, que pode ser abastecido por Pix ou cartão (mínimo de R$ 20,00 e máximo de R$ 10.000,00 por adição).','Sobre o valor do contrato incide uma <b>taxa de serviço de 10%</b>, paga pelo contratante.','O valor do contrato fica em <b>custódia</b> e é liberado ao criador quando a entrega é aprovada.','O criador pode sacar o saldo disponível por Pix, sem taxa, com valor mínimo de R$ 10,00.','No protótipo, o gateway é simulado e nenhum valor real é movimentado.']))
+FTS(6,'Inteligência artificial','Recomendações de criadores e análises de entrega feitas por IA são apoio à decisão e podem conter erros. A decisão final é sempre das pessoas envolvidas.')
+FTS(7,'Avaliações','Contratante e criador podem se avaliar ao fim da parceria. As avaliações devem ser verdadeiras e respeitosas, e podem ser removidas se violarem estes termos.')
+FTS(8,'Conduta e conteúdo','É proibido: usar dados falsos, burlar pagamentos fora da plataforma para evitar a taxa, publicar conteúdo ilegal, discriminatório ou que viole direitos de terceiros, assediar outros usuários ou tentar fraudar o sistema. O criador responde pelos direitos autorais do que entrega.')
+FTS(9,'Suspensão e encerramento','Podemos suspender ou encerrar contas que violem estes termos ou a lei, preservando valores em custódia até a resolução. Você pode encerrar a sua conta quando quiser, depois de concluir os contratos em andamento.')
+FTS(10,'Limitação de responsabilidade','A Triskel não se responsabiliza por atrasos, falhas ou prejuízos decorrentes da relação entre contratante e criador, nem por indisponibilidades fora do seu controle. Isso não afasta responsabilidades previstas em lei.')
+FTS(11,'Alterações','Podemos atualizar estes termos. Avisaremos pela plataforma ou por e-mail, e o uso continuado depois do aviso vale como aceite.')
+FTS(12,'Lei aplicável e foro','Estes termos seguem as leis brasileiras. Fica eleito o foro da comarca do domicílio do consumidor, quando aplicável.')
+FTN(FTD);

S.f_emp={t:'Informações da empresa',h:'Rodapé · Recursos',u:-1,b:ftEmp,o:[['Fale conosco','f_ctt'],['Voltar ao início','home','o']]};
S.f_ctt={t:'Fale conosco',h:'Rodapé · Recursos',u:-1,b:ftCtt,o:()=>CTT.sent?[]:[['Enviar mensagem','','','','','data-ctt="enviar"'],['Voltar ao início','home','o']]};
S.f_priv={t:'Política de privacidade',h:'Rodapé · Legal',u:-1,b:ftPriv,o:[['Termos & condições','f_termos'],['Voltar ao início','home','o']]};
S.f_termos={t:'Termos & condições',h:'Rodapé · Legal',u:-1,b:ftTer,o:[['Política de privacidade','f_priv'],['Voltar ao início','home','o']]};
['f_emp','f_ctt','f_priv','f_termos'].forEach(k=>{S[k].n=null;if(!FTG.includes(k))FTG.push(k)});
{const nav=$('#nav');if(nav){const og=nav.querySelector('optgroup');if(og)['f_emp','f_ctt','f_priv','f_termos'].forEach(k=>{if(!og.querySelector(`option[value="${k}"]`)){const o=document.createElement('option');o.value=k;o.textContent=S[k].t+' · '+S[k].h;og.appendChild(o)}})}}

/* ---- envio do Fale Conosco ---- */
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-ctt]');if(!el)return;
if(el.dataset.ctt=='novo'){CTT.sent=null;return draw()}
const f=k=>m.querySelector(`[data-ctt-f="${k}"]`),v=k=>(f(k)?f(k).value.trim():'');
const miss=[];if(v('nome').length<3)miss.push('nome');if(!v('mail'))miss.push('e-mail');if(!v('perfil'))miss.push('perfil');if(!v('assunto'))miss.push('assunto');if(v('msg').length<10)miss.push('mensagem');
const bad=mkBad(m);
if(miss.length||bad.length){['nome','mail','perfil','assunto','msg'].forEach(k=>{const x=f(k),n={nome:'nome',mail:'e-mail',perfil:'perfil',assunto:'assunto',msg:'mensagem'}[k];if(x&&miss.includes(n))x.setAttribute('aria-invalid','true');else if(x&&!bad.length)x.removeAttribute('aria-invalid')});
const first=m.querySelector('[aria-invalid=true]');if(first){try{first.scrollIntoView({block:'center'});first.focus({preventScroll:true})}catch(x){}}
return toast(miss.length?'Preencha: '+miss.join(', ')+'.':'Corrija: '+bad.slice(0,3).join(', ')+'.')}
CTT.sent={proto:'TRK-'+rid(8),mail:v('mail'),assunto:v('assunto'),dt:new Date()};draw();toast('Mensagem enviada. Respondemos em até 1 dia útil.')});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cttF&&t.getAttribute('aria-invalid')&&t.value.trim())t.removeAttribute('aria-invalid')});
/* links do rodapé acessíveis pelo teclado */
document.addEventListener('keydown',e=>{const t=e.target;if((e.key=='Enter'||e.key==' ')&&t.matches&&t.matches('[role=link][data-g]')){e.preventDefault();t.click()}});

/* =====================================================================
   Notícias: seção na home (2 mais recentes), lista e página da notícia
   ===================================================================== */
const NW={cat:'Todas',cur:null};
const NWCAT={"Mercado de influenciadores":["🎬","linear-gradient(135deg,#4b5dca,#2dd4bf)"],"Publicidade":["📣","linear-gradient(135deg,#2d7ad4,#3cd4c7)"],"Pequenos negócios":["🏪","linear-gradient(135deg,#2dd4bf,#5fe0a1)"],"Tecnologia e IA":["🤖","linear-gradient(135deg,#6b5bd6,#2d7ad4)"],"Regras e boas práticas":["📋","linear-gradient(135deg,#3cbfb8,#4b5dca)"]};
const NEWS=[
{id:"n8",cat:"Pequenos negócios",d:new Date(2026,10,5,9,0),mins:3,t:"Black Friday 2026: por que o comércio local está chamando criadores da própria cidade",r:"Com a data se aproximando, lojas de bairro apostam em vídeos de quem o cliente já conhece para competir com as grandes redes.",p:["A Black Friday deste ano chega em 27 de novembro, e muitos pequenos negócios já estão planejando como aparecer no meio de tantas ofertas. Uma tática que ganha força é contratar criadores da própria cidade: quem mora perto, frequenta os mesmos lugares e fala a língua do público local.","O motivo é simples. Um vídeo de um criador conhecido na região passa confiança de um jeito que um anúncio genérico não passa. O cliente vê o produto, reconhece o bairro e entende que a oferta é para ele.","Para não deixar tudo para a última hora, o ideal é fechar o briefing com antecedência: o que será mostrado, o prazo de entrega, por quanto tempo o vídeo pode ser usado e qual é a chamada para a ação, como “peça pelo link” ou “venha até a loja”.","Combinar valor, prazo e uso de imagem por escrito, dentro de uma plataforma que segura o pagamento até a entrega ser aprovada, evita mal-entendidos e protege os dois lados em um período em que todo mundo está com a agenda cheia."]},
{id:"n7",cat:"Regras e boas práticas",d:new Date(2026,10,3,10,30),mins:3,t:"Publicidade em vídeo: como sinalizar parcerias de forma clara",r:"Quando há pagamento ou troca por produtos, o público precisa saber. Veja boas práticas simples para deixar a parceria evidente.",p:["Quem recebe para divulgar um produto, ou ganha o produto em troca, está fazendo publicidade. A orientação das autoras e autores das regras de autorregulamentação publicitária no Brasil é que isso fique claro para quem assiste, sem exigir esforço para descobrir.","Na prática, vale avisar no início do vídeo, repetir na legenda e usar termos reconhecíveis, como “publicidade” ou “publi”. Marcações escondidas no meio de muitas hashtags ou em letra muito pequena não ajudam.","Para o negócio, deixar a regra combinada no briefing economiza retrabalho. Para o criador, a transparência protege a credibilidade que ele construiu com o público ao longo do tempo.","Na Triskel, o briefing da campanha já traz os requisitos do conteúdo, e a análise de apoio por IA confere itens como menção à marca antes de a entrega ir para aprovação."]},
{id:"n6",cat:"Mercado de influenciadores",d:new Date(2026,9,29,8,45),mins:4,t:"Nano e micro influenciadores ganham espaço nas campanhas de marcas regionais",r:"Perfis menores, com público mais próximo, têm sido escolhidos para campanhas com orçamento enxuto e foco em resultado local.",p:["Nem toda campanha precisa de um perfil com centenas de milhares de seguidores. Entre marcas regionais, cresce a preferência por nano e micro influenciadores, que têm comunidades menores, mas costumam conversar mais com quem acompanha.","Um público mais próximo costuma comentar, perguntar e responder. Para um comércio local, isso significa mais chances de o vídeo virar visita à loja, pedido ou agendamento.","Outro ponto é o orçamento. Com valores por vídeo mais acessíveis, é possível trabalhar com mais de um criador e comparar quais conteúdos funcionam melhor para o negócio.","Para escolher bem, vale olhar nicho, cidade, nota de trabalhos anteriores e o estilo dos vídeos, e não só o número de seguidores."]},
{id:"n5",cat:"Tecnologia e IA",d:new Date(2026,9,22,11,0),mins:3,t:"IA na revisão de conteúdo: o que ela confere e o que continua sendo decisão humana",r:"Ferramentas de análise ajudam a checar o briefing mais rápido, mas a aprovação final segue com quem contrata.",p:["A inteligência artificial já consegue conferir, em poucos segundos, se um vídeo cumpre pontos objetivos do briefing: logo nos primeiros segundos, produto aparecendo, duração, formato vertical e menção à marca.","Isso reduz idas e vindas. O criador sabe na hora o que ajustar, e o contratante recebe uma entrega que já passou por uma primeira checagem.","Mas a análise é um apoio. Tom, criatividade e adequação à marca são avaliações que continuam sendo humanas, e a decisão de aprovar ou pedir ajustes pertence a quem contrata.","O melhor uso combina as duas coisas: a IA cuida do que é mensurável, e as pessoas decidem o que faz sentido para a marca."]},
{id:"n4",cat:"Publicidade",d:new Date(2026,9,15,9,15),mins:3,t:"Vídeos curtos verticais seguem como formato preferido para vender no varejo",r:"Reels e vídeos de até um minuto continuam entre os formatos mais usados por quem quer mostrar produto em uso.",p:["O vídeo vertical curto virou o formato padrão de quem quer mostrar um produto funcionando: a sobremesa sendo servida, a roupa sendo experimentada, o serviço sendo feito.","Para o varejo, o mais importante é começar forte. Os primeiros segundos precisam mostrar o produto e a marca, porque é ali que a pessoa decide se continua assistindo.","Também ajuda manter uma única mensagem por vídeo e fechar com uma chamada clara para a ação. Vídeos muito longos ou com muitas ideias costumam perder o público no meio.","Combinar o formato, a duração e a plataforma no briefing deixa o trabalho do criador mais simples e o resultado mais previsível."]},
{id:"n3",cat:"Mercado de influenciadores",d:new Date(2026,9,8,10,0),mins:4,t:"Contrato claro, prazo e uso de imagem: o que não pode faltar numa parceria com criador",r:"Alguns pontos combinados no começo evitam conflito no fim: valor, prazo, revisões, exclusividade e por quanto tempo o conteúdo pode ser usado.",p:["Boa parte dos problemas em parcerias com criadores nasce de combinados vagos. Um contrato simples já resolve a maior parte deles.","Os pontos principais são o valor, o prazo de entrega, o número de rodadas de ajuste, a exclusividade e o tempo de uso de imagem, ou seja, por quanto tempo a marca pode usar o vídeo em seus próprios canais ou em anúncios.","Também é importante definir como o pagamento acontece. Quando o valor fica em custódia e só é liberado depois da aprovação e da publicação, os dois lados têm mais segurança.","Manter toda a negociação por escrito, dentro da plataforma, cria um histórico que pode ser consultado se surgir alguma dúvida."]},
{id:"n2",cat:"Pequenos negócios",d:new Date(2026,8,30,9,0),mins:3,t:"Como acompanhar o resultado de uma campanha com criadores sem planilhas complicadas",r:"Três perguntas simples ajudam a saber se valeu a pena: quantas pessoas viram, quantas interagiram e quantas viraram cliente.",p:["Medir o resultado de uma campanha não precisa ser complicado. O primeiro passo é decidir, antes de começar, o que seria um bom resultado: mais visitas à loja, mais pedidos, mais mensagens.","Depois, vale olhar três números: alcance, ou quantas pessoas viram; interação, ou quantas curtiram, comentaram ou salvaram; e conversão, ou quantas viraram cliente.","Um link exclusivo, um cupom com o nome do criador ou uma pergunta simples no balcão, como “como você conheceu a loja?”, já ajudam a ligar o vídeo ao resultado.","Com essas informações, fica mais fácil repetir o que funcionou e ajustar o que não funcionou na próxima campanha."]},
{id:"n1",cat:"Publicidade",d:new Date(2026,8,21,8,30),mins:3,t:"Conteúdo feito por criadores: a autenticidade que o consumidor percebe",r:"Vídeos com cara de dia a dia, e não de comercial, tendem a gerar mais confiança. Entenda por que marcas estão investindo nisso.",p:["O chamado conteúdo gerado por criadores, ou UGC, tem uma linguagem diferente do comercial tradicional: é mais próximo, mais espontâneo e fala como uma pessoa comum falaria.","Esse jeito de comunicar passa mais confiança, porque o público enxerga alguém usando o produto de verdade, e não uma cena produzida em estúdio.","Para o negócio, também costuma ser mais barato e rápido de produzir. Um briefing claro e liberdade para o criador usar o próprio estilo costumam render os melhores resultados.","O que não pode faltar é combinar o uso do material: onde o vídeo será publicado e por quanto tempo a marca pode reaproveitá-lo."]}];
const nwSorted=()=>NEWS.slice().sort((a,b)=>b.d-a.d);
const nwDate=d=>d.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
const nwShort=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
const nwEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nwCard=n=>{const[e,g]=NWCAT[n.cat]||NWCAT["Publicidade"];return`<button type="button" class="nwc" data-news="open:${n.id}"><span class="nwt" style="background:${g}"><i>${e}</i><b>${nwEsc(n.cat)}</b></span><span class="nwb"><small>${nwDate(n.d)} · ${n.mins} min de leitura</small><strong>${nwEsc(n.t)}</strong><span>${nwEsc(n.r)}</span><em>Ler notícia ›</em></span></button>`};
/* seção da home: sempre as 2 notícias mais recentes */
function newsHome(){return`<section class="ab nw" id="noticias" aria-labelledby="nwh"><div class="eb">Notícias</div><h2 id="nwh">Novidades do mercado de criadores</h2>${nwSorted().slice(0,2).map(nwCard).join('')}<button type="button" class="nwm" data-news="list">Ver mais notícias</button></section>`}
/* lista */
function nwListBody(){const cats=['Todas',...Object.keys(NWCAT)],L=nwSorted().filter(n=>NW.cat=='Todas'||n.cat==NW.cat);
return`<p class="hi">Novidades sobre influenciadores, publicidade e negócios. As mais recentes aparecem primeiro.</p><div class="chg" role="group" aria-label="Filtrar por assunto">${cats.map(c=>`<button type="button" class="sfc${NW.cat==c?' on':''}" aria-pressed="${NW.cat==c}" data-news="cat:${nwEsc(c)}">${nwEsc(c)}</button>`).join('')}</div>`
+`<p class="cap" style="text-align:left;margin:6px 0">${L.length} ${L.length==1?'notícia':'notícias'}${NW.cat=='Todas'?'':' em '+nwEsc(NW.cat)}</p>`+L.map(nwCard).join('')}
/* notícia aberta */
function nwArtBody(){const n=NEWS.find(x=>x.id==NW.cur)||nwSorted()[0],[e,g]=NWCAT[n.cat]||NWCAT["Publicidade"];
const rel=nwSorted().filter(x=>x.id!=n.id).sort((a,b)=>(b.cat==n.cat)-(a.cat==n.cat)||b.d-a.d).slice(0,2);
return`<div class="nwh" style="background:${g}"><i>${e}</i><b>${nwEsc(n.cat)}</b></div><p class="nwm2">${nwDate(n.d)} · ${n.mins} min de leitura</p><p class="nwl">${nwEsc(n.r)}</p>`+n.p.map(x=>`<p class="nwp">${nwEsc(x)}</p>`).join('')
+`<p class="cap" style="text-align:left">Conteúdo informativo da Triskel. Não substitui orientação jurídica ou contábil.</p>`+SHD('Leia também')+rel.map(nwCard).join('')}
S.f_news={t:'Notícias',h:'Home · Notícias',u:-1,b:nwListBody,o:[['Voltar ao início','home','o']],n:null};
S.f_nt={t:'Notícia',h:'Home · Notícias',u:-1,b:nwArtBody,o:[['Ver todas as notícias','f_news'],['Voltar ao início','home','o']],n:null};
Object.defineProperty(S.f_nt,'t',{get:()=>(NEWS.find(x=>x.id==NW.cur)||nwSorted()[0]).t,set:()=>{},configurable:true,enumerable:true});
['f_news','f_nt'].forEach(k=>{if(!FTG.includes(k))FTG.push(k)});
{const nav=$('#nav');if(nav){const og=nav.querySelector('optgroup');if(og)['f_news','f_nt'].forEach(k=>{if(!og.querySelector(`option[value="${k}"]`)){const o=document.createElement('option');o.value=k;o.textContent=S[k].t+' · '+S[k].h;og.appendChild(o)}})}}
document.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-news]');if(!el)return;e.stopPropagation();e.preventDefault();const[a,...r]=el.dataset.news.split(':'),arg=r.join(':');
if(a=='open'){const n=NEWS.find(x=>x.id==arg);if(!n)return;NW.cur=n.id;m.scrollTo(0,0);return go('f_nt')}
if(a=='list'){NW.cat='Todas';return go('f_news')}
if(a=='cat'){NW.cat=arg;const y=m.scrollTop;draw();m.scrollTop=y;return}},true);

/* ================= contrato em PDF com assinatura digital ================= */
const SHA=(()=>{const k=[],h0=[],M=4294967296;{const comp={};let c=0;for(let n=2;c<64;n++){if(!comp[n]){for(let i=0;i<313;i+=n)comp[i]=n;h0[c]=(Math.pow(n,.5)*M)|0;k[c++]=(Math.pow(n,1/3)*M)|0}}}
const rr=(v,a)=>(v>>>a)|(v<<(32-a));
return s=>{const b=new TextEncoder().encode(s),l=b.length,w=[];for(let i=0;i<l;i++)w[i>>2]|=b[i]<<((3-i%4)*8);w[l>>2]|=0x80<<((3-l%4)*8);const nw=(((l+8)>>6)+1)*16;for(let i=0;i<nw;i++)w[i]=w[i]|0;w[nw-1]=l*8;
let h=h0.slice(0,8);
for(let j=0;j<nw;){const W=w.slice(j,j+=16),oh=h;h=h.slice(0,8);
for(let i=0;i<64;i++){const w15=W[i-15],w2=W[i-2],a=h[0],e=h[4];
const t1=h[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&h[5])^(~e&h[6]))+k[i]+(W[i]=i<16?W[i]:(W[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+W[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
const t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&h[1])^(a&h[2])^(h[1]&h[2]));
h=[(t1+t2)|0].concat(h);h[4]=(h[4]+t1)|0}
for(let i=0;i<8;i++)h[i]=(h[i]+oh[i])|0}
return h.slice(0,8).map(x=>('0000000'+(x>>>0).toString(16)).slice(-8)).join('')}})();

/* ---- documentos e responsáveis de exemplo (só para quem não é o usuário logado) ---- */
const NOMESR=['Helena Vale','Ricardo Soares','Marina Duarte','Carlos Brandão','Patrícia Lemos','Fernando Alves','Juliana Prates','Roberto Farias'];
const hsh=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
function genDoc(seed,kind){let h=hsh(seed+kind),d=[];const n=kind=='cpf'?9:8;for(let i=0;i<n;i++){h=(Math.imul(h,1103515245)+12345)>>>0;d.push((h>>>16)%10)}if(kind=='cpf'){if(d.every(x=>x==d[0]))d[8]=(d[8]+1)%10;for(const m of[9,10]){let s=0;for(let i=0;i<m;i++)s+=d[i]*(m+1-i);d.push(s*10%11%10)}}else{d.push(0,0,0,1);for(const m of[12,13]){const w=m==12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];let s=0;for(let i=0;i<m;i++)s+=d[i]*w[i];const r=s%11;d.push(r<2?0:11-r)}}return d.join('')}

function partyK(q){const p=q.k,d=PD[p],me=!!d&&(p=='e'||p=='a')&&d.nome==q.kn,nome=q.kn;
const resp=me?(d.resp||''):NOMESR[hsh(nome)%NOMESR.length],doc=me?(d.cnpj||''):fmtCNPJ(genDoc(nome,'cnpj')),cidade=me?(d.cidade||''):'Pelotas',uf=me?(d.uf||''):'RS',miss=[];
if(me){if(!doc)miss.push('CNPJ');if(!resp)miss.push('nome do responsável');if(!cidade||!uf)miss.push('cidade e estado')}
return{nome,doc,resp,cidade,uf,mail:me?(d.mail||''):'',miss,me,ag:q.k=='a',cli:q.cli||'',seg:(q.camp&&q.camp.seg)||SEGOF[q.cli||q.kn]||''}}
function partyC(q){const me=q.cr==ME,x=crOf(q.cr),d=PD.c,nome=me?(d.nome||x.n):x.n,doc=me?(d.cpf||''):fmtCPF(genDoc(x.n,'cpf')),miss=[];
if(me){if(!doc)miss.push('CPF');if(!d.cidade||!d.uf)miss.push('cidade e estado')}
return{nome,doc,nasc:me?(d.nasc||''):'',cidade:me?(d.cidade||''):x.cid,uf:me?(d.uf||''):'RS',mail:me?(d.mail||''):'',insta:me?(d.insta||''):'',miss,me}}
const ctMiss=(q,role)=>role=='k'?partyK(q).miss:partyC(q).miss;
const ctNum=q=>'TRK-2026-'+String(+(String(q.id).replace(/\D/g,'')||0)).padStart(4,'0');

/* ---- modelo do contrato (usado na tela e no PDF) ---- */
function ctModel(q){const l=last(q),k=partyK(q),c=partyC(q),f=calc(l.valor),cm=q.camp||{},ex=exInfo(q),num=ctNum(q),dt=(q.acc&&q.acc.dt)||l.dt,vids=+cm.vids||1,
fmtx=cm.fmt||'Reels 9:16',loc=x=>[x.cidade,x.uf].filter(Boolean).join('/'),
ag=k.ag&&k.cli?`, agência atuando em nome e por conta do cliente ${k.cli}`:'';
const B=[];
B.push({t:'kv',h:'Partes',rows:[
['CONTRATANTE',k.nome+ag],['CNPJ',k.doc||'—'],['Representante legal',k.resp||'—'],['Sede',loc(k)||'—'],...(k.mail?[['E-mail',k.mail]]:[]),
['CONTRATADO(A)',c.nome],['CPF',c.doc||'—'],...(c.nasc?[['Nascimento',c.nasc]]:[]),['Residência',loc(c)||'—'],...(c.mail?[['E-mail',c.mail]]:[]),...(c.insta?[['Perfil principal',c.insta]]:[]),
['INTERVENIENTE','Triskel, plataforma que intermedeia a negociação, mantém o valor em custódia e registra as assinaturas eletrônicas']]});
B.push({t:'p',x:'As partes acima, identificadas pelos dados cadastrados na plataforma Triskel, firmam este contrato de prestação de serviços de criação de conteúdo, que se rege pelas cláusulas a seguir.'});
B.push({t:'h',x:'Cláusula 1 · Objeto'});
B.push({t:'p',x:`1.1 O CONTRATADO(A) produzirá ${vids} ${vids>1?'vídeos':'vídeo'} no formato ${fmtx} para a campanha “${cm.nome||'—'}”${cm.obj?', com o objetivo de '+String(cm.obj).toLowerCase():''}, conforme o briefing enviado pela plataforma e aceito pelas partes.`});
B.push({t:'p',x:'1.2 O briefing, as condições negociadas e o histórico de propostas e contrapropostas ficam registrados na Triskel e integram este contrato.'});
B.push({t:'h',x:'Cláusula 2 · Prazo, entrega e revisões'});
B.push({t:'p',x:`2.1 A entrega do conteúdo será feita pela plataforma até ${l.prazo}.`});
B.push({t:'p',x:'2.2 O conteúdo passa pela análise da inteligência artificial da Triskel, que apoia a conferência do briefing. A decisão final de aprovar ou pedir ajustes é humana e cabe ao CONTRATANTE.'});
B.push({t:'p',x:'2.3 O CONTRATANTE pode pedir até 2 rodadas de ajustes. Depois da aprovação, o CONTRATADO(A) publica o conteúdo e a Triskel confirma a publicação.'});
B.push({t:'h',x:'Cláusula 3 · Valor e pagamento'});
B.push({t:'p',x:`3.1 O valor devido ao CONTRATADO(A) é de ${brl(l.valor)}.`});
B.push({t:'p',x:`3.2 A taxa de serviço da Triskel é de ${FPCT}% do valor do CONTRATADO(A), ou ${brl(f.fee)}, paga pelo CONTRATANTE e somada ao valor. O total pago pelo CONTRATANTE é de ${brl(f.tot)}. A taxa não é descontada do CONTRATADO(A).`});
B.push({t:'p',x:'3.3 O pagamento é feito com o saldo da carteira do CONTRATANTE na Triskel e fica em custódia. É liberado para a carteira do CONTRATADO(A) depois da aprovação da entrega e da confirmação da publicação.'});
B.push({t:'h',x:'Cláusula 4 · Uso de imagem e conteúdo'});
B.push({t:'p',x:`4.1 O CONTRATADO(A) autoriza o uso do conteúdo e da sua imagem pelo CONTRATANTE por ${l.uso}, a contar da publicação, nas redes Instagram e TikTok. Outros usos ou prazos maiores dependem de novo acordo pela plataforma.`});
B.push({t:'p',x:'4.2 O CONTRATADO(A) declara que o conteúdo é original e que tem direito de usar músicas, imagens e demais materiais nele incluídos.'});
B.push({t:'h',x:'Cláusula 5 · Exclusividade'});
B.push({t:'p',x:ex.dias&&ex.pz?`5.1 Este contrato tem exclusividade de ${ex.dias} dias, de ${fdt(ex.pz)} até ${fdt(ex.fim)}${k.seg?', no ramo '+k.seg:''}. Nesse período o CONTRATADO(A) não fecha nem publica campanhas de marcas do mesmo ramo ou de ramos relacionados. A Triskel bloqueia propostas e candidaturas que gerem esse conflito.`:'5.1 Este contrato não tem exclusividade.'});
B.push({t:'h',x:'Cláusula 6 · Publicidade e transparência'});
B.push({t:'p',x:'6.1 O conteúdo deve indicar de forma clara que se trata de publicidade (por exemplo, #publi), conforme as boas práticas de publicidade digital.'});
B.push({t:'h',x:'Cláusula 7 · Comunicação dentro da plataforma'});
B.push({t:'p',x:'7.1 Toda a negociação, as mensagens, as entregas e os pagamentos acontecem dentro da Triskel. As partes não trocam telefone, e-mail, links ou redes sociais para tratar deste contrato.'});
B.push({t:'h',x:'Cláusula 8 · Cancelamento e descumprimento'});
B.push({t:'p',x:'8.1 Se a entrega não ocorrer no prazo, o CONTRATANTE pode notificar o CONTRATADO(A) pela plataforma e, persistindo o atraso, pedir o encerramento do contrato, com o tratamento do valor em custódia definido pelas regras da Triskel.'});
B.push({t:'p',x:'8.2 Aprovada a entrega e confirmada a publicação pela Triskel, o valor em custódia é liberado para a carteira do CONTRATADO(A).'});
B.push({t:'h',x:'Cláusula 9 · Dados pessoais'});
B.push({t:'p',x:'9.1 Os dados pessoais usados neste contrato são tratados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018) e a Política de privacidade da Triskel, apenas para executar o contrato e cumprir obrigações legais.'});
B.push({t:'h',x:'Cláusula 10 · Assinatura eletrônica'});
B.push({t:'p',x:'10.1 As partes reconhecem como válida a assinatura eletrônica registrada pela Triskel, feita depois do acesso autenticado à conta e do aceite expresso destes termos, nos termos do art. 10, §2º, da Medida Provisória 2.200-2/2001. O registro inclui nome, documento, data e hora, código de autenticação e o hash SHA-256 do conteúdo do contrato.'});
B.push({t:'h',x:'Cláusula 11 · Foro'});
B.push({t:'p',x:`11.1 Fica eleito o foro da comarca de ${k.cidade||'Pelotas'}${k.uf?'/'+k.uf:''} para resolver dúvidas deste contrato, depois de tentada a solução amigável pela plataforma.`});
const hash=SHA(JSON.stringify([num,dt.toISOString(),B]));
return{num,dt,k,c,B,hash,valor:l.valor,fee:f.fee,tot:f.tot}}
function ctGet(q){if(!q.cm&&q.sg&&(q.sg.k||q.sg.c))q.cm=ctModel(q);return q.cm||ctModel(q)}

/* ---- assinaturas ---- */
const FDH=d=>{const o={};new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).forEach(x=>o[x.type]=x.value);return`${o.day}/${o.month}/${o.year} às ${o.hour=='24'?'00':o.hour}:${o.minute}:${o.second}`};
const sigCode=(h,role,r)=>SHA(h+'|'+role+'|'+r.nome+'|'+r.doc+'|'+new Date(r.dt).toISOString()).slice(0,12).toUpperCase().match(/.{4}/g).join('-');
const sigMk=(q,role,dt)=>{const m=q.cm,P=role=='k'?m.k:m.c,s={nome:role=='k'?(P.resp||P.nome):P.nome,org:role=='k'?P.nome:'',doc:P.doc,papel:role=='k'?'Contratante':'Contratado(a)',dt};s.cod=sigCode(m.hash,role,s);return s};
function sigV(q,role){const r=(q.sg||{})[role];if(!r)return null;if(!r.nome){const m=ctGet(q);q.cm=m;Object.assign(r,sigMk(q,role,r.dt))}return r}
function signAs(q,role,dt){if(role=='k'&&!q.cm&&(partyK(q).miss.length||partyC(q).miss.length)){q.sgP={dt:dt||new Date()};return}
if(!q.cm)q.cm=ctModel(q);q.sg=q.sg||{};if(role=='c'&&q.sgP){q.sg.k=sigMk(q,'k',q.sgP.dt);delete q.sgP}
q.sg[role]=sigMk(q,role,dt||new Date());if(role=='c')q.signed=1}
const sigBoth=q=>!!(q.sg&&q.sg.k&&q.sg.c);
const sigDone=q=>{const a=sigV(q,'k'),b=sigV(q,'c');return a&&b?new Date(Math.max(+a.dt,+b.dt)):null};

/* ---- gerador de PDF (sem bibliotecas) ---- */
const HW={' ':278,'!':278,'"':355,'#':556,'$':556,'%':889,'&':667,"'":191,'(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,A:667,B:667,C:722,D:722,E:667,F:611,G:778,H:722,I:278,J:500,K:667,L:556,M:833,N:722,O:778,P:667,Q:778,R:722,S:667,T:611,U:722,V:667,W:944,X:667,Y:667,Z:611,'[':278,'\\':278,']':278,'^':469,_:556,'`':333,a:556,b:556,c:500,d:556,e:556,f:278,g:556,h:556,i:222,j:222,k:500,l:222,m:833,n:556,o:556,p:556,q:556,r:333,s:500,t:278,u:556,v:500,w:722,x:500,y:500,z:500,'{':334,'|':260,'}':334,'~':584};
const HBW={' ':278,'!':333,'"':474,'#':556,'$':556,'%':889,'&':722,"'":238,'(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,':':333,';':333,'<':584,'=':584,'>':584,'?':611,'@':975,A:722,B:722,C:722,D:722,E:667,F:611,G:778,H:722,I:278,J:556,K:722,L:611,M:833,N:722,O:778,P:667,Q:778,R:722,S:667,T:611,U:722,V:667,W:944,X:667,Y:667,Z:611,'[':333,'\\':278,']':333,'^':584,_:556,'`':333,a:556,b:611,c:556,d:611,e:556,f:333,g:611,h:611,i:278,j:278,k:556,l:278,m:889,n:611,o:611,p:611,q:611,r:389,s:556,t:333,u:611,v:556,w:778,x:556,y:556,z:500,'{':389,'|':280,'}':389,'~':584};
const CP1252={'“':0x93,'”':0x94,'‘':0x91,'’':0x92,'–':0x96,'—':0x97,'•':0x95,'…':0x85,'€':0x80,'·':0xB7,'º':0xBA,'ª':0xAA,'§':0xA7};
const pdfEnc=s=>{let o='';for(const ch of String(s)){const c=ch.charCodeAt(0);o+=c<128?ch:CP1252[ch]!=null?String.fromCharCode(CP1252[ch]):c<256?ch:'?'}return o};
const pdfStr=s=>'('+pdfEnc(s).replace(/([\\()])/g,'\\$1').replace(/[\r\n]+/g,' ')+')';
function pdfW(s,f,sz){if(f=='F4')return String(s).length*600*sz/1000;if(f=='F3')return String(s).length*430*sz/1000;const T=f=='F2'?HBW:HW;let w=0;for(const ch of String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,''))w+=T[ch]||556;return w*sz/1000}
function pdfWrap(s,f,sz,mw){const out=[];String(s).split('\n').forEach(par=>{let line='';par.split(/\s+/).filter(Boolean).forEach(w=>{const t=line?line+' '+w:w;if(pdfW(t,f,sz)<=mw||!line)line=t;else{out.push(line);line=w}});out.push(line)});return out}
const RGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].map(x=>(x/255).toFixed(3)).join(' ');
function pdfBuild(o){const W=595.28,H=841.89,ML=56,CW=W-ML*2,TOP=H-92,BOT=64,pages=[];let cur=null,y=0;
const np=()=>{cur={ops:[]};pages.push(cur);y=TOP};
const tx=(s,x,yy,f,sz,col)=>cur.ops.push(`BT /${f} ${sz} Tf ${RGB(col||'#1f2937')} rg ${x.toFixed(2)} ${yy.toFixed(2)} Td ${pdfStr(s)} Tj ET`);
const ens=h=>{if(y-h<BOT)np()};
const para=(s,x)=>{x=x||{};const f=x.f||'F1',sz=x.sz||10,ld=x.ld||sz*1.45,ind=x.ind||0,mw=CW-ind;pdfWrap(s,f,sz,mw).forEach(ln=>{ens(ld);y-=ld;const w=pdfW(ln,f,sz);tx(ln,x.c=='center'?ML+(CW-w)/2:ML+ind,y,f,sz,x.col);});y-=x.gap==null?4:x.gap};
const head=s=>{ens(34);y-=8;para(s,{f:'F2',sz:11,col:'#0f6f62',gap:3})};
const line=(x1,y1,x2,y2,col,w)=>cur.ops.push(`${RGB(col||'#d5dbe3')} RG ${w||.6} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
np();
y-=4;para('INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE CONTEÚDO',{f:'F2',sz:13.5,c:'center',col:'#1f3a8a',ld:18,gap:6});
para(`Contrato nº ${o.num} · emitido em ${fdt(o.dt)} · intermediado pela plataforma Triskel`,{sz:9,c:'center',col:'#6b7280',gap:8});
o.B.forEach(b=>{
if(b.t=='h')head(b.x);
else if(b.t=='p')para(b.x,{sz:9.8,gap:3.5});
else if(b.t=='kv'){head(b.h.toUpperCase());b.rows.forEach(([l,v])=>{const lw=118,L=pdfWrap(v,'F1',9.8,CW-lw),hh=L.length*13.5+3;ens(hh);const big=/^(CONTRATANTE|CONTRATADO\(A\)|INTERVENIENTE)$/.test(l);if(big){y-=4;line(ML,y+2,ML+CW,y+2,'#e5e9ef')}
L.forEach((ln,i)=>{y-=13.5;if(!i)tx(l,ML,y,'F2',big?9.6:9,big?'#0f6f62':'#6b7280');tx(ln,ML+lw,y,big&&!i?'F2':'F1',9.8,'#1f2937')});y-=3})}});
/* assinaturas */
ens(235);y-=10;head('ASSINATURAS ELETRÔNICAS');
para(o.final?'As duas partes assinaram eletronicamente este contrato. Cada assinatura foi registrada pela Triskel depois de acesso autenticado e aceite expresso dos termos.':'Esta é uma minuta. O contrato final, com as assinaturas digitais das duas partes, é gerado automaticamente quando as duas assinarem.',{sz:9,col:'#4b5563',gap:8});
const bw=(CW-16)/2,bh=158;ens(bh+10);const top=y;
[['k','CONTRATANTE'],['c','CONTRATADO(A)']].forEach(([r,lab],i)=>{const x0=ML+i*(bw+16),s=o.sigs[r];
const col=s?'#0f8f7d':'#9ca3af';
cur.ops.push(`${s?'0.925 0.984 0.969':'0.973 0.976 0.98'} rg ${x0} ${(top-bh).toFixed(2)} ${bw.toFixed(2)} ${bh} re f`);
if(!s)cur.ops.push('[3 3] 0 d');cur.ops.push(`${RGB(col)} RG ${s?1.1:.8} w ${x0} ${(top-bh).toFixed(2)} ${bw.toFixed(2)} ${bh} re S`);if(!s)cur.ops.push('[] 0 d');
tx(lab,x0+12,top-18,'F2',8.5,'#0f6f62');
if(s){const cx=x0+bw-22,cy=top-17;cur.ops.push(`${RGB('#0f8f7d')} rg ${cx+7} ${cy} m ${cx+7} ${cy+3.9} ${cx+3.9} ${cy+7} ${cx} ${cy+7} c ${cx-3.9} ${cy+7} ${cx-7} ${cy+3.9} ${cx-7} ${cy} c ${cx-7} ${cy-3.9} ${cx-3.9} ${cy-7} ${cx} ${cy-7} c ${cx+3.9} ${cy-7} ${cx+7} ${cy-3.9} ${cx+7} ${cy} c f`);
cur.ops.push(`1 1 1 RG 1.6 w ${cx-3.2} ${cy-.2} m ${cx-1} ${cy-2.6} l ${cx+3.4} ${cy+2.4} l S`);
const nm=s.nome;let fs=21;while(pdfW(nm,'F3',fs)>bw-24&&fs>11)fs--;tx(nm,x0+12,top-52,'F3',fs,'#1e3a8a');line(x0+12,top-60,x0+bw-12,top-60,'#1e3a8a',.7);
tx('Assinado digitalmente por',x0+12,top-74,'F1',7.5,'#6b7280');
pdfWrap(s.nome+(s.org?' · '+s.org:''),'F2',8.6,bw-24).slice(0,2).forEach((ln,j)=>tx(ln,x0+12,top-85-j*10.5,'F2',8.6,'#1f2937'));
const nl=Math.min(2,pdfWrap(s.nome+(s.org?' · '+s.org:''),'F2',8.6,bw-24).length);
let yy=top-85-nl*10.5-1;tx((r=='k'?'CNPJ ':'CPF ')+(s.doc||'—'),x0+12,yy,'F1',8.4,'#374151');yy-=11;
tx(FDH(new Date(s.dt))+' (Brasília)',x0+12,yy,'F1',8.4,'#374151');yy-=14;tx('Código de autenticação',x0+12,yy,'F1',7.2,'#6b7280');yy-=11;tx(s.cod,x0+12,yy,'F4',9.6,'#0f6f62')}
else{tx('Aguardando assinatura',x0+12,top-74,'F1',10,'#6b7280');pdfWrap('A assinatura de '+(r=='k'?o.k.nome:o.c.nome)+' aparece aqui depois do aceite na plataforma.','F1',8.4,bw-24).forEach((ln,j)=>tx(ln,x0+12,top-92-j*11,'F1',8.4,'#9ca3af'))}});
y=top-bh-14;
if(o.final){ens(104);const bh2=92,t2=y;cur.ops.push(`0.965 0.969 0.98 rg ${ML} ${(t2-bh2).toFixed(2)} ${CW} ${bh2} re f`);cur.ops.push(`${RGB('#d5dbe3')} RG .6 w ${ML} ${(t2-bh2).toFixed(2)} ${CW} ${bh2} re S`);
tx('REGISTRO DE AUTENTICIDADE',ML+12,t2-17,'F2',8.5,'#0f6f62');tx('Hash SHA-256 do conteúdo do contrato:',ML+12,t2-32,'F1',8.2,'#4b5563');
tx(o.hash.slice(0,32),ML+12,t2-45,'F4',9.2,'#1f2937');tx(o.hash.slice(32),ML+12,t2-57,'F4',9.2,'#1f2937');
pdfWrap('Para conferir, calcule o SHA-256 do texto do contrato e compare com o hash acima. Qualquer alteração no conteúdo muda o hash. Assinaturas concluídas em '+FDH(o.done)+' (horário de Brasília).','F1',7.8,CW-24).forEach((ln,j)=>tx(ln,ML+12,t2-71-j*9.5,'F1',7.8,'#6b7280'));y=t2-bh2-8}
/* cabeçalho, rodapé, marca d'água */
const n=pages.length;pages.forEach((pg,i)=>{const hd=[`${RGB('#2dd4bf')} rg 0 ${H-48} ${W} 48 re f`,`${RGB('#4b5dca')} rg 0 ${H-48} 130 48 re f`];
pg.ops.unshift(...hd);
const add=(s,x,yy,f,sz,col)=>pg.ops.push(`BT /${f} ${sz} Tf ${RGB(col)} rg ${x.toFixed(2)} ${yy.toFixed(2)} Td ${pdfStr(s)} Tj ET`);
add('Triskel',ML,H-30,'F2',19,'#ffffff');add('Contrato '+o.num,W-ML-pdfW('Contrato '+o.num,'F2',10),H-29,'F2',10,'#0b3d38');
pg.ops.push(`${RGB('#d5dbe3')} RG .6 w ${ML} 46 m ${W-ML} 46 l S`);
add(o.num+' · gerado pela plataforma Triskel · SHA-256 '+o.hash.slice(0,16)+'…',ML,32,'F1',7.5,'#6b7280');
const pn='Página '+(i+1)+' de '+n;add(pn,W-ML-pdfW(pn,'F1',7.5),32,'F1',7.5,'#6b7280');
if(!o.final){pg.ops.splice(2,0,`BT /F2 66 Tf 0.93 0.94 0.95 rg 0.7071 0.7071 -0.7071 0.7071 140 250 Tm ${pdfStr('MINUTA')} Tj ET`,`BT /F2 22 Tf 0.93 0.94 0.95 rg 0.7071 0.7071 -0.7071 0.7071 150 215 Tm ${pdfStr('AGUARDANDO ASSINATURAS')} Tj ET`)}});
/* objetos */
const ob=[];const add=s=>ob.push(s);add('<< /Type /Catalog /Pages 2 0 R >>');add('');
['Helvetica','Helvetica-Bold','Times-BoldItalic','Courier-Bold'].forEach(f=>add(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`));
const kids=[];pages.forEach(pg=>{const c=pg.ops.join('\n'),ci=ob.length+1;add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);kids.push(ob.length+1);add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${ci} 0 R >>`)});
ob[1]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(k=>k+' 0 R').join(' ')}] >>`;
const d=o.dt,pad=n=>String(n).padStart(2,'0'),cd=`D:${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
add(`<< /Title ${pdfStr('Contrato '+o.num+(o.final?' (assinado)':' (minuta)'))} /Author ${pdfStr('Triskel')} /Subject ${pdfStr('Contrato de prestação de serviços de criação de conteúdo')} /Producer ${pdfStr('Triskel')} /Creator ${pdfStr('Triskel')} /CreationDate (${cd}) >>`);
let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const off=[];ob.forEach((s,i)=>{off[i]=out.length;out+=`${i+1} 0 obj\n${s}\nendobj\n`});const xr=out.length;
out+=`xref\n0 ${ob.length+1}\n0000000000 65535 f \n`+off.map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${ob.length+1} /Root 1 0 R /Info ${ob.length} 0 R >>\nstartxref\n${xr}\n%%EOF`;
const u8=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u8[i]=out.charCodeAt(i)&255;return u8}
const PDFX={last:null,name:''};
function ctPdf(q){const m=ctGet(q),fin=sigBoth(q),a=sigV(q,'k'),b=sigV(q,'c');const u8=pdfBuild({num:m.num,dt:m.dt,B:m.B,hash:m.hash,k:m.k,c:m.c,final:fin,sigs:{k:a,c:b},done:sigDone(q)});PDFX.last=u8;PDFX.name='Contrato-'+m.num+(fin?'-assinado':'-minuta')+'.pdf';return u8}
function pdfAct(a,q,p){if(!q)return;const own=p=='c'?(q.cr==ME?partyC(q).miss:[]):(partyK(q).me?partyK(q).miss:[]);
if(own.length){toast('Complete '+own.join(' e ')+' no seu perfil para gerar o contrato.');return go(p+'_pe')}
const u8=ctPdf(q),url=URL.createObjectURL(new Blob([u8],{type:'application/pdf'}));
if(a=='view'){const w=window.open(url,'_blank');if(!w){const x=document.createElement('a');x.href=url;x.target='_blank';x.rel='noopener';document.body.appendChild(x);x.click();x.remove()}toast('PDF aberto em uma nova aba.')}
else{const x=document.createElement('a');x.href=url;x.download=PDFX.name;document.body.appendChild(x);x.click();x.remove();toast(sigBoth(q)?'Contrato assinado baixado em PDF.':'Minuta do contrato baixada em PDF.')}
setTimeout(()=>URL.revokeObjectURL(url),20000)}

/* ---- telas ---- */
function ctHtml(m){return m.B.map(b=>b.t=='h'?`<h4 class="cth">${pyEsc(b.x)}</h4>`:b.t=='p'?`<p class="ctp">${pyEsc(b.x)}</p>`:`<h4 class="cth">${pyEsc(b.h.toUpperCase())}</h4>`+K(b.rows.map(([l,v])=>[pyEsc(l),pyEsc(v)]))).join('')}
const pdfBtns=q=>sigBoth(q)?`<button class="bt" data-pdf="get:${q.id}">Baixar contrato assinado (PDF)</button><button class="bt o" data-pdf="view:${q.id}">Visualizar PDF</button>`:`<button class="bt o" data-pdf="get:${q.id}">Baixar minuta (PDF)</button>`;
function ctPanel(q,v,p){const m=ctGet(q),done=sigDone(q),miss=(q.cr==ME&&v=='c'?partyC(q).miss:(v!='c'&&partyK(q).me?partyK(q).miss:[]));
const w=`<span class="pl w">Falta preencher</span>`,val=x=>x?pyEsc(x):w;
const sg=r=>{const s=sigV(q,r);return s?`<b>Assinado</b><br>${FDH(new Date(s.dt))}<br><small>Código ${s.cod}</small>`:r=='k'&&q.sgP?'Pagamento confirmado<br><small>A assinatura é registrada quando o criador completar os dados.</small>':'Aguardando assinatura'};
return (done?`<div class="np ok">${IC('check',18,2)}<span>Contrato assinado pelas duas partes em ${FDH(done)}. O PDF com as assinaturas digitais já está pronto.</span></div>`:'')
+SHD('Partes do contrato')+Card(K([['Contratante',pyEsc(m.k.nome)],['CNPJ',val(m.k.doc)],['Representante',val(m.k.resp)],...(m.k.ag&&m.k.cli?[['Cliente',pyEsc(m.k.cli)]]:[]),['Contratado(a)',pyEsc(m.c.nome)],['CPF',val(m.c.doc)],['Cidade',val([m.c.cidade,m.c.uf].filter(Boolean).join('/'))]]))
+(miss.length&&!done?`<div class="np wn">${IC('lock',18,2)}<span>Falta ${miss.join(' e ')} no seu perfil. Esses dados entram no contrato e na assinatura.</span></div><button class="bt o" data-g="${p}_pe">Completar meus dados</button>`:'')
+SHD('Assinaturas digitais')+Card(K([['Contratante',sg('k')],['Contratado(a)',sg('c')]]))
+`<details class="fq"><summary>Ler o contrato completo</summary><div class="ctx">${ctHtml(m)}</div></details>`
+pdfBtns(q)+(v!='c'&&q.st=='contrato'&&!q.signed&&q.cr!=ME?simSign(q):'')
+`<p class="cap" style="text-align:left">${IC('lock',14,2)} ${done?'O PDF final traz a assinatura digital das duas partes, o código de autenticação e o hash SHA-256 do contrato.':'A minuta já traz os dados das duas partes. O PDF final, com as assinaturas digitais, é gerado quando as duas partes assinarem.'}</p>`}

const simSign=q=>{const n=crOf(q.cr).n;return`<div class="sim"><b>Simulação · assinatura de ${pyEsc(n)}</b><small>No uso real, o criador assina pelo app dele. Aqui você simula a assinatura para gerar o PDF final com as duas assinaturas digitais.</small><button class="bt" data-nx="simsign:${q.id}">Assinar como ${pyEsc(n)}</button></div>`};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pdf]');if(!b)return;e.stopPropagation();e.preventDefault();const[a,id]=b.dataset.pdf.split(':');pdfAct(a,PRP.find(x=>x.id==id),(profOf(cur)||PF[1]).p)},true);
