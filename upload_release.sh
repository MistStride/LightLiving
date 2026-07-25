#!/usr/bin/env bash
# 在【本机真实终端的 Git Bash】里运行（不要用 WorkBuddy 沙箱）。
# 脚本用本机已缓存的 GCM 令牌创建 GitHub Release 并上传 APK，令牌不落盘、仅存内存。
set -e
REPO="MistStride/LightLiving"
TAG="v1.3.0"
APK="/c/Users/shoyo/WorkBuddy/2026-07-24-02-11-13/light-living/android/app/build/outputs/apk/release/app-release.apk"
ASSET="LightLiving-v1.3.0-release.apk"

# curl 不会读 git 的代理配置，这里自动把 git 的 http.proxy 取出来给 curl 用。
# 在中国网络下，api.github.com / uploads.github.com 必须走代理，否则会卡死。
PROXY=$(git config --global --get http.proxy 2>/dev/null || true)
if [ -n "$PROXY" ]; then
  export HTTP_PROXY="$PROXY" HTTPS_PROXY="$PROXY"
  CURL_PROXY=(--proxy "$PROXY")
  echo "🌐 检测到代理 $PROXY，已为 curl 启用"
else
  CURL_PROXY=()
  echo "⚠️ 未检测到 git 代理；若连不上 api.github.com，请先启动 Clash 或在终端 export HTTPS_PROXY=..."
fi
# 超时设置：避免无限卡死
CT=("--connect-timeout" "20" "--max-time" "180")

echo "🔑 取本机 GitHub 令牌（来自 GCM 凭据）..."
TOKEN=$(printf 'protocol=https\nhost=github.com\n' | git credential fill 2>/dev/null | awk -F= '/^password=/{print $2}')
if [ -z "$TOKEN" ]; then
  echo "❌ 取不到令牌。请先在本机真实终端 git push 一次（会缓存 GCM 凭据），再运行本脚本。"
  exit 1
fi
echo "✅ 已获取令牌（长度 ${#TOKEN}）"

NOTES=$(cat <<'EOF'
# 轻盈生活 Light Living v1.2.0

本次 APK 同步了最新前端，并新增英语切换。

## 新增 / 优化
- 三套主题：竹杖(mint) / 鸢尾(purple) / 星夜(night)，设置内一键切换
- 首页底部主题诗句（中英双语），随主题变化
- 全新功能：切换语言 → English，界面与使用指南全量英译
- 修复：设置面板点 English 无反应、菜单跳转失效的 Bug
- 主题 / 语言选择本地持久化

## 安装
正式签名 APK。手机开启「允许安装未知来源应用」后点击安装（同机可覆盖旧版）。

## 隐私
所有数据仅存于本机 LocalStorage，无网络请求、无账号。
EOF
)
BODY_JSON=$(printf '%s' "$NOTES" | node -e "let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{const t=process.argv[1];process.stdout.write(JSON.stringify({tag_name:t,name:t,body:s,target_commitish:'main',prerelease:false}));});" "$TAG")

echo "📦 检查是否已有 Release $TAG ..."
REL=$(curl -s "${CURL_PROXY[@]}" "${CT[@]}" -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/releases/tags/$TAG")
REL_ID=$(echo "$REL" | grep -o '"id": *[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -z "$REL_ID" ]; then
  echo "🆕 创建 Release ..."
  REL=$(curl -s "${CURL_PROXY[@]}" "${CT[@]}" -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" -d "$BODY_JSON" "https://api.github.com/repos/$REPO/releases")
  REL_ID=$(echo "$REL" | grep -o '"id": *[0-9]*' | head -1 | grep -o '[0-9]*')
  if [ -z "$REL_ID" ]; then
    echo "❌ 创建 Release 失败，GitHub 返回："
    echo "$REL" | head -c 600
    echo
    echo "（常见原因：令牌无 repo 权限 / 代理未启动 / 网络中断）"
    exit 1
  fi
  echo "✅ Release 已创建 id=$REL_ID"
else
  echo "ℹ️ Release 已存在 id=$REL_ID"
fi

echo "⬆️ 上传 APK ..."
EXISTING=$(curl -s "${CURL_PROXY[@]}" "${CT[@]}" -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/releases/$REL_ID/assets" | grep -o "\"name\": *\"$ASSET\"")
if [ -n "$EXISTING" ]; then
  echo "ℹ️ $ASSET 已存在，跳过上传（如需替换请先到 GitHub 网页删除该 asset）。"
else
  UP=$(curl -s "${CURL_PROXY[@]}" "${CT[@]}" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/vnd.android.package-archive" --data-binary @"$APK" "https://uploads.github.com/repos/$REPO/releases/$REL_ID/assets?name=$ASSET")
  if echo "$UP" | grep -q "\"name\": *\"$ASSET\""; then
    echo "✅ APK 上传成功：$ASSET"
  else
    echo "❌ APK 上传失败，GitHub 返回："
    echo "$UP" | head -c 600
    echo
    exit 1
  fi
fi
echo ""
echo "🎉 完成！下载地址：https://github.com/$REPO/releases/tag/$TAG"
