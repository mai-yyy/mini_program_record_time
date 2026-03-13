const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 目标 openid。如果是管理员操作，可以覆盖别人；如果是普通调用默认自己
  const targetOpenId = event.targetOpenId || wxContext.OPENID
  const action = event.action
  const payload = event.payload || {}

  try {
    if (action === 'addStudyTime') {
      const hours = payload.hours
      // 我们创建一个最近的 study_session
      const now = new Date()
      const dOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
      // format to YYYY-MM-DD
      const dateStr = now.toLocaleDateString('zh-CN', dOptions).replace(/\//g, '-')
      const hm = now.toTimeString().substring(0, 5)

      await db.collection('study_sessions').add({
        data: {
          _openid: targetOpenId,
          date: dateStr,
          startTime: hm,
          endTime: hm,
          durationMinutes: hours * 60,
          durationDisplay: hours + '小时(Admin注入)',
          createTime: db.serverDate()
        }
      })
      return { success: true }
    }

    if (action === 'addMallPoints') {
      const points = payload.points
      let userRes = await db.collection('users').where({ _openid: targetOpenId }).get()
      if (userRes.data.length > 0) {
        let user = userRes.data[0]
        let mallState = user.mallState || {}
        mallState.blindBoxBonusPoints = (mallState.blindBoxBonusPoints || 0) + points
        // write back
        await db.collection('users').where({ _openid: targetOpenId }).update({
          data: { mallState: mallState, updatedAt: db.serverDate() }
        })
      } else {
        return { success: false, error: '用户未初始化云数据' }
      }
      return { success: true }
    }

    if (action === 'resetFreePulls') {
      // Free pulls are deducted locally and the limit is checked by local history.
      // Easiest is to clear the blindBoxHistory timestamp logs for today.
      let userRes = await db.collection('users').where({ _openid: targetOpenId }).get()
      if (userRes.data.length > 0) {
        let user = userRes.data[0]
        let mallState = user.mallState || {}
        // filter out today's free pulls
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        if (mallState.blindBoxHistory) {
          mallState.blindBoxHistory = mallState.blindBoxHistory.filter(h => {
            return !(h.isFree === true && h.createdAt >= todayStart.getTime())
          })
        }
        await db.collection('users').where({ _openid: targetOpenId }).update({
          data: { mallState: mallState, updatedAt: db.serverDate() }
        })
        return { success: true }
      }
      return { success: false, error: '用户未初始化' }
    }

    if (action === 'resetAllData') {
      // 彻底重置该用户的所有云端数据和 session
      await db.collection('users').where({ _openid: targetOpenId }).remove()
      // Note: removing multiple uses cloud sdk standard .remove() across the collection query
      await db.collection('study_sessions').where({ _openid: targetOpenId }).remove()

      // 添加空记录
      await db.collection('users').add({
        data: {
          _openid: targetOpenId,
          mallState: {},
          vipRewardState: {},
          userInfo: {},
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      return { success: true }
    }

    return { success: false, error: '未知操作' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
