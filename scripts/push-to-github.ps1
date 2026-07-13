param(
    [Parameter(Mandatory=$true)]
    [string] $RepoName,

    [Parameter(Mandatory=$true)]
    [string] $GitHubToken,

    [Parameter(Mandatory=$false)]
    [string] $Visibility = "private"
)

# Usage: .\push-to-github.ps1 -RepoName "my-repo" -GitHubToken "ghp_..." -Visibility public

Set-StrictMode -Version Latest

function Exec {
    param($cmd)
    Write-Host "> $cmd"
    iex $cmd
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not available in PATH."
    exit 1
}

$cwd = Get-Location

# Initialize git if needed
if (-not (Test-Path .git)) {
    Exec "git init"
}

# Create .gitignore if missing
if (-not (Test-Path .gitignore)) {
    @(
        "node_modules/",
        "dist/",
        ".env",
        "*.log",
        "response.html"
    ) | Out-File -FilePath .gitignore -Encoding utf8
    Exec "git add .gitignore"
}

Exec "git add -A"

try {
    Exec "git commit -m \"Initial commit\""
} catch {
    Write-Host "No changes to commit or commit failed: $_"
}

# Create repo via GitHub API
$apiUrl = "https://api.github.com/user/repos"

$body = @{ name = $RepoName; private = ($Visibility -ne 'public') } | ConvertTo-Json

$headers = @{ Authorization = "token $GitHubToken"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'push-to-github-script' }

Write-Host "Creating repository '$RepoName' on GitHub..."

$resp = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $body -ErrorAction Stop

$remoteUrl = $resp.clone_url

Write-Host "Setting remote origin to $remoteUrl"
Exec "git remote remove origin 2>$null; git remote add origin $remoteUrl"

Write-Host "Pushing to GitHub..."
Exec "git branch -M main"
Exec "git push -u origin main"

Write-Host "Done. Repository created: $($resp.html_url)"
