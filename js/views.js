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
        
        var content = <div className="dashContainer"></div>
        if (this.props.view === "createBand") {
            content = <CreateBand />
        }

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

// var DashPage = React.createClass({

//     // _handleCreateBand: function(evt) {
//     //     evt.preventDefault()
//     //     var band = new BandCollection() 
//     //     // var membership = new MembershipCollection()
//     // // console.log("Part 1 test ok")

//     //     var newModel = this.props.bandColl.create({
//     //         name: 'White Stripes',
//     //         memberid: '123'
//     //     })

//     //     console.log(newModel)

//     //     console.log("Create band worked!")

//     //     // this.props.membershipColl.create({
//     //     //     memberid: '123'
//     //     // })

//     //     // console.log("Create membership worked!")

//     // },
    
//     // componentWillMount: function() {
//     //     var self = this
//     //     this.props.msgColl.on('sync',function() {
//     //         self.forceUpdate()
//     //     })
//     // },

//     render: function() {
//         return (
//             <div className="dashContainer">
//                 <a href="#logout">log out</a>
//                 {/* <Profile _handleCreateBand={this._handleCreateBand}/> */}
//                 <MyBands bandColl={this.props.bandColl}/>
//             </div>
//             )
//     }
// })

var Profile = React.createClass({

    render: function(){
        return (
        <div>
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
                {/* <div className="createBandBar">
                        <ul>
                            <button onClick={this.props._handleCreateBand}>Create Band</button>
                        </ul>
                </div> */}
            {/* <MyBands /> */}
        </div>
            )
    }
})

var MyBands = React.createClass({

    // _addBand: function(keyEvent) {
    //     if (keyEvent.keyCode === 13) {

    //     }
    // },

    render: function(){
        return (
            
                <div className="bandBar">
                    <img className="bandPic" src="http://i.imgur.com/5NLuzJe.png">
                    </img>
                        <div className="infoContainer">
                            {/* <p>{this.props.bandColl.name}</p> */}
                            <p>White Stripes</p>
                            <p><a href="#">Delete Band</a></p>
                        </div>
                        
                </div>
            
            )
    }
})

// End Dash Page Components //////////////////////////

// Band Page Components //////////////////////////////

var BandPage = React.createClass({

    componentWillMount: function() {
        var self = this
        this.props.memberColl.on('sync update',function() {
            self.forceUpdate()
        })
    },

    render: function() {
        return (
            <div className="BandPage" >
                <NavBar />
                <h3>My Band</h3>
                <MemberList bandId={this.props.bandId} memberColl={this.props.memberColl} />
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