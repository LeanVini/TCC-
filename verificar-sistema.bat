@echo off
echo ============================================
echo     VERIFICAÇÃO PRÉ-APRESENTAÇÃO TCC
echo ============================================
echo.

echo [1/6] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: Docker não encontrado
    goto :error
)
echo ✅ Docker OK
echo.

echo [2/6] Verificando docker-compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: docker-compose não encontrado
    goto :error
)
echo ✅ Docker Compose OK
echo.

echo [3/6] Verificando arquivos do projeto...
if not exist "docker-compose.yml" (
    echo ❌ ERRO: docker-compose.yml não encontrado
    goto :error
)
if not exist "backend\server.js" (
    echo ❌ ERRO: backend/server.js não encontrado
    goto :error
)
if not exist "frontend\agendamentos.html" (
    echo ❌ ERRO: frontend/agendamentos.html não encontrado
    goto :error
)
if not exist "database\schema.sql" (
    echo ❌ ERRO: database/schema.sql não encontrado
    goto :error
)
echo ✅ Arquivos do projeto OK
echo.

echo [4/6] Verificando portas disponíveis...
netstat -an | find "3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  AVISO: Porta 3000 já em uso (pode estar OK se sistema já rodando)
) else (
    echo ✅ Porta 3000 disponível
)

netstat -an | find "3307" >nul
if %errorlevel% equ 0 (
    echo ⚠️  AVISO: Porta 3307 já em uso (pode estar OK se MySQL já rodando)
) else (
    echo ✅ Porta 3307 disponível
)
echo.

echo [5/6] Testando conectividade de rede...
ping -n 1 127.0.0.1 >nul
if errorlevel 1 (
    echo ❌ ERRO: Problema de conectividade local
    goto :error
)
echo ✅ Conectividade OK
echo.

echo [6/6] Verificando espaço em disco...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set free=%%a
if %free% lss 1073741824 (
    echo ⚠️  AVISO: Menos de 1GB de espaço livre em disco
) else (
    echo ✅ Espaço em disco OK
)
echo.

echo ============================================
echo        ✅ VERIFICAÇÃO CONCLUÍDA!
echo ============================================
echo.
echo 🎯 Tudo pronto para apresentação!
echo Execute 'iniciar-apresentacao.bat' para começar
echo.
pause
exit /b 0

:error
echo.
echo ❌ VERIFICAÇÃO FALHOU!
echo Corrija os problemas acima antes da apresentação.
echo.
pause
exit /b 1