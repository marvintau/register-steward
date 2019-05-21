import promisify from "../../lib/promise.js";
const db = wx.cloud.database();

// miniprogram/pages/view-forms/view-form.js
Page({

    /**
     * Page initial data
     */
    data: {
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        db.collection('designDocs')
        .doc(options.docid).get().then(res => {

            console.log(options.docid);

            this.setData({
                designDoc : res.data.designDoc
            });

            return db.collection('signups')
            .where({docid: options.docid}).get()
        }).then(res => {
            this.setData({
                signups : res.data,
                current : 0
            })
        })
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

    onSubmitMemo: function(e){
        db.collection('memo').doc(this.data.signups[this.data.current]._id).update({
            data: {
                memo: e.detail.value.memo,
            }
        }).then(res => {
            console.log(res);
        }).catch(error => {
            console.log(error);
        })
    },

    prevSignup: function(){
        if (this.data.current > 0) {
            this.setData({current: this.data.current-1});
        }
    },

    nextSignup: function(){
        if(this.data.current < this.data.signups.length - 1){
            this.setData({current: this.data.current+1});
        }
    }
})