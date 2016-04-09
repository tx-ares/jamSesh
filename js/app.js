// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"
import fetch from "isomorphic-fetch"
import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'
import Firebase from 'firebase'
// window.BB = Backbone

var ref = new Firebase("http://jamcamp.firebaseio.com")

var UserModel = Backbone.Firebase.Model.extend({
    initialize: function(uid) {
        this.url = `http://jamcamp.firebaseio.com/users/${uid}`
    }
})

var QueryByEmail = Backbone.Firebase.Collection.extend({
    initialize: function(targetEmail) {
        this.url = ref.child('users').orderByChild('email').equalTo(targetEmail)
    },
    autoSync: false
})

// collection that will sync with a specific user's "messages" schema
var UserMessages = Backbone.Firebase.Collection.extend({
    initialize: function(uid) {
        this.url = `http://jamcamp.firebaseio.com/users/${uid}/messages`
    }
})

// inside component
var DashPage = React.createClass({
    
    componentWillMount: function() {
        var self = this
        this.props.msgColl.on('sync',function() {
            self.forceUpdate()
        })
    },

    render: function() {
        return (
            <div className="dashboard">
                <a href="#logout" >log out</a>
                <Messenger />
                <Inbox msgColl={this.props.msgColl} />
            </div>
            )
    }
})

var Inbox = React.createClass({

    _makeMessage: function(mod,i) {
        return <Message msgData={mod} key={i} />
    },

    render: function() {
        return (
            <div className="inbox">
                {this.props.msgColl.map(this._makeMessage)}
            </div>
            )
    }
})

var Message = React.createClass({

    render: function() {
        var displayType = "block"
        if (this.props.msgData.id === undefined) displayType = "none"
        return (
            <div style={{display:displayType}} className="message" >
                <p className="author">from {this.props.msgData.get('sender_email')}</p>
                <p className="content">{this.props.msgData.get('content')}</p>
            </div>
            )
    }
})

var Messenger = React.createClass({

    targetEmail: '',
    msg: '',

    _setTargetEmail: function(e) {
        this.targetEmail = e.target.value
    },

    _setMsg: function(e) {
        this.msg = e.target.value
    },

    _submitMessage: function() {
        var queriedUsers = new QueryByEmail(this.targetEmail)
        var self = this
        queriedUsers.fetch()
        queriedUsers.on('sync', function() {
            var usrId = queriedUsers.models[0].get('id')
            var usrMsgCollection = new UserMessages(usrId)
            usrMsgCollection.create({
                content: self.msg,
                sender_email: ref.getAuth().password.email,
                sender_id: ref.getAuth().uid
            })
        })
    },

    render: function() {
        return (
            <div className="dashContainer">
                <div className="profile">
                    <div className="imgContainer">
                        <img className="profilePic" src="http://i.imgur.com/kQgQcDw.jpg?1"></img>
                    </div>
                    <ul>
                        <li>Name</li>
                        <li>Instruments</li>
                        <li>Genre</li>
                        <li><button>Create Band</button></li>
                        <li><a href="#">Join Band</a></li>
                        <li><a href="#">Delete Band</a></li>
                    </ul>
                </div>
                <div className="messenger">
                    <input placeholder="recipient email" onChange={this._setTargetEmail} />
                    <textarea placeholder="your message here" onChange={this._setMsg} />
                    <button onClick={this._submitMessage} >submit!</button> 
                </div>
            </div>
            )
    }
})

var SplashPage = React.createClass({
    email: '',
    password: '',
    realName: '',

    _handleSignUp: function() {
        this.props.createUser(this.email,this.password,this.realName)
    },

    _handleLogIn: function() {
        this.props.logUserIn(this.email,this.password)
    },

    _updateEmail: function(event) {
        this.email = event.target.value
    },
    // This function is currently disabled. //
    // _updateName: function(event) {
    //     this.realName = event.target.value
    // },
    //////////////////////////////////////////
    _updatePassword: function(event) {
        this.password = event.target.value
    },

    render: function() {
        return (
            <div className="splashContainer">
                <img className="banner" src="http://i.imgur.com/0Y0lbKB.png?1"></img>

                <div className="loginContainer">
                    <input onChange={this._updateEmail} />
                    <input onChange={this._updatePassword} type="password" />
                    <div className="splashButtons" >
                        <button onClick={this._handleSignUp} >sign up</button>
                        <button onClick={this._handleLogIn} >log in</button>
                    </div>
                </div>
            </div>
            )
    }
})

function app() {
    // start app
    // new Router()
    var Router = Backbone.Router.extend({
        routes: {
            'splash': "showSplashPage",
            'dash': "showDashboard",
            'logout': "doLogOut"
        },

        initialize: function() {
            this.ref = new Firebase('https://jamcamp.firebaseio.com/')
            window.ref = this.ref

            if (!this.ref.getAuth()) {
                location.hash = "splash"
            }

            this.on('route', function() {
                if (!this.ref.getAuth()) {
                    location.hash = "splash"
                }
            })
        },

        doLogOut: function() {
            this.ref.unauth()
            location.hash = "splash"
        },

        showSplashPage: function() {

            DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)} createUser={this._createUser.bind(this)} />, document.querySelector('.container'))
        },

        showDashboard: function() {
            var uid = ref.getAuth().uid
            var msgColl = new UserMessages(uid)
            DOM.render(<DashPage msgColl={msgColl} />,document.querySelector('.container'))
        },

        _logUserIn: function(email,password){
            console.log(email,password)
            this.ref.authWithPassword({
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

        _createUser: function(email,password,realName) {
            console.log(email, password)
            var self = this
            this.ref.createUser({
                email: email,
                password: password,
            },function(error,authData) {
                if (error) console.log(error)
                else {
                    var userMod = new UserModel(authData.uid)
                    userMod.set({
                        name: realName, 
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