Meteor.publish("collaborations", function () {
  var user = MedBook.ensureUser(this.userId);

  // publish both collaborations they're a member of and ones they admin
  var collaborations = user.getCollaborations();
  return Collaborations.find(myCollabsQuery(collaborations));
});

Meteor.publish("studies", function () {
  var user = MedBook.ensureUser(this.userId);

  return Studies.find({
    collaborations: {$in: user.getCollaborations() },
  });
});
