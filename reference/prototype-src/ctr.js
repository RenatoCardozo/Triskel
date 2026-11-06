
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
