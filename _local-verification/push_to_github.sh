#!/bin/sh
# 推送到 GitHub：先保留旧站为备份分支，成功后再强制推送新站
BK="/d/Myblog/_BACKUP_lhzhang06.github.io_20260922_0013/lhzhang06.github.io.git"
REPO="https://github.com/lhzhang06/lhzhang06.github.io.git"

echo "=== STEP 1/2: 把线上旧站保留为 backup-astro-wanderer 分支 ==="
cd "$BK" || exit 10
git push "$REPO" main:refs/heads/backup-astro-wanderer
S1=$?
echo "STEP1_EXIT=$S1"
if [ "$S1" -ne 0 ]; then
  echo "!! 备份分支创建失败 —— 出于安全,取消强制推送"
  echo "ALL_DONE_FAILED_STEP1"
  exit 1
fi

echo
echo "=== STEP 2/2: 强制推送新站到 main ==="
cd /d/Myblog/ryze || exit 11
git push --force --no-verify origin main
S2=$?
echo "STEP2_EXIT=$S2"

echo
echo "=== 推送后核对远程状态 ==="
git ls-remote --heads origin | sed 's/^/  /'
echo "ALL_DONE"
