import axios from 'axios'
import router from "../router";
import { Message } from 'element-ui'

const request = axios.create({
    baseURL: '/api',
    timeout: 25000
})

// 添加错误状态标记和计时器存储
let errorFlags = {
    401: false, // 未授权
    403: false, // 禁止访问
    500: false, // 服务器错误
    408: false, // 超时
    'network': false // 网络错误
};

// 防止消息重复显示的标记
let messageShown = false;

// 修改重置错误标记的函数
const resetErrorFlags = (specificError = null) => {
    if (specificError) {
        // 重置特定错误
        errorFlags[specificError] = false;
    } else {
        // 重置所有错误
        Object.keys(errorFlags).forEach(key => {
            errorFlags[key] = false;
        });
    }
    // 重置消息显示标记
    messageShown = false;
};

// 设置错误标记的函数
const setErrorFlag = (status) => {
    if (errorFlags.hasOwnProperty(status)) {
        errorFlags[status] = true;
        
        // 5秒后自动重置该错误状态
        setTimeout(() => {
            resetErrorFlags(status);
        }, 5000);
    }
};

window.onerror = function(message, url, lineNumber) {
    console.error("发生未捕获的错误:", message);
};
  
request.interceptors.request.use(
    config => {
        const user = localStorage.getItem('backUser');
        if (user) {
            try {
                config.headers['token'] = JSON.parse(user).token;
            } catch (e) {
                console.error('Token parsing error:', e);
            }
        }
        return config;
    },
    error => {
        console.error('request error:', error);
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    response => {
        if (response.config.responseType === 'blob') {
            return response;
        }

        let res = response.data;
        if (typeof res === 'string') {
            try {
                res = JSON.parse(res);
            } catch (e) {
                console.error('Response parsing error:', e);
            }
        }
        return res;
    },
    error => {
        // 防止重复处理错误
        if (messageShown) {
            return Promise.reject(error);
        }
        
        let status = null;
        
        if (error.response) {
            status = error.response.status;
            
            // 检查是否是已定义的错误状态码
            if (errorFlags.hasOwnProperty(status) && !errorFlags[status]) {
                setErrorFlag(status);
                messageShown = true;
                
                // 清除用户信息（仅在401时）
                if (status === 401) {
                    try {
                        localStorage.removeItem('backUser');
                        localStorage.removeItem('userMenuList');
                        localStorage.removeItem('frontUser');
                        router.push('/login');
                    } catch (e) {
                        console.error('Error during logout:', e);
                    }
                }
                handleErrorResponse(status);
            }
        } else if (!messageShown) {
            // 处理网络错误
            setErrorFlag('network');
            messageShown = true;
            handleErrorResponse('network');
        }
        
        return Promise.reject(error);
    }
);

function handleErrorResponse(status) {
    let message = '';
    switch (status) {
        case 500:
            message = '服务器内部错误，请稍后再试！';
            break;
        case 403:
            message = '您没有权限访问该资源！';
            break;
        case 408:
            message = '请求超时，请检查您的网络连接！';
            break;
        case 401:
            message = '登录失效，请重新登录！';
            break;
        case 'network':
            message = '网络连接错误，请检查网络设置！';
            break;
        default:
            message = '请求发生错误，请稍后再试！';
            break;
    }
    
    if (message) {
        try {
            Message.error({
                message: message,
                duration: 3000,
                showClose: true,
                onClose: () => {
                    // 消息关闭后重置消息显示标记
                    messageShown = false;
                }
            });
        } catch (e) {
            console.error('Error showing message:', e);
            // 如果显示消息出错，确保重置标记
            messageShown = false;
        }
    }
}

// 重置方法
request.resetAuth = () => {
    resetErrorFlags();
    messageShown = false;
};

export default request

