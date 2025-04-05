import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Register: undefined;
  Login: undefined;
  MainApp: undefined;
};

export type TabParamList = {
  Cards: undefined;
  Profile: undefined;
  Chats: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 