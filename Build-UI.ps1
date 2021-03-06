﻿param(
    [string] $BuildNumber,
    [switch] $Debug = $false,
    [switch] $CopyCore = $false,
    [switch] $SkipCdn = $false
)

$ErrorActionPreference = "Stop"

try
{
    Push-Location $PSScriptRoot

    New-Item .\target -ItemType "directory" -ErrorAction Ignore
    gci target -Exclude fonts,carbon-core*,carbon-api*,*.d.ts | ri -recurse
    copy .\fonts\ .\target\ -Recurse -Force
    copy .\img\ .\target\ -Recurse -Force
    copy .\src\res\i\ .\target\res\app\i\ -Recurse -Force

    if ($CopyCore)
    {
        ri target\carbon-core-*
        ri target\carbon-api-*
        copy ..\carbon-core\target\* target
    }

    if (-not $Debug)
    {
        npm install --loglevel=error
    }

    $params = @("run", "pack", "--", "--noColors", "--verbose", "--vendors")
    if ($Debug)
    {
        $params += "--noUglify"
    }
    if ($CopyCore)
    {
        $params += "--coreFolder"
        $params += "target"
    }

    if (-not $SkipCdn)
    {
        $params += "--host"
        $params += "//carbonstatic3.azureedge.net"
    }

    & npm $params

    if (-not $Debug)
    {
        #npm test
    }

    if ($BuildNumber)
    {
        $BuildNumber > .\target\version
        Copy-Item .\node_modules\@carbonium\carbon-core\lib\* .\target\
        Copy-Item .\node_modules\@carbonium\carbon-api\lib\* .\target\
    }
}
finally
{
    Pop-Location
}