$packageName = 'dynamic-island-for-windows'
$fileType = 'exe'
$url = 'https://github.com/AliBashmail/Dynamic-Island-for-windows/releases/download/v2.3.3/Dynamic-Island-for-windows-Setup-2.3.3.exe'
$silentArgs = '/S'

Install-ChocolateyPackage -PackageName $packageName `
                          -FileType $fileType `
                          -SilentArgs $silentArgs `
                          -Url $url
