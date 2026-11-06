import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':460,'height':1000})
        errs=[];pg.on('pageerror',lambda e:errs.append(e.message))
        await pg.goto('file:///mnt/user-data/outputs/triskel_prototipo.html')
        ev=pg.evaluate
        txt=lambda:ev("document.getElementById('m').innerText.replace(/\\s+/g,' ')")
        toast=lambda:ev("document.getElementById('ts').textContent")
        async def shot(n):await pg.screenshot(path=f'/tmp/a/dv_{n}.png')
        def ok(c,msg):print(('OK  ' if c else 'FAIL'),msg)
        async def typ(sel,v):
            await pg.fill(sel,'');await pg.type(sel,v)
        st=lambda:ev("(dlOf(PRP.find(x=>x.id=='PR-1'))||{}).st")
        # ============ CRIADOR ============
        await ev("go('c_en','r')");ok('Em produção' in await txt(),'Entregas (criador): contrato em produção')
        await pg.click('[data-dl^="open:"]');ok(await ev("cur")=='c11','abre briefing');ok(await st()=='prod','estado inicial: produção')
        t=await txt();ok('Requisitos analisados pela IA' in t and 'Logo nos primeiros 10 s' in t,'briefing com requisitos da IA')
        await pg.click('button:has-text("Enviar entrega")');ok(await ev("cur")=='c12','vai para enviar entrega')
        # validações
        await pg.click('[data-dl=submit]');ok('Escolha o vídeo' in await toast(),'sem vídeo bloqueia: '+await toast())
        await pg.click('[data-dl=sample]');await pg.click('[data-dl=submit]');ok('Aguarde' in await toast(),'upload em andamento bloqueia')
        await pg.wait_for_timeout(1400);ok('Envio concluído' in await txt(),'upload simulado concluído')
        # simulação: fora dos padrões
        await pg.select_option('[data-dl-mode]','bad') if False else None
        await pg.click('[data-dl-mode] >> xpath=..//button') if False else None
        await ev("DRF.mode='bad'");await shot('envio')
        await pg.click('[data-dl=submit]');ok(await ev("cur")=='c13','análise da IA (processamento)');await shot('analise_run')
        await pg.wait_for_timeout(3600);ok(await ev("cur")=='c14','avança sozinho para o relatório');t=await txt()
        ok('Fora dos padrões' in t and '57%' in t and 'Logo aparece aos 14 s' in t,'relatório reprova: humanização 57% e logo tardio');await shot('ia_falha')
        ok(await ev("document.querySelector('[data-dl=send]')")is None,'não envia ao contratante se reprovado')
        ok(await st()=='prod','estado continua produção')
        # corrigir e reenviar → ok
        await pg.click('[data-dl=fix]');ok(await ev("cur")=='c12','corrigir volta ao envio');ok(await ev("DRF.nome")=='','formulário limpo para novo envio')
        await pg.click('[data-dl=sample]');await pg.wait_for_timeout(1400);await pg.click('[data-dl=submit]')
        await pg.wait_for_timeout(3600);ok(await ev("cur")=='c14' and 'Dentro dos padrões' in await txt(),'IA aprova na 2ª tentativa');ok(await st()=='ia','estado: análise ok')
        await shot('ia_ok')
        # enviar para aprovação
        await pg.click('[data-dl=send]');ok(await ev("cur")=='c15' and await st()=='aprov','enviada para aprovação');await shot('aguardando')
        ok(await ev("PRP[0].un.k")==1,'contratante recebe aviso (não lida)')
        # contratante pede ajustes (simulado)
        await pg.click('[data-dl=sim-adjust]');ok(await ev("cur")=='c16' and await st()=='prod','pede ajustes → volta a produção');t=await txt();ok('pediu ajustes' in t and 'provando o doce' in t,'comentário do contratante exibido');await shot('ajustes')
        ok(await ev("dlOf(PRP[0]).aj")==1,'contagem de ajustes 1/2')
        await pg.click('button:has-text("Ajustar e reenviar")');ok(await ev("cur")=='c12','reenvio')
        await pg.click('[data-dl=sample]');await pg.wait_for_timeout(1400);await pg.click('[data-dl=submit]');await pg.wait_for_timeout(3600);await pg.click('[data-dl=send]')
        await pg.click('[data-dl=sim-approve]');ok(await st()=='aprovado','aprovada pelo contratante');ok(await ev("cur")=='c16' and 'Entrega aprovada' in await txt(),'tela de resultado: aprovada')
        # pagamento ainda em custódia
        ok(await ev("TXS.find(t=>t.id=='TRX-7K3M9QX2').st")=='custodia','dinheiro ainda em custódia após aprovação')
        w0=await ev("wal().disp");c0=await ev("wal().cust")
        await pg.click('button:has-text("Publicar e confirmar")');ok(await ev("cur")=='c_pb','publicar e confirmar')
        await pg.click('[data-dl=publish]');ok('link de um post' in await toast(),'sem link bloqueia')
        await typ('[data-dl-pub]','meusite.com/post');await pg.click('[data-dl=publish]');ok('link de um post' in await toast(),'link inválido bloqueia')
        await typ('[data-dl-pub]','instagram.com/reel/CxYz1234');await pg.click('[data-dl=publish]');await pg.wait_for_timeout(300);await shot('verificando')
        ok(await ev("cur")=='c_pb' and 'conferindo o post' in await txt(),'plataforma confere o post');ok(await ev("TXS.find(t=>t.id=='TRX-7K3M9QX2').st")=='custodia','ainda em custódia durante a verificação')
        await pg.wait_for_timeout(3600);ok(await ev("cur")=='c18','confirmada → pagamento liberado');t=await txt();ok('Pagamento liberado' in t and 'R$ 420,00' in t and 'TRX-7K3M9QX2' in t,'c18 mostra valor e transação')
        ok(await ev("TXS.find(t=>t.id=='TRX-7K3M9QX2').st")=='liberado','TX liberada');w1=await ev("wal().disp");ok(abs(w1-w0-420)<0.01,f'carteira do criador +420 ({w0}→{w1})');ok(abs(c0-await ev("wal().cust")-420)<0.01,'custódia do criador −420');await shot('liberado')
        ok(await st()=='liberado','estado: liberado')
        await ev("go('c_pgt','r')");ok('R$' in await txt(),'carteira do criador abre');await shot('carteira')
        await ev("go('c_ct','r')");await pg.click('.ctc >> nth=0') if False else None
        # sem liberar sem publicar: nova entrega
        # ============ COMÉRCIO ============
        await ev("TXS.unshift({id:'TRX-TESTE001',kind:'recarga',payer:'e',desc:'Adição de saldo',valor:3000,total:3000,fee:0,met:'pix',det:'Pix',st:'concluido',dt:new Date()})")
        await ev("CTX.e='PR-3'");await ev("go('e10','r')");await pg.click('[data-py="walpay:e"]');ok(await ev("PRP.find(x=>x.id=='PR-3').st")=='contrato','PR-3 pago (contrato)')
        await pg.click('[data-py^="wnext"]');ok(await ev("cur")=='e11','wnext → entregas');ok('Bianca' in await txt(),'lista de entregas do contratante')
        await ev("DLX.e='PR-3'");await ev("go('e12','r')");t=await txt();ok('Aguardando o criador' in t and 'R$ 660,00' in t,'acompanhar: total pago 660');
        await pg.click('[data-dl="sim-env:bad"]');ok('reprovou' in await toast() and await ev("dlOf(PRP.find(x=>x.id=='PR-3')).st")=='prod','criador envia fora dos padrões: IA reprova, volta ao criador')
        await pg.click('[data-dl="sim-env:ok"]');ok(await ev("cur")=='e13','criador envia ok → análise');await pg.wait_for_timeout(3600);ok(await ev("cur")=='e14','relatório da IA');t=await txt();ok('Dentro dos padrões' in t and 'Bianca' in t,'contratante lê relatório');await shot('e_relatorio')
        ok(await ev("dlOf(PRP.find(x=>x.id=='PR-3')).st")=='aprov','aguardando aprovação do contratante');ok('1' in await ev("document.querySelector('.kp')?document.querySelector('.kp').innerText:'1'"),'ok')
        await pg.click('button:has-text("Continuar para a decisão")');ok(await ev("cur")=='e15','decisão')
        await pg.click('button:has-text("Não, pedir ajustes")');ok(await ev("cur")=='e16','pedir ajustes')
        await typ('[data-dl-cmt]','me chama no whatsapp 53 99999-1234');await pg.click('[data-dl=adjust]');ok('Por segurança' in await toast(),'ajustes bloqueiam contato externo')
        await typ('[data-dl-cmt]','');await pg.click('[data-dl=adjust]');ok('Escreva' in await toast(),'comentário obrigatório')
        await typ('[data-dl-cmt]','Mostre o produto logo no início.');await pg.click('[data-dl=adjust]');ok(await ev("dlOf(PRP.find(x=>x.id=='PR-3')).st")=='prod' and await ev("dlOf(PRP.find(x=>x.id=='PR-3')).aj")==1,'ajuste 1 enviado ao criador');ok(await ev("cur")=='e12','volta ao acompanhamento')
        await pg.click('[data-dl="sim-env:ok"]');await pg.wait_for_timeout(3600)
        await pg.click('button:has-text("Continuar para a decisão")');await pg.click('button:has-text("Não, pedir ajustes")');await typ('[data-dl-cmt]','Regrave o final com mais energia.');await pg.click('[data-dl=adjust]')
        ok(await ev("dlOf(PRP.find(x=>x.id=='PR-3')).aj")==2,'ajuste 2 enviado')
        await pg.click('[data-dl="sim-env:ok"]');await pg.wait_for_timeout(3600);await pg.click('button:has-text("Continuar para a decisão")')
        ok(await ev("!!document.querySelector('[data-dl=approve]')") and await pg.locator('button:has-text("Não, pedir ajustes")').count()==0 and 'já foram usados' in await txt(),'após 2 ajustes só resta aprovar')
        await pg.click('[data-dl=approve]');ok(await ev("cur")=='e17','aprovada → e17');t=await txt();ok('ainda está em custódia' in t and 'Falta a Triskel confirmar a publicação' in t,'e17: aguardando publicação, dinheiro em custódia');await shot('e_aguarda_pub')
        txn=await ev("PRP.find(x=>x.id=='PR-3').tx");ok(await ev(f"TXS.find(t=>t.id=='{txn}').st")=='custodia','custódia mantida')
        await pg.click('[data-dl=sim-pub]');ok('Pagamento liberado' in await txt(),'publicação confirmada → pagamento liberado');ok(await ev(f"TXS.find(t=>t.id=='{txn}').st")=='liberado','TX liberada ao criador');await shot('e_liberado')
        ok('R$ 60,00' in await txt(),'mostra taxa 10% (R$ 60,00)')
        # contratante: painel e menu
        await ev("go('e_pn','r')");t=await txt();ok('Entrega' in t,'painel e ok')
        await ev("go('e_ct','r')");ok(await ev("document.querySelectorAll('.ctc').length")>=3,'contatos com mensagens de sistema do fluxo')
        await ev("CTX.e='PR-3'");await ev("go('e_th','r')");t=await txt();ok('Publicação confirmada pela Triskel' in t and 'pediu ajustes' in t and 'Entrega aprovada' in t,'conversa registra todo o histórico da entrega')
        ok(await ev("document.querySelector('[data-dl^=\"open:\"]')!==null"),'conversa tem Acompanhar entrega')
        # ============ AGÊNCIA ============
        await ev("TXS.unshift({id:'TRX-TESTE002',kind:'recarga',payer:'a',desc:'Adição de saldo',valor:3000,total:3000,fee:0,met:'pix',det:'Pix',st:'concluido',dt:new Date()})")
        await ev("CTX.a='PR-5'");await ev("go('a10','r')");await pg.click('[data-py="walpay:a"]');ok(await ev("PRP.find(x=>x.id=='PR-5').st")=='contrato','agência paga PR-5')
        await ev("DLX.a='PR-5'");await ev("go('a12','r')");await pg.click('[data-dl="sim-env:ok"]');await pg.wait_for_timeout(3600);ok(await ev("cur")=='a14','agência: relatório')
        await pg.click('button:has-text("Continuar para a decisão")');await pg.click('[data-dl=approve]');ok(await ev("cur")=='a17','agência aprova')
        await pg.click('[data-dl=sim-pub]');ok(await ev("TXS.find(t=>t.id==PRP.find(x=>x.id=='PR-5').tx).st")=='liberado','agência: liberado')
        # ============ CRIADOR: contrato aceito, pagamento simulado ============
        await ev("go('c10','r')") 
        await ev("CTX.c='PR-5'") if False else None
        # sem permissão: não libera sem aprovação
        ok(await ev("(()=>{const q=PRP.find(x=>x.id=='PR-5');return dlRelease(q,'x')})()") is None,'não libera duas vezes')
        # conta nova: Entregas vazio
        await ev("newAcc('e',{nome:'Café Novo'})");await ev("go('e_en','r')");ok('Nenhum contrato em andamento' in await txt(),'conta nova: Entregas vazio')
        await ev("newAcc('c',{nome:'Nova'})");await ev("go('c_en','r')");ok('Nenhum contrato em andamento' in await txt(),'criador novo: Entregas vazio')
        await ev("go('c11','r')");ok('Nenhum contrato' in await txt(),'c11 sem contrato: estado vazio')
        # ============ CRIADOR: aceita proposta, contratante paga (simulado), assina, produz ============
        pg2=await b.new_page(viewport={'width':460,'height':1000});errs2=[];pg2.on('pageerror',lambda e:errs2.append(e.message))
        await pg2.goto('file:///mnt/user-data/outputs/triskel_prototipo.html');e2=pg2.evaluate
        await e2("CTX.c='PR-4'");await e2("go('c_th','r')");await pg2.click('[data-nx^="accept:"]');ok(await e2("PRP.find(x=>x.id=='PR-4').st")=='aceita','criador aceita a proposta da pizzaria')
        await pg2.click('[data-nx^="contract:"]');ok(await e2("cur")=='c10','abre contrato');t2=await e2("document.getElementById('m').innerText.replace(/\\s+/g,' ')")
        ok('Você recebe R$ 250,00' in t2 and 'Taxa Triskel (10%) · paga pelo contratante R$ 25,00' in t2.replace('  ',' '),'contrato do criador: recebe 250 (taxa 25 paga pelo contratante)')
        ok(await pg2.locator('[data-dl^="simpay:"]').count()==1,'simulação do pagamento do contratante')
        ok(await pg2.locator('button:has-text("Assinar contrato")').count()==0,'não assina antes do pagamento')
        await pg2.click('[data-dl^="simpay:"]');ok(await e2("PRP.find(x=>x.id=='PR-4').st")=='contrato','contratante pagou → contrato');ok(await e2("TXS[0].payer+'|'+TXS[0].valor+'|'+TXS[0].fee")=='x|250|25','TX: pizzaria paga 250 + 25')
        ok(await pg2.locator('button:has-text("Assinar contrato")').count()==1,'agora pode assinar')
        ok(await e2("wal().cust")==670,'a receber (custódia) soma 420+250')
        await pg2.click('[data-nx=sign]');ok('Marque que leu' in await pg2.evaluate("document.getElementById('ts').textContent") and not await e2("PRP.find(x=>x.id=='PR-4').signed"),'assinar exige marcar a concordância');await pg2.check('label.ck input');await pg2.click('[data-nx=sign]');ok(await e2("PRP.find(x=>x.id=='PR-4').signed")==1 and await e2("cur")=='c10','assinado: segue no contrato com PDF disponível');await e2("go('c11','r')");ok('Pizzaria' in await e2("document.getElementById('m').innerText"),'briefing do novo contrato')
        await e2("go('c_en','r')");ok(await e2("document.querySelectorAll('.ctc').length")==2,'Entregas lista os 2 contratos')
        await e2("go('c_pn','r')");ok('Entrega em produção' in await e2("document.getElementById('m').innerText"),'painel do criador mostra entrega em produção')
        errs+=errs2
        print('erros de página:',errs)
        await b.close()
asyncio.run(main())
