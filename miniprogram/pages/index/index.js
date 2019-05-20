import promisify from "../../lib/promise.js";

const app = getApp()
const db = wx.cloud.database();


let getUserInfo = promisify(wx.getUserInfo),
    getSetting  = promisify(wx.getSetting),
    authorize   = promisify(wx.authorize),
    login       = promisify(wx.login),
    cloudCall   = promisify(wx.cloud.callFunction);

Page({
    data: {
        userInfo: {
            avatarUrl: './user-unlogin.png'
        },
        userDocs: [],
        logged: false,
        takeSession: false,
        requestResult: ''
    },

    onReceivedUserInfo: function (res) {
        if (res.detail.errMsg === "getUserInfo:ok") {
            this.setData({ userInfo: JSON.parse(res.detail.rawData) })

            cloudCall({ name: 'login', data: {}})
            .then(res => {
                this.setData({
                    userInfo: Object.assign({}, this.data.userInfo, {openid: res.result.openid}),
                    logged: true
                })

                db.collection('owners')
                  .where({ ownerID: res.result.openid })
                  .get().then(res => {
                      Promise.all(res.data.map(e => db.collection('designDocs').doc(e.docid).get().then(res => res.data)))
                      .then(res =>{
                          this.setData({userDocs: res})
                      });
                    
                  })

            })
            .catch(err => {
                console.error('[云函数] [login] 调用失败', err)
            })

        }
    },

    onLoad: function() {
        if (!wx.cloud) {
            console.error("微信版本不支持");
            return
        } else {
            wx.cloud.init();
        }
    },

    onShow: function(){
      db.collection('owners')
        .where({ ownerID: this.data.userInfo.openid })
        .get().then(res => {
          Promise.all(res.data.map(e => db.collection('designDocs').doc(e.docid).get().then(res => res.data)))
            .then(res => {
              this.setData({ userDocs: res })
            });

        })
    },

    onCreatingNewSignup: function () {
        let userID = this.data.userInfo.openid;
        wx.navigateTo({
            url: `../design-form/design-form?id=${userID}`,
        })
    },

    onOpenExistingSignup: function(e){
        let userID = this.data.userInfo.openid,
            docID = e.target.dataset.docid;
        wx.navigateTo({
            url: `../design-form/design-form?id=${userID}&docid=${docID}`,
        })
    },

    onOpenPublishedSignup: function(e) {
        let userID = this.data.userInfo.openid,
            docID = e.target.dataset.docid;
        wx.navigateTo({
            url: `../manage-form/manage-form?id=${userID}&docid=${docID}`,
        })
    },

    onGetOpenid: function() {
        // 调用云函数
    },

})
