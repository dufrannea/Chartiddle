#
# Download chrome
#

# Stop on error
$ErrorActionPreference = "Stop"

# Setup paths
$scriptPath = (split-path -Parent $MyInvocation.MyCommand.Path)

$tempDir = join-path $scriptPath 'temp'
$binDir = join-path $scriptPath 'bin'

$sevenZipUrl = 'http://www.7-zip.org/a/7za920.zip'
$sevenZipPkgPath = join-path $tempDir '7zip-pkg.zip'
$sevenZipBinDir = join-path $binDir '7zip'
$sevenZipBinPath = join-path $sevenZipBinDir '7za.exe'

$chromeUrl = 'http://cache.pack.google.com/edgedl/chrome/win/9559FFD4C2CF2E2F/46.0.2490.86_chrome_installer.exe'
$chromePkgPath = join-path $tempDir 'chrome-pkg.zip'
$chromeTempPkgPath = join-path $tempDir 'chrome.7z'
$chromeBinDir = join-path $binDir 'chrome'
$chromeBinPath = join-path $chromeBinDir 'Chrome-bin\chrome.exe'

if (-not (test-path $tempDir -PathType Container))
{
	new-item -type directory -path $tempDir | out-null
}

if (-not (test-path $binDir -PathType Container))
{
	new-item -type directory -path $binDir | out-null
}

# Download 7zip
$wc = new-object System.net.WebClient
if (-not (test-path $sevenZipBinPath -PathType Leaf))
{
	$wc.DownloadFile($sevenZipUrl, $sevenZipPkgPath)
	Add-Type -Assembly System.IO.Compression.FileSystem
	[System.IO.Compression.ZipFile]::ExtractToDirectory($sevenZipPkgPath, $sevenZipBinDir)
}

# Download chrome
if (-not (test-path $chromeBinPath -PathType Leaf))
{
	$wc.DownloadFile($chromeUrl, $chromePkgPath)
	& $sevenZipBinPath x $chromePkgPath -y ('-o"' + $tempDir + '"')
	& $sevenZipBinPath x $chromeTempPkgPath -y ('-o"' + $chromeBinDir + '"')
}

# Cleanup
if (test-path $tempDir)
{
	remove-item $tempDir -recurse
}
