import { ID, OAuthProvider, Query } from 'appwrite';
import { redirect } from 'react-router';
import { account, appWriteConfig, tables } from '~/appwrite/client';

export const getExistingUser = async (id: string) => {
  try {
    const { rows, total } = await tables.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userCollectionId,
      queries: [Query.equal('accountId', id)],
    });

    if (total > 0) return rows[0];
    return null;
  } catch (e) {
    console.log('getExistingUser error', e);
    return null;
  }
};

export const loginWithGoogle = async () => {
  try {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/404`
    );
  } catch (error) {
    console.error('Error during OAuth2 session creation:', error);
  }
};

export const getUser = async () => {
  try {
    const user = await account.get();
    if (!user?.$id) return redirect('/sign-in');

    const rows = await tables.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userCollectionId,
      queries: [Query.equal('accountId', user.$id)],
    });

    return rows.total > 0 ? rows.rows[0] : null;
  } catch (e) {
    console.log('getUser error', e);
    return redirect('/sign-in');
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (e) {
    console.log('logoutUser error', e);
    return false;
  }
};

export const getGooglePicture = async () => {
  try {
    // get current user session
    const session = await account.getSession('current');

    // get the OAuth2 token from the session
    const oAuthToken = session.providerAccessToken;

    if (!oAuthToken) {
      console.log('No auth token available');
      return null;
    }

    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=photos',
      {
        headers: {
          Authorization: `Bearer ${oAuthToken}`,
        },
      }
    );

    if (!response.ok) {
      console.log('Failed to fetch Google picture');
      return null;
    }

    const data = await response.json();

    const photoUrl =
      data.photos && data.photos.length > 0 ? data.photos[0].url : null;
    return photoUrl;
  } catch (e) {
    console.log('getGooglePicture error', e);
    return null;
  }
};

export const storeUserData = async () => {
  try {
    const accountUser = await account.get(); // user từ Account service
    const existingUser = await getExistingUser(accountUser.$id);

    if (existingUser) return existingUser; // đã có thì return

    const imageUrl = await getGooglePicture();

    const newUser = await tables.createRow(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: accountUser.$id,
        name: accountUser.name,
        email: accountUser.email,
        imageUrl: imageUrl || '',
        joinedAt: new Date().toISOString(),
      }
    );

    return newUser;
  } catch (e) {
    console.log('storeUserData error', e);
    return null;
  }
};

// Việt: Dùng cú pháp mới với table (tables.listRows)
export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { rows: users, total } = await tables.listRows(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );

    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (e) {
    console.log('Error fetching users');
    return { users: [], total: 0 };
  }
};
