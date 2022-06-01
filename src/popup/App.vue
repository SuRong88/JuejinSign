<template>
    <div class="sign-body" v-loading="state.loading">
        <div class="sign-image">
            <el-avatar size="large" :src="state.imageUrl"></el-avatar>
        </div>
        <div class="sign-text">{{ state.nickName }}</div>
        <div class="sign-label">
            当前矿石数量：<el-tag size="small" type="success">{{
                state.currentPoint
            }}</el-tag>
        </div>
        <div class="sign-label">
            连续签到天数：<el-tag size="small" type="success">{{
                state.continueSignDays
            }}</el-tag>
        </div>
        <div class="sign-btn">
            <el-button v-if="!state.login" type="primary" @click="toLogin"
                >去登录</el-button
            >
            <el-button
                v-else
                type="primary"
                :loading="state.signing"
                @click="toSign"
                >{{ state.todaySign ? "已签到" : "去签到" }}</el-button
            >
        </div>
        <el-icon v-if="state.login" class="sign-refresh" @click="refresh"
            ><Refresh
        /></el-icon>
    </div>
</template>

<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { formatDate } from "../utils/date";
import {
    getUserInfo,
    getCurrentPoint,
    getSignData,
    getTodaySign,
    startSign,
    sendMsgToWeChat,
} from "../api/index";

const state = reactive({
    imageUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", // 头像
    nickName: "", // 昵称
    currentPoint: 0, // 当前矿石数量
    continueSignDays: 0, // 连续签到天数
    login: false, // 是否登录
    todaySign: true, // 今日是否已签到
    loading: true, // 加载ing
    signing: false, // 签到ing
});

// 初始化 先读缓存，为空则发起请求
const init = () => {
    const todayStr = formatDate(new Date(), "YYYY-MM-DD");
    chrome.runtime.sendMessage(
        {
            key: "checkStorageSignData",
        },
        (data) => {
            console.log("checkStorageSignData返回：", data);
            // 有缓存且签到日期是今天，则使用缓存
            if (data && data.$signDate === todayStr) {
                delete data.$signDate;
                for (const key in data) {
                    state[key] = data[key];
                }
            } else {
                getAllInfo();
            }
        }
    );
};

// 刷新
const refresh = () => {
    getAllInfo();
};

// 获取所有信息
const getAllInfo = async () => {
    state.loading = true;
    // 获取用户信息
    let resp = await getUserInfo();
    // 判断cookie有效性
    state.login = !resp.data.err_no && resp.data.data;
    if (!state.login) {
        state.loading = false;
        return;
    }
    // 头像，昵称
    state.imageUrl = resp.data.data.avatar_large;
    state.nickName = resp.data.data.user_name;
    // 矿石数量
    resp = await getCurrentPoint();
    state.currentPoint = resp.data.data;
    // 连续签到天数
    resp = await getSignData();
    state.continueSignDays = resp.data.data.cont_count;
    // 当前签到状况
    resp = await getTodaySign();
    state.todaySign = resp.data.data;
    state.loading = false;
    storageData();
};

// 去登录
const toLogin = () => {
    window.open("https://juejin.cn/");
};

// 执行签到
const toSign = async () => {
    state.signing = true;
    const resp = await startSign();
    state.signing = false;
    let msg = "";
    if (resp.data.err_no === 0) {
        msg = "签到成功";
        refresh();
    } else {
        msg = resp.data.err_msg || "签到失败";
    }
    ElMessage({
        message: msg,
        type: msg === "签到成功" ? "success" : "error",
    });
    sendMsgToWeChat("浏览器插件签到", msg);
};

// 缓存数据
const storageData = () => {
    const copyData = JSON.parse(JSON.stringify(state));
    copyData.$signDate = formatDate(new Date(), "YYYY-MM-DD"); // 签到日期
    chrome.runtime.sendMessage({
        key: "storageSignData",
        data: copyData,
    });
};

init();
</script>

<style lang="less">
.sign-body {
    position: relative;
    width: 10vw;
    min-width: 400px;
    text-align: center;

    .sign-image {
    }

    .sign-label {
        margin-bottom: 15px;
    }

    .sign-refresh {
        cursor: pointer;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 99;
        color: #409eff;
        font-size: 20px;
    }
}
</style>
