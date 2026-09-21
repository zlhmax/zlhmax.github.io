@echo off
chcp 65001 >nul
title Ryze 构建 + 预览生产版
cd /d "%~dp0"

echo === 构建生产版 (astro build + pagefind 索引) ===
call npm run build
if errorlevel 1 goto fail

echo.
echo === 启动预览 (http://localhost:4321) ===
start "" http://localhost:4321/
call npm run preview
goto end

:fail
echo.
echo 构建失败，请把上面的红色输出发给我。
pause >nul

:end
