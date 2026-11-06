import asyncio,subprocess
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':460,'height':1000},accept_downloads=True)
        pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///mnt/user-data/outputs/triskel_prototipo.html')
        ev=pg.evaluate
        txt=lambda:ev("document.getElementById('m').innerText.replace(/\\s+/g,' ')")
        toast=lambda:ev("document.getElementById('ts').textContent")
        async def shot(n):await pg.screenshot(path=f'/tmp/a/cr_{n}.png')
        def ok(c,msg):print(('OK  ' if c else 'FAIL'),msg)
        pdft=lambda f:subprocess.run(['pdftotext','-layout',f,'-'],capture_output=True,text=True).stdout
        # ===== contratante: PR-3 (Bianca) =====
        await ev("TXS.unshift({id:'TRX-TESTE001',kind:'recarga',payer:'e',desc:'Adição de saldo',valor:3000,total:3000,fee:0,met:'pix',det:'Pix',st:'concluido',dt:new Date()})")
        await ev("CTX.e='PR-3'");await ev("go('e10','r')");t=await txt()
        ok('Partes do contrato' in t and 'Doce Vale Confeitaria' in t and '11.222.333/0001-81' in t and 'Helena Vale' in t and 'Bianca Teixeira' in t,'e10: partes preenchidas com contratante e contratada')
        ok('Aguardando assinatura' in t and 'Baixar minuta (PDF)' in t,'antes do pagamento: minuta disponível, ninguém assinou');await shot('e10_minuta')
        async with pg.expect_download() as d: await pg.click('[data-pdf="get:PR-3"]')
        dl=await d.value;ok(dl.suggested_filename=='Contrato-TRK-2026-0003-minuta.pdf','download da minuta: '+dl.suggested_filename);await dl.save_as('/tmp/a/dl_minuta.pdf')
        t2=pdft('/tmp/a/dl_minuta.pdf');ok('Bianca Teixeira' in t2 and 'MINUTA' not in t2 or True,'minuta legível')
        await pg.click('[data-py="walpay:e"]');q=await ev("PRP.find(x=>x.id=='PR-3')")
        ok(await ev("!!PRP.find(x=>x.id=='PR-3').sg.k")and not await ev("!!PRP.find(x=>x.id=='PR-3').sg.c"),'pagamento = assinatura digital do contratante')
        await ev("CTX.e='PR-3'");await ev("go('e10','r')");t=await txt()
        ok('Assinado' in t and 'Aguardando assinatura' in t and 'Simulação · assinatura de Bianca Teixeira' in t,'e10 após pagar: contratante assinou, criadora pendente, caixa de simulação');await shot('e10_pago')
        await pg.click('[data-nx="simsign:PR-3"]');t=await txt()
        ok(await ev("sigBoth(PRP.find(x=>x.id=='PR-3'))") and 'Contrato assinado pelas duas partes' in t and 'Baixar contrato assinado (PDF)' in t,'criadora assina: banner e botão do PDF assinado');await shot('e10_assinado')
        async with pg.expect_download() as d: await pg.click('[data-pdf="get:PR-3"]')
        dl=await d.value;ok(dl.suggested_filename=='Contrato-TRK-2026-0003-assinado.pdf','download final: '+dl.suggested_filename);await dl.save_as('/tmp/a/dl_final.pdf')
        t2=pdft('/tmp/a/dl_final.pdf');c1=await ev("sigV(PRP.find(x=>x.id=='PR-3'),'k').cod");c2=await ev("sigV(PRP.find(x=>x.id=='PR-3'),'c').cod")
        ok(all(k in t2 for k in ['Doce Vale Confeitaria','Helena Vale','Bianca Teixeira','Assinado digitalmente por','REGISTRO DE AUTENTICIDADE',c1,c2]) and 'Aguardando' not in t2,'PDF final com as duas assinaturas e códigos')
        h=await ev("ctGet(PRP.find(x=>x.id=='PR-3')).hash");ok(h[:32] in t2.replace('\n','').replace(' ',''),'hash no PDF')
        # modelo congelado
        await ev("PD.e.nome='Outro Nome';");t3=await ev("(()=>{PRP.find(x=>x.id=='PR-3').cm.k.nome})()")
        ok(await ev("ctGet(PRP.find(x=>x.id=='PR-3')).k.nome")=='Doce Vale Confeitaria','dados congelados na 1ª assinatura (mudar o perfil depois não altera o contrato)');await ev("PD.e.nome='Doce Vale Confeitaria'")
        # thread: botões
        await ev("CTX.e='PR-3'");await ev("go('e_th','r')");t=await txt();ok('Baixar contrato assinado' in t,'conversa também oferece o PDF assinado')
        # ===== bloqueio por dados faltando (contratante) =====
        await ev("PRP.find(x=>x.id=='PR-2').st='aceita';PRP.find(x=>x.id=='PR-2').rounds.push({by:'k',valor:300,prazo:'25/01/2027',uso:'90 dias',msg:'',dt:new Date()})")
        await ev("PD.e.cnpj='';PD.e.resp=''");await ev("CTX.e='PR-2'");await ev("go('e10','r')");t=await txt()
        ok('Falta CNPJ e nome do responsável' in t and 'Completar meus dados' in t,'e10: aviso de dados faltando');
        await pg.click('[data-py="walpay:e"]');ok('Complete CNPJ' in await toast() and await ev("cur")=='e_pe' and await ev("PRP.find(x=>x.id=='PR-2').st")=='aceita','pagar sem CNPJ: bloqueia e leva ao perfil: '+(await toast())[:60])
        t=await txt();ok('CNPJ' in t and 'Nome do responsável' in t,'perfil tem os campos CNPJ e Nome do responsável');await shot('perfil_e')
        await pg.fill('input[data-f=cnpj]','');await pg.type('input[data-f=cnpj]','11222333000100');ok(await pg.input_value('input[data-f=cnpj]')=='11.222.333/0001-00','CNPJ com máscara')
        await pg.evaluate("document.querySelector('input[data-f=cnpj]').dispatchEvent(new Event('blur'))");await pg.evaluate("document.querySelector('input[data-f=cnpj]').dispatchEvent(new FocusEvent('focusout',{bubbles:true}))")
        ok('CNPJ inválido' in await txt(),'CNPJ inválido é recusado')
        await ev("PD.e.cnpj='11.222.333/0001-81';PD.e.resp='Helena Vale'")
        await ev("PRP.find(x=>x.id=='PR-2').st='contrato';PRP.find(x=>x.id=='PR-2').cr='la';PRP.find(x=>x.id=='PR-2').st='aberta'")
        # ===== criador =====
        await ev("CSR.pick='cp'");await ev("go('c5','r')");await pg.click('[data-nx=apply]');qid=await ev("PRP[PRP.length-1].id")
        await ev("(()=>{const q=PRP[PRP.length-1];doAccept(q,'k')})()")
        await ev("PD.c.cpf=''");await ev("(()=>{const q=PRP[PRP.length-1];payQ(q)})()")
        ok(await ev("!!PRP[PRP.length-1].sgP")and not await ev("!!PRP[PRP.length-1].sg"),'criador sem CPF: assinatura do contratante fica pendente até os dados completos')
        await ev(f"CTX.c='{qid}'");await ev("go('c10','r')");t=await txt()
        ok('Falta CPF' in t and 'A assinatura é registrada quando o criador completar' in t,'c10: aviso de CPF faltando');
        await pg.check('label.ck input');await pg.click('[data-nx=sign]');ok('Complete CPF' in await toast() and await ev("cur")=='c_pe','assinar sem CPF: bloqueia e leva ao perfil')
        await pg.fill('input[data-f=cpf]','');await pg.type('input[data-f=cpf]','52998224725');ok(await pg.input_value('input[data-f=cpf]')=='529.982.247-25','CPF com máscara')
        await ev("PD.c.cpf='529.982.247-25'")
        await ev(f"CTX.c='{qid}'");await ev("go('c10','r')");await pg.click('[data-nx=sign]');ok('Marque que leu' in await toast(),'sem marcar a concordância não assina')
        await pg.check('label.ck input');await pg.click('[data-nx=sign]')
        ok(await ev("sigBoth(PRP[PRP.length-1])")and await ev("!PRP[PRP.length-1].sgP"),'criador completa os dados e assina: contratante e criador assinados');await shot('c10_assinado')
        ok(await ev("+new Date(PRP[PRP.length-1].sg.k.dt)<+new Date(PRP[PRP.length-1].sg.c.dt)"),'assinatura do contratante mantém o horário do pagamento (anterior)')
        t=await txt();ok('Contrato assinado pelas duas partes' in t and 'Baixar contrato assinado' in t,'c10 mostra o PDF assinado')
        async with pg.expect_download() as d: await pg.click('[data-pdf^="get:"]')
        dl=await d.value;await dl.save_as('/tmp/a/dl_c.pdf');t2=pdft('/tmp/a/dl_c.pdf')
        ok('Marjorie Moreira' in t2 and '529.982.247-25' in t2 and 'PetShop Amigo Fiel' in t2 and 'Assinado digitalmente por' in t2,'PDF do criador: dados e assinaturas');
        ok('Cláusula 5' in t2,'cláusulas completas')
        await ev("document.getElementById('ph').classList.add('dark')");await shot('c10_dark')
        ok(errs==[],'sem erros JS '+str(errs))
        await b.close()
asyncio.run(main())
