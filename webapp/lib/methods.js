Meteor.methods({
  removeCollab: function (collabName) {
    check(collabName, String);

    var user = MedBook.ensureUser(this.userId);
    user.ensureAdmin(collabName);

    // remove all collaborators and administrators so that no one can edit it
    // but no one can create one with that name
    Collaborations.update({name: collabName}, {
      $set: {
        collaborators: [],
        administrators: [],
      }
    });
  },
  createCollab: function (newCollab) {
    check(newCollab, Collaborations.simpleSchema());

    var user = MedBook.ensureUser(this.userId);
    // they must be an admin of the collaboration they create
    user.ensureAdmin(newCollab);

    if (Meteor.call("collabNameTaken", newCollab.name)) {
      throw new Meteor.Error("collaboration-name-taken");
    }

    return Collaborations.insert(newCollab);
  },
  collabNameTaken: function (collabName) {
    return !!Collaborations.findOne({name: collabName});
  },
  updateCollab: function (collabName, setObject) {
    check(collabName, String);
    check(setObject, Collaborations.simpleSchema().pick([
      "description",
      "isUnlisted",
      "adminApprovalRequired"
    ]));

    var user = MedBook.ensureUser(this.userId);
    user.ensureAdmin(collabName);

    Collaborations.update({name: collabName}, {
      $set: setObject,
    });
  },
});
