---
date: 2026-04-07
category:
  - Android
tag:
  - Android
  - Kernel
  - KernelSU
  - SUSFS
  - Linux
---

# 在 Linux 上编译 Wild KSU 内核

本文基于 [WildKernels/GKI_KernelSU_SUSFS](https://github.com/WildKernels/GKI_KernelSU_SUSFS) 项目的 CI 构建脚本，提取并整理出一套可在本地 Linux 环境下编译 GKI 内核的完整流程。编译产物为集成了 **Wild KSU + SUSFS + Baseband Guard** 的 AnyKernel3 刷机包。

<!-- more -->

## 背景知识

### 什么是 GKI？

**GKI (Generic Kernel Image)** 是 Google 从 Android 11 开始推行的通用内核架构。它将内核分为 **通用内核** 和 **厂商模块** 两部分，使得用户可以在不依赖设备厂商源码的情况下，独立编译和替换内核。

### 涉及的组件

| 组件 | 说明 |
| --- | --- |
| [Wild KSU](https://github.com/WildKernels/Wild_KSU) | KernelSU 的定制分支，提供内核级 root 权限管理 |
| [SUSFS](https://gitlab.com/simonpunk/susfs4ksu) | KernelSU 的隐藏补丁，用于对抗 root 检测 |
| [Baseband Guard (BBG)](https://github.com/vc-teahouse/Baseband-guard) | 基带保护模块，防止基带层面的安全威胁 |
| [AnyKernel3](https://github.com/WildKernels/AnyKernel3) | 内核刷写打包工具，生成可直接通过 Recovery 刷入的 zip 包 |

## 环境准备

### 系统要求

- **操作系统**：Debian / Ubuntu（脚本依赖 `apt-get` 进行自动化依赖安装）
- **磁盘空间**：建议至少 **60 GB** 可用空间（内核源码 + 工具链 + 编译产物）
- **内存**：建议 **16 GB** 以上

### 构建依赖

脚本会自动安装以下依赖包：

```bash
git curl wget rsync jq python3 python-is-python3
bc bison flex build-essential zip unzip cpio xz-utils zstd
file ca-certificates patch perl make gcc g++ clang lld
libssl-dev libelf-dev libdw-dev libncurses-dev dwarves pahole
openjdk-17-jdk
```

如果你使用的不是 Debian/Ubuntu，需要手动安装上述等效包，并在运行脚本时加上 `--skip-deps` 参数。

## 构建流程概览

整个构建流程可以分为以下阶段：

```
环境检查 → 解析上游 commit → 拉取内核源码 → 集成功能模块 → 配置内核选项 → 编译 → 打包
```

下面逐步解析脚本中的每个阶段。

## 脚本详解

### 1. 全局变量与参数解析

脚本开头定义了目标内核版本和默认配置：

```bash
TARGET_VERSION="5.10.186-android13-2023-09"
ANDROID_VERSION="android13"
KERNEL_VERSION="5.10"
OS_PATCH_LEVEL="2023-09"
DEFAULT_FEATURE_SET="WKSU+SUSFS+BBG"
```

支持通过命令行参数自定义构建行为：

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `--workdir DIR` | 构建根目录 | `./build-<TARGET_VERSION>` |
| `--feature-set VALUE` | 功能集合 | `WKSU+SUSFS+BBG` |
| `--ksu-commit REF` | 指定 Wild KSU 的 commit/分支/tag | canary 分支最新 |
| `--skip-deps` | 跳过依赖安装 | 不跳过 |
| `--jobs N` | 并行任务数 | `$(nproc --all)` |

可选的功能集合（Feature Set）有 5 种组合：

- `WKSU+SUSFS+BBG` — 完整功能（默认）
- `WKSU+BBG` — KSU + 基带保护，不含隐藏
- `WKSU` — 仅 KSU
- `BBG` — 仅基带保护
- `None` — 原始 GKI 内核

### 2. 解析上游 Commit

`resolve_commits()` 函数通过 `git ls-remote` 获取各仓库的最新 commit hash，确保构建基于确定的版本：

```bash
# 获取 Wild_KSU canary 分支的最新 commit
RESOLVED_KSU_COMMIT="$(git ls-remote https://github.com/WildKernels/Wild_KSU.git refs/heads/canary | awk 'NR==1 {print $1}')"

# 获取 AnyKernel3 和 kernel_patches
ANYKERNEL_COMMIT="$(git ls-remote https://github.com/WildKernels/AnyKernel3.git refs/heads/gki-2.0 | awk 'NR==1 {print $1}')"
PATCHES_COMMIT="$(git ls-remote https://github.com/WildKernels/kernel_patches.git HEAD | awk 'NR==1 {print $1}')"

# SUSFS 需要按照 Android 版本和内核版本选择分支
SUSFS_COMMIT="$(git ls-remote https://gitlab.com/simonpunk/susfs4ksu.git refs/heads/gki-android13-5.10 | awk 'NR==1 {print $1}')"
```

### 3. 拉取内核源码

使用 Google 的 `repo` 工具同步 AOSP 内核源码：

```bash
# 下载 repo 工具
curl -L https://storage.googleapis.com/git-repo-downloads/repo -o "${WORKDIR}/bin/repo"
chmod +x "${WORKDIR}/bin/repo"

# 初始化并同步
repo init -u https://android.googlesource.com/kernel/manifest \
  -b "common-android13-5.10-2023-09" --depth=1
repo --trace sync -c -j$(nproc) --fail-fast --no-tags --force-sync --no-clone-bundle
```

::: tip
如果 upstream 分支已被标记为 deprecated，脚本会自动修补 manifest 中的分支名为 `deprecated/<branch>` 格式。
:::

### 4. 集成 Wild KSU

通过官方 `setup.sh` 脚本集成 KernelSU 到内核源码树中：

```bash
curl -L "https://raw.githubusercontent.com/WildKernels/Wild_KSU/stable/kernel/setup.sh" \
  | bash -s "${RESOLVED_KSU_COMMIT}"
```

同时在内核配置片段（defconfig fragment）中启用 KSU：

```ini
CONFIG_KSU=y
```

### 5. 集成 SUSFS

SUSFS 的集成分为两步：**拷贝源码** 和 **打补丁**。

```bash
# 拷贝 SUSFS 内核源文件
cp susfs4ksu/kernel_patches/fs/*           kernel/common/fs/
cp susfs4ksu/kernel_patches/include/linux/* kernel/common/include/linux/

# 应用 GKI 集成补丁
patch -p1 < "50_add_susfs_in_gki-android13-5.10.patch"
```

对应的内核配置选项：

```ini
CONFIG_KSU_SUSFS=y
CONFIG_KSU_SUSFS_SUS_PATH=y
CONFIG_KSU_SUSFS_SUS_MOUNT=y
CONFIG_KSU_SUSFS_SUS_KSTAT=y
CONFIG_KSU_SUSFS_SPOOF_UNAME=y
CONFIG_KSU_SUSFS_ENABLE_LOG=y
CONFIG_KSU_SUSFS_HIDE_KSU_SUSFS_SYMBOLS=y
CONFIG_KSU_SUSFS_SPOOF_CMDLINE_OR_BOOTCONFIG=y
CONFIG_KSU_SUSFS_OPEN_REDIRECT=y
CONFIG_KSU_SUSFS_SUS_MAP=y
```

### 6. 集成 Baseband Guard

```bash
wget -O- https://github.com/vc-teahouse/Baseband-guard/raw/main/setup.sh | bash
```

启用配置并将 `baseband_guard` 注册到 LSM（Linux Security Module）链中：

```bash
echo "CONFIG_BBG=y" >> wild_gki.fragment

# 将 baseband_guard 添加到 LSM 默认列表
sed -i '/^config LSM$/,/^help$/{ /default/ { /baseband_guard/! s/selinux/selinux,baseband_guard/ } }' \
  kernel/common/security/Kconfig
```

### 7. 额外内核配置

脚本还会启用一些实用的网络和性能相关选项：

```ini
# TTL/HL 伪装（用于热点共享防检测）
CONFIG_IP_NF_TARGET_TTL=y
CONFIG_IP6_NF_TARGET_HL=y
CONFIG_IP6_NF_MATCH_HL=y

# BBR 拥塞控制算法
CONFIG_TCP_CONG_ADVANCED=y
CONFIG_TCP_CONG_BBR=y
CONFIG_NET_SCH_FQ=y

# IP Set 支持（用于高级防火墙规则）
CONFIG_IP_SET=y
CONFIG_IP_SET_MAX=65534
# ... 及其子模块
```

### 8. 清理 dirty 标记

为了让编译出的内核版本号干净（不带 `-dirty` 后缀），脚本会覆盖 `setlocalversion` 脚本：

```bash
# 移除 -dirty 标记
sed -i 's/-dirty//' kernel/common/scripts/setlocalversion

# 覆写为固定版本后缀
cat > kernel/common/scripts/setlocalversion << 'SCRIPT'
#!/bin/sh
echo "-android13-4-00003-g776d0a76f6aa-ab10208116"
SCRIPT

# 提交更改以避免 git diff 引入 dirty 标记
git add . && git commit -m "Local: Clean Dirty Flag"
```

### 9. 编译内核

使用 Google 提供的 `build.sh` 脚本执行编译：

```bash
export BUILD_CONFIG=common/build.config.gki.aarch64
export GKI_DEFCONFIG_FRAGMENT="${WORKDIR}/wild_gki.fragment"
export LTO=thin
export SKIP_MRPROPER=1
export KBUILD_BUILD_TIMESTAMP="Thu May 25 12:11:12 UTC 2023"
export KBUILD_BUILD_USER="build-user"
export KBUILD_BUILD_HOST="build-host"

build/build.sh
```

::: info 关键环境变量说明
- **`LTO=thin`**：使用 Thin LTO 链接时优化，平衡编译速度和产物大小
- **`SKIP_MRPROPER=1`**：跳过 `make mrproper`，避免清除己有配置
- **`KBUILD_BUILD_TIMESTAMP/USER/HOST`**：固定构建元信息，确保可复现构建
:::

### 10. 打包 AnyKernel3

编译完成后，将 `Image` 文件拷入 AnyKernel3 目录并打包为 zip：

```bash
cp kernel/out/android13-5.10/dist/Image AnyKernel3/Image

cd AnyKernel3
zip -r9 "../release/${FILE_NAME}-AnyKernel3.zip" . \
  -x '.git/*' '.github/*' 'README.md'
```

最终产物路径：`build-<version>/release/<version>-AnyKernel3.zip`

## 完整脚本

::: details 点击展开完整构建脚本

```bash
#!/usr/bin/env bash

set -euo pipefail

TARGET_VERSION="5.10.186-android13-2023-09"
ANDROID_VERSION="android13"
KERNEL_VERSION="5.10"
OS_PATCH_LEVEL="2023-09"
DEFAULT_FEATURE_SET="WKSU+SUSFS+BBG"
DEFAULT_WORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/build-${TARGET_VERSION}"

WORKDIR="${DEFAULT_WORKDIR}"
FEATURE_SET="${DEFAULT_FEATURE_SET}"
KSU_COMMIT=""
SKIP_DEPS=0
JOBS="$(nproc --all)"

usage() {
  cat <<EOF
Usage: $0 [options]

Build ${TARGET_VERSION} GKI kernel locally and package it as AnyKernel3 zip.

Options:
  --workdir DIR         Build root directory. Default: ${DEFAULT_WORKDIR}
  --feature-set VALUE   One of: WKSU+SUSFS+BBG, WKSU+BBG, WKSU, BBG, None
  --ksu-commit REF      Wild_KSU commit, branch, or tag to use
  --skip-deps           Skip dependency installation
  --jobs N              Parallel jobs for repo sync/build
  -h, --help            Show this help
EOF
}

log() {
  printf '[%s] %s\n' "$(date -u '+%F %T')" "$*"
}

trap 'rc=$?; printf "[%s] Failed at line %s: %s (exit %s)\n" "$(date -u "+%F %T")" "${LINENO}" "${BASH_COMMAND}" "${rc}" >&2; exit "${rc}"' ERR

run_step() {
  local title="$1"
  shift
  log "${title}"
  "$@"
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

contains_feature() {
  local token="$1"
  [[ "${FEATURE_SET}" == *"${token}"* ]]
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --workdir)
        WORKDIR="$2"
        shift 2
        ;;
      --feature-set)
        FEATURE_SET="$2"
        shift 2
        ;;
      --ksu-commit)
        KSU_COMMIT="$2"
        shift 2
        ;;
      --skip-deps)
        SKIP_DEPS=1
        shift
        ;;
      --jobs)
        JOBS="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "Unknown argument: $1"
        ;;
    esac
  done

  case "${FEATURE_SET}" in
    WKSU+SUSFS+BBG|WKSU+BBG|WKSU|BBG|None)
      ;;
    *)
      die "Unsupported feature set: ${FEATURE_SET}"
      ;;
  esac
}

run_as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    die "Need root privileges for: $*"
  fi
}

install_dependencies() {
  local packages=(
    git curl wget rsync jq python3 python-is-python3
    bc bison flex build-essential zip unzip cpio xz-utils zstd
    file ca-certificates patch perl make gcc g++ clang lld
    libssl-dev libelf-dev libdw-dev libncurses-dev dwarves pahole
    openjdk-17-jdk
  )

  if ! command -v apt-get >/dev/null 2>&1; then
    die "Automatic dependency installation currently supports Debian/Ubuntu only. Re-run with --skip-deps after installing: ${packages[*]}"
  fi

  log "Installing build dependencies"
  run_as_root apt-get update
  run_as_root apt-get install -y "${packages[@]}"
}

ensure_base_tools() {
  local base_tools=(git curl wget python3 patch zip unzip perl sed awk grep find xargs)
  local tool
  for tool in "${base_tools[@]}"; do
    need_cmd "${tool}"
  done
}

setup_repo_tool() {
  mkdir -p "${WORKDIR}/bin"
  if [[ ! -x "${WORKDIR}/bin/repo" ]]; then
    log "Downloading repo tool"
    curl -L https://storage.googleapis.com/git-repo-downloads/repo -o "${WORKDIR}/bin/repo"
    chmod +x "${WORKDIR}/bin/repo"
  fi
  export PATH="${WORKDIR}/bin:${PATH}"
  need_cmd repo
}

get_remote_commit() {
  local repo_url="$1"
  local ref="$2"
  git ls-remote "${repo_url}" "${ref}" | awk 'NR==1 {print $1}'
}

resolve_commits() {
  RESOLVED_KSU_COMMIT=""
  SUSFS_COMMIT=""

  if contains_feature "WKSU"; then
    if [[ -n "${KSU_COMMIT}" ]]; then
      RESOLVED_KSU_COMMIT="$(get_remote_commit "https://github.com/WildKernels/Wild_KSU.git" "${KSU_COMMIT}")"
      if [[ -z "${RESOLVED_KSU_COMMIT}" ]]; then
        RESOLVED_KSU_COMMIT="${KSU_COMMIT}"
      fi
    else
      RESOLVED_KSU_COMMIT="$(get_remote_commit "https://github.com/WildKernels/Wild_KSU.git" "refs/heads/canary")"
    fi
  fi

  ANYKERNEL_COMMIT="$(get_remote_commit "https://github.com/WildKernels/AnyKernel3.git" "refs/heads/gki-2.0")"
  PATCHES_COMMIT="$(get_remote_commit "https://github.com/WildKernels/kernel_patches.git" "HEAD")"

  if contains_feature "WKSU"; then
    [[ -n "${RESOLVED_KSU_COMMIT}" ]] || die "Failed to resolve Wild_KSU commit"
  fi
  [[ -n "${ANYKERNEL_COMMIT}" ]] || die "Failed to resolve AnyKernel3 commit"
  [[ -n "${PATCHES_COMMIT}" ]] || die "Failed to resolve kernel_patches commit"
  if contains_feature "SUSFS"; then
    SUSFS_COMMIT="$(get_remote_commit "https://gitlab.com/simonpunk/susfs4ksu.git" "refs/heads/gki-${ANDROID_VERSION}-${KERNEL_VERSION}")"
    [[ -n "${SUSFS_COMMIT}" ]] || die "Failed to resolve SUSFS commit"
  fi

  if contains_feature "WKSU"; then
    log "Wild_KSU commit: ${RESOLVED_KSU_COMMIT}"
  fi
  log "AnyKernel3 commit: ${ANYKERNEL_COMMIT}"
  log "kernel_patches commit: ${PATCHES_COMMIT}"
  if contains_feature "SUSFS"; then
    log "SUSFS commit: ${SUSFS_COMMIT}"
  fi
}

clone_support_repos() {
  mkdir -p "${WORKDIR}"

  rm -rf "${WORKDIR}/kernel_patches" "${WORKDIR}/AnyKernel3" "${WORKDIR}/susfs4ksu"

  log "Cloning kernel_patches"
  git clone https://github.com/WildKernels/kernel_patches.git "${WORKDIR}/kernel_patches"
  git -C "${WORKDIR}/kernel_patches" checkout "${PATCHES_COMMIT}"

  log "Cloning AnyKernel3"
  git clone https://github.com/WildKernels/AnyKernel3.git "${WORKDIR}/AnyKernel3"
  git -C "${WORKDIR}/AnyKernel3" checkout "${ANYKERNEL_COMMIT}"

  if contains_feature "SUSFS"; then
    log "Cloning SUSFS"
    git clone https://gitlab.com/simonpunk/susfs4ksu.git -b "gki-${ANDROID_VERSION}-${KERNEL_VERSION}" "${WORKDIR}/susfs4ksu"
    git -C "${WORKDIR}/susfs4ksu" checkout "${SUSFS_COMMIT}"
  fi
}

sync_kernel_source() {
  mkdir -p "${WORKDIR}/kernel"
  pushd "${WORKDIR}/kernel" >/dev/null

  local branch="${ANDROID_VERSION}-${KERNEL_VERSION}-${OS_PATCH_LEVEL}"
  local manifest_branch="common-${branch}"

  if [[ ! -d .repo ]]; then
    log "Initializing repo manifest ${manifest_branch}"
    repo init -u https://android.googlesource.com/kernel/manifest -b "${manifest_branch}" --depth=1
  fi

  local remote_branch
  remote_branch="$(git ls-remote https://android.googlesource.com/kernel/common "${branch}" || true)"
  if grep -q deprecated <<<"${remote_branch}"; then
    log "Branch ${branch} is deprecated in upstream manifest, patching default.xml"
    sed -i "s/\"${branch}\"/\"deprecated\/${branch}\"/g" .repo/manifests/default.xml
  fi

  log "Syncing kernel source"
  repo --trace sync -c -j"${JOBS}" --fail-fast --no-tags --force-sync --no-clone-bundle
  popd >/dev/null
}

extract_sublevel() {
  local makefile="${WORKDIR}/kernel/common/Makefile"
  [[ -f "${makefile}" ]] || die "Kernel Makefile not found: ${makefile}"
  SUBLEVEL="$(awk '/^SUBLEVEL = / {print $3; exit}' "${makefile}")"
  [[ -n "${SUBLEVEL}" ]] || die "Failed to parse SUBLEVEL from ${makefile}"
  FILE_NAME="${KERNEL_VERSION}.${SUBLEVEL}-${ANDROID_VERSION}-${OS_PATCH_LEVEL}"
  export SUBLEVEL FILE_NAME
  log "Detected sublevel: ${SUBLEVEL}"
}

prepare_fragment() {
  : > "${WORKDIR}/wild_gki.fragment"
}

apply_glibc_fix() {
  local common_dir="${WORKDIR}/kernel/common"
  local glibc_version
  glibc_version="$(ldd --version 2>/dev/null | awk 'NR==1 {print $NF}')"
  [[ -n "${glibc_version}" ]] || return 0

  if [[ "${ANDROID_VERSION}" == "android13" && "${KERNEL_VERSION}" == "5.10" && "${SUBLEVEL}" -le 186 ]]; then
    if [[ "$(printf '%s\n' "2.38" "${glibc_version}" | sort -V | head -n1)" == "2.38" ]]; then
      log "Applying glibc 2.38 compatibility fixes"
      pushd "${common_dir}" >/dev/null
      sed -i '/\$(Q)\$(MAKE) -C \$(SUBCMD_SRC) OUTPUT=\$(abspath \$(dir \$@))\/ \$(abspath \$@)/s//$(Q)$(MAKE) -C $(SUBCMD_SRC) EXTRA_CFLAGS="$(CFLAGS)" OUTPUT=$(abspath $(dir $@))\/ $(abspath $@)/' tools/bpf/resolve_btfids/Makefile || true
      sed -i '/char \*buf = NULL;/a int i;' tools/lib/subcmd/parse-options.c || true
      sed -i 's/for (int i = 0; subcommands\[i\]; i++) {/for (i = 0; subcommands[i]; i++) {/' tools/lib/subcmd/parse-options.c || true
      sed -i '/if (subcommands) {/a int i;' tools/lib/subcmd/parse-options.c || true
      sed -i 's/for (int i = 0; subcommands\[i\]; i++)/for (i = 0; subcommands[i]; i++)/' tools/lib/subcmd/parse-options.c || true
      popd >/dev/null
    fi
  fi

  return 0
}

setup_wksu() {
  log "Setting up Wild_KSU"
  pushd "${WORKDIR}/kernel" >/dev/null
  curl -L "https://raw.githubusercontent.com/WildKernels/Wild_KSU/stable/kernel/setup.sh" | bash -s "${RESOLVED_KSU_COMMIT}"
  popd >/dev/null

  cat >> "${WORKDIR}/wild_gki.fragment" <<'EOF'
# KernelSU Configuration
CONFIG_KSU=y
EOF
}

setup_susfs() {
  log "Applying SUSFS base patches"
  pushd "${WORKDIR}/kernel/common" >/dev/null
  cp "${WORKDIR}/susfs4ksu/kernel_patches/fs/"* "${WORKDIR}/kernel/common/fs/"
  cp "${WORKDIR}/susfs4ksu/kernel_patches/include/linux/"* "${WORKDIR}/kernel/common/include/linux/"
  cp "${WORKDIR}/susfs4ksu/kernel_patches/50_add_susfs_in_gki-${ANDROID_VERSION}-${KERNEL_VERSION}.patch" ./
  patch -p1 < "50_add_susfs_in_gki-${ANDROID_VERSION}-${KERNEL_VERSION}.patch" || true
  popd >/dev/null

  cat >> "${WORKDIR}/wild_gki.fragment" <<'EOF'
# KernelSU SUSFS Configuration
CONFIG_KSU_SUSFS=y
CONFIG_KSU_SUSFS_SUS_PATH=y
CONFIG_KSU_SUSFS_SUS_MOUNT=y
CONFIG_KSU_SUSFS_SUS_KSTAT=y
CONFIG_KSU_SUSFS_SPOOF_UNAME=y
CONFIG_KSU_SUSFS_ENABLE_LOG=y
CONFIG_KSU_SUSFS_HIDE_KSU_SUSFS_SYMBOLS=y
CONFIG_KSU_SUSFS_SPOOF_CMDLINE_OR_BOOTCONFIG=y
CONFIG_KSU_SUSFS_OPEN_REDIRECT=y
CONFIG_KSU_SUSFS_SUS_MAP=y
EOF

  log "Applying SUSFS Android 13 5.10 fixes"
  pushd "${WORKDIR}/kernel/common" >/dev/null
  if [[ "${SUBLEVEL}" -le 107 ]]; then
    cp "${WORKDIR}/kernel_patches/wild/susfs_fix_patches/v2.0.0/a13-5.10/fdinfo.c.patch" ./
    patch -p1 < fdinfo.c.patch
  fi
  if [[ "${SUBLEVEL}" -le 209 && "${OS_PATCH_LEVEL}" != "2024-05" ]]; then
    sed -i -e 's/goto show_pad;/return 0;/' ./fs/proc/task_mmu.c
  fi
  popd >/dev/null
}

setup_bbg() {
  log "Setting up Baseband Guard"
  pushd "${WORKDIR}/kernel" >/dev/null
  wget -O- https://github.com/vc-teahouse/Baseband-guard/raw/main/setup.sh | bash
  popd >/dev/null

  echo "CONFIG_BBG=y" >> "${WORKDIR}/wild_gki.fragment"
  sed -i '/^config LSM$/,/^help$/{ /^[[:space:]]*default/ { /baseband_guard/! s/selinux/selinux,baseband_guard/ } }' "${WORKDIR}/kernel/common/security/Kconfig"
  grep -q "baseband_guard" "${WORKDIR}/kernel/common/security/Kconfig" || die "baseband_guard was not added to common/security/Kconfig"
}

configure_kernel() {
  log "Writing kernel config fragment"
  cat >> "${WORKDIR}/wild_gki.fragment" <<'EOF'
# Optional kernel config placeholders
CONFIG_IP_NF_TARGET_TTL=y
CONFIG_IP6_NF_TARGET_HL=y
CONFIG_IP6_NF_MATCH_HL=y
CONFIG_TCP_CONG_ADVANCED=y
CONFIG_TCP_CONG_BBR=y
CONFIG_NET_SCH_FQ=y
# CONFIG_TCP_CONG_BIC is not set
# CONFIG_TCP_CONG_WESTWOOD is not set
# CONFIG_TCP_CONG_HTCP is not set
CONFIG_IP_SET=y
CONFIG_IP_SET_MAX=65534
CONFIG_IP_SET_BITMAP_IP=y
CONFIG_IP_SET_BITMAP_IPMAC=y
CONFIG_IP_SET_BITMAP_PORT=y
CONFIG_IP_SET_HASH_IP=y
CONFIG_IP_SET_HASH_IPMARK=y
CONFIG_IP_SET_HASH_IPPORT=y
CONFIG_IP_SET_HASH_IPPORTIP=y
CONFIG_IP_SET_HASH_IPPORTNET=y
CONFIG_IP_SET_HASH_IPMAC=y
CONFIG_IP_SET_HASH_MAC=y
CONFIG_IP_SET_HASH_NETPORTNET=y
CONFIG_IP_SET_HASH_NET=y
CONFIG_IP_SET_HASH_NETNET=y
CONFIG_IP_SET_HASH_NETPORT=y
CONFIG_IP_SET_HASH_NETIFACE=y
CONFIG_IP_SET_LIST_SET=y
EOF

  sed -i 's/CONFIG_IP_SET_MAX/65534/g' "${WORKDIR}/kernel/common/net/netfilter/ipset/ip_set_core.c"
}

clean_kernel_flags() {
  log "Cleaning dirty flags"
  sed -i 's/-dirty//' "${WORKDIR}/kernel/common/scripts/setlocalversion"

  # Override setlocalversion to output fixed version suffix
  cat > "${WORKDIR}/kernel/common/scripts/setlocalversion" << 'SCRIPT'
#!/bin/sh
echo "-android13-4-00003-g776d0a76f6aa-ab10208116"
SCRIPT
  chmod +x "${WORKDIR}/kernel/common/scripts/setlocalversion"

  pushd "${WORKDIR}/kernel/common" >/dev/null
  git config user.name "local-builder"
  git config user.email "local-builder@localhost"
  if ! git diff --quiet; then
    git add .
    git commit -m "Local: Clean Dirty Flag" >/dev/null || true
  fi
  popd >/dev/null
}

build_kernel() {
  log "Building kernel"
  pushd "${WORKDIR}/kernel" >/dev/null
  export BUILD_CONFIG=common/build.config.gki.aarch64
  export GKI_DEFCONFIG_FRAGMENT="${WORKDIR}/wild_gki.fragment"
  export LTO=thin
  export SKIP_MRPROPER=1
  export KBUILD_BUILD_TIMESTAMP="Thu May 25 12:11:12 UTC 2023"
  export KBUILD_BUILD_USER="build-user"
  export KBUILD_BUILD_HOST="build-host"

  [[ -f build/build.sh ]] || die "Expected legacy build/build.sh for ${TARGET_VERSION}"
  build/build.sh
  popd >/dev/null
}

prepare_anykernel_zip() {
  local image_path="${WORKDIR}/kernel/out/${ANDROID_VERSION}-${KERNEL_VERSION}/dist/Image"
  [[ -f "${image_path}" ]] || die "Image file not found: ${image_path}"

  log "Preparing AnyKernel3 package"
  cp "${image_path}" "${WORKDIR}/AnyKernel3/Image"

  mkdir -p "${WORKDIR}/release"
  rm -f "${WORKDIR}/release/${FILE_NAME}-AnyKernel3.zip"

  pushd "${WORKDIR}/AnyKernel3" >/dev/null
  zip -r9 "${WORKDIR}/release/${FILE_NAME}-AnyKernel3.zip" . \
    -x '.git/*' '.github/*' 'README.md'
  popd >/dev/null
}

print_summary() {
  cat <<EOF

Build complete.
Version      : ${FILE_NAME}
Feature set  : ${FEATURE_SET}
Output zip   : ${WORKDIR}/release/${FILE_NAME}-AnyKernel3.zip
Image path   : ${WORKDIR}/kernel/out/${ANDROID_VERSION}-${KERNEL_VERSION}/dist/Image
EOF
}

main() {
  parse_args "$@"

  mkdir -p "${WORKDIR}"

  if [[ "${SKIP_DEPS}" -eq 0 ]]; then
    install_dependencies
  fi

  run_step "Checking required commands" ensure_base_tools
  run_step "Preparing repo tool" setup_repo_tool
  run_step "Resolving upstream commits" resolve_commits
  run_step "Cloning support repositories" clone_support_repos
  run_step "Syncing kernel source" sync_kernel_source
  run_step "Reading kernel sublevel" extract_sublevel
  run_step "Preparing defconfig fragment" prepare_fragment
  run_step "Applying glibc compatibility fixes if needed" apply_glibc_fix
  log "Optional integrations begin, feature set: ${FEATURE_SET}"

  if contains_feature "WKSU"; then
    run_step "Integrating Wild_KSU" setup_wksu
  fi
  if contains_feature "SUSFS"; then
    run_step "Integrating SUSFS" setup_susfs
  fi
  if contains_feature "BBG"; then
    run_step "Integrating Baseband Guard" setup_bbg
  fi

  run_step "Configuring kernel options" configure_kernel
  run_step "Cleaning kernel dirty flags" clean_kernel_flags
  run_step "Starting kernel build" build_kernel
  run_step "Packaging AnyKernel3 zip" prepare_anykernel_zip
  print_summary
}

main "$@"
```

:::

## 快速使用

### 默认构建（完整功能集）

```bash
chmod +x build.sh
./build.sh
```

### 仅编译带 KSU 的内核

```bash
./build.sh --feature-set WKSU
```

### 在已安装依赖的环境中快速重建

```bash
./build.sh --skip-deps --jobs 8
```

### 指定 Wild KSU 版本

```bash
./build.sh --ksu-commit v0.9.5
```

## 常见问题

### Q: glibc 版本过高导致编译失败？

较新的 Linux 发行版（如 Ubuntu 24.04）的 glibc ≥ 2.38 会导致旧版内核编译工具报错。脚本已内置自动修复逻辑（`apply_glibc_fix`），会自动处理 `resolve_btfids` 和 `parse-options.c` 中的兼容性问题。

### Q: repo sync 报 deprecated 分支错误？

Google 会将旧版内核分支标记为 deprecated。脚本会自动检测并将 manifest 中的分支名修补为 `deprecated/<branch>` 格式，无需手动干预。

### Q: 编译产物中出现 `-dirty` 后缀？

这是因为对内核源码的修改未提交到 git。脚本通过覆写 `setlocalversion` 并执行本地 commit 来消除该标记。

## 参考链接

- [WildKernels/GKI_KernelSU_SUSFS](https://github.com/WildKernels/GKI_KernelSU_SUSFS) — 原始项目及 CI 构建
- [KernelSU 官方文档](https://kernelsu.org/) — KernelSU 安装与使用指南
- [SUSFS4KSU](https://gitlab.com/simonpunk/susfs4ksu) — SUSFS 隐藏补丁仓库
- [Google GKI 内核文档](https://source.android.com/docs/core/architecture/kernel/generic-kernel-image) — GKI 架构说明
