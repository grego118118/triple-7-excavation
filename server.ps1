$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8775/")
$listener.Start()

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.json' = 'application/json'
    '.webp' = 'image/webp'
}

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req  = $context.Request
    $resp = $context.Response

    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }

    $relPath  = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $filePath = Join-Path $root $relPath

    if ((Test-Path $filePath -PathType Container)) {
        $filePath = Join-Path $filePath 'index.html'
    }

    try {
        $resp.KeepAlive = $false
        if (Test-Path $filePath -PathType Leaf) {
            $ext     = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime    = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $bytes   = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType     = $mime
            $resp.ContentLength64 = $bytes.Length
            $resp.StatusCode      = 200
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $resp.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $resp.ContentLength64 = $body.Length
            $resp.OutputStream.Write($body, 0, $body.Length)
        }
    } catch {
        # Client likely canceled the request (e.g. browser reload) — ignore.
    } finally {
        try { $resp.Close() } catch { }
    }
}
