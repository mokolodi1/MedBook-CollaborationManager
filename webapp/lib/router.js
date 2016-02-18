FlowRouter.notFound = {
  action: function () {
    BlazeLayout.render("appBody", {content: "pageNotFound"});
  }
};

var collaborationManager = FlowRouter.group({
  prefix: "/CollaborationManager"
});

collaborationManager.route("/", {
  name: "welcome",
  action: function() {
    BlazeLayout.render("appBody", {content: "welcome"});
  }
});

collaborationManager.route("/collaborations", {
  name: "collaborations",
  action: function() {
    BlazeLayout.render("appBody", {content: "collaborations"});
  }
});

// var testing = collaborationManager.group({
//   prefix: "/testing"
// });
//
// testing.route("/removeData", {
//   action: function () {
//     Meteor.call("removeData", function (error) {
//       if (error) {
//         console.log("error:", error);
//       } else {
//         BlazeLayout.render("appBody", {content: "actionDone"});
//       }
//     });
//   }
// });
