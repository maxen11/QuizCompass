import * as functions from "firebase-functions";
import algoliasearch from "algoliasearch";

const ALGOLIA_ID = functions.config().algolia.appid;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.apikey;
const ALGOLIA_INDEX_NAME = "QuizCompass";
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.syncFirestoreToAlgolia = functions.firestore
  .document("rooms/{docId}")
  .onWrite((change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const objectId = context.params.docId;

    if (data) {
      // Add or update record
      return index.saveObject({...data, objectID: objectId});
    } else {
      // Delete record
      return index.deleteObject(objectId);
    }
  });
