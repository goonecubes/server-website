@echo off
rem Drag a folder of .sht/.author files (or the files themselves) onto this to add them
rem to the piano sheet music. Afterwards it offers to put the site live.
setlocal
if "%~1"=="" (
	echo Drag a folder of .sht files onto this file.
	pause
	exit /b 1
)
python "%~dp0import-piano-sheets.py" %*
if errorlevel 1 (
	pause
	exit /b 1
)
echo.
set /p DEPLOY=Put the updated songs on the live site now? [y/N]
if /i "%DEPLOY%"=="y" python "%~dp0..\..\Other tools\deploy\sync_to_vps.py" website
pause
