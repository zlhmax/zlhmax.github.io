@echo off
chcp 65001 >nul
title Ryze 本地站点 (Astro dev)
cd /d "%~dp0"

echo ============================================================
echo   Ryze 本地站点 — 开发模式 (改文件自动刷新)
echo ------------------------------------------------------------
echo   项目目录 : %CD%
echo   官方地址 : http://localhost:4321
echo   站内搜索 : 任意页面按 Ctrl + K
echo   停止服务 : 在本窗口按 Ctrl + C
echo ------------------------------------------------------------
echo   注意: 若 4321 已被占用, 端口会自动跳到 4322/4323...
echo         请以下面打印的 Local 地址为准。
echo ============================================================
echo.

rem 先等 1 秒让窗口显示出来, 再打开浏览器
start "" cmd /c "timeout /t 6 >nul & start \"\" http://localhost:4321/"

call npm run dev

echo.
echo 服务已停止。按任意键关闭窗口。
pause >nul
