@echo off
setlocal
pushd %~dp0
cd frontend
set GENERATE_SOURCEMAP=false
npm start
popd
endlocal
pause
