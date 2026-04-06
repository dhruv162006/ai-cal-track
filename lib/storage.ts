import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USER_ONBOARDING: 'user_onboarding',
};

export const setLocalData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving local data for key: ${key}`, e);
  }
};

export const getLocalData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error reading local data for key: ${key}`, e);
    return null;
  }
};

export const removeLocalData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing local data for key: ${key}`, e);
  }
};
