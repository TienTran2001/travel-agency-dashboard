import { Account, Client, TablesDB } from 'appwrite';

export const appWriteConfig = {
  endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
};

const client = new Client()
  .setEndpoint(appWriteConfig.endpointUrl)
  .setProject(appWriteConfig.projectId);

const account = new Account(client);
const tables = new TablesDB(client);

export { account, tables };
