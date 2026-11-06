import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':460,'height':1000})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///mnt/user-data/outputs/triskel_prototipo.html')
        ev=pg.evaluate
        txt=lambda:ev("document.getElementById('m').innerText.replace(/\\s+/g,' ')")
        toast=lambda:ev("document.getElementById('ts').textContent")
        async def shot(n):await pg.screenshot(path=f'/tmp/a/ex_{n}.png')
        def ok(c,msg):print(('OK  ' if c else 'FAIL'),msg)
        async def typ(sel,v):
            await pg.fill(sel,'');await pg.type(sel,v)
        # ===== regras (dados) =====
        ok(await ev("!!exBlocked('e','la')"),'Doce Vale x Lucas: exclusividade assinada de Café Lume (mesmo ramo, entrega dentro do período) → conflito')
        ok(not await ev("!!exBlocked('e','mm')"),'Doce Vale x Marjorie: mesma empresa → sem conflito')
        ok(not await ev("!!exBlocked('e','rf')"),'criador sem exclusividade → sem conflito')
        ok(not await ev("!!exBlocked('a','bt')"),'agência (cliente Alimentação) x Bianca (exclusividade em Beleza) → sem conflito')
        ok(await ev("!!exQ(PRP.find(x=>x.id=='PR-7'))"),'PR-7 (Studio Bela Pele, Beleza) x Bianca exclusiva em Beleza → conflito')
        ok(await ev("!!exQ(PRP.find(x=>x.id=='PR-2'))"),'PR-2 (Doce Vale) x Lucas exclusivo Alimentação → conflito')
        ok(not await ev("!!exQ(PRP.find(x=>x.id=='PR-3'))"),'PR-3 (Bianca, Alimentação) → sem conflito')
        ok(not await ev("!!exQ(PRP.find(x=>x.id=='PR-1'))"),'contrato assinado da Marjorie não conflita consigo mesmo')
        # só assinados contam
        ok(await ev("(()=>{const q=PRP.find(x=>x.id=='PR-8');q.signed=0;const r=isSig(q);q.signed=1;return r})()")==False,'contrato pago mas não assinado pelo criador NÃO conta (só assinado)')
        ok(not await ev("(()=>{const q=PRP.find(x=>x.id=='PR-8');q.st='aceita';const r=!!exBlocked('e','la');q.st='contrato';return r})()"),'contrato apenas aceito (não fechado) NÃO conflita')
        ok(not await ev("(()=>{const q=PRP.find(x=>x.id=='PR-8');q.st='aberta';const r=!!exBlocked('e','la');q.st='contrato';return r})()"),'proposta aberta NÃO conflita')
        ok(await ev("!!exBlocked('e','la')"),'restaurado: conflito volta')
        # janela
        ok(not await ev("!!exBlocked('e','la',new Date(2026,10,19))"),'entrega antes do início da exclusividade (19/11) → sem conflito')
        ok(await ev("!!exBlocked('e','la',new Date(2026,10,20))"),'entrega no 1º dia (20/11) → conflito')
        ok(await ev("!!exBlocked('e','la',new Date(2027,0,19))"),'entrega no último dia (19/01/2027) → conflito')
        ok(not await ev("!!exBlocked('e','la',new Date(2027,0,20))"),'entrega depois do fim (20/01/2027) → sem conflito')
        # ramo
        ok(not await ev("(()=>{const c=cdGet('a'),o=c.cliente;c.cliente='Studio Bela Pele';const r=!!exBlocked('a','bt');c.cliente=o;return r})()") ==False,'agência com cliente Beleza (25/11) x Bianca → conflito mesmo ramo')
        ok(await ev("(()=>{const c=cdGet('a'),o=c.cliente;c.cliente='Clínica Sorriso Sul';const r=exBlocked('a','bt');c.cliente=o;return r&&r.rel})()")==True,'cliente Saúde x Beleza → conflito por ramo relacionado')
        ok(not await ev("(()=>{const c=cdGet('a'),o=c.cliente;c.cliente='PetShop Amigo Fiel';const r=!!exBlocked('a','bt');c.cliente=o;return r})()"),'cliente Pets x Beleza → sem conflito (ramos distintos)')
        # reverso: campanha nova exclusiva x contrato assinado existente
        ok(await ev("(()=>{const c=cdGet('e');c.excl='60 dias';c.entrega='01/11/2026';const r=!!exBlocked('e','bt');c.excl='Nenhuma';c.entrega='25/11/2026';return r})()")==False,'reverso: Bianca/Alimentação sem contrato no ramo → sem conflito')
        ok(await ev("(()=>{const c=cdGet('e'),o=[c.excl,c.entrega];c.excl='60 dias';c.entrega='01/11/2026';const r=exBlocked('e','mm');c.excl=o[0];c.entrega=o[1];return !!r})()")==False,'reverso: mesma empresa (Doce Vale) → sem conflito')
        ok(await ev("(()=>{const c=cdGet('e'),o=[c.excl,c.entrega];const q=PRP.find(x=>x.id=='PR-8'),s=q.cr;q.cr='mm';q.signed=1;c.excl='60 dias';c.entrega='01/11/2026';const r=exBlocked('e','mm');q.cr=s;c.excl=o[0];c.entrega=o[1];return r&&r.by})()")=='b','reverso: campanha exclusiva cobre entrega de contrato assinado de outra marca do ramo → conflito (by b)')
        # ===== comércio: busca =====
        await ev("go('e4','r')");t=await txt()
        ok(await ev("[...document.querySelectorAll('#sres .cd.rs')].some(c=>/Lucas Amaral/.test(c.innerText)&&/Conflito de exclusividade/.test(c.innerText)&&c.querySelector('button[disabled]'))"),'busca: card de Lucas com selo de conflito e botão desabilitado')
        ok(await ev("[...document.querySelectorAll('#sres .cd.rs')].some(c=>!/Conflito/.test(c.innerText)&&c.querySelector('[data-nx^=prop]'))"),'busca: criadores sem conflito seguem com "Enviar proposta"')
        ok('outra marca' in t and 'Café Lume' not in t,'busca não revela o nome da marca concorrente')
        await shot('busca_e')
        await ev("PRP.find(x=>x.id=='PR-2').st='recusada'");await ev("PICK.e='la'");await ev("go('e_cr','r')");t=await txt()
        ok('Conflito de exclusividade' in t and 'Indisponível no período' in t,'perfil de Lucas: aviso + botão indisponível');await shot('perfil_e')
        await ev("PRP.find(x=>x.id=='PR-2').st='aberta'")
        # compor/enviar mesmo assim (forçando) → bloqueia
        n0=await ev("PRP.length");await ev("go('e5','r')");t=await txt()
        ok('conflito de exclusividade' in t.lower(),'compor: banner de conflito para Lucas')
        await pg.click('[data-nx=send]');ok('exclusividade' in (await toast()).lower() or 'Escolha uma entrega' in await toast(),'envio bloqueado: '+(await toast())[:70]);ok(await ev("PRP.length")==n0,'nenhuma proposta criada')
        # ajustar prazo ao vivo
        await typ('[data-nf=prazo]','25012027');ok(await ev("document.getElementById('exw').innerText.trim()")=='','prazo depois do fim → banner some ao vivo')
        await typ('[data-nf=prazo]','25112026');ok('conflito' in (await ev("document.getElementById('exw').innerText")).lower(),'voltando o prazo → banner volta ao vivo')
        await typ('[data-nf=prazo]','25012027')
        await pg.click('[data-nx=send]');ok(await ev("PRP.length")==n0+1,'prazo fora do período → proposta enviada');
        ok(await ev("(()=>{const q=PRP[PRP.length-1];return q.cr+'|'+q.camp.seg+'|'+q.camp.excl})()")=='la|Alimentação|0','snapshot da proposta guarda ramo e exclusividade')
        # ===== comércio: conversa PR-2 =====
        await ev("CTX.e='PR-2'");await ev("go('e_th','r')");t=await txt()
        ok('Conflito de exclusividade' in t and 'Aceite indisponível' in t,'PR-2: conversa mostra conflito e aceite indisponível');await shot('thread_e')
        ok(await ev("!document.querySelector('[data-nx^=\"accept:\"]')"),'sem botão de aceitar ativo')
        ok(await ev("typeof doAccept")=='function' and True,'-')
        await ev("(()=>{const f=PRP.find(x=>x.id=='PR-2');window.__st=f.st})()")
        await ev("document.querySelector('[data-nx^=\"cp:\"]')&&0")
        # ===== agência =====
        await ev("CTX.a='PR-7'");await ev("go('a_th','r')");t=await txt()
        ok('Conflito de exclusividade' in t,'PR-7 (agência): conflito na conversa')
        sim=await ev("!!document.querySelector('[data-nx^=\"sim:accept\"]')")
        if sim:
            await pg.click('[data-nx^="sim:accept"]');ok('exclusividade' in (await toast()).lower() or 'Escolha' in await toast(),'simular aceite do criador: bloqueado');ok(await ev("PRP.find(x=>x.id=='PR-7').st")=='aberta','PR-7 segue aberta')
        else: ok(False,'botão de simulação não encontrado')
        await ev("go('a4','r')");ok(await ev("cmpIds('a').indexOf('la')<0"),'agência: seleção padrão ignora criador em conflito')
        # ===== criador (Marjorie) =====
        await ev("go('c4','r')");t=await txt()
        ok('Exclusividade de 60 dias' in t and 'Exclusividade de 30 dias' in t,'campanhas exclusivas mostram o selo');ok('Conflito de exclusividade' not in t,'inicialmente sem conflito para Marjorie');await shot('c4')
        await ev("CSR.pick='ct'");await ev("go('c5','r')");t=await txt()
        ok('Exclusividade' in t and '60 dias, de 05/12/2026 até 03/02/2027' in t,'candidatura mostra período da exclusividade');ok('mesmo ramo' in t,'explica o efeito da exclusividade');await shot('c5_excl')
        await pg.click('[data-nx=apply]');q=await ev("PRP[PRP.length-1].id");ok(await ev("PRP[PRP.length-1].camp.excl")==60 and await ev("PRP[PRP.length-1].camp.seg")=='Alimentação','candidatura guarda ramo e exclusividade de 60 dias')
        ok(not await ev("!!exQ(PRP[PRP.length-1])"),'ainda sem conflito')
        await ev("(()=>{const q=PRP[PRP.length-1];doAccept(q,'k');})()");await ev("(()=>{const q=PRP[PRP.length-1];payQ(q)})()")
        ok(await ev("PRP[PRP.length-1].st")=='contrato','contratante aceitou e pagou')
        ok(not await ev("!!exCamp(campOf('cv'))"),'antes de assinar: contrato pago mas NÃO assinado ainda não bloqueia Doce Vale') if False else None
        ok(not await ev("!!exCamp(campOf('cv'))"),'antes da assinatura não há bloqueio (só contrato assinado conta)')
        await ev("CTX.c=PRP[PRP.length-1].id");await ev("go('c10','r')");await pg.check('label.ck input');await pg.click('[data-nx=sign]')
        ok(await ev("PRP[PRP.length-1].signed")==1,'criador assinou o contrato')
        ok(await ev("!!exCamp(campOf('cv'))"),'depois de assinar: Cardápio de verão (Doce Vale, 15/12) entra em conflito')
        ok(not await ev("!!exCamp(campOf('ci'))"),'campanha com entrega antes do período (20/11) segue liberada')
        ok(not await ev("!!exCamp(campOf('cs'))"),'ramo sem relação (Beleza) segue liberado')
        await ev("go('c4','r')");t=await txt()
        ok(await ev("[...document.querySelectorAll('#sres .cd.rs')].some(c=>/Cardápio de verão/.test(c.innerText)&&/Conflito de exclusividade/.test(c.innerText)&&/Ver detalhes/.test(c.innerText))"),'lista do criador marca conflito e troca o botão');await shot('c4_conf')
        await ev("CSR.pick='cv'");await ev("go('c5','r')");t=await txt()
        ok('Conflito de exclusividade' in t and 'Café Colonial da Serra' in t and '03/02/2027' in t and await ev("!document.querySelector('[data-nx=apply]')"),'detalhes: banner com marca e data; sem candidatura');await shot('c5_conf')
        n1=await ev("PRP.length");await ev("applySend()");ok('exclusividade' in (await toast()).lower() or 'Você assinou' in await toast(),'applySend bloqueado');ok(await ev("PRP.length")==n1,'nenhuma candidatura criada')
        # proposta recebida em conflito: PR-4 não conflita (20/11) mas nova da Doce Vale em 15/12 conflita
        await ev("go('c_ct','r')");t=await txt()
        ok('Exclusividades vigentes' in t and 'Café Colonial da Serra' in t and '03/02/2027' in t,'Contatos: lista exclusividades vigentes');await shot('c_ct')
        # proposta existente do criador em conflito: PR-5? mesma empresa → ok
        ok(not await ev("!!exQ(PRP.find(x=>x.id=='PR-5'))"),'PR-5 (agência, cliente Doce Vale; aceita) sem conflito')
        # nova proposta conflitante chega e não pode ser aceita/assinada/paga
        await ev("PRP.push({id:'PR-X1',k:'x',kn:'Doce Vale Confeitaria',cr:'mm',camp:{nome:'Teste',obj:'x',fmt:'Reels',vids:1,seg:'Alimentação',excl:0},st:'aberta',seed:0,un:{c:1,k:0},rounds:[{by:'k',valor:300,prazo:'20/12/2026',uso:'90 dias',msg:'oi',dt:new Date()}],msgs:[]})")
        await ev("CTX.c='PR-X1'");await ev("go('c_th','r')");t=await txt()
        ok('Aceite indisponível' in t and 'Você assinou exclusividade com Café Colonial da Serra' in t,'proposta conflitante: aviso para o criador citando a própria exclusividade');await shot('c_th_conf')
        await ev("go('c7','r')") ; 
        await ev("CTX.c='PR-X1'");await ev("go('c_th','r')")
        # contraproposta com prazo depois do fim resolve ao vivo
        await pg.click('[data-nx^="cp:"]');ok(await ev("cur")=='c8','abre contraproposta')
        ok('conflito' in (await ev("document.getElementById('exw').innerText")).lower(),'contraproposta: aviso ao vivo para o prazo atual')
        await typ('[data-nf=prazo]','10022027');ok((await ev("document.getElementById('exw').innerText")).strip()=='','prazo após 03/02/2027 → aviso some')
        # aceitar pelo handler direto continua bloqueado
        await ev("CTX.c='PR-X1'");await ev("go('c_th','r')");await ev("document.dispatchEvent(new Event('x'))")
        await ev("(()=>{const b=document.createElement('button');b.dataset.nx='accept:PR-X1';m.appendChild(b);b.click()})()")
        ok(await ev("PRP.find(x=>x.id=='PR-X1').st")=='aberta','aceite forçado pelo handler também é bloqueado')
        # contrato: linha de conflito
        await ev("(()=>{const q=PRP.find(x=>x.id=='PR-X1');q.st='aceita'})()");await ev("CTX.c='PR-X1'");await ev("go('c10','r')");t=await txt()
        ok('Conflito de exclusividade' in t and 'Há conflito' in t,'contrato mostra "Há conflito"')
        await ev("CTX.c='PR-1'");await ev("go('c10','r')");t=await txt()
        ok('Nenhum conflito' in t and 'Exclusividade Nenhuma' in t,'contrato sem exclusividade: "Nenhuma" + "Nenhum conflito ✓"')
        await ev("CTX.c=PRP.find(x=>x.camp.nome=='Café da manhã colonial').id");await ev("go('c10','r')");t=await txt()
        ok('60 dias, de 05/12/2026 até 03/02/2027' in t and 'Nenhum conflito' in t,'contrato exclusivo: período e sem conflito')
        # pagar/assinar conflito
        await ev("PRP.find(x=>x.id=='PR-X1').st='aceita'")
        await ev("CTX.c='PR-X1'")
        r=await ev("(()=>{const x=PRP.find(x=>x.id=='PR-X1');x.st='contrato';x.signed=0;const cf=exQ(x);x.st='aceita';return !!cf})()");ok(r,'assinatura de contrato em conflito seria bloqueada (exQ)')
        # dark / sweep
        await ev("go('c_ct','r')");await ev("document.getElementById('ph').classList.add('dark')");await shot('c_ct_dark')
        ok(errs==[],'sem erros JS: '+str(errs))
        await b.close()
asyncio.run(main())
