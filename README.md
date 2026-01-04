# 🌾 农产品销售系统 (Agricultural Products Sales System)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-green)
![Vue](https://img.shields.io/badge/Vue.js-2.6.14-4FC08D)
![License](https://img.shields.io/badge/license-MIT-blue)

> **👨‍💻 开发者致辞**
>
> 本项目由一名热衷技术的开发者（自称“摆兵”）基于 BootVue 脚手架深度定制开发。作为大二期末课程设计的优秀课题，本项目不仅是一个学术实践成果，更通过 GitHub 进行了长期的迭代与精细化管理。
>
> **⚠️ 学术声明**：本仓库包含的源代码和文档仅供**学术交流与研究**（如课程设计、毕业设计参考），严禁用于商业用途或直接抄袭提交。

---

## 📖 目录 (Table of Contents)

- [项目简介](#-项目简介-project-overview)
- [系统架构](#-系统架构-architecture)
- [功能亮点](#-功能亮点-features)
- [技术栈](#-技术栈-tech-stack)
- [快速开始](#-快速开始-quick-start)
- [配置说明](#-配置说明-configuration)
- [项目结构](#-项目结构-project-structure)
- [常见问题](#-常见问题-troubleshooting)
- [开发日志](#-开发日志-dev-log)
- [贡献指南](#-贡献指南-contribution)
- [许可证](#-许可证-license)

---

## 🔭 项目简介 (Project Overview)

本系统是一个现代化的**农副产品电商平台**，采用前后端分离架构设计。旨在为农产品提供便捷的线上销售渠道，同时为消费者打造流畅的购物体验。项目结构清晰，代码规范，非常适合作为 Java Web 开发的学习案例。

### 📸 系统预览
*(此处可添加系统运行截图)*

---

## 🏗 系统架构 (Architecture)

本系统采用经典的 MVC 分层架构与前后端分离模式。

```mermaid
graph TD
    User[用户/管理员] --> |HTTP/HTTPS| Nginx[Web服务器/Vue前端]
    Nginx --> |REST API| Gateway[API网关/后端接口]
    Gateway --> |Auth| Security[Spring Security + JWT]
    Security --> Controller[控制层 Controller]
    Controller --> Service[业务层 Service]
    Service --> Mapper[持久层 MyBatis Plus]
    Mapper --> DB[(MySQL 数据库)]
    
    subgraph "后端服务 (Spring Boot)"
    Security
    Controller
    Service
    Mapper
    end
    
    subgraph "基础设施"
    DB
    Redis[Redis 缓存 (可选)]
    end
```

---

## ✨ 功能亮点 (Features)

| 模块 | 功能特性 | 描述 |
| :--- | :--- | :--- |
| 🛍️ | **商品浏览** | 支持分类筛选、关键词搜索、商品详情展示 |
| 🛒 | **购物车** | 商品添加、数量调整、批量结算 |
| 📦 | **订单管理** | 订单创建、支付模拟、状态流转（发货/收货/评价） |
| 👤 | **用户中心** | 个人资料修改、收货地址管理、收藏夹 |
| 🛡️ | **权限控制** | 基于 RBAC 的角色权限管理 (Admin/User) |
| 📊 | **数据统计** | (后台) 销售数据可视化图表 |
| 📰 | **资讯发布** | (后台) 公告与农产品资讯管理 |

---

## 🛠 技术栈 (Tech Stack)

### Backend (后端)
- **核心框架**: [Spring Boot 3.4.1](https://spring.io/projects/spring-boot)
- **语言版本**: Java 17
- **持久层**: [MyBatis Plus 3.5.7](https://baomidou.com/)
- **安全框架**: Spring Security + JWT
- **数据库连接**: MySQL Connector/J
- **工具库**: Lombok, Hutool, FastJSON

### Frontend (前端)
- **核心框架**: [Vue.js 2.6](https://v2.vuejs.org/)
- **UI 组件库**: [Element UI 2.15](https://element.eleme.io/)
- **路由管理**: Vue Router 3.x
- **状态管理**: Vuex 3.x
- **HTTP 客户端**: Axios
- **图表库**: ECharts 5.x

---

## 🚀 快速开始 (Quick Start)

### 环境准备
- **JDK**: 17+
- **Node.js**: 14+
- **MySQL**: 5.7 或 8.0
- **Maven**: 3.6+

### 1. 克隆仓库
```bash
git clone https://github.com/yourusername/agricultural-sales-system.git
cd agricultural-sales-system
```

### 2. 数据库初始化
1. 创建数据库 `db_aps` (字符集 `utf8mb4`)。
2. 执行脚本 `数据库/db_aps.sql` 导入表结构与初始数据。

### 3. 后端启动 (Spring Boot)
建议使用 IntelliJ IDEA 打开 `源码/springboot` 目录。

**配置环境变量** (推荐) 或修改 `application.properties`:
- `DB_PASSWORD`: 您的数据库密码
- `MAIL_USERNAME`: 发件人邮箱 (可选)
- `MAIL_PASSWORD`: 邮箱授权码 (可选)

```bash
# 进入后端目录
cd 源码/springboot

# 运行项目 (Windows)
mvnw spring-boot:run
```
> 后端服务默认端口: `1234`

### 4. 前端启动 (Vue)
建议使用 VS Code 打开 `源码/vue` 目录。

```bash
# 进入前端目录
cd 源码/vue

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run serve
```
> 前端访问地址: `http://localhost:8080`

---

## ⚙️ 配置说明 (Configuration)

核心配置文件位于 `springboot/src/main/resources/application.properties`。

| 配置项 | 环境变量 Key | 说明 | 默认值 |
| :--- | :--- | :--- | :--- |
| 数据库密码 | `DB_PASSWORD` | MySQL root 用户密码 | `123456` |
| 邮箱账号 | `MAIL_USERNAME` | SMTP 发送方邮箱 | - |
| 邮箱授权码 | `MAIL_PASSWORD` | SMTP 授权码 | - |
| 服务端口 | `server.port` | 后端运行端口 | `1234` |

---

## 📂 项目结构 (Project Structure)

```
农产品销售系统/
├── 📂 数据库/              # SQL 初始化脚本
├── 📂 文档/                # 设计文档与 API 说明
├── 📂 源码/
├── ☕ springboot/     # 后端工程
│   ├── src/main/java  # Java 源代码
│   │   └── controller # 控制层 (API 接口)
│   │   └── service    # 业务逻辑层
│   │   └── mapper     # 数据访问层
│   │   └── entity     # 实体类
│   └── resources      # 配置文件
└── 🎨 vue/            # 前端工程
    ├── src/
    │   ├── api/       # 接口定义
    │   ├── views/     # 页面组件
    │   └── components # 公共组件
└── 📄 README.md           # 项目说明文档
```

---

## ❓ 常见问题 (Troubleshooting)

<details>
<summary><strong>Q1: 启动前端时提示 "opensslErrorStack: [ 'error:03000086...']"</strong></summary>

**原因**: Node.js 版本过高 (v17+) 导致 OpenSSL 算法不兼容。
**解决**:
Windows CMD: `set NODE_OPTIONS=--openssl-legacy-provider`
PowerShell: `$env:NODE_OPTIONS="--openssl-legacy-provider"`
然后重新运行 `npm run serve`。
</details>

<details>
<summary><strong>Q2: 后端报错 "Access denied for user 'root'@'localhost'"</strong></summary>

**原因**: 数据库密码配置错误。
**解决**: 检查 `application.properties` 或环境变量 `DB_PASSWORD` 是否正确，确保 MySQL 服务已启动。
</details>

---

## 🛠️ 开发日志 (Dev Log)

### 2026-01-04 环境配置与启动修复

- **13:00 - 问题报告**
    - **现象**：后端启动报错 `找不到或无法加载主类`，前端报错 `ECONNREFUSED`。
    - **初步分析**：Maven 构建产物缺失，后端未正确编译，导致 Jar 包内缺少主清单属性。

- **13:05 - 构建修复**
    - **操作**：执行 `mvn clean package -DskipTests`。
    - **阻碍**：发现原有 `target` 目录被占用无法清理，手动删除目录后重新构建。
    - **结果**：成功生成 `springboot-0.0.1-SNAPSHOT.jar`。

- **13:10 - JDK 版本冲突排查**
    - **现象**：运行 Jar 包报错 `UnsupportedClassVersionError` (Class 61.0)。
    - **原因**：系统默认 `java` 命令版本为 1.8，而 Spring Boot 3.4.1 编译需要 Java 17+。
    - **解决**：定位到本地 JDK 21 路径 `D:\develop\jdk21`，强制指定该版本运行 Jar 包。

- **13:15 - 配置兼容性修复**
    - **现象**：后端启动报错 `Could not resolve placeholder 'DB_PASSWORD'`。
    - **原因**：信息脱敏策略过于激进，移除了 `application.properties` 中的默认密码，且本地未配置环境变量。
    - **解决**：采用兼容写法 `${DB_PASSWORD:123456}`，既支持云端环境变量注入，又保证本地开箱即用。

- **13:20 - 最终验证**
    - **操作**：使用 JDK 21 启动修复后的 Jar 包，并启动前端开发服务器。
    - **结果**：后端在 1234 端口成功启动，前端代理连接正常，系统功能恢复。

---

## 🤝 贡献指南 (Contribution)

欢迎提交 Issue 或 Pull Request 来改进本项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📜 许可证 (License)

本项目采用 [MIT License](LICENSE) 开源。

---

> **🌟 如果这个项目对你有帮助，请给一个 Star！**
