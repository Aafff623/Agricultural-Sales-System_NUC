# 静态资源加载问题解决方案

## 问题分析

项目启动后网页上的图片（静态资源）无法加载，主要原因有以下几个：

### 1. **Spring Boot 后端问题**

#### 问题1.1: WebConfig拦截器配置错误
- **位置**: `src/main/java/org/example/springboot/config/WebConfig.java`
- **问题**: 
  - 拦截器配置中存在重复的 `addPathPatterns("/api/**")` 和 `excludePathPatterns("/api/**")`
  - 缺少静态资源映射配置
  
#### 问题1.2: 缺少静态资源映射
- **现象**: 虽然文件被保存在 `files/img/` 目录下，但访问路径 `/img/**` 没有被正确映射到该目录
- **原因**: Spring Boot 默认只会从 `classpath:/static/` 等位置提供静态文件

### 2. **Vue前端问题**

#### 问题2.1: 图片URL格式不统一
前端各个地方访问图片的方式不一致：
```
// 不同的格式存在：
:src="'api'+scope.row.imageUrl"      // 错误：变成 /apiimg/xxx.jpg
:src="'api/'+form.imageUrl"          // 错误：变成 /api/img/xxx.jpg
:src="'/api' + userInfo.businessLicense"  // 错误：多了 /api 前缀
:src="`/api${product.imageUrl}`"     // 错误：多了 /api 前缀
```

问题在于后端返回的 imageUrl 已经包含了完整路径（如 `/img/123456.jpg`），前端再加上 `/api` 就变成了 `/api/img/123456.jpg`，而实际应该是 `/img/123456.jpg`。

## 解决方案

### 后端解决方案

**修改 WebConfig.java**:

1. **修复拦截器配置**
   - 移除重复的配置
   - 确保静态资源路径不被拦截

2. **添加资源映射处理器**
   ```java
   @Override
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
       // 配置静态资源映射
       registry.addResourceHandler("/img/**")
               .addResourceLocations("file:" + System.getProperty("user.dir") + "/files/img/");
       
       registry.addResourceHandler("/file/**")
               .addResourceLocations("file:" + System.getProperty("user.dir") + "/files/");
   }
   ```

这样，访问 `/img/xxx.jpg` 时，Spring 会自动去 `files/img/` 目录下查找文件。

### 前端解决方案

**创建图片URL处理工具** (`src/utils/imageUrl.js`):

提供统一的函数处理后端返回的图片路径，自动识别路径格式，确保返回正确的可访问URL。

**在 main.js 中注册全局方法**:
```javascript
import { getImageUrl, getImageUrls } from './utils/imageUrl'
Vue.prototype.$getImageUrl = getImageUrl
Vue.prototype.$getImageUrls = getImageUrls
```

**在所有Vue组件中统一使用**:
```vue
<!-- 原来的方式 -->
<el-image :src="'api'+scope.row.imageUrl"></el-image>

<!-- 改为 -->
<el-image :src="$getImageUrl(scope.row.imageUrl)"></el-image>
```

## 修改的文件列表

### 后端
- `src/main/java/org/example/springboot/config/WebConfig.java` - 修复拦截器配置，添加资源映射

### 前端 - 新增
- `src/utils/imageUrl.js` - 图片URL处理工具函数
- `src/utils/imageUrlMixin.js` - Vue Mixin（可选）

### 前端 - 修改（已更新所有图片URL引用）
后台管理页面:
- `src/views/ProductManager.vue`
- `src/views/CarouselManager.vue`
- `src/views/StockOutManager.vue`
- `src/views/StockInManager.vue`
- `src/views/ReviewManager.vue`
- `src/views/OrderManager.vue`
- `src/views/CartManager.vue`
- `src/views/UserManager.vue`

前台页面:
- `src/views/front/ProductDetail.vue`
- `src/views/front/Order.vue`
- `src/views/front/Cart.vue`
- `src/views/front/Article.vue`
- `src/views/front/ArticleDetail.vue`
- `src/views/PersonInfo.vue`

## 测试步骤

1. **启动后端**
   ```bash
   cd 源码/springboot
   mvn clean package
   java -jar target/springboot-0.0.1-SNAPSHOT.jar
   ```

2. **启动前端**
   ```bash
   cd 源码/vue
   npm install
   npm run serve
   ```

3. **验证图片加载**
   - 打开浏览器 F12 开发者工具
   - 查看 Network 标签，检查图片请求是否成功（200状态码）
   - 确认图片 URL 是 `/img/xxxxx.jpg` 格式

## 核心原理

### 文件保存流程
```
用户上传图片 → FileController (/api/file/upload/img)
    ↓
FileUtil.saveFile() → 保存到 files/img/xxxxx.jpg
    ↓
返回相对路径 /img/xxxxx.jpg
```

### 文件访问流程
```
前端请求 /img/xxxxx.jpg
    ↓
Spring 资源映射处理器识别
    ↓
从 files/img/ 目录获取文件
    ↓
返回给前端
```

## 关键要点

1. **不要混合使用 /api 前缀** - 静态资源直接在根路径访问，API 接口才用 /api 前缀
2. **后端返回的路径是相对路径** - `/img/123456.jpg` 是相对于应用根目录的路径
3. **资源映射是必需的** - 需要在 WebConfig 中配置才能正确访问文件系统中的文件
4. **前端统一处理** - 使用 `$getImageUrl()` 函数确保路径格式正确

## 可能的后续问题

1. **跨域问题** - 如果前后端分离部署，需要在 SecurityConfig 中配置 CORS
2. **文件存储路径** - 当前使用项目根目录的 files/ 文件夹，生产环境应使用专门的存储目录
3. **文件访问权限** - 如果需要限制用户只能访问自己上传的文件，需要在 Controller 中添加权限验证

## 文件存储位置说明

- 执行项目时，文件保存位置为: `项目运行目录/files/`
- 例如: `D:/xxx/农产品销售系统/源码/springboot/files/img/`
- 访问 URL: `http://localhost:1234/img/xxxxx.jpg`

确保 files 目录有读写权限！

