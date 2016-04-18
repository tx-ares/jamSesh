import React, {Component} from 'react'
import Backbone from 'bbfire'
import Actions from './actions'
import {Models,Collections} from './models'

// Dash Page Components //////////////////////////////

var CreateBand = React.createClass ({
    _save: function() {
        Actions.saveBand({
            name: this.name,
            genre: this.genre
        })
        console.log("Band saved to database!")
        console.log(this.name + "'s new band Id is " + this.me)
    },

    _updateName: function(evt) {
        this.name = evt.target.value
    },

    _updateGenre: function(evt) {
        this.genre = evt.target.value
    },

    render: function() {
        return (
            <div className="createBandBar">
                <input onChange={this._updateName} placeholder="Enter your band's name." />
                <input onChange={this._updateGenre} placeholder="What genre is your band?" />
                <button onClick={this._save}> Save</button> 
            </div>
            )
    }
})

var DashPage = React.createClass({
    componentWillMount: function() {
        var self = this
    },

    render: function() {
        
        var content = ''
        // var content2 = ''
        if (this.props.view === "createBand") {
            content = <CreateBand />
        }

        // if (ref.users.bandId) {
        //     content2 = <MyBands />
        // }

        return (
            <div className="dashContainer">
                <NavBar />
                <Profile />
                 {content}
                 
            </div>
            )
    }
})

var NavBar = React.createClass({
    render: function() {
        return (
            <div className="navBar">
                <a href="#createBand">Create a band</a>
                <a href="#dash">Dashboard</a>
                <a href="#band">My Band</a>
                <a href="#logout">Log out</a>
            </div>
            )
    }
})

var Profile = React.createClass({

    render: function(){
        return (
        
            <div className="profile">
                    <div className="imgContainer">
                        <img className="profilePic" src="http://i.imgur.com/kQgQcDw.jpg?1"></img>
                    </div>
                    <ul>
                        <li>Jimmy Sax</li>
                        <li>Instruments: Guitar, Saxophone</li>
                        <li>Genre: Jazz</li>
                    </ul>
            </div>

            )
    }
})

var Members = React.createClass({

    render: function() {
        return(
            <div className="bandMembers">

            </div>

            )

    }
})

var MyBands = React.createClass({

    _handleBands: function(){
        var BandsArr = this.props.bandsColl.map(function(bands, i){
            console.log(band)
            return(
                <p key={i}> {bands.get("name")} </p>
                )
        })
        return BandsArr
    },

    render: function() {
       
        return (
            <div className="myBands">
                    {this._handleBands()}
            </div>
        
            )
    }
})

// End Dash Page Components //////////////////////////

// Band Page Components //////////////////////////////

var BandPage = React.createClass({

    componentWillMount: function() {
        var self = this
        this.props.memberColl.on('sync update',function(){
            self.forceUpdate()
        })
        this.props.postColl.on('sync update', function(){
            self.forceUpdate()
        })
        
    },

    render: function() {
        return (
            <div className="dashContainer" >
                <NavBar />
                <h1>My Band</h1>
                <div className="scheduleContainer">This will contain a weekly schedule containing practice times and gigs. </div>
                <MemberList bandId={this.props.bandId} memberColl={this.props.memberColl} />
                {/*<Posts bandId={this.props.bandId} postColl={this.props.postColl} />*/}
            </div>
            )
    }
})

var MemberList = React.createClass({

    _addMember: function(keyEvent){
        if (keyEvent.keyCode === 13) {
            var email = keyEvent.target.value
            var qbe = new Collections.QueryByEmail(email)
            var component = this
            qbe.fetchWithPromise().then(function() {
                var userToAdd = qbe.models[0]
                if (userToAdd.id) {
                    Actions.addMember(component.props.bandId,userToAdd)
                    component.props.memberColl.add(userToAdd)
                }
                else alert("no user with that email!")
            })
            
        }
        
    },

    _genMember: function(MemberModel,i) {
        return <Member remover={this._remover} model={MemberModel} key={i} />
    },

    _remover: function(model) {
        this.props.memberColl.remove(model)
    },

    render: function() {
        return (
            <div className="members">
                <h4>The Band</h4>
                {this.props.memberColl.map(this._genMember)}
                <input placeholder="add a member by email" onKeyDown={this._addMember} />
            </div>
            )
    }
})

var Member = React.createClass({

    _boot: function() {
        // unset the Member's band_id
        this.props.model.set({band_id: ''})

        // remove the Member from the MemberColl
        this.props.remover(this.props.model)
    },

    render: function() {
        var styleObj = {display: "block"}
        if (!this.props.model.id) styleObj.display = "none"

        return (
            <div style={styleObj} className="member">
                <p>{this.props.model.get('email')}</p><button onClick={this._boot}>X</button>
            </div>
                )
    }
})

var Posts = React.createClass({

    _newPost: function(keyEvent) {
        if (keyEvent.keyCode === 13) {
            var postText = keyEvent.target.value
            keyEvent.target.value = ''
            var postObj = {
                text: postText,
                band_id: this.props.bandId
            }
            Actions.addpost(postObj)

        }
    },

    _handlePosts: function(){
        var postArr = this.props.postColl.map(function(post, i){
            console.log(post)
            return(
                <p key={i}> {post.get("text")} </p>
                )
        })
        return postsArr
    },

    render: function() {
       
        return (
            <div className="posts">
                <textarea 
                    placeholder="create a new post" 
                    onKeyDown={this._newPost} 
                />
                <div>
                    {this._handlePosts()}
                </div>
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
                <div className="messenger">
                    <input placeholder="recipient email" onChange={this._setTargetEmail} />
                    <textarea placeholder="your message here" onChange={this._setMsg} />
                    <button onClick={this._submitMessage} >submit!</button> 
                </div> 
            )
    }

})

// End Band Page Components //////////////////////////

// Splash Page Components ////////////////////////////

var SplashPage = React.createClass({
    email: '',
    password: '',
    realName: '',

    _handleSignUp: function() {
        this.props.createUser(this.email,this.password)
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
                <img className="banner" src="http://i.imgur.com/xZIPVAG.png?1"></img>

                <div className="loginContainer">
                    <input onChange={this._updateEmail} />
                    <input onChange={this._updatePassword} type="password" />
                    <div className="splashButtons" >
                        <button onClick={this._handleSignUp} >Sign up</button>
                        <button onClick={this._handleLogIn} >Log in</button>
                    </div>
                </div>
            </div>
            )
    }
})

// End Splash Page Components ////////////////////////

export {SplashPage,DashPage,BandPage}