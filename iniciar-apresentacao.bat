@echo off
echo ============================================
echo    TCC - Sistema de Agendamentos de Massagem
echo ============================================
echo.

echo [1/4] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não encontrado. Instale o Docker Desktop primeiro.
    pause
    exit /b 1
)
echo ✅ Docker encontrado
echo.

echo [2/4] Navegando para diretório do projeto...
cd /d "%~dp0"
if not exist "docker-compose.yml" (
    echo ❌ Arquivo docker-compose.yml não encontrado no diretório atual
    echo Certifique-se de executar este script dentro da pasta TCC--main
    pause
    exit /b 1
)
echo ✅ Diretório correto
echo.

echo [3/4] Iniciando serviços Docker...
docker compose down >nul 2>&1
docker compose up -d --build
if errorlevel 1 (
    echo ❌ Falha ao iniciar serviços Docker
    pause
    exit /b 1
)
echo ✅ Serviços iniciados
echo.

echo [4/4] Verificando status dos serviços...
timeout /t 10 /nobreak >nul
docker compose ps
echo.

echo ============================================
echo           SISTEMA PRONTO!
echo ============================================
echo.
echo 🌐 Frontend + API: http://localhost:3000
echo 📊 Agendamentos:   http://localhost:3000/agendamentos.html
echo 💚 Health Check:   http://localhost:3000/health
echo 🗄️  MySQL:         localhost:3307 (root/password)
echo.
echo 📋 Para apresentar:
echo 1. Abra http://localhost:3000 no navegador
echo 2. Navegue para "Agendar" ou diretamente para agendamentos.html
echo 3. Demonstre criação de clientes e agendamentos
echo.
echo 🔧 Comandos úteis:
echo - docker compose logs -f backend    (ver logs)
echo - docker compose restart           (reiniciar)
echo - docker compose down              (parar tudo)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul