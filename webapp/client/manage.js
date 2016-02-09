// Template.manage

Template.manage.onCreated(function () {
  var instance = this;

  instance.selectedCollaboration = new ReactiveVar(null);

  // The observe is called from within a Tracker.autorun so that it is
  // stopped automatically when the autorun is stopped.
  // http://docs.meteor.com/#/full/observe
  instance.autorun(function () {
    Collaborations.find({}, { sort: { date_created: -1 } }).observe({
      addedAt: function (doc, index) {
        if (index === 0) {
          instance.selectedCollaboration.set(doc._id);
        }
      },
      movedTo: function (doc, fromIndex, toIndex, before) {
        // When new documents come in, they're added to the end and then
        // moved to the beginning.
        if (toIndex === 0) {
          instance.selectedCollaboration.set(doc._id);
        }
      },
    });
  });
});

// Template.selectableCollaborations

Template.selectableCollaborations.helpers({
  getCollaborations: function () {
    return Collaborations.find({});
  },
});
