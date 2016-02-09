Meteor.publish("collaborations", function () {
  if (!this.userId) {
    this.ready();
    return;
  }

  var collaborations = [];
  collaborations = Meteor.users.findOne({_id: this.userId}).getAssociatedCollaborations();

  // if (!collaborations || collaborations.length === 0) {
  //   return Collaborations.find( {isUnlisted: false} );
  // } else {
  //   return Collaborations.find({
  //     $or: [
  //       {isUnlisted: false}, // allows people to join
  //       {
  //         $and: [
	//           {isUnlisted: true}, // here to show the true branch
	//           {
  //             $or: [
	// 	            {collaborators:  {$in: collaborations}},
	// 	            {administrators: {$in: collaborations}},
	//             ]
  //           }
  //         ]
  //       }
  //     ]
  //   });
  // }
});
