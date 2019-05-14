import promisify from "../../lib/promise.js";

const db = wx.cloud.database();

let getUserInfo = promisify(wx.getUserInfo),
    getSetting = promisify(wx.getSetting),
    authorize = promisify(wx.authorize),
    login = promisify(wx.login),
    cloudCall = promisify(wx.cloud.callFunction);

Page({

    /**
     * Page initial data
     */
    data: {
        userInfo: { avatarUrl: './user-unlogin.png' },
        logged: false,
        isTransfer : false
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        if(options.t){
            db.collection("designDocs").where({ pageLinkID: options.t }).get()
                .then(res => {
                    let doc = res.data[0];
                    this.setData({
                        formName: doc.formName,
                        docid: doc._id,
                        isTransfer : true
                    });
                })

        } else if (options.e) {
            db.collection("designDocs").where({pageLinkID: options.e}).get()
            .then(res => {
                let doc = res.data[0];
                this.setData({
                    formName: doc.formName,
                    doc: doc.designDoc,
                    docid: doc._id
                });
            })
        }
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {
        console.log(this.data);
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

                db.collection('signups').where({
                    signer: res.result.openid,
                    docid: this.data.docid
                }).get().then(res => {
                    console.log(res);
                    if(res.data.length > 0){
                        console.log('dup');
                        // this.setData({
                        //     isDuplicate: true
                        // })
                    }
                })
            })
            .catch(err => {
                console.error('[云函数] [login] 调用失败', err)
            })

        }
    },

    onSubmit: function(e){
        db.collection('signups').add({
            data: {
                form: e.detail.value,
                timestamp : Date(),
                docid: this.data.docid,
                signer: this.data.userInfo.openid
            }
        }).then(res => {
            this.setData({isSignedUp: true});
        }).catch(error => {
            console.log(error);
        })
    },

    transferAdmin: function(){
        db.collection('designDocs')
            .doc(this.data.docid)
            .update({
                data: {ownerID: this.data.userInfo.openid}
            }).then(res => {
                wx.navigateTo({
                    url: '/pages/index/index'
                })
            })
    }
})