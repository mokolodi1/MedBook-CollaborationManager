// Template.studyBrowser

Template.studyBrowser.onCreated(function () {
  var instance = this;

  // if they're viewing/managing a collaboration
  instance.selectedStudyId = new ReactiveVar(null);
  // if they're creating a new one
  instance.creatingNew = new ReactiveVar(false);

  // When I create a collaboration I want that one to become the selected
  // collaboration. I do this by setting the Session variable
  // "selectedStudyId" which updates this instance variable.
  // I know it's hack-y ;)
  instance.autorun(function (computation) {
    // don't set it on the first run
    if (!computation.firstRun) {
      instance.selectedStudyId.set(Session.get("selectedStudyId"));
    }
  });

  // maintain invariance between selectedStudyId and creatingNew
  // (if one is non-falsey, set the other to falsey)
  instance.autorun(function () {
    // runs when selectedStudyId changes
    if (instance.selectedStudyId.get()) {
      instance.creatingNew.set(false);
    }
  });
  instance.autorun(function () {
    // runs when creatingNew changes
    if (instance.creatingNew.get()) {
      instance.selectedStudyId.set(null);
    }
  });

  instance.subscribe("studies");
});

Template.studyBrowser.helpers({
  getSelectedStudy: function () {
    return Studies.findOne(Template.instance().selectedStudyId.get());
  },
  getStudies: function () {
    return Studies.find({}, { sort: { short_name: 1 } });
  },
});

// Template.listAllStudies

Template.listAllStudies.helpers({
  creatingNewActive: function () {
    if (Template.instance().parent().creatingNew.get()) {
      return "active";
    }
  },
});

Template.listAllStudies.events({
  "click #create-study": function (event, instance) {
    instance.parent().creatingNew.set(true);
  },
});

// Template.listStudy

Template.listStudy.helpers({
  active: function () {
    if (Template.instance().parent(2).selectedStudyId.get() === this._id) {
      return "active";
    }
  },
});

Template.listStudy.events({
  "click .select-study": function (event, instance) {
    instance.parent(2).selectedStudyId.set(instance.data._id);
  },
});

// Template.createNewStudy

Template.createNewStudy.helpers({
  newStudySchema: function () {
    return newStudySchema;
  },
});

// TODO: can I just use a submit event instead of this hooks thing?
// I don't see why I'm using it if it means I have to do the ugly Session
// thing to set selectedStudyId afterwards...
AutoForm.hooks({
  "create-study-form": {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;

      var newId = Meteor.call("createStudy", insertDoc,
          function (error, result) {
        if (error) {
          self.done(new Error("Failed to create"));
        } else {
          // make the new collaboration the selected one via my relatively
          // hack-y Session variable thing
          Session.set("selectedStudyId", result);

          self.done();
        }
      });

      // I don't think returning false does anything, but I'm keeping it
      // because it was in the example I copied.
      return false;
    }
  }
});

// Template.manageStudy

Template.manageStudy.onCreated(function () {
  var instance = this;

  instance.removeClicked = new ReactiveVar(false);
  instance.editing = new ReactiveVar(false);

  // set back to defaults when the selectedStudyId changes
  instance.autorun(function () {
    instance.parent().selectedStudyId.get();

    instance.removeClicked.set(false);
    instance.editing.set(false); // hard cancel: lose changes
  });
});

Template.manageStudy.onRendered(function () {
  $('#detail-view').affix({
    offset: {
      top: 59,
    }
  });
});

Template.manageStudy.helpers({
  isAdmin: function () {
    return MedBook.findUser(Meteor.userId()).isAdmin(this);
  },
  editing: function () {
    return Template.instance().editing.get();
  },
  summarySchema: function () {
    return Collaborations.simpleSchema().pick([
      "description",
    ]);
  },
});

Template.manageStudy.events({
  "click .edit-study": function (event, instance) {
    instance.editing.set(true);
  },
  "click .done-editing-study": function (event, instance) {
    var valid = AutoForm.validateForm("summary-edit-study-form");
    if (valid) {
      var values = AutoForm.getFormValues("summary-edit-study-form");
      Meteor.call("updateStudy", this.study_label, values.insertDoc.description,
          function (error, result) {
        if (!error) {
          instance.editing.set(false);
        }
      });
    }
  },
  "click .remove-study": function (event, instance) {
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
      instance.parent().selectedStudyId.set(null);
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
  "click .edit-collaborations": function (event, instance) {
    MedBook.editCollaborations("Studies", this._id, "collaborations");
  },
});
