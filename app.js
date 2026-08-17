<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OS-PREMIUM - Painel de Licenças</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #fff; font-family: 'Segoe UI', sans-serif; min-height: 100vh; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .login-box, .painel-box { background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    h1 { margin-bottom: 20px; color: #00e676; }
    h2 { margin: 20px 0 12px 0; color: #fff; }
    input, select, textarea { width: 100%; padding: 12px; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
    button { cursor: pointer; font-weight: 600; }
    .btn { width: 100%; padding: 14px; background: #00e676; color: #000; border: none; border-radius: 8px; font-size: 15px; }
    .btn:hover { background: #00cc33; }
    .btn-small { padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center; font-weight: 600; }
    .alert-success { background: rgba(0,230,118,0.2); color: #00e676; }
    .alert-error { background: rgba(239,68,68,0.2); color: #ef4444; }
    .licenca-card { background: #0f172a; border: 2px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .licenca-info p { margin: 4px 0; font-size: 13px; color: #cbd5e1; }
    .licenca-info h3 { color: #fff; font-size: 16px; margin-bottom: 8px; }
    .licenca-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    #painelPrincipal { display: none; }
    #painelPrincipal.ativo { display: block; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .logout-btn { background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    .abas { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .aba { padding: 10px 16px; background: #1e293b; color: #94a3b8; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .aba.ativa { background: #00e676; color: #000; }
    .aba-conteudo { display: none; }
  </style>
</head>
<body>
  <div class="container">

    <!-- TELA DE LOGIN -->
    <div id="loginScreen" class="login-box">
      <h1>🔐 OS-PREMIUM - Painel</h1>
      <p style="margin-bottom:16px;color:#94a3b8;">Faça login como Administrador ou Revendedor</p>

      <label style="color:#cbd5e1;font-size:13px;">Tipo de acesso:</label>
      <select id="tipoLogin">
        <option value="admin">👑 Administrador</option>
        <option value="revendedor">🏪 Revendedor</option>
      </select>

      <div id="campoEmail" style="display:none">
        <label style="color:#cbd5e1;font-size:13px;">Email do revendedor:</label>
        <input id="emailLogin" type="email" placeholder="revendedor@email.com" />
      </div>

      <label style="color:#cbd5e1;font-size:13px;">Senha:</label>
      <input id="senhaAdmin" type="password" placeholder="Sua senha" />

      <p id="erroLogin" style="color:#ef4444;margin:12px 0;min-height:18px;"></p>

      <button class="btn" onclick="fazerLogin()">🔓 Entrar</button>
    </div>

    <!-- PAINEL PRINCIPAL -->
    <div id="painelPrincipal">
      <div class="header-row">
        <h1 id="tituloPainel">👑 Painel do Administrador</h1>
        <button class="logout-btn" onclick="fazerLogout()">🚪 Sair</button>
      </div>

      <div id="mensagem"></div>

      <div class="abas">
        <button class="aba ativa" id="aba-pendentes" onclick="trocarAba('pendentes')">⏳ Pendentes</button>
        <button class="aba" id="aba-ativas" onclick="trocarAba('ativas')">✅ Ativas</button>
        <button class="aba" id="aba-revendedores" onclick="trocarAba('revendedores')" style="display:none">🏪 Revendedores</button>
        <button class="aba" id="aba-estatisticas" onclick="trocarAba('estatisticas')" style="display:none">📊 Estatísticas</button>
      </div>

      <!-- ABA: PENDENTES -->
      <div id="conteudo-pendentes" class="aba-conteudo" style="display:block">
        <h2>⏳ Aguardando Aprovação</h2>
        <div id="listaLicencas"></div>
      </div>

      <!-- ABA: ATIVAS -->
      <div id="conteudo-ativas" class="aba-conteudo">
        <h2>✅ Licenças Ativas</h2>
        <div id="listaLicencasAtivas"></div>

        <h2 style="margin-top:32px">➕ Cadastrar Nova Licença</h2>
        <input id="nomeCliente" placeholder="Nome do cliente" />
        <input id="nomeEmpresa" placeholder="Empresa (opcional)" />
        <input id="email" placeholder="Email (opcional)" />
        <input id="telefone" placeholder="Telefone (opcional)" />
        <input id="hwid" placeholder="HWID do cliente" />
        <input id="validade" type="date" />
        <select id="status">
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        <button class="btn" onclick="gerarLicenca()">🔑 Cadastrar Licença</button>
      </div>

      <!-- ABA: REVENDEDORES (só admin) -->
      <div id="conteudo-revendedores" class="aba-conteudo">
        <h2>➕ Cadastrar Novo Revendedor</h2>
        <input id="revNome" placeholder="Nome completo" />
        <input id="revEmail" type="email" placeholder="Email (será o login)" />
        <input id="revTelefone" placeholder="Telefone (opcional)" />
        <input id="revSenha" type="password" placeholder="Senha do revendedor" />
        <button class="btn" onclick="cadastrarRevendedorHandler()">➕ Cadastrar Revendedor</button>

        <h2 style="margin-top:32px">🏪 Revendedores Cadastrados</h2>
        <div id="listaRevendedores"></div>
      </div>

      <!-- ABA: ESTATÍSTICAS (só admin) -->
      <div id="conteudo-estatisticas" class="aba-conteudo">
        <h2>📊 Vendas por Revendedor</h2>
        <div id="listaEstatisticas"></div>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('tipoLogin').addEventListener('change', (e) => {
      document.getElementById('campoEmail').style.display = e.target.value === 'revendedor' ? 'block' : 'none'
    })
  </script>
  <script src="app.js"></script>
</body>
</html>
