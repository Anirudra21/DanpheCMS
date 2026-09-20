# Reads .env, signs in via NextAuth credentials, and verifies /admin/dashboard
$envPath = Join-Path $PSScriptRoot '..\.env'
if (-not (Test-Path $envPath)) { $envPath = Join-Path $PSScriptRoot '..\..\.env' }
$lines = Get-Content $envPath | Where-Object { $_ -and $_ -notmatch '^#' }
$vars = @{}
foreach ($line in $lines) {
  $pair = $line -split '='; if ($pair.Length -lt 2) { continue }
  $k = $pair[0].Trim(); $v = ($pair[1..($pair.Length-1)] -join '=').Trim(); $v = $v.Trim('"')
  $vars[$k] = $v
}
if (-not $vars.ContainsKey('ADMIN_EMAIL') -or -not $vars.ContainsKey('ADMIN_PASSWORD')) { Write-Output "Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env"; exit 2 }
$adminEmail = $vars['ADMIN_EMAIL']
$adminPassword = $vars['ADMIN_PASSWORD']
$base = 'http://localhost:3000'
# Fetch CSRF token
try {
  $csrfResp = Invoke-RestMethod -Uri "$base/api/auth/csrf" -Method Get
  $csrf = $csrfResp.csrfToken
} catch {
  Write-Output "ERROR: Unable to fetch CSRF token: $_"; exit 3
}
# Prepare web session
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$body = @{ csrfToken = $csrf; email = $adminEmail; password = $adminPassword; json = 'true'; callbackUrl = '/admin/dashboard' }
# Sign in (follow redirects to create session cookie)
try {
  $signin = Invoke-WebRequest -Uri "$base/api/auth/callback/credentials" -Method Post -Body $body -WebSession $session -ContentType 'application/x-www-form-urlencoded' -MaximumRedirection 5 -ErrorAction Stop
  Write-Output "SIGNIN_OK: Sign-in request completed (redirects followed)."
  Write-Output "SIGNIN_STATUS: $($signin.StatusCode)"
  # List cookie names set in the session (do not print values)
  if ($session.Cookies) {
    $cookieNames = $session.Cookies.GetCookies($base) | ForEach-Object { $_.Name }
    Write-Output "SESSION_COOKIES: $($cookieNames -join ',')"
  } else {
    Write-Output "SESSION_COOKIES: none"
  }
} catch {
  Write-Output "SIGNIN_ERROR: $_"; exit 4
}
# Access dashboard
try {
  $dashResp = Invoke-WebRequest -Uri "$base/admin/dashboard" -WebSession $session -Method Get -UseBasicParsing -ErrorAction Stop
  Write-Output "DASH_STATUS: $($dashResp.StatusCode)"
  $body = $dashResp.Content
  $hasAdminIndicator = $body -match 'Admin' -or $body -match 'Dashboard' -or $body -match 'SUPER_ADMIN'
  $showsAdminEmail = $body -match [regex]::Escape($adminEmail)
  if ($hasAdminIndicator) { Write-Output 'DASH_INDICATOR: admin content appears present' } else { Write-Output 'DASH_INDICATOR: admin content not detected' }
  if ($showsAdminEmail) { Write-Output 'DASH_CONTAINS_ADMIN_EMAIL: true' } else { Write-Output 'DASH_CONTAINS_ADMIN_EMAIL: false' }
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
    Write-Output "DASH_STATUS: $($_.Exception.Response.StatusCode)"
  } else { Write-Output "DASH_ERROR: $_" }
  exit 5
}

# Fetch session JSON to verify role
try {
  $sessJson = Invoke-RestMethod -Uri "$base/api/auth/session" -Method Get -WebSession $session
  if ($sessJson.user) {
    $role = ($sessJson.user.role -as [string])
    $email = ($sessJson.user.email -as [string])
    Write-Output "SESSION_USER_EMAIL: $email"
    Write-Output "SESSION_USER_ROLE: $role"
  } else {
    Write-Output 'SESSION: no user object in session response'
  }
} catch {
  Write-Output "SESSION_ERROR: $_"
}
