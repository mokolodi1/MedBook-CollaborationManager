// set up custom async validation on the client for the name field
// We have to do this here instead of in the package because the package
// doesn't know where to add the invalid keys.
// TODO: do this in a _.debounce as the user is typing
SimpleSchema.messages({
  collabNameTaken: "That collaboration name is taken.",
});

var name = Collaborations.simpleSchema().schema().name;
var oldCustom = name.custom;
name.custom = function () {
  // first call the normal custom validation function
  var oldCustomResult = oldCustom.call(this);
  if (oldCustomResult) {
    return oldCustomResult;
  }

  // async custom validation on the client (see SimpleSchema docs)
  if (Meteor.isClient && this.isSet) {
    Meteor.call("collabNameTaken", this.value,
      function (error, result) {
        if (result) {
          newCollabSchema
              .namedContext("create-collab-form") // id of form
              .addInvalidKeys([{
                name: "name",
                type: "collabNameTaken"
              }]);
        }
      }
    );
  }
};

newCollabSchema = new SimpleSchema([
  new SimpleSchema({
    name: name
  }),
  Collaborations.simpleSchema().pick("description"),
]);

// the query used in Collaborations.find()
// define here so it can be used on both the server and client
myCollabsQuery = function (memberOf) {
  return {
    $or: [
      { collaborators: { $in: memberOf } },
      { administrators: { $in: memberOf } },
    ]
  };
};



newStudySchema = Studies.simpleSchema().pick([
  "study_label",
  "name",
  "short_name",
  "description",
]);
