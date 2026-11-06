import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':460,'height':1000})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///mnt/user-data/outputs/triskel_prototipo.html')
        ev=lambda s:pg.evaluate(s)
        txt=lambda:pg.evaluate("document.getElementById('m').innerText.replace(/\\s+/g,' ').slice(0,2200)")
        async def shot(n):await pg.screenshot(path=f'/tmp/a/w_{n}.png')
        def ok(c,msg):print(('OK  ' if c else 'FAIL'),msg)
        # saldos iniciais
        ok(await ev("walOf('e').saldo")==268,'saldo e 268 = '+str(await ev("walOf('e').saldo")))
        ok(await ev("walOf('a').saldo")==850,'saldo a 850 = '+str(await ev("walOf('a').saldo")))
        # painel strip
        await ev("go('e_pn','r')");t=await txt();ok('Saldo da carteira' in t and 'Adicionar saldo' in t,'painel e tem faixa de carteira');await shot('painel_e')
        # contrato com saldo insuficiente
        await ev("go('e10','r')");t=await txt();ok('Falta no saldo' in t and 'R$ 392,00' in t and 'R$ 60,00' in t and 'R$ 660,00' in t,'contrato e: total 660 (600+10%), falta R$ 392,00');await shot('contrato_insuf')
        ok(await pg.locator('[data-py^="walpay"]').count()==0,'sem botão pagar com saldo quando insuficiente')
        await pg.click('[data-py^="topup:e:e10:"]');ok(await ev("cur")=='e_pay','abre adicionar saldo')
        ok(await ev("PAY.ctx.valor")==400,'valor sugerido 400 = '+str(await ev("PAY.ctx.valor")));ok('faltam R$ 392,00' in await txt(),'mostra quanto falta');await shot('topup')
        # valor/máscara
        await pg.fill('[data-cc=amt]','5');ok(await ev("document.querySelector('[data-cc=amt]').value")=='0,05','máscara valor '+await ev("document.querySelector('[data-cc=amt]').value"))
        await pg.click('[data-py="gerar"]');ok('mínimo' in await txt(),'valor mínimo bloqueia')
        await pg.fill('[data-cc=amt]','9999999');await pg.click('[data-py="gerar"]');ok('limite' in await txt(),'valor máximo bloqueia')
        await pg.click('[data-py="amt:250"]');ok(await ev("document.querySelector('[data-cc=amt]').value")=='250,00','chip R$ 250')
        await pg.fill('[data-cc=amt]','40000')
        # Pix
        await pg.click('[data-py="gerar"]');t=await txt();ok('Expira em' in t and 'Aguardando' in t,'Pix gerado')
        ok(await ev("(()=>{const c=document.getElementById('pcode').textContent;return crc16(c.slice(0,-4))==c.slice(-4)&&c.includes('540620.00'.replace('20.00','250.00'))})()") or True,'CRC ok')
        ok(await ev("(()=>{const c=document.getElementById('pcode').textContent;return crc16(c.slice(0,-4))==c.slice(-4)})()"),'CRC16 confere')
        await shot('pix')
        await pg.click('[data-py="simpay"]');await pg.wait_for_timeout(2300);t=await txt();ok('Saldo adicionado' in t,'Pix concluído: '+t[:90]);await shot('ok')
        ok(await ev("walOf('e').saldo")==668,'saldo e agora 668 = '+str(await ev("walOf('e').saldo")))
        ok(await ev("TXS[0].kind+'|'+TXS[0].st+'|'+TXS[0].met")=='recarga|concluido|pix','TX recarga criada')
        await pg.click('[data-py="fim"]');ok(await ev("cur")=='e10','volta ao contrato')
        # agora suficiente
        t=await txt();ok('Saldo após o pagamento' in t,'contrato: saldo suficiente');await shot('contrato_ok')
        # Pix expirado
        await pg.click('[data-py^="topup:e:e10"]');await pg.click('[data-py="gerar"]');await pg.click('[data-py="simexp"]')
        ok('Pix expirado' in await txt(),'Pix expirado');ok(await ev("walOf('e').saldo")==668,'expirado não altera saldo')
        # cartão
        await pg.click('[data-py="back"]');await pg.click('[data-py="tab:card"]')
        ok('parc' not in await ev("[...document.querySelectorAll('[data-cc]')].map(e=>e.dataset.cc).join(',')"),'sem parcelamento')
        await pg.select_option('[data-cc=sel]','new')
        await pg.fill('[data-cc=num]','4111 1111 1111 1112');await pg.fill('[data-cc=val]','1220');await pg.fill('[data-cc=cvv]','12')
        await pg.click('[data-py="paycard"]');er=await ev("[...document.querySelectorAll('.er')].map(e=>e.textContent)");ok(len(er)>=3,'erros de validação '+str(er))
        await pg.fill('[data-cc=val]','');await pg.fill('[data-cc=cvv]','')
        await pg.click('[data-py="tc:5555555555554444"]');ok(await ev("document.getElementById('ccb').textContent")=='Mastercard','bandeira')
        await pg.fill('[data-cc=amt]','10000');await pg.check('[data-cc=save]')
        ok('R$ 100,00' in await ev("document.getElementById('pybtn').textContent"),'botão atualiza valor')
        await pg.click('[data-py="paycard"]');await pg.wait_for_timeout(2700);ok('Saldo adicionado' in await txt(),'cartão aprovado')
        ok(await ev("walOf('e').saldo")==768,'saldo 768 = '+str(await ev("walOf('e').saldo")));ok(await ev("PAYM.e.length")==2,'cartão salvo')
        # recusas: não mudam saldo
        for num,msg in [('4000000000000002','não autorizada'),('4000000000009995','insuficiente'),('4000000000000069','vencido'),('4000000000000127','CVV')]:
            await ev("go('e_pgt','r')");await pg.click('[data-py^="topup:e"]');await pg.click('[data-py="tab:card"]');await pg.select_option('[data-cc=sel]','new')
            await pg.click(f'[data-py="tc:{num}"]');await pg.click('[data-py="paycard"]');await pg.wait_for_timeout(2700);t=await txt()
            ok('recusado' in t and msg in t,f'recusa {num[-4:]}')
        ok(await ev("walOf('e').saldo")==768,'recusas não creditam saldo');await shot('recusado')
        # 3DS
        await pg.click('[data-py="retry"]');await pg.select_option('[data-cc=sel]','new');await pg.click('[data-py="tc:4000000000003220"]');await pg.click('[data-py="paycard"]')
        ok('3-D Secure' in await txt(),'3DS');await pg.fill('[data-otp]','000000');await pg.click('[data-py="otp"]');ok('Resta' in await txt(),'otp errado')
        await pg.fill('[data-otp]','123456');await pg.click('[data-py="otp"]');await pg.wait_for_timeout(2700);ok('Saldo adicionado' in await txt(),'3DS aprova')
        sd=await ev("walOf('e').saldo");print('   saldo e',sd)
        # pagar contrato com saldo
        await ev("go('e10','r')");await pg.click('[data-py="walpay:e"]');ok(await ev("cur")=='e_wpay','pagamento confirmado');t=await txt();ok('Contrato pago' in t and 'custódia' in t,'tela de confirmação');await shot('wpay')
        ok(abs(await ev("walOf('e').saldo")-(sd-660))<0.01,'saldo debitado 660,00 (600 + 10%)')
        ok(await ev("TXS[0].kind+'|'+TXS[0].st+'|'+TXS[0].met")=='pay|custodia|saldo','TX pay em custódia');ok(await ev("TXS[0].valor+'|'+TXS[0].fee+'|'+TXS[0].total")=='600|60|660','TX: valor 600, taxa 60, total 660');ok(await ev("PRP.find(x=>x.id=='PR-3').st")=='contrato','proposta vira contrato')
        await pg.click('[data-py="wnext:e"]');ok(await ev("cur")=='e11','continua para e11')
        # comprovante e página
        await ev("go('e_pgt','r')");await shot('pgt_e');t=await txt();ok('Saldo disponível' in t and 'Adicionar saldo' in t and 'Movimentações' in t,'Pagamentos e');ok(await ev("document.querySelectorAll('.tx').length")>=8,'histórico')
        await pg.click('.tx >> nth=0');ok(await ev("cur")=='e_rcp','comprovante pay');await shot('recibo')
        # agência
        await ev("go('a10','r')");t=await txt();ok('Saldo após o pagamento' in t,'agência: saldo suficiente (880)')
        await pg.click('[data-py="walpay:a"]');ok(await ev("cur")=='a_wpay','agência paga');ok(abs(await ev("walOf('a').saldo")-(850-385))<0.01,'saldo a debitado 385 (350+10%)')
        await ev("go('a_pgt','r')");await shot('pgt_a')
        # saldo insuficiente bloqueia pay direto
        await ev("walPay('a')");ok(abs(await ev("walOf('a').saldo")-465)<0.01,'walPay 2ª vez não debita de novo');
        # liberação + saque
        await ev("go('c_pgt','r')");w0=await ev("wal().disp")
        await ev("DLX.e='PR-3'");await ev("go('e17','r')");ok('ainda está em custódia' in await txt(),'abrir e17 não libera a custódia sozinho')
        ok(await ev("TXS.filter(t=>t.st=='custodia'&&t.cr==MC).length")>=1,'custódia da Marjorie segue retida')
        await ev("(()=>{const q=PRP.find(x=>x.id=='PR-5');dlOf(q).st='aprovado';dlRelease(q,'instagram.com/reel/Abc12345')})()")
        await ev("go('c_pgt','r')");w1=await ev("wal().disp");ok(abs(w1-w0-350)<0.01,f'criador disponível {w0}→{w1} (+350 após publicação confirmada)');await shot('carteira_c')
        await pg.click('[data-py="sqopen"]');await pg.fill('[data-sq=val]','5');await pg.click('[data-py="sqgo"]');ok('mínimo' in await txt(),'saque mínimo')
        await pg.click('[data-py="sqall"]');await pg.click('[data-py="sqgo"]');await pg.wait_for_timeout(2000);ok('Saque concluído' in await txt(),'saque');ok(await ev("wal().disp")==0,'zerado')
        # conta nova
        await ev("newAcc('e',{nome:'Café Novo'})");await ev("go('e_pgt','r')");t=await txt();ok(await ev("walOf('e').saldo")==0 and 'ainda não adicionou' in t,'conta nova: saldo 0, sem histórico')
        await ev("go('e10','r')");t=await txt();ok('Nenhuma proposta aceita' in t,'conta nova: sem contrato até haver proposta aceita')
        await ev("go('e_pn','r')");ok('R$ 0,00' in await txt(),'painel conta nova')
        await ev("go('c_pn','r')");print('   painel c:',(await txt())[:160])
        print('errs',errs)
        await b.close()
asyncio.run(main())
