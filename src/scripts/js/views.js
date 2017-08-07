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
        // console.log(this.name + "'s new band Id is " + this.me)
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
            <div className="container dashContainer">
                <NavBar />

                <div className="row profileContainer"><h3>My Members</h3>
                    <Profile />
                    <Profile2 />
                    <Profile3 />
                    <a href="#createBand" className="btn btn-primary btn-lg active" role="button">Create a band</a>
                </div>

                 {content}
                 
            </div>
            )
    }
})

var NavBar = React.createClass({
    render: function() {
        return (
            <div className="row my-nav-styles">
               
                <div className='col-xs-6 col-sm-3 my-menu-op'>
                    <a href="#dash" className="btn btn-primary btn-lg active" role="button">Dashboard</a>
                </div>

                <div className='col-xs-6 col-sm-3 my-menu-op'>
                    <a href="#band" className="btn btn-primary btn-lg active" role="button">Schedule</a>
                </div>
                <div className='col-xs-6 col-sm-3 my-menu-op'>
                    <a href="#logout" className="btn btn-primary btn-lg active" role="button">Log out</a>
                </div>

            </div>
            )
    }
})

var Profile = React.createClass({

    render: function(){
        return (
        
            <div className="col-xs-12 col-sm-4">
                <div className="thumbnail">
                    <img className="profilePic" src="http://i.imgur.com/4UQ1mKSm.jpg"></img>
                    <div className="caption">
                        <h3>Jimmy Sax</h3>
                        <h5>Instruments: Guitar, Saxophone</h5>
                        <h6><small>Genre: Jazz</small></h6>
                    </div>
                </div>
            </div>

            )
    }
})

var Profile2 = React.createClass({

    render: function(){
        return (
        
            <div className="col-xs-12 col-sm-4">
                <div className="thumbnail">
                    <img className="profilePic" src="http://i.imgur.com/0VGlKhRm.jpg"></img>
                    <div className="caption">
                        <h3>Ringo Sax</h3>
                        <h5>Instruments: Vox, Saxophone</h5>
                        <h6><small>Genre: Jazz</small></h6>
                    </div>
                </div>
            </div>

            )
    }
})

var Profile3 = React.createClass({

    render: function(){
        return (
        
            <div className="col-xs-12 col-sm-4">
                <div className="thumbnail">
                    <img className="profilePic" src="http://i.imgur.com/Y3WNolbm.jpg"></img>
                    <div className="caption">
                        <h3>Bobby Sax</h3>
                        <h5>Instruments: Drums, Saxophone</h5>
                        <h6><small>Genre: Jazz</small></h6>
                    </div>
                </div>
            </div>

            )
    }
})

var MyBands = React.createClass({

    _handleBands: function(){
        var BandsArr = this.props.bandsColl.map(function(bands, i){
            // console.log(band)
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
        // this.props.bandsColl.on('sync update', function(){
        //     self.forceUpdate()
        // })
        console.log('checking band page')
        
    },

    render: function() {
        // console.log(this.props.bandId)
        // console.log({Collections.BandCollection.child})
        return (
            <div className="container dashContainer">

                <NavBar />
                <h1>The Glitch Mob</h1>
                <div className="row scheduleContainer"> 
                    <Posts bandId={this.props.bandId} postColl={this.props.postColl} />

                    <MemberList bandId={this.props.bandId} memberColl={this.props.memberColl} />
                </div>
                    
                
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
            <div className="col-xs-12 col-sm-4 members">
                <h4>My members</h4>
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
                <p>{this.props.model.get('email')}</p><button className="btn btn-danger" onClick={this._boot}>X</button>
            </div>
                )
    }
})

var Posts = React.createClass({

    _formatTime: function(timeString) {
            // var postData = keyEvent.target.value
            // keyEvent.target.value = ''
           var timeData = new Date(timeString)
           // console.log(timeData)
           var months = ["January","Feburary","March","April","May","June","July","August","September","October","November","December"];
           var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
           
            // log(months[timeData.getMonth(timeData)])
    
           var fgm = (months[timeData.getMonth(timeData)])
           var fgd = (days[timeData.getDay(timeData)])
           var fgda = timeData.getDate(timeData) 
           var fgh = (( timeData.getUTCHours(timeData) + 11) % 12 + 1)
           var fgmi = timeData.getUTCMinutes(timeData)
           var ampm = timeData.getUTCHours() < 12 ? "AM" : "PM";
           
           var zero = function(){ 
               if(timeData.getUTCMinutes() ===0){
                  return "0"
                  }
                 else {
                    return ''
                    }
                }
           
           // var pdh = (timeData.getHours(timeData))
           // var pdm = (timeData.getMinutes(timeData))
            
           console.log(fgm)
           console.log(fgd)
           console.log(fgda)
           console.log(fgh)
           console.log(fgmi)
          
           var formattedPost = ''
           formattedPost = fgd + ' ' + fgm + ' ' + fgda +' at '+ fgh + ":" + fgmi + zero() + ampm
           
           console.log(formattedPost)
        // input: a string of the form "2016-04-30T21:00"
        // output: a string of the form "March 23 at 5:50 p.m."
        return formattedPost
    },

    _handlePosts: function(){
        var self = this
        var postArr = this.props.postColl.map(function(post, i){
            // if the post doesn't have an id property, it is a ghost, and the .postBox should have display: none.  
                var styleObj = {}
                if (!post.get('id')) {
                    styleObj.display = 'none';
                }

                // if (post.get('type') = "Gig") {
                //     styleObj.box-shadow = 'box-shadow: 10px 10px 130px 86px rgba(235,212,65,0.82);'
                // }

            return(
                <div className="postBoxContainer">
                    <div style={styleObj} className="postBox">
                        <div key={i}> <h4>{post.get("type")}</h4>{self._formatTime(post.get("time"))}  @ {post.get("place")}</div>
                    </div> 
                </div>
                               
                )
        })
        console.log(postArr)
        return postArr
    },

    _handleSubmit: function(evt){
       var postObj = {
            time: this.time,
            place: this.place,
            type: this.type,
            band_id: this.props.bandId
        }
        Actions.addPost(postObj)
    },

    _updateEventType: function(evt) {
        this.type = evt.target.value
    },

    _updatePlace: function(evt) {
        this.place = evt.target.value
    },

    _updateTime: function(evt) {
        this.time = evt.target.value
    },

    render: function() {
        // console.log("accessing the Posts component!!")
        console.log(this.props)
        return (

            <div className="col-xs-12 col-sm-8 posts">
                <h4>Make a Rehearsal Post</h4>

                <form onSubmit={this._handleSubmit} className=''>
                    <div className="form-group">
                        <label>Event Type</label>
                        <select className="form-control" onChange={this._updateEventType} >
                            <option>Choose a type</option>
                            <option>Rehearsal</option>
                            <option>Meeting</option>
                            <option>Gig</option></select>
                    
                    </div>

                    <div className="form-group">
                        <label>Venue</label>
                        <input className="form-control" type="text" onChange={this._updatePlace} />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input className="form-control" type="datetime-local" onChange={this._updateTime} />
                    </div>
                    <button onClick={this._newSubmit} type="submit" className="btn btn-primary">Create Event</button>
                </form>
         
            {/*<button onClick={this._newPost}>Post</button>*/}
                <div className="col-xs-12 col-sm-12 posts">
                    <h5>Posts</h5>
                    {this._handlePosts()}
                </div>
            </div>
            
            )
    }
})

//Messenger Planned ////
//                    //
////////////////////////

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
                    <form onSubmit={this._handleLogin} className=''>
                        <div className="form-group">
                            <h5>Email</h5>
                            <input placeholder="email" onChange={this._updateEmail} />
                        </div>

                        <div className="form-group">
                            <h5>Password</h5>
                            <input type="password" onChange={this._updatePassword} />
                        </div>
                    
                        <button onClick={this._handleSignUp} >Sign up</button>
                        <button onClick={this._handleLogIn} >Log in</button>
                    </form>
                </div>
            </div>
            )
    }
})

// End Splash Page Components ////////////////////////

export {SplashPage,DashPage,BandPage}