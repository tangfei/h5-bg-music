(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BgMusic = factory());
})(this, (function () { 'use strict';

    // 默认配置
    const defaultOptions = {
        src: '',
        loop: 999,
        controls: true
    };

    // 判断是否为Android设备
    function isAndroid() {
        const u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
    }

    // 判断是否为iOS设备
    function isIos() {
        const u = navigator.userAgent;
        return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    }

    // BgMusicAndroid类 - 用于Android设备
    class BgMusicAndroid {
        constructor() {
            this.musicInstance = null;
            this.musicLoadComplete = false;
            this.options = null;
            this.firstPlay = false;
        }

        init(options) {
            this.options = { ...defaultOptions, ...options };

            // 动态加载音频库
            const script = document.createElement('script');
            script.src = 'https://code.createjs.com/1.0.0/soundjs.min.js';
            script.type = 'text/javascript';

            // 注册音频加载完成事件
            script.onload = () => {
                // 注册音频加载完成事件
                createjs.Sound.alternateExtensions = ['mp3', 'ogg', 'wav'];
                createjs.Sound.on('fileload', () => {
                    this.musicLoadComplete = true;
                });
                createjs.Sound.on('fileerror', (e) => {
                    console.error('[y-bg-music] 音频加载失败:', e.src);
                });

                // 注册音频
                createjs.Sound.registerSound({ src: this.options.src, id: 'sound' });
            };
            
            // 预防重复加载
            if (script.parentElement === null) {
                document.body.appendChild(script);
            }
        }

        play() {
            return new Promise((resolve) => {
                // 存在音频实例，直接恢复播放
                if (this.musicInstance && this.firstPlay) {
                    this.musicInstance.paused = false;
                    this.updateControls(true);
                    resolve();
                    return;
                }

                // 不存在音频实例，等待音频加载完成后播放
                const timer = setInterval(() => {
                    if (window.createjs && this.musicLoadComplete && this.firstPlay === false) {
                        clearInterval(timer);
                        this.musicInstance = createjs.Sound.play('sound');
                        this.musicInstance.loop = this.options.loop;
                        this.updateControls(true);
                        this.firstPlay = true;
                        resolve();
                    }
                }, 300);
            });
        }

        pause() {
            if (this.musicInstance) {
                this.musicInstance.paused = true;
                this.updateControls(false);
            }
        }

        destroy() {
            if (this.musicInstance) {
                this.musicInstance.stop();
                this.musicInstance = null;
            }
            this.updateControls(false, true);
        }

        getState() {
            if (!this.musicInstance) {
                return 'pause';
            }
            return this.musicInstance.paused ? 'pause' : 'play';
        }

        updateControls(isPlaying, isDestroy = false) {
            // 不再自动处理控件，由外部控制
        }
    }

    // BgMusicIos类 - 用于iOS设备
    class BgMusicIos {
        constructor() {
            this.audioDom = null;
        }

        init(options) {
            this.options = { ...defaultOptions, ...options };
            
            this.audioDom = document.createElement('audio');
            this.audioDom.src = this.options.src;
            this.audioDom.loop = this.options.loop > 0;
            this.audioDom.preload = 'auto';
            this.audioDom.id = 'audio';
            document.body.appendChild(this.audioDom);
        }

        play() {
            return new Promise((resolve, reject) => {
                if (this.audioDom) {
                    this.audioDom.play()
                        .then(() => {
                            this.updateControls(true);
                            resolve();
                        })
                        .catch((error) => {
                            console.error('[y-bg-music] 播放失败:', error);
                            reject(error);
                        });
                } else {
                    reject(new Error('Audio element not initialized'));
                }
            });
        }

        pause() {
            if (this.audioDom) {
                this.audioDom.pause();
                this.updateControls(false);
            }
        }

        destroy() {
            if (this.audioDom) {
                this.audioDom.pause();
                this.audioDom.remove();
            }
            this.updateControls(false, true);
        }

        getState() {
            if (!this.audioDom) {
                return 'pause';
            }
            return this.audioDom.paused ? 'pause' : 'play';
        }

        updateControls(isPlaying, isDestroy = false) {
            // 不再自动处理控件，由外部控制
        }
    }

    // 初始化背景音乐（不创建控件）
    function initBgMusic(options) {
        // 合并默认选项
        const opts = { ...defaultOptions, ...options };
        
        // 参数验证
        if (!opts.src) {
            console.error('[y-bg-music] 请提供音频文件地址');
            return null;
        }

        // 创建播放器实例
        let player = null;
        if (isAndroid()) {
            player = new BgMusicAndroid();
        } else {
            player = new BgMusicIos();
        }

        // 初始化播放器
        player.init(opts);

        return player;
    }

    return {
        init: initBgMusic,
        isAndroid: isAndroid,
        isIos: isIos
    };
}));