/* eslint-disable */
chrome.runtime.onInstalled.addListener((installedDetails) => {
    console.log("onInstalled");
    // emit in every reload
    if (installedDetails.reason === " update") {
        console.log("chrome extension update success");
    }
});

// 监听通信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 初始化老是触发了sendResponse 什么情况
    // 防止初始化时触发
    if (request.type === "SIGN_CONNECT") {
        return;
    } else {
        const storageKey = "juejinSign";
        if (request.key === "storageSignData") {
            console.log("存数据：", request.data);
            chrome.storage.local.set({
                [storageKey]: request.data,
            });
        } else if (request.key === "checkStorageSignData") {
            chrome.storage.local.get(storageKey, (result) => {
                console.log("读数据：", result[storageKey]);
                sendResponse(result[storageKey]);
            });
        }
    }
});

// 拦截http请求 设置origin 解决跨域限制
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        details.requestHeaders.push({
            name: "origin",
            value: "https://juejin.cn",
        });
        return {
            requestHeaders: details.requestHeaders,
        };
    },
    {
        urls: ["*://*.juejin.cn/*"],
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);

// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback && callback(tabs.length ? tabs[0].id : null);
    });
}

// 当前标签打开某个链接
function openUrlCurrentTab(url) {
    getCurrentTabId((tabId) => {
        chrome.tabs.update(tabId, { url: url });
    });
}
