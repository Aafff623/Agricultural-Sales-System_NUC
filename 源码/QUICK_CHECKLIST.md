# 静态资源加载问题 - 快速检查清单

## ✅ 已完成的修改

### 后端修改
- [x] `WebConfig.java` - 修复拦截器配置（移除重复的 excludePathPatterns）
- [x] `WebConfig.java` - 添加 `addResourceHandlers()` 方法配置静态资源映射
  - 配置 `/img/**` 映射到 `files/img/` 目录
  - 配置 `/file/**` 映射到 `files/` 目录

### 前端工具创建
- [x] 创建 `src/utils/imageUrl.js` - 统一的图片URL处理工具
- [x] 创建 `src/utils/imageUrlMixin.js` - Vue Mixin（可选使用）
- [x] 修改 `src/main.js` - 注册全局 `$getImageUrl()` 方法

### 前端UI组件更新
- [x] `src/views/ProductManager.vue` - 修改所有图片URL引用
- [x] `src/views/CarouselManager.vue` - 修改所有图片URL引用
- [x] `src/views/StockOutManager.vue` - 修改所有图片URL引用
- [x] `src/views/StockInManager.vue` - 修改所有图片URL引用
- [x] `src/views/ReviewManager.vue` - 修改所有图片URL引用
- [x] `src/views/OrderManager.vue` - 修改所有图片URL引用
- [x] `src/views/CartManager.vue` - 修改所有图片URL引用
- [x] `src/views/UserManager.vue` - 修改所有图片URL引用
- [x] `src/views/front/ProductDetail.vue` - 修改所有图片URL引用
- [x] `src/views/front/Order.vue` - 修改所有图片URL引用
- [x] `src/views/front/Cart.vue` - 修改所有图片URL引用
- [x] `src/views/front/Article.vue` - 修改所有图片URL引用
- [x] `src/views/front/ArticleDetail.vue` - 修改所有图片URL引用
- [x] `src/views/PersonInfo.vue` - 修改所有图片URL引用

## 🔍 本地测试步骤

### 1. 启动后端
```bash
cd D:\OneDrive\Desktop\农产品销售系统\源码\springboot
mvn clean install
mvn spring-boot:run
```

或者直接运行IDE中的Spring Boot应用。

### 2. 启动前端
```bash
cd D:\OneDrive\Desktop\农产品销售系统\源码\vue
npm install  # 如果还没有安装依赖
npm run serve
```

### 3. 浏览器验证

访问 `http://localhost:8080` 或前端配置的地址

#### 检查项：
1. **打开浏览器开发者工具** (F12)
2. **切换到 Network 标签**
3. **刷新页面**
4. **查找图片请求**
   - 搜索 `/img/` 开头的请求
   - 确认响应状态码是 `200`（成功）而不是 `404`（未找到）或 `403`（禁止访问）

5. **查看 Console 标签**
   - 确认没有图片加载失败的错误信息

6. **视觉检查**
   - 商品列表页面能看到商品图片 ✓
   - 轮播图能正常显示 ✓
   - 文章/详情页面能显示封面图 ✓
   - 用户头像/营业执照能显示 ✓

## 📊 问题诊断

如果图片仍然无法加载，请按以下步骤排查：

### 问题 1: Network 中显示 404
```
症状：F12 Network 标签中看到 /img/xxx.jpg 返回 404
原因：WebConfig 的资源映射没有生效或格式错误
解决：
  1. 检查 WebConfig 中是否添加了 addResourceHandlers() 方法
  2. 确认 addResourceLocations() 的路径格式正确：
     "file:" + System.getProperty("user.dir") + "/files/img/"
  3. 重启 Spring Boot 应用
```

### 问题 2: 图片URL仍然是 /api/img/xxx.jpg
```
症状：浏览器开发者工具中看到请求的URL是 /api/img/xxx.jpg
原因：前端没有使用 $getImageUrl() 函数，或者使用方式不对
解决：
  1. 检查是否在 main.js 中导入并注册了 getImageUrl
  2. 搜索所有 Vue 文件中的 :src="'api'" 并替换为 :src="$getImageUrl()"
  3. 重新编译并刷新前端
```

### 问题 3: CORS 跨域错误
```
症状：Console 中看到 CORS 错误信息
原因：前后端分离部署，浏览器同源策略限制
解决：
  1. 确认前端 API 的 baseURL 配置
  2. 在后端 SecurityConfig 中添加 CORS 配置
  3. 或者在 WebConfig 中添加 CorsRegistry 配置
```

### 问题 4: files 目录权限问题
```
症状：上传文件时报错，或文件保存失败
原因：files 目录没有写入权限
解决：
  1. 确保 files 目录存在
  2. 授予目录读写权限
  3. 不要在程序运行时删除或移动 files 目录
```

## 🔧 配置验证

### 后端配置检查清单

检查 `src/main/java/org/example/springboot/config/WebConfig.java`：

```java
// ✓ 应该包含这个方法
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/img/**")
            .addResourceLocations("file:" + System.getProperty("user.dir") + "/files/img/");
    
    registry.addResourceHandler("/file/**")
            .addResourceLocations("file:" + System.getProperty("user.dir") + "/files/");
}

// ✓ 拦截器配置应该没有重复的 addPathPatterns
// ✓ excludePathPatterns 中应该包括 "/img/**" 和 "/file/**"
```

### 前端配置检查清单

检查 `src/main.js`：
```javascript
// ✓ 应该导入并注册
import { getImageUrl, getImageUrls } from './utils/imageUrl'
Vue.prototype.$getImageUrl = getImageUrl
Vue.prototype.$getImageUrls = getImageUrls
```

检查 Vue 文件中的图片引用：
```vue
<!-- ✓ 应该使用这种格式 -->
<el-image :src="$getImageUrl(scope.row.imageUrl)"></el-image>

<!-- ✗ 不应该使用这些格式 -->
<!-- <el-image :src="'api'+scope.row.imageUrl"></el-image> -->
<!-- <el-image :src="'api/'+scope.row.imageUrl"></el-image> -->
<!-- <el-image :src="'/api'+scope.row.imageUrl"></el-image> -->
```

## 📝 常见问题解答

**Q: 为什么后端返回的路径是 `/img/xxx.jpg`，不是 `/api/img/xxx.jpg`？**

A: 因为静态资源和 API 是分开的。API 走 `/api/**` 前缀，而静态资源直接在根路径访问。这样可以更清晰地区分动态接口和静态资源。

**Q: `$getImageUrl()` 函数有什么作用？**

A: 它可以自动识别不同格式的图片路径（例如已经带了 /api 前缀的、没有前缀的、HTTP 开头的等），然后返回正确的可访问路径。这样前端就不用担心路径格式问题。

**Q: 如果图片仍然加载不出来怎么办？**

A: 按照上面的"问题诊断"部分一步一步排查。最常见的原因是：
1. WebConfig 没有添加资源映射
2. 前端仍然在使用旧的 URL 拼接方式
3. files 目录权限问题

**Q: 可以改成将文件保存到项目的 static 目录吗？**

A: 可以。修改 FileUtil.java 中的 `FILE_BASE_PATH` 为项目的 static 目录即可。但需要注意每次编译时 target/static 会被清空。

## 📞 获取更多帮助

如果按照上述步骤仍无法解决问题，请提供：
1. 浏览器 F12 开发者工具中的错误信息截图
2. 后端日志中关于文件上传的信息
3. files 目录的实际位置和权限设置
4. 完整的 WebConfig.java 文件内容

---

**最后确认：所有必需的代码修改都已完成，现在可以启动项目进行测试了！**

