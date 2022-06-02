<template>
    <div class="sign-body" v-loading="loading">
        <div class="sign-image">
            <el-avatar size="large" :src="imageUrl"></el-avatar>
        </div>
        <div class="sign-text">{{ nickName }}</div>
        <div class="sign-label">
            当前矿石数量：<el-tag size="small" type="success">{{
                currentPoint
            }}</el-tag>
        </div>
        <div class="sign-label">
            连续签到天数：<el-tag size="small" type="success">{{
                continueSignDays
            }}</el-tag>
        </div>
        <div class="sign-btn">
            <el-button v-if="!login" type="primary" @click="toLogin"
                >去登录</el-button
            >
            <el-button
                v-else
                type="primary"
                :loading="signing"
                @click="toSign"
                >{{ todaySign ? "已签到" : "去签到" }}</el-button
            >
        </div>
        <el-icon v-if="login" class="sign-refresh" @click="refresh"
            ><Refresh
        /></el-icon>
    </div>
</template>

<script>
import { formatDate } from "../utils/date";
import {
    getUserInfo,
    getCurrentPoint,
    getSignData,
    getTodaySign,
    startSign,
    sendMsgToWeChat,
} from "../api/index";
export default {
    data() {
        return {
            imageUrl:
                "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", // 头像
            nickName: "", // 昵称
            currentPoint: 0, // 当前矿石数量
            continueSignDays: 0, // 连续签到天数
            login: false, // 是否登录
            todaySign: true, // 今日是否已签到
            loading: true, // 加载ing
            signing: false, // 签到ing
        };
    },
    // .......
    created() {
        this.init();
    },
    methods: {
        // 初始化 先读缓存，为空则发起请求
        async init() {
            // 判断登录
            this.loading = true;
            let resp = await getUserInfo();
            this.login = !resp.data.err_no && resp.data.data;
            if (!this.login) {
                this.loading = false;
                return;
            }
            // 已登录
            chrome.runtime.sendMessage(
                {
                    key: "checkStorageSignData",
                },
                (data) => {
                    const todayStr = formatDate(new Date(), "YYYY-MM-DD");
                    console.log("checkStorageSignData返回：", data);
                    // 有缓存且签到日期是今天，则使用缓存
                    if (data && data.$signDate === todayStr) {
                        delete data.$signDate;
                        for (const key in data) {
                            this[key] = data[key];
                        }
                    } else {
                        this.getAllInfo();
                    }
                }
            );
        },
        // 刷新
        refresh() {
            this.getAllInfo();
        },
        // 获取所有信息
        async getAllInfo() {
            this.loading = true;
            // 获取用户信息
            let resp = await getUserInfo();
            // 判断cookie有效性
            this.login = !resp.data.err_no && resp.data.data;
            if (!this.login) {
                this.loading = false;
                return;
            }
            // 头像，昵称
            this.imageUrl = resp.data.data.avatar_large;
            this.nickName = resp.data.data.user_name;
            // 矿石数量
            resp = await getCurrentPoint();
            this.currentPoint = resp.data.data;
            // 连续签到天数
            resp = await getSignData();
            this.continueSignDays = resp.data.data.cont_count;
            // 当前签到状况
            resp = await getTodaySign();
            this.todaySign = resp.data.data;
            this.loading = false;
            this.storageData();
        },
        // 去登录
        toLogin() {
            window.open("https://juejin.cn/");
        },
        // 执行签到
        async toSign() {
            this.signing = true;
            const resp = await startSign();
            this.signing = false;
            let msg = "";
            if (resp.data.err_no === 0) {
                msg = "签到成功";
                this.$message.success();
                this.refresh();
            } else {
                msg = resp.data.err_msg || "签到失败";
                this.$message.error(msg);
            }
            sendMsgToWeChat("浏览器插件签到", msg);
        },
        // 缓存数据
        storageData() {
            const copyData = JSON.parse(JSON.stringify(this.$data));
            copyData.$signDate = formatDate(new Date(), "YYYY-MM-DD"); // 签到日期
            chrome.runtime.sendMessage({
                key: "storageSignData",
                data: copyData,
            });
        },
    },
};
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
