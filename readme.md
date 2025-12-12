# h5 自动播放背景音乐

**兼容性**

| 移动端浏览器 | iOS微信内置浏览器 | Android微信内置浏览器 |
| :---: | :---: | :---: |
| 触摸任意地方播放 | ✅ 自动播放 | ✅ 自动播放 |

微信内置浏览器打开链接, 自动播放  无需有任何动作


## 使用


### 在普通HTML页面中使用

你可以使用我们提供的 `bg-music.js` 文件在普通HTML页面中实现背景音乐自动播放功能：

```html
<!DOCTYPE html>
<html>
<head>
    <title>背景音乐示例</title>
    <script src="path/to/bg-music.js"></script>
</head>
<body>
    <h1>我的网页</h1>
    
    <script>
        // 初始化背景音乐
        const bgMusic = BgMusic.init({
            src: 'https://example.com/your-music.mp3',
            loop: 999
        });
        
        // 尝试播放（在某些浏览器中可能需要用户交互）
        document.addEventListener('touchend', function() {
            bgMusic.play();
        }, { once: true });
    </script>
</body>
</html>
```

或者直接调用播放方法：

```javascript
// 初始化背景音乐
const bgMusic = BgMusic.init({
    src: 'https://example.com/your-music.mp3',
    loop: 999
});

// 播放音乐
bgMusic.play();

// 暂停音乐
bgMusic.pause();

// 获取播放状态
const state = bgMusic.getState(); // 'play' 或 'pause'

// 销毁音乐实例
bgMusic.destroy();
```

### 使用外部控制图标

如果你有自己的音乐控制图标，可以像这样使用：

```html
<!-- 音乐控制图标 -->
<img src="music-icon.png" alt="音乐图标" class="music-ico">

<script src="path/to/bg-music.js"></script>
<script>
        // 初始化背景音乐
        let bgMusic = null;
        window.onload = function() {
            // 替换为实际可用的音频链接
            bgMusic = BgMusic.init({
                src: '../../lorealaction.mp3', // 请替换为有效的音频链接
                loop: 999,
                controls: true
            });
            
            // 针对微信浏览器的特殊处理
            handleWechatAutoPlay();
        };
        
        // 处理微信浏览器音频自动播放
        function handleWechatAutoPlay() {
            // 检测是否在微信浏览器中
            const isWechat = navigator.userAgent.toLowerCase().includes('micromessenger');
            
            if (isWechat) {
                // 方式1: 监听WeixinJSBridgeReady事件
                if (typeof WeixinJSBridge === "object" && typeof WeixinJSBridge.invoke === "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function(res) {
                        // 触发音频播放
                        playBackgroundMusic();
                    });
                } else {
                    document.addEventListener("WeixinJSBridgeReady", function() {
                        WeixinJSBridge.invoke('getNetworkType', {}, function(res) {
                            // 触发音频播放
                            playBackgroundMusic();
                        });
                    }, false);
                }
                
                // 方式2: 用户首次交互时播放
                const handleFirstUserInteraction = () => {
                    playBackgroundMusic();
                    // 移除事件监听器，确保只触发一次
                    document.removeEventListener('touchstart', handleFirstUserInteraction);
                    document.removeEventListener('click', handleFirstUserInteraction);
                };
                
                document.addEventListener('touchstart', handleFirstUserInteraction, { once: true });
                document.addEventListener('click', handleFirstUserInteraction, { once: true });
            } else {
                // 非微信浏览器直接播放
                playBackgroundMusic();
            }
        }
        
        // 播放背景音乐的统一方法
        function playBackgroundMusic() {
            if (bgMusic) {
                $('.music-ico').addClass('css3');
                // 添加一个小延迟确保音频资源加载完成
                setTimeout(() => {
                    bgMusic.play().catch(e => {
                        console.log('背景音乐播放失败:', e);
                    });
                }, 300);
            }
        }
</script>
```

对应的CSS样式：
```css
.music-ico {
    position: fixed;
    right: 20px;
    top: 20px;
    width: 50px;
    height: 50px;
    z-index: 9999;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.music-ico.css3 {
    animation: rotate 3s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

useBgMusic 参数说明：

- **src**：音乐地址
- **loop**：循环次数
