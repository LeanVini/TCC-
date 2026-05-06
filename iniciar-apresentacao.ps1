param(
    [switch]$Force,
    [switch]$Clean
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   TCC - Sistema de Agendamentos de Massagem" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Limpar dados se solicitado
if ($Clean) {
    Write-Host "[0/5] Limpando dados antigos..." -ForegroundColor Yellow
    docker compose down -v 2>$null
    Write-Host "✅ Dados limpos" -ForegroundColor Green
    Write-Host ""
}

# Verificar Docker
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host ""

# Verificar diretório
Write-Host "[2/5] Verificando diretório do projeto..." -ForegroundColor Yellow
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Arquivo docker-compose.yml não encontrado" -ForegroundColor Red
    Write-Host "Certifique-se de executar este script dentro da pasta TCC--main" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Diretório correto" -ForegroundColor Green
Write-Host ""

# Parar serviços existentes
Write-Host "[3/5] Preparando ambiente..." -ForegroundColor Yellow
docker compose down 2>$null
Write-Host "✅ Ambiente preparado" -ForegroundColor Green
Write-Host ""

# Iniciar serviços
Write-Host "[4/5] Iniciando serviços Docker..." -ForegroundColor Yellow
try {
    docker compose up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao iniciar serviços"
    }
    Write-Host "✅ Serviços iniciados" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao iniciar serviços Docker: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host ""

# Aguardar inicialização
Write-Host "[5/5] Aguardando inicialização completa..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar status
docker compose ps
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "           SISTEMA PRONTO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend + API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Agendamentos:   http://localhost:3000/agendamentos.html" -ForegroundColor Cyan
Write-Host "💚 Health Check:   http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "🗄️  MySQL:         localhost:3307 (root/password)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 FLUXO DE APRESENTAÇÃO:" -ForegroundColor Yellow
Write-Host "1. Abra http://localhost:3000 no navegador" -ForegroundColor White
Write-Host "2. Navegue para 'Agendar' ou acesse agendamentos.html" -ForegroundColor White
Write-Host "3. Demonstre:" -ForegroundColor White
Write-Host "   - Criar cliente (aba Clientes)" -ForegroundColor White
Write-Host "   - Criar agendamento (aba Agendamentos)" -ForegroundColor White
Write-Host "   - Editar/Excluir registros" -ForegroundColor White
Write-Host "   - Buscar clientes" -ForegroundColor White
Write-Host ""
Write-Host "🔧 COMANDOS ÚTEIS:" -ForegroundColor Yellow
Write-Host "- docker compose logs -f backend    (ver logs)" -ForegroundColor White
Write-Host "- docker compose restart           (reiniciar)" -ForegroundColor White
Write-Host "- docker compose down              (parar tudo)" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Enter para continuar..." -ForegroundColor Green
Read-Host