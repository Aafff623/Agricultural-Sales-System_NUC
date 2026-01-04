/**
 * 图片URL处理Mixin
 * 为组件中的imageUrl相关字段自动处理URL格式
 */
import { getImageUrl } from '@/utils/imageUrl'

export default {
    methods: {
        /**
         * 获取图片URL（计算属性的函数版本）
         */
        getImageUrl(path) {
            return getImageUrl(path)
        }
    }
}

