import axios from 'axios';

export const getUserInfo = function() {
  return axios({
    url: 'https://api.juejin.cn/user_api/v1/user/get',
    method: `get`,
  });
};
export const getCurrentPoint = function() {
  return axios({
    url: 'https://api.juejin.cn/growth_api/v1/get_cur_point',
    method: `get`,
  });
};
export const getSignData = function() {
  return axios({
    url: 'https://api.juejin.cn/growth_api/v1/get_counts',
    method: `get`,
  });
};
export const getTodaySign = function() {
  return axios({
    url: 'https://api.juejin.cn/growth_api/v1/get_today_status',
    method: `get`,
  });
};
export const startSign = function() {
  return axios({
    url: 'https://api.juejin.cn/growth_api/v1/check_in',
    method: `post`,
  });
};

// 需要使用pushPlus的同学请更换自己的token, 用法请百度
const pushPlusConfig = {
  url: `http://www.pushplus.plus/send`,
  token: `2c4326bb6c5049e09a5d2d26bad17a78`,
};

export const sendMsgToWeChat = function(title = '掘金签到通知', msg) {
  console.log(msg);
  return axios({
    url: pushPlusConfig.url,
    method: `post`,
    data: {
      token: pushPlusConfig.token,
      title: title,
      content: msg,
    },
  });
};
