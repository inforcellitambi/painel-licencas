// ✅ PAINEL DE LICENÇAS OS-PREMIUM - VERSÃO FINAL (SUPABASE)
const SENHA_ADMIN = 'Washington2024'
const SUPABASE_URL = 'https://sneozlvodhxirzrimtep.supabase.co'
const SUPABASE_KEY = 'sb_publishable_3i3ZGV6M13dbUhEtvyfGFQ_DPiu4Pnl'
const AUTH_KEY = 'os_premium_auth'

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
  } catch (e) {
    console.error('Erro ao buscar licenças:', e)
    return []
  }
}

async function salvarLicenca(licenca) {
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
  } catch (e) {
    return false
  }
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
  } catch (e) {
    return false
  }
}

async function excluirLicenca(hwid) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/licencas?hwid=eq.${encodeURIComponent(hwid)}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    return response.ok
  } catch (e) {
    return false
  }
}

// ============================
// LOGIN
// ============================

function verificarLogin() {
  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('painelPrincipal').classList.add('ativo')
    renderizarLicencas()
  }
}

function fazerLogin() {
  const senha = document.getElementById('senhaAdmin').value
  if (senha === SENHA_ADMIN) {
    sessionStorage.setItem(AUTH_KEY, 'true')
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('painelPrincipal').classList.add('ativo')
    document.getElementById('erroLogin').textContent = ''
    renderizarLicencas()
  } else {
    document.getElementById('erroLogin').textContent = '❌ Senha incorreta!'
  }
}

function fazerLogout() {
  sessionStorage.removeItem(AUTH_KEY)
  location.reload()
}

function mostrarMensagem(texto, tipo = 'success') {
  const div = document.getElementById('mensagem')
  div.className = `alert alert-${tipo === 'success' ? 'success' : 'error'}`
  div.textContent = texto
  setTimeout(() => div.textContent = '', 5000)
}

// ============================
// CADASTRO MANUAL (ativa na hora)
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
    hwid,
    nome_cliente: nomeCliente,
    nome_empresa: nomeEmpresa,
    email,
    telefone,
    validade,
    status,
    status_aprovacao: 'Ativo'
  })

  if (sucesso) {
    mostrarMensagem('✅ Licença cadastrada na nuvem! O sistema ativa sozinho.')
    document.getElementById('nomeCliente').value = ''
    document.getElementById('nomeEmpresa').value = ''
    document.getElementById('email').value = ''
    document.getElementById('telefone').value = ''
    document.getElementById('hwid').value = ''
    document.getElementById('validade').value = ''
    document.getElementById('status').value = 'Ativo'
    await renderizarLicencas()
  } else {
    mostrarMensagem('❌ Erro ao salvar no Supabase', 'error')
  }
}

// ============================
// RENOVAR / APROVAR / REPROVAR
// ============================

async function renovarLicenca(hwid) {
  const padrao = new Date()
  padrao.setDate(padrao.getDate() + 30)
  const padraoStr = padrao.toISOString().split('T')[0]

  const novaValidade = prompt('Nova validade (AAAA-MM-DD):', padraoStr)
  if (!novaValidade) return

  const sucesso = await atualizarLicenca(hwid, { validade: novaValidade, status: 'Ativo', status_aprovacao: 'Ativo' })
  if (sucesso) {
    mostrarMensagem('✅ Renovado! O cliente abre o sistema e ativa sozinho.')
    await renderizarLicencas()
  }
}

async function aprovarCadastro(hwid) {
  const padrao = new Date()
  padrao.setDate(padrao.getDate() + 30)
  const validade = prompt('Validade da licença (AAAA-MM-DD):', padrao.toISOString().split('T')[0])
  if (!validade) return

  const sucesso = await atualizarLicenca(hwid, { status_aprovacao: 'Ativo', status: 'Ativo', validade })
  if (sucesso) {
    mostrarMensagem('✅ Cliente aprovado! Ele abre o sistema e ativa sozinho.')
    await renderizarLicencas()
  }
}

async function reprovarCadastro(hwid) {
  if (!confirm('Reprovar este cadastro?')) return
  const sucesso = await atualizarLicenca(hwid, { status_aprovacao: 'Reprovado' })
  if (sucesso) {
    mostrarMensagem('❌ Cadastro reprovado!')
    await renderizarLicencas()
  }
}

async function excluirLicencaHandler(hwid) {
  if (!confirm('Excluir esta licença?')) return
  const sucesso = await excluirLicenca(hwid)
  if (sucesso) {
    mostrarMensagem('✅ Licença excluída!')
    await renderizarLicencas()
  }
}

function copiarTexto(texto, msg) {
  navigator.clipboard.writeText(texto)
  mostrarMensagem(msg || '✅ Copiado!')
}

// ============================
// LISTA
// ============================

async function renderizarLicencas() {
  const container = document.getElementById('listaLicencas')
  container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">⏳ Carregando...</p>'

  const licencas = await buscarLicencas()
  const hoje = new Date()

  const pendentes = licencas.filter(l => l.status_aprovacao === 'Pendente')
  const ativas = licencas.filter(l => l.status_aprovacao !== 'Pendente' && l.status_aprovacao !== 'Reprovado')

  if (licencas.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">Nenhuma licença cadastrada</p>'
    return
  }

  let html = ''

  if (pendentes.length > 0) {
    html += `<h3 style="color: #f59e0b; margin: 0 0 12px 0;">⏳ Aguardando Aprovação (${pendentes.length})</h3>`
    html += pendentes.map(l => `
      <div class="licenca-card" style="border-color: #f59e0b;">
        <div class="licenca-info">
          <h3>${l.nome_cliente}</h3>
          <p>🔒 HWID: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;font-size:11px;">${l.hwid}</code></p>
          <p>📅 Cadastrado: ${new Date(l.criado_em).toLocaleString('pt-BR')}</p>
          <p style="color: #f59e0b; font-weight: 600;">⚠️ AGUARDANDO SUA APROVAÇÃO</p>
        </div>
        <div class="licenca-actions">
          <button class="btn-small btn-approve" onclick="aprovarCadastro('${l.hwid}')">✅ Aprovar</button>
          <button class="btn-small btn-reject" onclick="reprovarCadastro('${l.hwid}')">❌ Reprovar</button>
          <button class="btn-small btn-delete" onclick="excluirLicencaHandler('${l.hwid}')">🗑️ Excluir</button>
        </div>
      </div>
    `).join('')
  }

  if (ativas.length > 0) {
    html += `<h3 style="color: #00e676; margin: 20px 0 12px 0;">✅ Licenças Ativas (${ativas.length})</h3>`
    html += ativas.map(l => {
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
            <p>📅 Validade: ${validade.toLocaleDateString('pt-BR')} | <strong style="color:${cor}">${texto}</strong></p>
          </div>
          <div class="licenca-actions">
            <button class="btn-small btn-renew" onclick="renovarLicenca('${l.hwid}')">🔄 Renovar</button>
            <button class="btn-small btn-copy" onclick="copiarTexto('${l.hwid}', '✅ HWID copiado!')">📋 Copiar HWID</button>
            <button class="btn-small btn-delete" onclick="excluirLicencaHandler('${l.hwid}')">🗑️ Excluir</button>
          </div>
        </div>
      `
    }).join('')
  }

  container.innerHTML = html
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
    .btn-copy { background: #00e676; color: #000; }
    .btn-delete { background: #ef4444; color: #fff; }
  `
  document.head.appendChild(estilo)

  verificarLogin()
  const hoje = new Date().toISOString().split('T')[0]
  const validadeInput = document.getElementById('validade')
  if (validadeInput) validadeInput.setAttribute('min', hoje)

  setInterval(() => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') renderizarLicencas()
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
