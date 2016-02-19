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


  // study methods
  createStudy: function (newStudy) {
    check(newStudy, newStudySchema);

    var user = MedBook.ensureUser(this.userId);
    // make them the default collaborator
    newStudy.collaborations = [user.collaborations.personal];

    if (Meteor.call("studyLabelTaken", newStudy.study_label)) {
      throw new Meteor.Error("study-label-taken");
    }

    return Studies.insert(newStudy);
  },
  studyLabelTaken: function (study_label) {
    return !!Studies.findOne({study_label: study_label});
  },
  updateStudy: function (study_label, description) {
    check([study_label, description], [String]);

    var user = MedBook.ensureUser(this.userId);
    var query = { study_label: study_label };
    var study = Studies.findOne(query);
    user.ensureAccess(study);

    Studies.update(query, {
      $set: {
        description: description
      }
    });
  },
});
