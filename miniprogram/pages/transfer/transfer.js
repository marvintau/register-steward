import promisify from "../../lib/promise.js";

const db = wx.cloud.database();

let getUserInfo = promisify(wx.getUserInfo),
  getSetting = promisify(wx.getSetting),
  authorize = promisify(wx.authorize),
  login = promisify(wx.login),
  cloudCall = promisify(wx.cloud.callFunction);
  
// miniprogram/pages/transfer/transfer.js
Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: { avatarUrl: './user-unlogin.png' },
    logged: false
  },


  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (query) {

    const scene = decodeURIComponent(query.scene);

    console.log("transfer", scene)
    db.collection("designDocs").where({ pageLinkID: scene }).get()
      .then(res => {
        let doc = res.data[0];
        console.log(doc);
        this.setData({
          formName: doc.formName,
          doc: doc.designDoc,
          docid: doc._id,
        });
      }).catch(err => {
        console.log("transfer error", err);
      })

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  onReceivedUserInfo: function (res) {
    if (res.detail.errMsg === "getUserInfo:ok") {
      this.setData({ userInfo: JSON.parse(res.detail.rawData) })
      console.log(JSON.parse(res.detail.rawData));
      wx.cloud.callFunction({ name: 'login', data: {} })
        .then(res => {
          let openid = { openid: res.result.openid };
          this.setData({
            userInfo: Object.assign({}, this.data.userInfo, openid),
            logged: true
          });

        })
        .catch(err => {
          console.error('[云函数] [login] 调用失败', err)
        })

    }
  },

  transferAdmin: function () {
    db.collection('owners').where({
      ownerID: this.data.userInfo.openid
    }).get().then(res => {
        if (res.data.length === 0){
            db.collection('owners')
            .add({
                data: {
                  ownerID: this.data.userInfo.openid,
                  docid: this.data.docid
                }
            }).then(res => {
                wx.navigateTo({
                  url: '/pages/index/index'
                })
            })
        } else {
            console.log("you've already the admin")
            wx.navigateTo({
              url: '/pages/index/index'
            })
        }
    })
 
  }

})