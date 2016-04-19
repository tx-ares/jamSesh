import Backbone from 'bbfire'
import Firebase from 'firebase'
import ref from './fbRef'

Backbone.Firebase.Model.prototype.fetchWithPromise = Backbone.Firebase.Collection.prototype.fetchWithPromise = function() {
    this.fetch()
    var self = this
    var p = new Promise(function(res,rej){
        self.once('sync',function() {
            res()
        })
        self.once('err',function() {
            rej()
        })
    })
    return p
}

var Models = {
    UserModel : Backbone.Firebase.Model.extend({
        initialize: function(uid) {
             this.url = `http://jamcamp.firebaseio.com/users/${uid}`
        }
    })

}

var Collections = {

     QueryByEmail : Backbone.Firebase.Collection.extend({
        initialize: function(targetEmail) {
            this.url = ref.child('users').orderByChild('email').equalTo(targetEmail)
        },
        autoSync: false
    }),

     UsersByBandId: Backbone.Firebase.Collection.extend({
        initialize: function(targetBandId) {
            this.url = ref.child('users').orderByChild('band_id').equalTo(targetBandId)
        }
    }),

     PostByBandId: Backbone.Firebase.Collection.extend({
        initialize: function(targetBandId) {
            this.url= ref.child('posts').orderByChild('band_id').equalTo(targetBandId)
        }
     }), 

      BandCollection : Backbone.Firebase.Collection.extend({
        url : "http://jamcamp.firebaseio.com/bands"
    }),   

     PostCollection: Backbone.Firebase.Collection.extend({
        url: "http://jamcamp.firebaseio.com/posts"
     }),
    // collection that will sync with a specific user's "messages" schema
     UserMessages : Backbone.Firebase.Collection.extend({
        initialize: function(uid) {
            this.url = `http://jamcamp.firebaseio.com/users/${uid}/messages`
        }
    })

}

export {Models,Collections} 