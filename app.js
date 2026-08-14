// ✅ SENHA DO ADMINISTRADOR (MUDE PARA SUA SENHA)
const SENHA_ADMIN = 'Washington2024'

// ✅ Banco de dados local
const DB_KEY = 'os_premium_licencas'
const AUTH_KEY = 'os_premium_auth'

// ✅ Verificar se já está logado
function verificarLogin() {
  const autenticado = sessionStorage.getItem(AUTH_KEY)
  if (autenticado === 'true') {
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('painelPrincipal').classList.add('ativo')
    renderizarLicencas()
  }
}

// ✅ Fazer login
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
    document.getElementById('senhaAdmin').value = ''
  }
}

// ✅ Fazer logout
function fazerLogout() {
  sessionStorage.removeItem(AUTH_KEY)
  location.reload()
}

// ✅ Carregar licenças
function carregarLicencas() {
  const dados = localStorage.getItem(DB_KEY)
  return dados ? JSON.parse(dados) : []
}

// ✅ Salvar licenças
function salvarLicencas(licencas) {
  localStorage.setItem(DB_KEY, JSON.stringify(licencas))
}

// ✅ Gerador de Chave
function gerarChave(hwid, validade) {
  const base = `${hwid}-${validade}-OSPREMIUM-V2-${Date.now()}`
  let hash = 0
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i)
    hash |= 0
  }
  const prefix = hwid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()
  const suffix = Math.abs(hash).toString(16).substring(0, 6).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `OS-${prefix}-${suffix}-${random}-${validade.replace(/-/g, '')}`
}

// ✅ Mostrar mensagem
function mostrarMensagem(texto, tipo = 'success') {
  const div = document.getElementById('mensagem')
  div.className = `alert alert-${tipo === 'success' ? 'success' : 'error'}`
  div.textContent = texto
  setTimeout(() => div.textContent = '', 5000)
}

// ✅ Gerar nova licença
function gerarLicenca() {
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

  const chaveGerada = gerarChave(hwid, validade)
  
  const novaLicenca = {
    id: Date.now(),
    nomeCliente,
    nomeEmpresa,
    email,
    telefone,
    hwid,
    validade,
    status,
    chave: chaveGerada,
    dataGeracao: new Date().toISOString()
  }

  const licencas = carregarLicencas()
  licencas.push(novaLicenca)
  salvarLicencas(licencas)

  mostrarMensagem('✅ Licença gerada e salva com sucesso!')
  
  // Limpar formulário
  document.getElementById('nomeCliente').value = ''
  document.getElementById('nomeEmpresa').value = ''
  document.getElementById('email').value = ''
  document.getElementById('telefone').value = ''
  document.getElementById('hwid').value = ''
  document.getElementById('validade').value = ''
  document.getElementById('status').value = 'Ativo'

  renderizarLicencas()
}

// ✅ Copiar chave
function copiarChave(chave) {
  navigator.clipboard.writeText(chave)
  mostrarMensagem('✅ Chave copiada! Cole no WhatsApp/E-mail do cliente.')
}

// ✅ Excluir licença
function excluirLicenca(id) {
  if (!confirm('⚠️ Tem certeza que deseja excluir esta licença?')) return
  
  let licencas = carregarLicencas()
  licencas = licencas.filter(l => l.id !== id)
  salvarLicencas(licencas)
  mostrarMensagem('✅ Licença excluída!')
  renderizarLicencas()
}

// ✅ Renderizar lista
function renderizarLicencas() {
  const licencas = carregarLicencas()
  const container = document.getElementById('listaLicencas')

  if (licencas.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 40px;">Nenhuma licença cadastrada</p>'
    return
  }

  container.innerHTML = licencas.map(licenca => `
    <div class="licenca-card">
      <div class="licenca-info">
        <h3>${licenca.nomeCliente} ${licenca.nomeEmpresa ? `- ${licenca.nomeEmpresa}` : ''}</h3>
        <p>📧 ${licenca.email || 'N/A'} | 📱 ${licenca.telefone || 'N/A'}</p>
        <p> HWID: ${licenca.hwid}</p>
        <p>📅 Validade: ${new Date(licenca.validade).toLocaleDateString('pt-BR')} | Status: <strong style="color: ${licenca.status === 'Ativo' ? '#00e676' : '#ef4444'}">${licenca.status}</strong></p>
        <div class="licenca-chave">${licenca.chave}</div>
      </div>
      <div class="licenca-actions">
        <button class="btn-small btn-copy" onclick="copiarChave('${licenca.chave}')"> Copiar Chave</button>
        <button class="btn-small btn-delete" onclick="excluirLicenca(${licenca.id})">🗑️ Excluir</button>
      </div>
    </div>
  `).join('')
}

// ✅ Inicializar
document.addEventListener('DOMContentLoaded', () => {
  verificarLogin()
  
  const hoje = new Date().toISOString().split('T')[0]
  document.getElementById('validade').setAttribute('min', hoje)
})