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
            'logout': "doLogOut",
            '*default': "redirect"
        },

        initialize: function() {
            // location.hash = "splash"
            // this.ref = new Firebase('https://jamcamp.firebaseio.com/')
            // window.ref = ref
            console.log("initialize fired")

            if (!ref.auth().currentUser) {
                location.hash = "splash"
            }

            this.on('route', function() {
                if (!ref.auth().currentUser) {
                    location.hash = "splash"
                }
            })

            Backbone.history.start()
        },

        showBandCreator: function() {
            DOM.render(<DashPage view="createBand" />, document.querySelector('.container'))
        },

        doLogOut: function() {
            ref.unauth()
            location.hash = "splash"
        },

        redirect: function() {
            location.hash = "splash"
        },

        showSplashPage: function() {
            DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)} createUser={this._createUser.bind(this)} />, document.querySelector('.container'))
        },

        showDashPage: function() {
            var uid = ref.auth().currentUser;
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
            ref.auth().signInWithEmailAndPassword(email,password)
                    .then(function(){
                        location.hash = "dash"
                    })
                    .catch(function(error) {
                        console.log(error)
                    })        
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

    var rtr = new Router()
    // Backbone.history.start()
}

app()