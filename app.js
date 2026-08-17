// ✅ PAINEL OS-PREMIUM COM SISTEMA DE REVENDEDORES - VERSÃO FINAL
const SENHA_ADMIN = 'Washington2024'
const SUPABASE_URL = 'https://sneozlvodhxirzrimtep.supabase.co'
const SUPABASE_KEY = 'sb_publishable_3i3ZGV6M13dbUhEtvyfGFQ_DPiu4Pnl'
const AUTH_KEY = 'os_premium_auth'

let usuarioAtual = null

// ============================
// FUNÇÕES DO SUPABASE
// ============================

async function buscarLicencas() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licencas?select=*&order=criado_em.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    if (!response.ok) throw new Error('Falha ao buscar')
    return await response.json()
  } catch (e) { return [] }
}

async function salvarLicenca(licenca) {
  if (usuarioAtual?.tipo === 'revendedor') {
    licenca.revendedor_id = usuarioAtual.id
    licenca.revendedor_nome = usuarioAtual.nome
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licencas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(licenca)
    })
    return response.ok
  } catch (e) { return false }
}

async function atualizarLicenca(hwid, dados) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licencas?hwid=eq.${encodeURIComponent(hwid)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })
    return response.ok
  } catch (e) { return false }
}

async function excluirLicenca(hwid) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licencas?hwid=eq.${encodeURIComponent(hwid)}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    return response.ok
  } catch (e) { return false }
}

async function buscarRevendedores() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/revendedores?select=*&order=criado_em.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    if (!response.ok) throw new Error()
    return await response.json()
  } catch (e) { return [] }
}

async function cadastrarRevendedor(rev) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/revendedores`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rev)
    })
    return response.ok
  } catch (e) { return false }
}

async function atualizarRevendedor(id, dados) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/revendedores?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })
    return response.ok
  } catch (e) { return false }
}

async function excluirRevendedor(id) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/revendedores?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    return response.ok
  } catch (e) { return false }
}

// ============================
// LOGIN
// ============================

function verificarLogin() {
  const saved = sessionStorage.getItem(AUTH_KEY)
  if (saved) {
    usuarioAtual = JSON.parse(saved)
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('painelPrincipal').classList.add('ativo')
    ajustarPainelParaUsuario()
    renderizarLicencas()
    if (usuarioAtual.tipo === 'admin') renderizarRevendedores()
  }
}

async function fazerLogin() {
  const email = document.getElementById('emailLogin').value.trim()
  const senha = document.getElementById('senhaAdmin').value
  const tipo = document.getElementById('tipoLogin').value

  if (tipo === 'admin') {
    if (senha === SENHA_ADMIN) {
      usuarioAtual = { tipo: 'admin', nome: 'Administrador' }
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(usuarioAtual))
      document.getElementById('loginScreen').style.display = 'none'
      document.getElementById('painelPrincipal').classList.add('ativo')
      document.getElementById('erroLogin').textContent = ''
      ajustarPainelParaUsuario()
      renderizarLicencas()
      renderizarRevendedores()
    } else {
      document.getElementById('erroLogin').textContent = '❌ Senha de administrador incorreta!'
    }
  } else {
    const revendedores = await buscarRevendedores()
    const rev = revendedores.find(r => r.email === email && r.senha === senha)
    if (!rev) {
      document.getElementById('erroLogin').textContent = '❌ Email ou senha incorretos!'
      return
    }
    if (rev.status === 'Bloqueado') {
      document.getElementById('erroLogin').textContent = '❌ Revendedor bloqueado. Contate o administrador.'
      return
    }
    usuarioAtual = { tipo: 'revendedor', id: rev.id, nome: rev.nome }
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(usuarioAtual))
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('painelPrincipal').classList.add('ativo')
    document.getElementById('erroLogin').textContent = ''
    ajustarPainelParaUsuario()
    renderizarLicencas()
  }
}

function ajustarPainelParaUsuario() {
  const isAdmin = usuarioAtual?.tipo === 'admin'
  const titulo = document.getElementById('tituloPainel')
  const abaRev = document.getElementById('aba-revendedores')
  const abaEstat = document.getElementById('aba-estatisticas')
  if (titulo) titulo.textContent = isAdmin ? '👑 Painel do Administrador' : `🏪 Painel - ${usuarioAtual.nome}`
  if (abaRev) abaRev.style.display = isAdmin ? 'inline-block' : 'none'
  if (abaEstat) abaEstat.style.display = isAdmin ? 'inline-block' : 'none'
}

function fazerLogout() {
  sessionStorage.removeItem(AUTH_KEY)
  usuarioAtual = null
  location.reload()
}

function mostrarMensagem(texto, tipo = 'success') {
  const div = document.getElementById('mensagem')
  div.className = `alert alert-${tipo === 'success' ? 'success' : 'error'}`
  div.textContent = texto
  setTimeout(() => div.textContent = '', 5000)
}

// ============================
// CADASTRO / RENOVAR / APROVAR
// ============================

async function gerarLicenca() {
  const nomeCliente = document.getElementById('nomeCliente').value.trim()
  const nomeEmpresa = document.getElementById('nomeEmpresa').value.trim()
  const email = document.getElementById('email').value.trim()
  const telefone = document.getElementById('telefone').value.trim()
  const hwid = document.getElementById('hwid').value.trim()
  const validade = document.getElementById('validade').value
  const status = document.getElementById('status').value

  if (!nomeCliente || !hwid || !validade) {
    mostrarMensagem('⚠️ Preencha Nome, HWID e Validade!', 'error')
    return
  }

  const sucesso = await salvarLicenca({
    hwid, nome_cliente: nomeCliente, nome_empresa: nomeEmpresa,
    email, telefone, validade, status, status_aprovacao: 'Ativo'
  })

  if (sucesso) {
    mostrarMensagem('✅ Licença cadastrada!')
    document.getElementById('nomeCliente').value = ''
    document.getElementById('nomeEmpresa').value = ''
    document.getElementById('email').value = ''
    document.getElementById('telefone').value = ''
    document.getElementById('hwid').value = ''
    document.getElementById('validade').value = ''
    document.getElementById('status').value = 'Ativo'
    await renderizarLicencas()
    if (usuarioAtual?.tipo === 'admin') await renderizarRevendedores()
  } else {
    mostrarMensagem('❌ Erro ao salvar', 'error')
  }
}

async function renovarLicenca(hwid) {
  const padrao = new Date()
  padrao.setDate(padrao.getDate() + 30)
  const novaValidade = prompt('Nova validade (AAAA-MM-DD):', padrao.toISOString().split('T')[0])
  if (!novaValidade) return
  const sucesso = await atualizarLicenca(hwid, { validade: novaValidade, status: 'Ativo', status_aprovacao: 'Ativo' })
  if (sucesso) { mostrarMensagem('✅ Renovado!'); await renderizarLicencas(); if (usuarioAtual?.tipo === 'admin') await renderizarRevendedores() }
}

async function aprovarCadastro(hwid) {
  const padrao = new Date(); padrao.setDate(padrao.getDate() + 30)
  const validade = prompt('Validade (AAAA-MM-DD):', padrao.toISOString().split('T')[0])
  if (!validade) return
  const dados = { status_aprovacao: 'Ativo', status: 'Ativo', validade }
  if (usuarioAtual?.tipo === 'revendedor') {
    dados.revendedor_id = usuarioAtual.id
    dados.revendedor_nome = usuarioAtual.nome
  }
  const sucesso = await atualizarLicenca(hwid, dados)
  if (sucesso) { mostrarMensagem('✅ Aprovado!'); await renderizarLicencas(); if (usuarioAtual?.tipo === 'admin') await renderizarRevendedores() }
}

async function reprovarCadastro(hwid) {
  if (!confirm('Reprovar este cadastro?')) return
  const sucesso = await atualizarLicenca(hwid, { status_aprovacao: 'Reprovado' })
  if (sucesso) { mostrarMensagem('❌ Reprovado!'); await renderizarLicencas() }
}

async function excluirLicencaHandler(hwid) {
  if (!confirm('Excluir esta licença?')) return
  const sucesso = await excluirLicenca(hwid)
  if (sucesso) { mostrarMensagem('✅ Excluída!'); await renderizarLicencas() }
}

// ============================
// REVENDEDORES
// ============================

async function cadastrarRevendedorHandler() {
  const nome = document.getElementById('revNome').value.trim()
  const email = document.getElementById('revEmail').value.trim()
  const telefone = document.getElementById('revTelefone').value.trim()
  const senha = document.getElementById('revSenha').value.trim()
  if (!nome || !email || !senha) { mostrarMensagem('⚠️ Preencha nome, email e senha', 'error'); return }
  const sucesso = await cadastrarRevendedor({ nome, email, telefone, senha, status: 'Ativo' })
  if (sucesso) {
    mostrarMensagem('✅ Revendedor cadastrado!')
    document.getElementById('revNome').value = ''
    document.getElementById('revEmail').value = ''
    document.getElementById('revTelefone').value = ''
    document.getElementById('revSenha').value = ''
    await renderizarRevendedores()
  }
}

async function bloquearRevendedor(id, statusAtual) {
  const novo = statusAtual === 'Ativo' ? 'Bloqueado' : 'Ativo'
  if (!confirm(`${novo === 'Bloqueado' ? 'Bloquear' : 'Desbloquear'} este revendedor?`)) return
  const sucesso = await atualizarRevendedor(id, { status: novo })
  if (sucesso) { mostrarMensagem(`✅ ${novo === 'Bloqueado' ? 'Bloqueado!' : 'Desbloqueado!'}`); await renderizarRevendedores() }
}

async function excluirRevendedorHandler(id) {
  if (!confirm('Excluir este revendedor?')) return
  const sucesso = await excluirRevendedor(id)
  if (sucesso) { mostrarMensagem('✅ Excluído!'); await renderizarRevendedores() }
}

async function renderizarRevendedores() {
  const container = document.getElementById('listaRevendedores')
  if (!container) return
  container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">⏳ Carregando...</p>'
  const revendedores = await buscarRevendedores()
  const licencas = await buscarLicencas()

  if (revendedores.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Nenhum revendedor cadastrado</p>'
    return
  }

  container.innerHTML = revendedores.map(r => {
    const licAtivas = licencas.filter(l => l.revendedor_id === r.id && l.status_aprovacao === 'Ativo').length
    const licPendentes = licencas.filter(l => l.revendedor_id === r.id && l.status_aprovacao === 'Pendente').length
    const cor = r.status === 'Bloqueado' ? '#ef4444' : '#00e676'
    return `
      <div class="licenca-card" style="border-color:${cor}">
        <div class="licenca-info">
          <h3>${r.nome} <span style="background:${cor};color:#000;padding:2px 8px;border-radius:6px;font-size:11px;margin-left:8px">${r.status}</span></h3>
          <p>📧 ${r.email} | 📱 ${r.telefone || 'N/A'}</p>
          <p>✅ ${licAtivas} ativas | ⏳ ${licPendentes} pendentes</p>
        </div>
        <div class="licenca-actions">
          <button class="btn-small btn-renew" onclick="bloquearRevendedor(${r.id}, '${r.status}')">${r.status === 'Ativo' ? '🚫 Bloquear' : '✅ Desbloquear'}</button>
          <button class="btn-small btn-delete" onclick="excluirRevendedorHandler(${r.id})">🗑️ Excluir</button>
        </div>
      </div>
    `
  }).join('')
}

function trocarAba(aba) {
  document.querySelectorAll('.aba').forEach(el => el.classList.remove('ativa'))
  document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none')
  document.getElementById(`aba-${aba}`).classList.add('ativa')
  document.getElementById(`conteudo-${aba}`).style.display = 'block'
  if (aba === 'revendedores') renderizarRevendedores()
  if (aba === 'estatisticas') renderizarEstatisticas()
}

async function renderizarEstatisticas() {
  const container = document.getElementById('listaEstatisticas')
  if (!container) return
  const licencas = await buscarLicencas()
  const revendedores = await buscarRevendedores()

  const stats = {}
  licencas.forEach(l => {
    const chave = l.revendedor_nome || 'Administrador (você)'
    if (!stats[chave]) stats[chave] = { total: 0, ativas: 0, pendentes: 0, reprovadas: 0 }
    stats[chave].total++
    if (l.status_aprovacao === 'Ativo') stats[chave].ativas++
    if (l.status_aprovacao === 'Pendente') stats[chave].pendentes++
    if (l.status_aprovacao === 'Reprovado') stats[chave].reprovadas++
  })

  revendedores.forEach(r => {
    if (!stats[r.nome]) stats[r.nome] = { total: 0, ativas: 0, pendentes: 0, reprovadas: 0 }
  })

  container.innerHTML = Object.entries(stats).map(([nome, s]) => `
    <div class="licenca-card">
      <div class="licenca-info">
        <h3>🏪 ${nome}</h3>
        <p>📊 Total: <strong>${s.total}</strong> | ✅ Ativas: <strong style="color:#00e676">${s.ativas}</strong> | ⏳ Pendentes: <strong style="color:#f59e0b">${s.pendentes}</strong> | ❌ Reprovadas: <strong style="color:#ef4444">${s.reprovadas}</strong></p>
      </div>
    </div>
  `).join('') || '<p style="color:#94a3b8;text-align:center;padding:20px;">Nenhuma venda ainda</p>'
}

// ============================
// LISTA DE LICENÇAS (separadas em pendentes e ativas)
// ============================

async function renderizarLicencas() {
  const containerPendentes = document.getElementById('listaLicencas')
  const containerAtivas = document.getElementById('listaLicencasAtivas')
  
  let licencas = await buscarLicencas()
  const hoje = new Date()

  // FILTRO: revendedor só vê as dele
  if (usuarioAtual?.tipo === 'revendedor') {
    licencas = licencas.filter(l => l.revendedor_id === usuarioAtual.id)
  }

  const pendentes = licencas.filter(l => l.status_aprovacao === 'Pendente')
  const ativas = licencas.filter(l => l.status_aprovacao !== 'Pendente' && l.status_aprovacao !== 'Reprovado')

  // RENDERIZAR PENDENTES
  if (containerPendentes) {
    if (pendentes.length === 0) {
      containerPendentes.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Nenhuma pendente</p>'
    } else {
      containerPendentes.innerHTML = pendentes.map(l => `
        <div class="licenca-card" style="border-color: #f59e0b;">
          <div class="licenca-info">
            <h3>${l.nome_cliente}</h3>
            <p>🔒 HWID: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;font-size:11px;">${l.hwid}</code></p>
            ${l.revendedor_nome ? `<p>🏪 Vendido por: <strong>${l.revendedor_nome}</strong></p>` : ''}
            <p>📅 Cadastrado: ${new Date(l.criado_em).toLocaleString('pt-BR')}</p>
          </div>
          <div class="licenca-actions">
            <button class="btn-small btn-approve" onclick="aprovarCadastro('${l.hwid}')">✅ Aprovar</button>
            <button class="btn-small btn-reject" onclick="reprovarCadastro('${l.hwid}')">❌ Reprovar</button>
            <button class="btn-small btn-delete" onclick="excluirLicencaHandler('${l.hwid}')">🗑️ Excluir</button>
          </div>
        </div>
      `).join('')
    }
  }

  // RENDERIZAR ATIVAS
  if (containerAtivas) {
    if (ativas.length === 0) {
      containerAtivas.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Nenhuma ativa</p>'
    } else {
      containerAtivas.innerHTML = ativas.map(l => {
        const validade = new Date(l.validade)
        const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24))
        const expirado = dias <= 0
        const vencendo = !expirado && dias <= 7
        const cor = expirado ? '#ef4444' : vencendo ? '#f59e0b' : '#00e676'
        const texto = expirado ? 'Expirado' : vencendo ? `Vence em ${dias}d` : `${dias} dias restantes`
        return `
          <div class="licenca-card">
            <div class="licenca-info">
              <h3>${l.nome_cliente} ${l.nome_empresa ? `- ${l.nome_empresa}` : ''}</h3>
              <p>📧 ${l.email || 'N/A'} | 📱 ${l.telefone || 'N/A'}</p>
              <p>🔒 HWID: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;font-size:11px;">${l.hwid}</code></p>
              ${l.revendedor_nome ? `<p>🏪 Vendido por: <strong>${l.revendedor_nome}</strong></p>` : ''}
              <p>📅 Validade: ${validade.toLocaleDateString('pt-BR')} | <strong style="color:${cor}">${texto}</strong></p>
            </div>
            <div class="licenca-actions">
              <button class="btn-small btn-renew" onclick="renovarLicenca('${l.hwid}')">🔄 Renovar</button>
              <button class="btn-small btn-delete" onclick="excluirLicencaHandler('${l.hwid}')">🗑️ Excluir</button>
            </div>
          </div>
        `
      }).join('')
    }
  }
}

function copiarTexto(texto, msg) {
  navigator.clipboard.writeText(texto)
  mostrarMensagem(msg || '✅ Copiado!')
}

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener('DOMContentLoaded', () => {
  const estilo = document.createElement('style')
  estilo.textContent = `
    .btn-approve { background: #10b981; color: #fff; }
    .btn-renew { background: #3b82f6; color: #fff; }
    .btn-reject { background: #ef4444; color: #fff; }
    .btn-delete { background: #ef4444; color: #fff; }
  `
  document.head.appendChild(estilo)

  verificarLogin()
  const hoje = new Date().toISOString().split('T')[0]
  const validadeInput = document.getElementById('validade')
  if (validadeInput) validadeInput.setAttribute('min', hoje)

  setInterval(() => {
    if (sessionStorage.getItem(AUTH_KEY)) {
      renderizarLicencas()
      if (usuarioAtual?.tipo === 'admin') renderizarRevendedores()
    }
  }, 30000)
})

window.fazerLogin = fazerLogin
window.fazerLogout = fazerLogout
window.gerarLicenca = gerarLicenca
window.renovarLicenca = renovarLicenca
window.aprovarCadastro = aprovarCadastro
window.reprovarCadastro = reprovarCadastro
window.excluirLicencaHandler = excluirLicencaHandler
window.copiarTexto = copiarTexto
window.mostrarMensagem = mostrarMensagem
window.cadastrarRevendedorHandler = cadastrarRevendedorHandler
window.bloquearRevendedor = bloquearRevendedor
window.excluirRevendedorHandler = excluirRevendedorHandler
window.trocarAba = trocarAba
