/**
 * 图片URL处理工具
 * 统一处理后端返回的相对路径，转换为可访问的绝对路径
 */

/**
 * 获取完整的图片URL
 * @param {string} imagePath - 后端返回的相对路径，如 "/img/xxx.jpg"
 * @returns {string} 完整的图片访问URL
 */
export function getImageUrl(imagePath) {
    // 如果路径为空或undefined，返回空字符串
    if (!imagePath) {
        return '';
    }

    // 如果已经是完整的http(s)URL，直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 如果路径已经以/img/或/file/开头，直接返回
    if (imagePath.startsWith('/img/') || imagePath.startsWith('/file/')) {
        return imagePath;
    }

    // 处理api前缀的情况
    if (imagePath.startsWith('/api/img/') || imagePath.startsWith('/api/file/')) {
        // 去掉/api前缀，返回原始路径
        return imagePath.replace('/api', '');
    }

    // 如果路径不以/开头但是以img/或file/开头，添加/前缀
    if (imagePath.startsWith('img/') || imagePath.startsWith('file/')) {
        return '/' + imagePath;
    }

    // 其他情况，假设是相对于/img/的路径
    if (!imagePath.startsWith('/')) {
        return '/img/' + imagePath;
    }

    return imagePath;
}

/**
 * 批量处理图片URL数组
 * @param {Array<string>} imagePaths - 图片路径数组
 * @returns {Array<string>} 处理后的图片URL数组
 */
export function getImageUrls(imagePaths) {
    if (!Array.isArray(imagePaths)) {
        return [];
    }
    return imagePaths.map(path => getImageUrl(path));
}

export default {
    getImageUrl,
    getImageUrls
};

