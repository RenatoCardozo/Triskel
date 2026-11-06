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
const t={id:'TRX-'+rid(8),kind:'pay',payer:p,desc:q.camp.nome,cr:crOf(q.cr).n,valor:v,fee:k.fee,total:k.tot,met:'saldo',det:SALDO,st:'custodia',dt:new Date()};TXS.unshift(t);q.st='contrato';q.tx=t.id;
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
+`<div class="rd"><div class="rdh"><b>Relatório da IA</b><small>${dtf(ia.dt)}</small></div><div style="padding:2px 0 8px"><span class="pl ${ia.ok?'g':'w'}">${ia.ok?'Dentro dos padrões':'Fora dos padrões'}</span> <span class="pl">Pontuação ${ia.score}/100</span></div>`+K(iaRows(ia))+`</div>`
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
return`<div class="pyc"><div class="pyic">${IC('check',44,2.6)}</div><h2>Pagamento liberado</h2><p>${p=='c'?'A Triskel confirmou a publicação e liberou o pagamento para a sua carteira.':'A Triskel confirmou a publicação do post e liberou o pagamento para '+pyEsc(crOf(q.cr).n)+'.'}</p></div>`
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
if(a=='simpay'){const q=PRP.find(x=>x.id==r[0]);if(!q||q.st!='aceita')return;const t=payQ(q);if(!t)return toast(q.kn+' ainda não tem saldo suficiente na carteira.');toast('Contrato pago. O valor ficou em custódia.');CTX.c=q.id;return refresh()}}
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
