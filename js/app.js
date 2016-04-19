// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"
import fetch from "isomorphic-fetch"
import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'
import Firebase from 'firebase'
import ref from './fbRef'
import {SplashPage,DashPage,BandPage} from './views'
import {Models,Collections} from './models'

function app() {
    // start app
    // new Router()
    var Router = Backbone.Router.extend({
        routes: {
            'createBand': "showBandCreator",
            'splash': "showSplashPage",
            'dash': "showDashPage",
            'band': "showBandPage",
            'logout': "doLogOut"
        },

        initialize: function() {
            // location.hash = "splash"
            // this.ref = new Firebase('https://jamcamp.firebaseio.com/')
            // window.ref = ref

            if (!ref.getAuth()) {
                location.hash = "splash"
            }

            this.on('route', function() {
                if (!ref.getAuth()) {
                    location.hash = "splash"
                }
            })
        },

        showBandCreator: function() {
            DOM.render(<DashPage view="createBand" />, document.querySelector('.container'))
        },

        // showBandPage: function() {
        //     var myMod = new Models.UserModel(ref.getAuth().uid)
        //     myMod.once('sync',function() {
        //         var BandId = myMod.get('band_id')
        //         var usersInBand = new Collections.UsersByBandId(BandId)
        //         DOM.render(<BandPage BandId={BandId} postColl={postColl} membersColl={usersInBand}/>, document.querySelector('.container'))                
        //     })
        // },

        doLogOut: function() {
            ref.unauth()
            location.hash = "splash"
        },

        showSplashPage: function() {
            DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)} createUser={this._createUser.bind(this)} />, document.querySelector('.container'))
        },

        showDashPage: function() {
            var uid = ref.getAuth().uid
            // var bandColl = new BandCollection()
            // var membershipColl = new MembershipCollection()
            // DOM.render(<DashPage bandColl={bandColl} membershipColl={membershipColl}/> ,document.querySelector('.container'))
            DOM.render(<DashPage /> ,document.querySelector('.container'))

        },

        showBandPage: function() {
            // var postColl = new PostCollection(bandId)
            // var myMod = new Models.UserModel(ref.getAuth().uid)
            function reactRenderBandComponent(uMod){
                var bandId = uMod.get('band_id')
                var usersInBand = new Collections.UsersByBandId(bandId)
                var postsInBand = new Collections.PostByBandId(bandId)
                DOM.render(<BandPage bandId={bandId} postColl={postsInBand} memberColl={usersInBand}/>, document.querySelector('.container') )               
            }

            var userMod = new Models.UserModel(ref.getAuth().uid)

            if (typeof userMod.id !== 'undefined') reactRenderBandComponent(userMod)
            else {
                userMod.once('sync',function(){
                    reactRenderBandComponent(userMod)  
                })
            }
        },

        _logUserIn: function(email,password){
            console.log(email,password)
            ref.authWithPassword({
                email: email,
                password: password
            }, function(err,authData) {
                if (err) console.log(err)
                else {
                    location.hash = "dash"
                }
              }
            )
        },

        _createUser: function(email,password) {
            console.log(email, password)
            var self = this
            ref.createUser({
                email: email,
                password: password,
            },function(error,authData) {
                if (error) console.log(error)
                else {
                    var userMod = new Models.UserModel(authData.uid)
                    userMod.set({ 
                        email:email,
                        id: authData.uid
                    })  
                    self._logUserIn(email,password)  
                }
            })
        }
    })

    var pr = new Router()
    Backbone.history.start()
}

app()