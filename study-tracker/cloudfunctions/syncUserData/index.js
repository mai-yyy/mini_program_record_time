const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID

  const action = event.action

  if (action === 'get') {
    // 自动初始化或获取用户基础数据
    let userRes = await db.collection('users').where({ _openid: openId }).get()
    
    // 如果没有记录，创建一条空的
    if (userRes.data.length === 0) {
      await db.collection('users').add({
        data: {
          _openid: openId,
          mallState: {},
          vipRewardState: {},
          userInfo: {},
          achievementsState: {},
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      return { success: true, isNew: true, data: {} }
    } else {
      return { success: true, isNew: false, data: userRes.data[0] }
    }
  }

  if (action === 'update') {
    // 增量更新某一项数据
    const { key, data } = event
    if (!key) return { success: false, error: 'miss key' }

    let userRes = await db.collection('users').where({ _openid: openId }).get()
    
    if (userRes.data.length === 0) {
      await db.collection('users').add({
        data: {
          _openid: openId,
          [key]: data,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    } else {
      await db.collection('users').where({ _openid: openId }).update({
        data: {
          [key]: data,
          updatedAt: db.serverDate()
        }
      })
    }

    return { success: true }
  }

  return { success: false, error: 'unknown action' }
}
