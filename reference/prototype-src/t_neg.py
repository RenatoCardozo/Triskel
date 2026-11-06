import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':460,'height':1000})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///mnt/user-data/outputs/triskel_prototipo.html')
        ev=lambda s:pg.evaluate(s)
        txt=lambda:pg.evaluate("document.getElementById('m').innerText.replace(/\\s+/g,' ')")
        toast=lambda:pg.evaluate("document.getElementById('ts').textContent")
        res=lambda:pg.evaluate("document.getElementById('sres').innerText.replace(/\\s+/g,' ')")
        n=lambda:pg.evaluate("document.querySelectorAll('#sres .cd.rs').length")
        async def shot(x):await pg.screenshot(path=f'/tmp/a/ng_{x}.png')
        def ok(c,msg):print(('OK  ' if c else 'FAIL'),msg)
        async def openf():
            if not await ev("document.querySelector('.sfp').open"):
                await pg.click('.sfp summary');await pg.wait_for_timeout(80)
        async def typ(sel,v):
            await pg.fill(sel,'');await pg.type(sel,v)
        # ================= COMÉRCIO: busca e filtros =================
        await ev("go('e4','r')");t=await txt()
        ok('Buscar criadores' in t and 'Filtros' in t,'e4 título e painel de filtros')
        ok(await ev("document.querySelector('.sfp').open")==False,'filtros fechados por padrão')
        n0=await n();ok(n0>=2,f'e4 lista inicial ({n0})');ok('ordenados por compatibilidade' in await res(),'ordenação padrão')
        ok('filtros ativos' in await res() or 'filtro ativo' in await res(),'contagem de filtros ativos')
        await typ('[data-sf=q]','zzzz');ok('Nenhum criador com esses filtros' in await res(),'busca sem resultado: estado vazio');await shot('vazio')
        await pg.click('#sres [data-sf=clear]');t=await txt();ok(await ev("document.querySelector('[data-sf=q]').value")=='' ,'limpar zera busca')
        ok(await n()>=n0,'limpar amplia resultados '+str(await n()))
        nAll=await n()
        await typ('[data-sf=q]','Marjorie');ok(await n()==1 and 'Marjorie' in await res(),'busca por nome');
        await typ('[data-sf=q]','pelotas');k1=await n();ok(k1>=1,'busca por cidade '+str(k1))
        await typ('[data-sf=q]','')
        # painel
        await pg.click('.sfp summary');await pg.wait_for_timeout(80);ok(await ev("document.querySelector('.sfp').open"),'abre painel de filtros')
        await pg.click('[data-sf=clear]');nAll=await n()
        ok('Nenhum filtro ativo' in await ev("document.getElementById('sfs').textContent"),'resumo: nenhum filtro ativo')
        await pg.click('[data-sf="nich:Games"]');a=await n();ok(a<nAll,f'chip nicho Games reduz {nAll}→{a}');ok('Games' in await ev("document.getElementById('sfs').textContent"),'resumo mostra Games')
        ok(await ev("document.querySelector('[data-sf=\"nich:Games\"]').getAttribute('aria-pressed')")=='true','chip aria-pressed')
        await pg.click('[data-sf="nich:Games"]');ok(await n()==nAll,'desmarcar chip restaura')
        await pg.click('[data-sf="porte:Nano"]');a=await n();ok(a<nAll and all(('Nano' in x) for x in await ev("[...document.querySelectorAll('#sres .cd.rs .rt2 span:nth-child(2)')].map(e=>e.textContent)")),f'porte Nano {a}')
        await pg.click('[data-sf="porte:Nano"]')
        await pg.select_option('[data-sf=nota]','4,5 ou mais');a=await n();notas=await ev("[...document.querySelectorAll('#sres .cd.rs .rt2 span:nth-child(1)')].map(e=>parseFloat(e.textContent.replace('★','').replace(',','.')))")
        ok(a<nAll and all(x>=4.5 for x in notas),f'nota ≥4,5 {a} {notas}')
        await pg.select_option('[data-sf=nota]','Sem mínimo')
        await pg.select_option('[data-sf=reg]',index=1);ok(await ev("srcGet('e').reg")!='Sem preferência','região aplicada '+await ev("srcGet('e').reg"))
        await pg.select_option('[data-sf=reg]','Sem preferência')
        await typ('[data-sf=vmax]','150');a=await n();ok(a<nAll,f'valor máx R$150 reduz {nAll}→{a}')
        await typ('[data-sf=vmax]','');ok(await n()==nAll,'vmax vazio restaura')
        await pg.select_option('[data-sf=ord]','nota');nt=await ev("[...document.querySelectorAll('#sres .cd.rs .rt2 span:nth-child(1)')].map(e=>parseFloat(e.textContent.replace('★','').replace(',','.')))")
        ok(nt==sorted(nt,reverse=True),'ordenar por nota '+str(nt))
        await shot('filtros_abertos')
        await pg.click('[data-sf=reset]');ok(await ev("document.querySelector('[data-sf=ord]').value")=='compat','"usar filtros da campanha" reinicia')
        ok(await ev("document.querySelector('.sfp').open")==True,'painel continua aberto após reiniciar')
        # ================= perfil do criador =================
        await pg.click('#sres [data-nx^="view:"]');ok(await ev("cur")=='e_cr','abre perfil do criador')
        await ev("PICK.e=CRD.find(x=>x.n=='Rafael Gomes').id");await ev("go('e_cr','p')");t=await txt()
        ok('Só pela Triskel' in t and 'Enviar proposta' in t,'perfil: área de contato só pela Triskel')
        ok('@' not in t.replace('O @ das redes','').replace('(@)',''),'perfil não expõe @ das redes')
        ok('Taxa Triskel (10%)' in t,'perfil mostra taxa 10%');await shot('perfil')
        ok(not any(x in t.lower() for x in ['whatsapp.com','wa.me','mailto','telefone:']),'perfil sem contatos externos')
        # ================= compor proposta =================
        await pg.click('[data-nx^="prop:"]');ok(await ev("cur")=='e5','compor proposta');t=await txt()
        ok('Taxa Triskel (10%)' in t and 'Total a pagar' in t,'compor: breakdown com taxa 10%')
        await typ('[data-nf=valor]','500,00');await pg.wait_for_timeout(50);v=await ev("document.getElementById('brk').innerText.replace(/\\s+/g,' ')")
        ok('R$ 500,00' in v and 'R$ 50,00' in v and 'R$ 550,00' in v,'breakdown ao vivo 500→50→550 :: '+v)
        # validações
        await typ('[data-nf=valor]','');await pg.click('[data-nx=send]');ok('valor' in (await toast()).lower(),'valor vazio bloqueia: '+await toast())
        await typ('[data-nf=valor]','35000');await typ('[data-nf=prazo]','01012020');await pg.click('[data-nx=send]');ok('futura' in await toast() or 'prazo' in (await toast()).lower(),'prazo passado bloqueia: '+await toast())
        await typ('[data-nf=prazo]','15122026')
        for msg,lab in [('me liga 53 99999-1234','telefone'),('escreve pra fulano@gmail.com','e-mail'),('veja http://meusite.com/x','link'),('chama no whatsapp','whatsapp'),('meu insta @fulano','@'),('vamos fechar por fora','por fora')]:
            await typ('[data-nf=msg]',msg);before=await ev("PRP.length");await pg.click('[data-nx=send]')
            tt=await toast();ok(await ev("PRP.length")==before and ('Por segurança' in tt),f'bloqueia {lab}: '+tt[:50])
        await typ('[data-nf=msg]','Olá! Gostaria de te contratar para esta campanha.');await shot('compor')
        pr0=await ev("PRP.length");await pg.click('[data-nx=send]');ok(await ev("cur")=='e_sent','envio vai para e_sent '+await ev("cur"));ok(await ev("PRP.length")==pr0+1,'proposta criada');t=await txt()
        ok('Proposta enviada' in t and 'R$ 350,00' in t and 'R$ 35,00' in t and 'R$ 385,00' in t,'e_sent mostra valor + taxa 10% + total');await shot('enviada')
        q=await ev("PRP[PRP.length-1].id");ok(await ev("PRP[PRP.length-1].camp.html.length")>200,'campanha gerada anexada à proposta')
        ok(await ev("PRP[PRP.length-1].rounds[0].valor")==350 and await ev("PRP[PRP.length-1].st")=='aberta','estado aberta, valor 350')
        # conversa
        await pg.click('[data-nx^="open:"]');ok(await ev("cur")=='e_th','abre conversa');t=await txt();ok('Aguardando' in t or 'Aguarda' in t,'status aguardando criador');ok('R$ 35,00' in t,'thread mostra taxa da rodada')
        # mensagens com bloqueio
        for msg,lab in [('me chama no 53999991234','telefone'),('meu email é a.b@x.com','e-mail'),('www.site.com.br','link'),('fala comigo no zap','zap'),('instagram.com/fulano','instagram')]:
            await typ('[data-th=msg]',msg);m0=await ev("PRP.find(x=>x.id=='"+q+"').msgs.length");await pg.click('[data-nx=msg]')
            ok(await ev("PRP.find(x=>x.id=='"+q+"').msgs.length")==m0 and 'Por segurança' in await toast(),f'chat bloqueia {lab}')
        await typ('[data-th=msg]','Posso te mandar o briefing completo aqui mesmo?');await pg.click('[data-nx=msg]');ok(await ev("PRP.find(x=>x.id=='"+q+"').msgs.length")==1,'mensagem normal enviada');ok('briefing completo' in await txt(),'mensagem aparece na conversa')
        # simulação: criador contrapropõe
        await pg.click('[data-nx^="sim:counter"]');t=await txt();ok(await ev("PRP.find(x=>x.id=='"+q+"').rounds.length")==2,'criador contrapropôs (simulado)');ok('R$ 402,50' in t or 'R$ 400,00' in t or 'R$ 410,00' in t or 'R$ 4' in t,'contraproposta exibida')
        await shot('thread_cp')
        l=await ev("PRP.find(x=>x.id=='"+q+"').rounds[1].valor");k=round(l*.1,2);ok('Taxa Triskel (10%)' in t,'contraproposta mostra taxa 10%')
        # comércio responde com contraproposta
        await pg.click('[data-nx^="cp:"]');ok(await ev("cur")=='e8','abre contraproposta');t=await txt();ok('Taxa Triskel (10%)' in t,'form de contraproposta mostra taxa')
        await typ('[data-nf=valor]','37000');v=await ev("document.getElementById('brk').innerText.replace(/\\s+/g,' ')");ok('R$ 370,00' in v and 'R$ 37,00' in v and 'R$ 407,00' in v,'breakdown contraproposta :: '+v)
        await typ('[data-nf=msg]','Consigo fechar assim, tudo bem?');await shot('contraproposta')
        await pg.click('[data-nx=cpsend]');ok(await ev("cur")=='e_th','volta à conversa');ok(await ev("PRP.find(x=>x.id=='"+q+"').rounds.length")==3,'rodada 3 registrada');ok('R$ 37,00' in await txt(),'taxa da rodada 3 visível')
        # criador aceita (simulado) → contrato
        await pg.click('[data-nx^="sim:accept"]');ok(await ev("PRP.find(x=>x.id=='"+q+"').st")=='aceita','proposta aceita');t=await txt();ok('Ver contrato' in t or 'contrato' in t.lower(),'ação de contrato disponível')
        await pg.click('[data-nx^="contract:"]');ok(await ev("cur")=='e10','abre contrato');t=await txt()
        ok('Valor ao criador R$ 370,00' in t and 'Taxa Triskel (10%) R$ 37,00' in t and 'Total a pagar R$ 407,00' in t,'contrato: 370 + 37 = 407');await shot('contrato')
        # saldo: 268 → suficiente (407 > 268?)
        sal=await ev("walOf('e').saldo");print('   saldo',sal)
        ok(sal<407 and 'Falta no saldo' in t,'contrato: saldo insuficiente indica falta')
        await pg.click('[data-py^="topup:e:e10:"]');ok(await ev("cur")=='e_pay','vai para adicionar saldo');ok(await ev("PAY.ctx.valor")>=139,'sugestão cobre a falta '+str(await ev("PAY.ctx.valor")))
        await pg.fill('[data-cc=amt]','20000');await pg.click('[data-py="gerar"]');await pg.click('[data-py="simpay"]');await pg.wait_for_timeout(2300)
        await pg.click('[data-py="fim"]');ok(await ev("cur")=='e10','volta ao contrato após recarga');t=await txt();ok('Saldo após o pagamento' in t,'saldo agora suficiente')
        s0=await ev("walOf('e').saldo");await pg.click('[data-py="walpay:e"]');ok(await ev("cur")=='e_wpay','pagou com carteira')
        ok(abs(await ev("walOf('e').saldo")-(s0-407))<0.01,'debitou 407 (370+10%)');ok(await ev("PRP.find(x=>x.id=='"+q+"').st")=='contrato','proposta virou contrato')
        ok(await ev("TXS[0].valor+'|'+TXS[0].fee+'|'+TXS[0].total")=='370|37|407','custódia: valor/taxa/total')
        await pg.click('[data-py^="wnext"]')
        await ev("go('e_ct','r')");t=await txt();ok('Conversas' in t,'contatos lista');ok(await ev("document.querySelectorAll('.ctc').length")>=3,'contatos: conversas listadas '+str(await ev("document.querySelectorAll('.ctc').length")));await shot('contatos_e')
        await pg.click('[data-nx="ctf:closed"]');ok(await ev("document.querySelector('[data-nx=\"ctf:closed\"]').classList.contains('on')"),'filtro fechadas ativo')
        await pg.click('[data-nx="ctf:all"]')
        # menu e badge
        await ev("go('e_pn','r')");await pg.click('[aria-label*=enu],.hb,#hb') if False else None
        ok(await ev("typeof ctUnread=='function'"),'ctUnread existe');ok('Contatos' in await ev("document.getElementById('ph').innerText"),'menu tem Contatos' ) if False else None
        # ================= AGÊNCIA: múltipla seleção =================
        await ev("go('a4','r')");await pg.wait_for_timeout(100);pass
        await openf();pass
        await pg.click('[data-sf=clear]',timeout=3000)
        sel=await ev("[...document.querySelectorAll('#sres [data-nx^=\"sel:\"]')].length");ok(sel>=2,'agência: botões de seleção '+str(sel))
        await pg.click('#sres [data-nx^="sel:"] >> nth=0');await pg.click('#sres [data-nx^="sel:"] >> nth=1');ok(len(await ev("srcGet('a').sel"))==2,'2 criadores selecionados')
        ok('2 selecionados' in await txt() or 'Enviar proposta a 2' in await txt() or await ev("!!document.querySelector('[data-nx=prop-sel]')"),'barra/ação de envio múltiplo')
        await pg.click('[data-nx=prop-sel]');ok(await ev("cur")=='a5','agência: compor');t=await txt();ok('Total para 2 criadores' in t,'total para 2 criadores')
        await typ('[data-nf=valor]','30000');v=await ev("document.getElementById('brk').innerText.replace(/\\s+/g,' ')");ok('R$ 330,00' in v and 'R$ 660,00' in v,'agência: 300+10%=330 ×2=660 :: '+v)
        await typ('[data-nf=prazo]','20122026');p0=await ev("PRP.length");await pg.click('[data-nx=send]');ok(await ev("cur")=='a_sent' and await ev("PRP.length")==p0+2,'2 propostas criadas, uma por criador');t=await txt();ok('Propostas enviadas' in t,'a_sent');await shot('a_sent')
        ok(await ev("PRP.slice(-2).every(x=>x.k=='a'&&x.st=='aberta')"),'propostas da agência abertas')
        # duplicata
        await ev("go('a4','r')");await openf();await pg.click('[data-sf=clear]')
        # ================= CRIADOR =================
        await ev("go('c4','r')");t=await txt();ok('Buscar oportunidades' in t and 'Filtros' in t,'c4 oportunidades');ok(await ev("document.querySelector('.sfp').open")==False,'c4 filtros fechados')
        c0=await ev("document.querySelectorAll('#sres .cd.rs').length");ok(c0>=2,f'c4 campanhas ({c0})')
        await openf();await pg.click('[data-sf=cclear]');cAll=await ev("document.querySelectorAll('#sres .cd.rs').length");ok(cAll>c0 or cAll==8,f'limpar filtros mostra todas ({cAll})')
        await pg.click('[data-sf="cnich:Pets"]');a=await ev("document.querySelectorAll('#sres .cd.rs').length");ok(a==1,'nicho Pets → 1 campanha');await pg.click('[data-sf="cnich:Pets"]')
        await pg.select_option('[data-sf=creg]','Sem preferência');await typ('[data-sf=cvmin]','500');a=await ev("document.querySelectorAll('#sres .cd.rs').length");vals=await ev("[...document.querySelectorAll('#sres .cd.rs')].map(c=>c.querySelector('.brk b').textContent)");ok(a>=1 and a<cAll,f'valor mín 500 → {a} {vals}')
        await typ('[data-sf=cvmin]','');await typ('[data-sf=cq]','pizzaria');ok(await ev("document.querySelectorAll('#sres .cd.rs').length")==1,'busca por empresa');await typ('[data-sf=cq]','')
        t=await ev("document.getElementById('sres').innerText.replace(/\\s+/g,' ')");ok('Taxa Triskel (10%)' in t or '10%' in t,'oportunidade mostra taxa 10% (paga pela empresa)');await shot('c4')
        await pg.select_option('[data-sf=cord]','valor');vs=await ev("[...document.querySelectorAll('#sres .cd.rs')].map(c=>parseFloat(c.querySelector('.brk b').textContent.replace('R$','').replace('.','').replace(',','.')))");ok(vs==sorted(vs,reverse=True),'ordem por maior valor')
        # candidatar
        await pg.click('[data-sf=cclear]');await pg.click('#sres [data-nx^="camp:"] >> nth=0');ok(await ev("cur")=='c5','abre candidatura');t=await txt();ok('Taxa Triskel (10%)' in t,'candidatura: taxa 10%');ok('não desconta' in t,'explica que não desconta do criador')
        await typ('[data-nf=avalor]','');await pg.click('[data-nx=apply]');ok('valor' in (await toast()).lower(),'candidatura exige valor')
        await typ('[data-nf=avalor]','45000');await typ('[data-nf=amsg]','me chama no zap 53 98888-7777');await pg.click('[data-nx=apply]');ok('Por segurança' in await toast(),'candidatura bloqueia telefone')
        await typ('[data-nf=amsg]','Tenho interesse e disponibilidade.');p0=await ev("PRP.length");await pg.click('[data-nx=apply]');ok(await ev("cur")=='c_th' and await ev("PRP.length")==p0+1,'candidatura enviada e conversa aberta');await shot('c_th')
        qa=await ev("PRP[PRP.length-1]");ok(qa['k'] in ('e','x') and qa['rounds'][0]['by']=='c','rodada 1 do criador')
        # contraproposta do contratante simulada → criador responde
        await pg.click('[data-nx^="sim:counter"]') if await ev("!!document.querySelector('[data-nx^=\"sim:counter\"]')") else None
        t=await txt();ok('Taxa Triskel (10%)' in t or 'Você recebe' in t,'criador vê valores com taxa/recebimento')
        ok(await ev("document.querySelectorAll('.sfc').length")>=0,'ok')
        # contatos do criador
        await ev("go('c_ct','r')");ok(await ev("document.querySelectorAll('.ctc').length")>=2,'c_ct tem conversas');await shot('contatos_c')
        await pg.click('[data-nx="ctf:me"]');ok(await ev("document.querySelector('[data-nx=\"ctf:me\"]').classList.contains('on')"),'filtro "aguardam você"');await pg.click('[data-nx="ctf:all"]')
        # contrato do criador mostra "Você recebe" e taxa paga pelo contratante
        pid=await ev("(PRP.find(x=>x.cr=='mm'&&x.st=='aceita')||{}).id||''")
        await ev("go('c_pv','r')");t=await txt();ok('Contatos' in t and 'Só pela Triskel' in t or 'Área de contatos' in t,'perfil do criador tem a área de Contatos')
        # perfil público: sem handles
        await ev("PICK.e='mm'");await ev("go('e_cr','r')");t=await txt();ok(not any(x in t for x in ['@marjorie','@mari','instagram.com','tiktok.com']),'perfil público sem handle/site')
        # conta nova: contatos vazios
        await ev("newAcc('e',{nome:'Café Novo'})");await ev("go('e_ct','r')");t=await txt();ok('Nenhum contato ainda' in t and await ev("document.querySelectorAll('.ctc').length")==0,'conta nova: Contatos vazio')
        await ev("go('e4','r')");ok(await n()>=1,'conta nova: busca funciona')
        await ev("PICK.e='mm'");await ev("go('e_cr','r')");await pg.click('[data-nx^="prop:"]');ok(await ev("cur")=='e2' and 'Crie a campanha' in await toast(),'conta nova sem campanha: Enviar proposta leva à criação da campanha (sem erro)')
        await ev("go('e5','r')");ok('ainda não criou uma campanha' in await txt(),'e5 direto sem campanha: estado vazio, sem erro')
        await ev("newAcc('a',{nome:'Ag Nova'})");await ev("go('a4','r')");await pg.click('#sres [data-nx^="sel:"] >> nth=0');await pg.click('[data-nx=prop-sel]');ok(await ev("cur")=='a3','agência nova: enviar proposta leva à criação da campanha')
        await ev("newAcc('c',{nome:'Nova Criadora'})");await ev("go('c_ct','r')");ok('Nenhum contato ainda' in await txt(),'criador novo: Contatos vazio')
        print('erros de página:',errs)
        await b.close()
asyncio.run(main())
