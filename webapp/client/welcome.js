// Template.welcome

Template.welcome.onCreated(function () {
  var instance = this;

  instance.autorun(function () {
    var user = Meteor.user();
    if (user && user.profile && user.profile.collaborationManager &&
        user.profile.collaborationManager.neverShowWelcome) {
      FlowRouter.go("manage");
    }
  });
});

Template.welcome.events({
  "click #close-welcome-forever": function () {
    Meteor.users.update(Meteor.userId(), {
      $set: {
        "profile.collaborationManager.neverShowWelcome": true
      }
    });
  },
});
