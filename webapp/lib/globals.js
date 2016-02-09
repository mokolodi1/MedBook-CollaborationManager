ensureLoggedIn = function() {
  var user_id = Meteor.user() && Meteor.user()._id;
  if (!user_id) {
    throw new Meteor.Error(403, "not-logged-in", "Log in to proceed");
  }
  return user_id;
};
