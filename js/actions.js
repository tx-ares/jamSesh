import Backbone from 'bbfire'
import ref from './fbRef'
import {Models,Collections} from './models'

var Actions = {
	saveBand: function(bandData){
		var bc = new Collections.BandCollection()
		var newBandModel = bc.create(bandData),
			bandId = newBandModel.id
		var me = new Models.UserModel(ref.getAuth().uid)
		me.set({band_id: bandId})
	},

	addMember: function(bandId,userModel) {
		userModel.set({band_id:bandId})
		userModel.save()
	},

	addPost: function(postObj) {
		var postColl = new Collections.PostCollection()
		postColl.create(postObj)
	}
}

export default Actions