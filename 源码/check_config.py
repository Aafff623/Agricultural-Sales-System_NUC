#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
静态资源加载问题检查脚本
用于验证项目配置是否正确
"""

import os
import re
import sys

def check_webconfig():
    """检查 WebConfig.java 是否包含资源映射配置"""
    print("\n📋 检查 WebConfig.java...")
    webconfig_path = "源码/springboot/src/main/java/org/example/springboot/config/WebConfig.java"

    if not os.path.exists(webconfig_path):
        print(f"  ❌ 找不到文件: {webconfig_path}")
        return False

    with open(webconfig_path, 'r', encoding='utf-8') as f:
        content = f.read()

    checks = [
        ("addResourceHandlers", "静态资源映射处理器"),
        ("addResourceHandler(\"/img/**\")", "/img/** 路径映射"),
        ("addResourceHandler(\"/file/**\")", "/file/** 路径映射"),
        ("addResourceLocations", "资源位置配置"),
    ]

    all_passed = True
    for check_str, desc in checks:
        if check_str in content:
            print(f"  ✓ {desc}")
        else:
            print(f"  ✗ {desc} - 未找到")
            all_passed = False

    # 检查是否有重复的 addPathPatterns
    if "addPathPatterns(\"/api/**\").excludePathPatterns(\"/api/**\")" in content:
        print(f"  ✗ 发现重复的 addPathPatterns 和 excludePathPatterns")
        all_passed = False
    else:
        print(f"  ✓ 拦截器配置正确")

    return all_passed

def check_main_js():
    """检查 main.js 是否导入了图片处理工具"""
    print("\n📋 检查 main.js...")
    main_js_path = "源码/vue/src/main.js"

    if not os.path.exists(main_js_path):
        print(f"  ❌ 找不到文件: {main_js_path}")
        return False

    with open(main_js_path, 'r', encoding='utf-8') as f:
        content = f.read()

    checks = [
        ("getImageUrl", "getImageUrl 函数导入"),
        ("Vue.prototype.$getImageUrl", "$getImageUrl 全局注册"),
    ]

    all_passed = True
    for check_str, desc in checks:
        if check_str in content:
            print(f"  ✓ {desc}")
        else:
            print(f"  ✗ {desc} - 未找到")
            all_passed = False

    return all_passed

def check_image_url_utility():
    """检查 imageUrl.js 是否存在"""
    print("\n📋 检查 imageUrl.js 工具...")
    image_url_path = "源码/vue/src/utils/imageUrl.js"

    if not os.path.exists(image_url_path):
        print(f"  ❌ 找不到文件: {image_url_path}")
        return False

    with open(image_url_path, 'r', encoding='utf-8') as f:
        content = f.read()

    checks = [
        ("getImageUrl", "getImageUrl 函数定义"),
        ("export function getImageUrl", "getImageUrl 导出"),
        ("startsWith('http')", "HTTP URL 检查"),
        ("startsWith('/img/')", "/img/ 路径检查"),
    ]

    all_passed = True
    for check_str, desc in checks:
        if check_str in content:
            print(f"  ✓ {desc}")
        else:
            print(f"  ✗ {desc} - 未找到")
            all_passed = False

    return all_passed

def check_vue_components():
    """检查 Vue 组件是否使用了新的 URL 处理方法"""
    print("\n📋 检查 Vue 组件...")

    components = [
        "源码/vue/src/views/ProductManager.vue",
        "源码/vue/src/views/CarouselManager.vue",
        "源码/vue/src/views/front/ProductDetail.vue",
    ]

    all_passed = True
    old_patterns = [
        "':src=\"'api'+",
        "':src=\"'api/'",
        "':src=\"'/api'",
    ]

    new_pattern = ":src=\"$getImageUrl("

    for component_path in components:
        if not os.path.exists(component_path):
            print(f"  ⚠ {os.path.basename(component_path)} - 文件不存在")
            continue

        with open(component_path, 'r', encoding='utf-8') as f:
            content = f.read()

        has_old_pattern = any(pattern in content for pattern in old_patterns)
        has_new_pattern = new_pattern in content

        if has_old_pattern:
            print(f"  ✗ {os.path.basename(component_path)} - 仍然使用旧的 URL 拼接方式")
            all_passed = False
        elif has_new_pattern:
            print(f"  ✓ {os.path.basename(component_path)} - 已更新为新方式")
        else:
            print(f"  ⚠ {os.path.basename(component_path)} - 未使用 $getImageUrl()")

    return all_passed

def check_files_directory():
    """检查 files 目录是否存在"""
    print("\n📋 检查文件存储目录...")

    files_path = "源码/springboot/files"

    if os.path.exists(files_path):
        print(f"  ✓ files 目录存在: {os.path.abspath(files_path)}")

        # 检查子目录
        img_path = os.path.join(files_path, "img")
        if os.path.exists(img_path):
            print(f"  ✓ files/img 目录存在")
        else:
            print(f"  ℹ files/img 目录不存在（第一次运行时会自动创建）")

        return True
    else:
        print(f"  ℹ files 目录不存在（运行时会自动创建）")
        return True

def main():
    """运行所有检查"""
    print("=" * 50)
    print("静态资源加载问题 - 配置检查工具")
    print("=" * 50)

    # 改变工作目录到脚本所在的上级目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    results = {
        "WebConfig.java": check_webconfig(),
        "main.js": check_main_js(),
        "imageUrl.js": check_image_url_utility(),
        "Vue 组件": check_vue_components(),
        "files 目录": check_files_directory(),
    }

    print("\n" + "=" * 50)
    print("检查结果汇总")
    print("=" * 50)

    all_passed = True
    for check_name, result in results.items():
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{status}: {check_name}")
        if not result:
            all_passed = False

    print("\n" + "=" * 50)

    if all_passed:
        print("✓ 所有检查都已通过！可以启动项目进行测试。")
        print("\n建议的测试步骤：")
        print("1. 启动 Spring Boot 后端")
        print("2. 启动 Vue 前端")
        print("3. 打开浏览器，按 F12 查看 Network 标签")
        print("4. 检查图片请求的 URL 是否为 /img/xxxxx.jpg")
        print("5. 检查响应状态码是否为 200")
        return 0
    else:
        print("✗ 有些检查项未通过，请按照上述提示修复。")
        return 1

if __name__ == "__main__":
    sys.exit(main())

