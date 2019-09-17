const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.copyChildMapRelatedDataToParentMap = functions.database
  // listen for creation of new object in childmap Related
  .ref("/App/Maps/{mapId}/Related/{objectId}/{pushId}")
  //.onCreate((snapshot, context) => {
  .onWrite((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    //const original = snapshot.val();
    const relDataValue = snapshot.after.val();
    // get the object path including key

    return (
      admin
        // retrive path of parent map
        .database()
        .ref(`/App/Maps/${context.params.mapId}/config/relDataMapHash`)
        .once("value")
        .then(snapshot => {
          const relDataMapHash = snapshot.val();
          return relDataMapHash;
        })
        .then(relDataMapHash => {
          // copy relData to parent map
          console.log(
            "RelatedData:",
            "mapId:",
            context.params.mapId,
            "ObjectId:",
            context.params.objectId,
            "key:",
            context.params.pushId,
            "value: ",
            JSON.stringify(relDataValue)
          );
          if (!relDataValue) {
            // equiv to onDelete
            //console.log("no newValue so onDelete");
            return admin
              .database()
              .ref(`/App/Maps/${relDataMapHash}/Related`)
              .child(context.params.objectId)
              .child(context.params.pushId)
              .set(null);
          }

          return admin
            .database()
            .ref(`/App/Maps/${relDataMapHash}/Related`)
            .child(context.params.objectId)
            .child(context.params.pushId)
            .set(relDataValue);
        })
    );
  });

exports.copyChildMapMarkerToParentMap = functions.database
  // onCreate a new marker in Childmap: get a ref to ParentMap, then create a new marker in ParentMap, width
  // same key and value.

  .ref("/App/Maps/{mapId}/Markers/{pushId}")
  .onWrite((snapshot, context) => {
    const markerValue = snapshot.after.val();

    return (
      admin
        // retrive path of parent map
        .database()
        .ref(`/App/Maps/${context.params.mapId}/config/relDataMapHash`)
        .once("value")
        .then(snapshot => {
          const relDataMapHash = snapshot.val();
          return relDataMapHash;
        })
        .then(relDataMapHash => {
          // copy relData to parent map
          console.log(
            "Marker:",
            "mapId:",
            context.params.mapId,
            "key:",
            context.params.pushId,
            "value: ",
            JSON.stringify(markerValue)
          );
          if (!markerValue) {
            // equiv to onDelete
            //console.log("no newValue so onDelete");
            return admin
              .database()
              .ref(`/App/Maps/${relDataMapHash}/Markers`)
              .child(context.params.pushId)
              .set(null);
          }

          //console.log("relDatamapHash: ", relDataMapHash);
          // onCreate and onUpdate
          return (
            admin
              .database()
              .ref(`/App/Maps/${relDataMapHash}/Markers`)
              //.child(context.params.objectId)
              .child(context.params.pushId)
              .set(markerValue)
          );
        })
    );
  });
