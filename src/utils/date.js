import dayjs from "dayjs";

// 日期格式化
export const formatDate = (dataStr, pattern = "YYYY-MM-DD HH:mm:ss") => {
    if (!dataStr) return "";
    return dayjs(dataStr).format(pattern);
};
