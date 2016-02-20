FlowRouter.notFound = {
  action: function () {
    BlazeLayout.render("appBody", {content: "pageNotFound"});
  }
};

FlowRouter.route("/", {
  name: "welcome",
  action: function() {
    BlazeLayout.render("appBody", {content: "welcome"});
  }
});

FlowRouter.route("/collaborations", {
  name: "collaborations",
  action: function() {
    BlazeLayout.render("appBody", {content: "collaborations"});
  }
});

FlowRouter.route("/studies", {
  name: "studies",
  action: function() {
    BlazeLayout.render("appBody", {content: "studies"});
  }
});

// var testing = FlowRouter.group({
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
