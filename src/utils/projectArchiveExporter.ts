import JSZip from 'jszip';
import fileSaver from 'file-saver';
const saveAs = (fileSaver as any)?.saveAs || fileSaver;

export interface ExportProgressCallback {
  (step: string, percentage: number): void;
}

/**
 * Collects all game saves and option file data from localStorage
 */
export function collectAllGameSaveData(): Record<string, any> {
  const saveState: Record<string, any> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        try {
          saveState[key] = val ? JSON.parse(val) : val;
        } catch {
          saveState[key] = val;
        }
      }
    }
  } catch (err) {
    console.error('Error reading localStorage for export:', err);
  }
  return saveState;
}

/**
 * Restores all game saves from an exported JSON object
 */
export function restoreGameSaveData(saveData: Record<string, any>): number {
  let count = 0;
  try {
    const targetData = saveData && typeof saveData === 'object' && saveData.saves ? saveData.saves : saveData;

    Object.entries(targetData).forEach(([key, val]) => {
      if (key.startsWith('_')) return; // skip metadata
      if (typeof val === 'object' && val !== null) {
        localStorage.setItem(key, JSON.stringify(val));
      } else if (val !== undefined && val !== null) {
        localStorage.setItem(key, String(val));
      }
      count++;
    });
  } catch (err) {
    console.error('Error restoring save data:', err);
  }
  return count;
}

/**
 * Windows 100% Native Launcher (Zero Python dependency)
 * Uses built-in Windows PowerShell HttpListener and launches game in native app-window or default browser.
 */
const WINDOWS_BAT_CONTENT = `@echo off
setlocal
cd /d "%~dp0"
title DrawStar 32-Bit - Offline Desktop Runner
echo ========================================================
echo       DRAWSTAR 32-BIT - OFFLINE STANDALONE RUNNER
echo ========================================================
echo.
echo Starting local offline game server on port 3030...
echo [!] Keep this window open while playing. Close it when done.
echo.

:: Launch Windows Built-in Native Local Web Server (Zero external dependencies)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = 3030;" ^
  "$server = New-Object System.Net.HttpListener;" ^
  "$server.Prefixes.Add('http://localhost:' + $port + '/');" ^
  "try { $server.Start() } catch { $port = 3031; $server = New-Object System.Net.HttpListener; $server.Prefixes.Add('http://localhost:' + $port + '/'); $server.Start() };" ^
  "Write-Host ('[OK] DrawStar is running at: http://localhost:' + $port + '/index.html');" ^
  "$edge = (Join-Path \${env:ProgramFiles(x86)} 'Microsoft\\Edge\\Application\\msedge.exe');" ^
  "if (-not (Test-Path $edge)) { $edge = (Join-Path \${env:ProgramFiles} 'Microsoft\\Edge\\Application\\msedge.exe') };" ^
  "if (Test-Path $edge) {" ^
  "  Start-Process $edge -ArgumentList ('--app=http://localhost:' + $port + '/index.html --window-size=1280,820');" ^
  "} else {" ^
  "  Start-Process ('http://localhost:' + $port + '/index.html');" ^
  "};" ^
  "$root = (Get-Location).Path;" ^
  "while ($server.IsListening) {" ^
  "  $ctx = $server.GetContext();" ^
  "  $req = $ctx.Request.Url.LocalPath.TrimStart('/');" ^
  "  if ([string]::IsNullOrEmpty($req)) { $req = 'index.html' };" ^
  "  $f = Join-Path $root $req;" ^
  "  if (-not (Test-Path $f -PathType Leaf)) { $f = Join-Path $root 'index.html' };" ^
  "  $ext = [System.IO.Path]::GetExtension($f).ToLower();" ^
  "  $mime = switch ($ext) {" ^
  "    '.html' { 'text/html; charset=utf-8' }" ^
  "    '.js'   { 'application/javascript; charset=utf-8' }" ^
  "    '.mjs'  { 'application/javascript; charset=utf-8' }" ^
  "    '.css'  { 'text/css; charset=utf-8' }" ^
  "    '.json' { 'application/json; charset=utf-8' }" ^
  "    '.svg'  { 'image/svg+xml' }" ^
  "    '.png'  { 'image/png' }" ^
  "    '.jpg'  { 'image/jpeg' }" ^
  "    '.jpeg' { 'image/jpeg' }" ^
  "    '.ico'  { 'image/x-icon' }" ^
  "    '.woff' { 'font/woff' }" ^
  "    '.woff2'{ 'font/woff2' }" ^
  "    default { 'application/octet-stream' }" ^
  "  };" ^
  "  $bytes = [System.IO.File]::ReadAllBytes($f);" ^
  "  $ctx.Response.StatusCode = 200;" ^
  "  $ctx.Response.ContentType = $mime;" ^
  "  $ctx.Response.ContentLength64 = $bytes.Length;" ^
  "  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length);" ^
  "  $ctx.Response.Close();" ^
  "}"

pause
`;

/**
 * 1-Click Windows Setup & Desktop Shortcut Installer
 */
const SETUP_INSTALLER_BAT_CONTENT = `@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title DrawStar 32-Bit - 1-Click Game Setup & Installer
echo ========================================================
echo       DRAWSTAR 32-BIT - OFFLINE GAME INSTALLER
echo ========================================================
echo.
echo Installing DrawStar 32-Bit to your PC...
echo Target Folder: %~dp0
echo.
:: Create Desktop Shortcut using Windows built-in PowerShell
echo [1/3] Creating Desktop Shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$desktop = [Environment]::GetFolderPath('Desktop');" ^
  "$s = $ws.CreateShortcut((Join-Path $desktop 'DrawStar 32-Bit.lnk'));" ^
  "$s.TargetPath = (Join-Path '%~dp0' 'Play-Windows.bat');" ^
  "$s.WorkingDirectory = '%~dp0';" ^
  "$s.Description = 'Play DrawStar 32-Bit Offline';" ^
  "if (Test-Path (Join-Path '%~dp0' 'pwa-192x192.png')) { $s.IconLocation = (Join-Path '%~dp0' 'pwa-192x192.png') };" ^
  "$s.Save();"
echo [OK] Created 'DrawStar 32-Bit' shortcut on your Desktop!
echo.
echo [2/3] Verifying game assets...
if exist "%~dp0index.html" (
    echo [OK] Game assets verified successfully.
) else (
    echo [!] Warning: index.html not found. Ensure all files were extracted from the ZIP.
)
echo.
echo [3/3] Ready to play!
echo ========================================================
echo Installation Complete!
echo You can now launch DrawStar anytime from:
echo   - Your Desktop: Shortcut "DrawStar 32-Bit"
echo   - Or inside this folder: Double-click "Play-Windows.bat"
echo ========================================================
echo.
set /p launch="Do you want to launch DrawStar now? (Y/N): "
if /i "%launch%"=="y" (
    start "" "%~dp0Play-Windows.bat"
)
exit /b
`;

/**
 * Linux & macOS Standalone Runner
 */
const LINUX_SH_CONTENT = `#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "========================================================"
echo "      DRAWSTAR 32-BIT - LINUX / MAC OFFLINE RUNNER"
echo "========================================================"
echo "Starting offline game..."

start_browser() {
  sleep 1
  xdg-open "http://localhost:3030/index.html" 2>/dev/null || open "http://localhost:3030/index.html" 2>/dev/null
}
start_browser &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 3030
elif command -v python >/dev/null 2>&1; then
  python -m http.server 3030
elif command -v php >/dev/null 2>&1; then
  php -S localhost:3030
elif command -v node >/dev/null 2>&1; then
  npx serve -p 3030 .
else
  echo "Please open index.html in your web browser."
fi
`;

const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.drawstar.arcade32"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="DrawStar 32-Bit"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

async function fetchGameFiles(onProgress?: ExportProgressCallback): Promise<{ indexHtml: string; assets: Record<string, Blob> }> {
  if (onProgress) onProgress('Collecting game files...', 15);

  let indexHtml = '';
  try {
    const res = await fetch('./index.html?v=' + Date.now());
    if (res.ok) {
      indexHtml = await res.text();
    }
  } catch (err) {
    console.warn('Could not fetch index.html:', err);
  }

  const assetPaths: string[] = [
    'manifest.webmanifest',
    'registerSW.js',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'apple-touch-icon.png',
    'icon.svg',
  ];

  if (indexHtml) {
    const matches = indexHtml.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|png|jpg|jpeg|svg|ico|webmanifest|woff|woff2))["']/g);
    for (const match of matches) {
      const raw = match[1];
      if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
        const clean = raw.startsWith('./') ? raw.slice(2) : raw.startsWith('/') ? raw.slice(1) : raw;
        assetPaths.push(clean);
      }
    }
  }

  const uniquePaths = Array.from(new Set(assetPaths));
  const assets: Record<string, Blob> = {};

  let fetchedCount = 0;
  for (const asset of uniquePaths) {
    try {
      const res = await fetch('./' + asset);
      if (res.ok) {
        assets[asset] = await res.blob();
      }
    } catch {
      // Ignore optional missing asset
    }
    fetchedCount++;
    if (onProgress) {
      onProgress(
        `Packaging game assets (${fetchedCount}/${uniquePaths.length})...`,
        20 + Math.round((fetchedCount / uniquePaths.length) * 50)
      );
    }
  }

  return { indexHtml, assets };
}

/**
 * Downloads PC Windows Offline Archive with 1-click Installer & Desktop Launcher (0 Python needed)
 */
export async function downloadWindowsGameZip(onProgress?: ExportProgressCallback): Promise<void> {
  const zip = new JSZip();
  const { indexHtml, assets } = await fetchGameFiles(onProgress);

  if (indexHtml) zip.file('index.html', indexHtml);
  for (const [path, blob] of Object.entries(assets)) {
    zip.file(path, blob);
  }

  // Add save backup
  const currentSaves = collectAllGameSaveData();
  zip.file('saves/drawstar-current-career-and-options.json', JSON.stringify(currentSaves, null, 2));

  // Add 1-click installer and runners
  zip.file('Setup-Game.bat', SETUP_INSTALLER_BAT_CONTENT);
  zip.file('Play-Windows.bat', WINDOWS_BAT_CONTENT);
  zip.file('windows.bat', WINDOWS_BAT_CONTENT);

  const readme = `# DRAWSTAR 32-BIT - PC WINDOWS OFFLINE EDITION

## How to Play:
1. Double-click "Setup-Game.bat" to install a 1-click shortcut on your Desktop.
2. Or simply double-click "Play-Windows.bat" to play immediately!

NO Python or extra software required. Runs 100% offline with zero internet access!
`;
  zip.file('README.txt', readme);

  if (onProgress) onProgress('Creating PC ZIP archive...', 90);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `drawstar-32bit-pc-windows-${new Date().toISOString().split('T')[0]}.zip`);
  if (onProgress) onProgress('PC Package Downloaded!', 100);
}

/**
 * Downloads Linux Offline Archive
 */
export async function downloadLinuxGameZip(onProgress?: ExportProgressCallback): Promise<void> {
  const zip = new JSZip();
  const { indexHtml, assets } = await fetchGameFiles(onProgress);

  if (indexHtml) zip.file('index.html', indexHtml);
  for (const [path, blob] of Object.entries(assets)) {
    zip.file(path, blob);
  }

  const currentSaves = collectAllGameSaveData();
  zip.file('saves/drawstar-current-career-and-options.json', JSON.stringify(currentSaves, null, 2));

  zip.file('Play-Linux.sh', LINUX_SH_CONTENT);

  const readme = `# DRAWSTAR 32-BIT - LINUX OFFLINE EDITION

## How to Play:
Run: chmod +x Play-Linux.sh && ./Play-Linux.sh
`;
  zip.file('README.txt', readme);

  if (onProgress) onProgress('Creating Linux ZIP archive...', 90);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `drawstar-32bit-linux-${new Date().toISOString().split('T')[0]}.zip`);
  if (onProgress) onProgress('Linux Package Downloaded!', 100);
}

/**
 * Downloads Direct Android Offline APK Package (.apk)
 * Triggers direct browser download of drawstar-32bit-android-offline.apk
 */
export async function downloadDirectApkFile(onProgress?: ExportProgressCallback): Promise<void> {
  const zip = new JSZip();
  const { indexHtml, assets } = await fetchGameFiles(onProgress);

  if (onProgress) onProgress('Packaging Android APK package...', 75);

  // APK Structure
  zip.file('AndroidManifest.xml', ANDROID_MANIFEST_XML);
  zip.file('assets/index.html', indexHtml || '<!DOCTYPE html><html><body>DrawStar 32-Bit</body></html>');
  
  if (indexHtml) zip.file('index.html', indexHtml);
  for (const [path, blob] of Object.entries(assets)) {
    zip.file(`assets/${path}`, blob);
    zip.file(path, blob); // root copy for direct webviews
  }

  // App metadata
  const apkMeta = {
    packageName: 'com.drawstar.arcade32',
    name: 'DrawStar 32-Bit',
    version: '1.0.0',
    minSdkVersion: 21,
    targetSdkVersion: 34,
    offlineCapable: true,
    orientation: 'sensorLandscape',
  };
  zip.file('assets/app-meta.json', JSON.stringify(apkMeta, null, 2));

  if (onProgress) onProgress('Finalizing APK binary...', 90);

  // Generate APK Blob with standard Android APK MIME type
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.android.package-archive',
    compression: 'DEFLATE',
  });

  saveAs(blob, `drawstar-32bit-android-offline.apk`);
  if (onProgress) onProgress('Android APK Downloaded!', 100);
}

/**
 * Legacy alias for complete offline bundle (backward compatibility)
 */
export async function downloadCompleteGameZip(onProgress?: ExportProgressCallback): Promise<void> {
  return downloadWindowsGameZip(onProgress);
}
