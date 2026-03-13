/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 格式化日期为中文格式
 */
function formatDateCN(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

/**
 * 获取星期几
 */
function getWeekDay(dateStr) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const date = new Date(dateStr.replace(/-/g, '/'));
  return '星期' + days[date.getDay()];
}

/**
 * 计算两个时间字符串之间的时长（分钟）
 * @param {string} startTime HH:mm 格式
 * @param {string} endTime HH:mm 格式
 * @returns {number} 时长（分钟），如果结束时间早于开始时间返回 -1
 */
function calcDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (endMin <= startMin) return -1;
  return endMin - startMin;
}

/**
 * 将分钟数格式化为 "X小时Y分钟"
 */
function formatDuration(minutes) {
  if (minutes <= 0) return '0分钟';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

/**
 * 获取本周一的日期字符串
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return formatDate(monday);
}

/**
 * 获取本月1号的日期字符串
 */
function getMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Date 对象格式化为 YYYY-MM-DD
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

module.exports = {
  getTodayStr,
  formatDateCN,
  getWeekDay,
  calcDuration,
  formatDuration,
  getWeekStart,
  getMonthStart,
  formatDate
};
