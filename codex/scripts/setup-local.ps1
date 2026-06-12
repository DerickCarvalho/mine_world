$ErrorActionPreference = "Stop"
$Database = "mineworld_db"
$MysqlUser = "root"
$MysqlPassword = "Senha123#"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$mysql = "C:\laragon\bin\mysql\mysql-8.0.46-winx64\bin\mysql.exe"
$php = "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
$fcgid = "C:\laragon\etc\apache2\fcgid.conf"
$httpd = "C:\laragon\bin\apache\httpd-2.4.62-240904-win64-VS17\bin\httpd.exe"
$laragonTemp = "C:/laragon/tmp"

foreach ($executable in @($mysql, $php, $httpd)) {
    if (-not (Test-Path $executable)) {
        throw "Executavel nao encontrado: $executable"
    }
}

$services = Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match "^(mysqld|httpd)$"
}

if (-not ($services.ProcessName -contains "mysqld")) {
    throw "MySQL nao esta ativo. Inicie o Laragon e tente novamente."
}

if (-not ($services.ProcessName -contains "httpd")) {
    throw "Apache nao esta ativo. Inicie o Laragon e tente novamente."
}

$fcgidConfig = Get-Content -Raw -LiteralPath $fcgid
if (-not $fcgidConfig.Contains("php-8.3.16-Win32-vs16-x64")) {
    throw "Apache nao esta usando PHP 8.3.16. No Laragon, selecione Menu > PHP > Version > php-8.3.16-Win32-vs16-x64 e reinicie o Apache."
}

$updatedFcgidConfig = $fcgidConfig `
    -replace 'FcgidInitialEnv TEMP "[^"]*"', "FcgidInitialEnv TEMP `"$laragonTemp`"" `
    -replace 'FcgidInitialEnv TMP "[^"]*"', "FcgidInitialEnv TMP `"$laragonTemp`""

if ($updatedFcgidConfig -ne $fcgidConfig) {
    Set-Content -LiteralPath $fcgid -Value $updatedFcgidConfig -Encoding ASCII

    $apacheProcesses = @(Get-CimInstance Win32_Process -Filter "Name='httpd.exe'" | Where-Object {
        $_.ExecutablePath -eq $httpd
    })
    $apacheProcessIds = @($apacheProcesses | ForEach-Object { [int] $_.ProcessId })
    $apacheRootProcesses = @($apacheProcesses | Where-Object {
        $apacheProcessIds -notcontains [int] $_.ParentProcessId
    })

    foreach ($process in $apacheRootProcesses) {
        Stop-Process -Id $process.ProcessId -Force
    }

    Start-Sleep -Seconds 1
    Start-Process -FilePath $httpd -ArgumentList @("-d", (Split-Path (Split-Path $httpd))) -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

$previousMysqlPassword = $env:MYSQL_PWD
$env:MYSQL_PWD = $MysqlPassword
$mysqlArgs = @(
    "--user=$MysqlUser",
    "--host=127.0.0.1",
    "--port=3306"
)

try {
    & $mysql @mysqlArgs -e "CREATE DATABASE IF NOT EXISTS ``$Database`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao criar ou acessar o banco $Database."
    }

    Push-Location $root
    try {
        & $php api\database\migrate.php
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao aplicar migrations."
        }

        & $mysql @mysqlArgs $Database -e "DELETE FROM usuarios WHERE login = 'mineworld_setup_check';"
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao preparar usuario tecnico de validacao."
        }

        try {
            & node codex\scripts\test-local-api.mjs
            if ($LASTEXITCODE -ne 0) {
                throw "Falha na validacao da API local."
            }
        } finally {
            & $mysql @mysqlArgs $Database -e "DELETE FROM usuarios WHERE login = 'mineworld_setup_check';"
        }
    } finally {
        Pop-Location
    }
} finally {
    $env:MYSQL_PWD = $previousMysqlPassword
}

Write-Host "MineWorld local configurado com sucesso em http://mine_world.test/"
