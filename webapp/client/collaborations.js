// Template.collabBrowser

Template.collabBrowser.onCreated(function () {
  var instance = this;

  // if they're viewing/managing a collaboration
  instance.selectedCollabId = new ReactiveVar(null);
  // if they're creating a new one
  instance.creatingNew = new ReactiveVar(false);

  // When I create a collaboration I want that one to become the selected
  // collaboration. I do this by setting the Session variable
  // "selectedCollabId" which updates this instance variable.
  // I know it's hack-y ;)
  instance.autorun(function (computation) {
    // don't set it on the first run
    if (!computation.firstRun) {
      instance.selectedCollabId.set(Session.get("selectedCollabId"));
    }
  });

  // maintain invariance between selectedCollabId and creatingNew
  // (if one is non-falsey, set the other to falsey)
  instance.autorun(function () {
    // runs when selectedCollabId changes
    if (instance.selectedCollabId.get()) {
      instance.creatingNew.set(false);
    }
  });
  instance.autorun(function () {
    // runs when creatingNew changes
    if (instance.creatingNew.get()) {
      instance.selectedCollabId.set(null);
    }
  });

  // load up the collaborations and select the first one, stopping
  // when the collabsSub is finished
  var user = MedBook.findUser(Meteor.userId());
  var query = myCollabsQuery(user.getCollaborations());
  var observeHandle = Collaborations.find(query, { sort: { name: 1 } })
      .observe({
    addedAt: function (doc, index) {
      if (index === 0) {
        instance.selectedCollabId.set(doc._id);
      }
    },
    movedTo: function (doc, fromIndex, toIndex, before) {
      // When new documents come in, they're added to the end and then
      // moved to the beginning.
      if (toIndex === 0) {
        instance.selectedCollabId.set(doc._id);
      }
    },
  });

  instance.subscribe("collaborations", function () {
    // stop the observe when the data has loaded
    observeHandle.stop();
  });
});

Template.collabBrowser.helpers({
  getSelectedCollab: function () {
    return Collaborations.findOne(Template.instance().selectedCollabId.get());
  },
  getCollaborations: function () {
    var user = MedBook.findUser(Meteor.userId());
    var query = myCollabsQuery(user.getCollaborations());
    return Collaborations.find(query, { sort: { name: 1 } });
  },
});

// Template.listAllCollabs

Template.listAllCollabs.helpers({
  creatingNewActive: function () {
    if (Template.instance().parent().creatingNew.get()) {
      return "active";
    }
  },
});

Template.listAllCollabs.events({
  "click #create-collab": function (event, instance) {
    instance.parent().creatingNew.set(true);
  },
});

// Template.listCollab

Template.listCollab.helpers({
  active: function () {
    if (Template.instance().parent(2).selectedCollabId.get() === this._id) {
      return "active";
    }
  },
  isAdmin: function () {
    return MedBook.findUser(Meteor.userId()).isAdmin(this);
  },
});

Template.listCollab.events({
  "click .select-collab": function (event, instance) {
    instance.parent(2).selectedCollabId.set(instance.data._id);
  },
});

// Template.createNewCollab

Template.createNewCollab.helpers({
  nameAndDesc: function () {
    return newCollabSchema;
  },
});

// TODO: can I just use a submit event instead of this hooks thing?
// I don't see why I'm using it if it means I have to do the ugly Session
// thing to set selectedCollabId afterwards...
AutoForm.hooks({
  "create-collab-form": {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;

      var newId = Meteor.call("createCollab", _.extend(insertDoc, {
        isUnlisted : true,
        collaborators : [ Meteor.user().collaborations.personal ],
        administrators : [ Meteor.user().collaborations.personal ],
        adminApprovalRequired : true
      }), function (error, result) {
        if (error) {
          self.done(new Error("Failed to create"));
        } else {
          // make the new collaboration the selected one via my relatively
          // hack-y Session variable thing
          Session.set("selectedCollabId", result);

          self.done();
        }
      });

      // I don't think returning false does anything, but I'm keeping it
      // because it was in the example I copied.
      return false;
    }
  }
});

// Template.manageCollab

Template.manageCollab.onCreated(function () {
  var instance = this;

  instance.removeClicked = new ReactiveVar(false);
  instance.editing = new ReactiveVar(false);
});

Template.manageCollab.onRendered(function () {
  $('#detail-view').affix({
    offset: {
      top: 59,
    }
  });
});

Template.manageCollab.helpers({
  isAdmin: function () {
    return MedBook.findUser(Meteor.userId()).isAdmin(this);
  },
  editing: function () {
    return Template.instance().editing.get();
  },
  summarySchema: function () {
    return Collaborations.simpleSchema().pick([
      "description",
      "isUnlisted",
      "adminApprovalRequired"
    ]);
  },
});

Template.manageCollab.events({
  "click .edit-collab": function (event, instance) {
    instance.editing.set(true);
  },
  "click .done-editing-collab": function (event, instance) {

    var valid = AutoForm.validateForm("summary-edit-form");
    if (valid) {
      var values = AutoForm.getFormValues("summary-edit-form");
      Meteor.call("updateCollab", this.name, values.insertDoc,
          function (error, result) {
        if (!error) {
          instance.editing.set(false);
        }
      });
    }
  },
  "click .remove-collab": function (event, instance) {
    var removeClicked = instance.removeClicked;

    if (removeClicked.get()) {
      var stillRemove = window.confirm("You are about to delete this " +
          "collaboration. You will never be able to create a collaboration " +
          "with this name again. This action cannot be undone.");
      if (!stillRemove) {
        removeClicked.set(false);
        return; // quit
      }

      Meteor.call("removeCollab", instance.data.name);

      // make it not selected anymore
      instance.parent().selectedCollabId.set(null);
    } else {
      removeClicked.set(true);

      // if they click elsewhere, cancel remove
      // wait until propogation finishes before registering event handler
      Meteor.defer(function () {
        $("html").one("click",function() {
          removeClicked.set(false);
        });
      });
    }
  },
  "click .edit-collaborators": function (event, instance) {
    MedBook.editCollaborations("Collaborations", this._id, "collaborators");
  },
  "click .edit-administrators": function (event, instance) {
    MedBook.editCollaborations("Collaborations", this._id, "administrators");
  },
});

// Template.showCollaborator

Template.showCollaborator.helpers({
  isPersonalCollab: function (text) {
    return text.startsWith("user:");
  },
  removeUserColon: function (text) {
    if (text.startsWith("user:")) {
      return text.slice(5);
    }
    return text;
  },
});
